import OpenAI from "openai";
import type { StructuredCV, JobRequirements, GapAnalysisResult } from "../types/analysis.js";
import { parseJsonStrict, normalizeStringArray } from "./aiJsonUtils.js";

let aiClientInstance: OpenAI | null = null;

function getAIClient(): OpenAI {
  if (!aiClientInstance) {
    aiClientInstance = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: process.env.GROQ_API_URL || "https://api.groq.com/openai/v1",
    });
  }
  return aiClientInstance;
}

export function setAIClient(client: OpenAI): void {
  aiClientInstance = client;
}

const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

export class GapAnalyzerError extends Error {
  code: string;
  details?: string;

  constructor(message: string, code: string, details?: string) {
    super(message);
    this.name = "GapAnalyzerError";
    this.code = code;
    this.details = details;
  }
}

function buildJobRequirementsPrompt(jobDescription: string): string {
  return `You extract job requirements from a job description.

Return ONLY valid JSON, no markdown, no extra text.

JOB DESCRIPTION:
${jobDescription}

JSON SCHEMA:
{
  "skills": ["string"],
  "technologies": ["string"]
}

Rules:
- List only required skills and technologies.
- Use concise, normalized names (e.g., \"TypeScript\", \"AWS\").
- Do not include soft skills.
- Do not add explanations.`;
}

function parseJson(content: string): unknown {
  return parseJsonStrict(content, (message, details) => new GapAnalyzerError(message, "AI_INVALID_JSON", details));
}

function normalizeArray(value: unknown, fieldName: string): string[] {
  return normalizeStringArray(value, fieldName, (message) => new GapAnalyzerError(message, "AI_INVALID_SHAPE"));
}

function validateJobRequirements(data: unknown): JobRequirements {
  if (!data || typeof data !== "object") {
    throw new GapAnalyzerError("Invalid AI response", "AI_INVALID_SHAPE");
  }

  const record = data as Record<string, unknown>;
  const requiredFields = ["skills", "technologies"];
  const missing = requiredFields.filter((field) => !(field in record));

  if (missing.length > 0) {
    throw new GapAnalyzerError(
      `Incomplete AI response: ${missing.join(", ")}`,
      "AI_MISSING_FIELDS"
    );
  }

  return {
    skills: normalizeArray(record.skills, "skills"),
    technologies: normalizeArray(record.technologies, "technologies"),
  };
}

async function extractJobRequirements(jobDescription: string): Promise<JobRequirements> {
  if (!jobDescription || jobDescription.trim().length === 0) {
    throw new GapAnalyzerError("Job description is empty", "JOB_DESCRIPTION_EMPTY");
  }

  const prompt = buildJobRequirementsPrompt(jobDescription);

  try {
    const aiClient = getAIClient();
    const completion = await aiClient.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "You return ONLY valid JSON with no markdown or extra text.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 800,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new GapAnalyzerError("AI returned an empty response", "AI_EMPTY_RESPONSE");
    }

    const parsed = parseJson(content);
    return validateJobRequirements(parsed);
  } catch (error) {
    if (error instanceof GapAnalyzerError) {
      throw error;
    }

    const details = error instanceof Error ? error.message : "Unknown error";
    throw new GapAnalyzerError("Failed to extract requirements", "AI_PROCESSING_FAILED", details);
  }
}

function normalizeToken(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9+.#\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function generateTokenVariants(token: string): string[] {
  const variants = [token];
  
  if (token.includes(".")) {
    variants.push(token.replace(/\./g, ""));
    variants.push(token.split(".")[0]);
  }
  
  if (token.includes(" ")) {
    variants.push(token.replace(/\s/g, ""));
  }
  
  const abbrevMap: Record<string, string[]> = {
    "typescript": ["ts"],
    "javascript": ["js", "ecmascript"],
    "postgresql": ["postgres", "psql", "pg"],
    "mongodb": ["mongo", "nosql"],
    "kubernetes": ["k8s"],
    "reactjs": ["react"],
    "react": ["reactjs"],
    "nodejs": ["node"],
    "node": ["nodejs"],
    "nextjs": ["next"],
    "next": ["nextjs"],
    "vuejs": ["vue"],
    "vue": ["vuejs"],
    "angularjs": ["angular"],
    "angular": ["angularjs"],
    "aws": ["amazon web services"],
    "gcp": ["google cloud platform", "google cloud"],
    "azure": ["microsoft azure"],
    "docker": ["containerization", "containers"],
    "ci cd": ["cicd", "continuous integration", "continuous deployment"],
    "graphql": ["gql"],
    "rest api": ["restful", "rest"],
    "api": ["rest", "restful"],
  };
  
  if (abbrevMap[token]) {
    variants.push(...abbrevMap[token]);
  }
  
  return Array.from(new Set(variants));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countOccurrences(text: string, term: string): number {
  const normalizedTerm = term.trim();
  if (!normalizedTerm) return 0;

  const regex = new RegExp(escapeRegExp(normalizedTerm), "gi");
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

function hasMatch(term: string, cvTokens: string[]): boolean {
  const normalizedTerm = normalizeToken(term);
  if (!normalizedTerm) return false;

  const termVariants = generateTokenVariants(normalizedTerm);

  for (const variant of termVariants) {
    for (const token of cvTokens) {
      if (token === variant) return true;
      
      if (variant.length > 2 && token.length > 2) {
        if (token.includes(variant) || variant.includes(token)) {
          return true;
        }
      }
      
      const tokenWords = token.split(" ");
      if (tokenWords.some(word => word === variant)) {
        return true;
      }
    }
  }

  return false;
}

export async function analyzeGap(
  structuredCV: StructuredCV,
  jobDescription: string
): Promise<GapAnalysisResult> {
  const requirements = await extractJobRequirements(jobDescription);
  const normalizedText = jobDescription.toLowerCase();

  const cvSkillsAndTech = [...structuredCV.skills, ...structuredCV.technologies];
  const cvTokens = Array.from(
    new Set(
      cvSkillsAndTech
        .flatMap(skill => {
          const normalized = normalizeToken(skill);
          return [normalized, ...generateTokenVariants(normalized)];
        })
        .filter((token) => token.length > 0)
    )
  );
  
 const requiredItems = [
    ...requirements.skills.map((skill) => ({ type: "skill", value: skill })),
    ...requirements.technologies.map((tech) => ({ type: "technology", value: tech })),
  ];

  const scoredRequirements = requiredItems.map((item) => {
    const normalized = normalizeToken(item.value);
    const frequency = Math.max(1, countOccurrences(normalizedText, normalized));
    const weight = Math.min(3, frequency);
    const matched = hasMatch(normalized, cvTokens);

    return {
      ...item,
      normalized,
      frequency,
      weight,
      matched,
    };
  });

  const totalWeight = scoredRequirements.reduce((sum, item) => sum + item.weight, 0);
  const matchedWeight = scoredRequirements
    .filter((item) => item.matched)
    .reduce((sum, item) => sum + item.weight, 0);

  const matchScore = totalWeight === 0 ? 0 : Math.round((matchedWeight / totalWeight) * 100);
  
  const missingCriticalSkills = scoredRequirements
    .filter((item) => !item.matched && item.frequency >= 2)
    .sort((a, b) => b.weight - a.weight)
    .map((item) => item.value);

  const strongMatches = scoredRequirements
    .filter((item) => item.matched)
    .sort((a, b) => b.weight - a.weight)
    .map((item) => item.value);

  const suggestedFocusAreas = scoredRequirements
    .filter((item) => !item.matched)
    .sort((a, b) => b.weight - a.weight)
    .map((item) => item.value);

  return {
    matchScore,
    missingCriticalSkills: Array.from(new Set(missingCriticalSkills)).slice(0, 6),
    strongMatches: Array.from(new Set(strongMatches)).slice(0, 6),
    suggestedFocusAreas: Array.from(new Set(suggestedFocusAreas)).slice(0, 6),
  };
}

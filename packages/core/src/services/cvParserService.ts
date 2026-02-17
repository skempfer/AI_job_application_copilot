import fs from "fs/promises";
import pdf from "pdf-parse";
import OpenAI from "openai";
import type { StructuredCV } from "../types/analysis.js";
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

export class CVParserError extends Error {
  code: string;
  details?: string;

  constructor(message: string, code: string, details?: string) {
    super(message);
    this.name = "CVParserError";
    this.code = code;
    this.details = details;
  }
}

export async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    const buffer = await fs.readFile(filePath);
    const result = await pdf(buffer);

    if (!result.text || result.text.trim().length === 0) {
      throw new CVParserError("PDF has no extracted text", "PDF_EMPTY_TEXT");
    }

    return result.text;
  } catch (error) {
    if (error instanceof CVParserError) {
      throw error;
    }

    const details = error instanceof Error ? error.message : "Unknown error";
    throw new CVParserError("Failed to extract text from PDF", "PDF_PARSE_FAILED", details);
  }
}

function buildStructuredCVPrompt(cvText: string): string {
  return `You are a CV parser. Extract structured information from the CV text.

Return ONLY valid JSON, no markdown, no extra text.

CV TEXT:
${cvText}

JSON SCHEMA:
{
  "skills": ["string"],
  "technologies": ["string"],
  "seniorityLevel": "junior" | "mid" | "senior" | "unknown",
  "yearsOfExperience": number | null,
  "languages": ["string"],
  "education": ["string"],
  "certifications": ["string"],
  "strengths": ["string"]
}

Rules:
- Use only data present in the CV text.
- If not found, return empty arrays or null.
- Do not add explanations.`;
}

function parseJson(content: string): unknown {
  return parseJsonStrict(content, (message, details) => new CVParserError(message, "AI_INVALID_JSON", details));
}

function normalizeArray(value: unknown, fieldName: string): string[] {
  return normalizeStringArray(value, fieldName, (message) => new CVParserError(message, "AI_INVALID_SHAPE"));
}

function normalizeYears(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function validateStructuredCV(data: unknown): StructuredCV {
  if (!data || typeof data !== "object") {
    throw new CVParserError("Invalid AI response", "AI_INVALID_SHAPE");
  }

  const record = data as Record<string, unknown>;
  const requiredFields = [
    "skills",
    "technologies",
    "seniorityLevel",
    "yearsOfExperience",
    "languages",
    "education",
    "certifications",
    "strengths",
  ];

  const missing = requiredFields.filter((field) => !(field in record));
  if (missing.length > 0) {
    throw new CVParserError(
      `Incomplete AI response: ${missing.join(", ")}`,
      "AI_MISSING_FIELDS"
    );
  }

  const seniorityLevel = record.seniorityLevel;
  const allowedSeniority = ["junior", "mid", "senior", "unknown"];

  if (typeof seniorityLevel !== "string" || !allowedSeniority.includes(seniorityLevel)) {
    throw new CVParserError("Invalid seniorityLevel", "AI_INVALID_SHAPE");
  }

  return {
    skills: normalizeArray(record.skills, "skills"),
    technologies: normalizeArray(record.technologies, "technologies"),
    seniorityLevel: seniorityLevel as StructuredCV["seniorityLevel"],
    yearsOfExperience: normalizeYears(record.yearsOfExperience),
    languages: normalizeArray(record.languages, "languages"),
    education: normalizeArray(record.education, "education"),
    certifications: normalizeArray(record.certifications, "certifications"),
    strengths: normalizeArray(record.strengths, "strengths"),
  };
}

export async function parseCVToStructuredData(cvText: string): Promise<StructuredCV> {
  if (!cvText || cvText.trim().length === 0) {
    throw new CVParserError("CV text is empty", "CV_EMPTY_TEXT");
  }

  const prompt = buildStructuredCVPrompt(cvText);

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
      max_tokens: 1200,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new CVParserError("AI returned an empty response", "AI_EMPTY_RESPONSE");
    }

    const parsed = parseJson(content);
    return validateStructuredCV(parsed);
  } catch (error) {
    if (error instanceof CVParserError) {
      throw error;
    }

    const details = error instanceof Error ? error.message : "Unknown error";
    throw new CVParserError("Failed to process CV with AI", "AI_PROCESSING_FAILED", details);
  }
}

import fs from "fs/promises";
import pdf from "pdf-parse";
import OpenAI from "openai";
import type { StructuredCV } from "../types/analysis.js";

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
      throw new CVParserError("PDF sem texto extraido", "PDF_EMPTY_TEXT");
    }

    return result.text;
  } catch (error) {
    if (error instanceof CVParserError) {
      throw error;
    }

    const details = error instanceof Error ? error.message : "Erro desconhecido";
    throw new CVParserError("Falha ao extrair texto do PDF", "PDF_PARSE_FAILED", details);
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

function parseJsonStrict(content: string): unknown {
  const trimmed = content.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) {
    throw new CVParserError("Resposta da IA nao esta em JSON", "AI_INVALID_JSON");
  }

  try {
    return JSON.parse(trimmed);
  } catch (error) {
    const details = error instanceof Error ? error.message : "Erro desconhecido";
    throw new CVParserError("Falha ao parsear JSON da IA", "AI_INVALID_JSON", details);
  }
}

function normalizeStringArray(value: unknown, fieldName: string): string[] {
  if (!Array.isArray(value)) {
    throw new CVParserError(`Campo ${fieldName} deve ser um array`, "AI_INVALID_SHAPE");
  }

  const cleaned = value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  return Array.from(new Set(cleaned));
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
    throw new CVParserError("Resposta da IA invalida", "AI_INVALID_SHAPE");
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
      `Resposta da IA incompleta: ${missing.join(", ")}`,
      "AI_MISSING_FIELDS"
    );
  }

  const seniorityLevel = record.seniorityLevel;
  const allowedSeniority = ["junior", "mid", "senior", "unknown"];

  if (typeof seniorityLevel !== "string" || !allowedSeniority.includes(seniorityLevel)) {
    throw new CVParserError("seniorityLevel invalido", "AI_INVALID_SHAPE");
  }

  return {
    skills: normalizeStringArray(record.skills, "skills"),
    technologies: normalizeStringArray(record.technologies, "technologies"),
    seniorityLevel: seniorityLevel as StructuredCV["seniorityLevel"],
    yearsOfExperience: normalizeYears(record.yearsOfExperience),
    languages: normalizeStringArray(record.languages, "languages"),
    education: normalizeStringArray(record.education, "education"),
    certifications: normalizeStringArray(record.certifications, "certifications"),
    strengths: normalizeStringArray(record.strengths, "strengths"),
  };
}

export async function parseCVToStructuredData(cvText: string): Promise<StructuredCV> {
  if (!cvText || cvText.trim().length === 0) {
    throw new CVParserError("Texto do CV vazio", "CV_EMPTY_TEXT");
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
      throw new CVParserError("IA retornou resposta vazia", "AI_EMPTY_RESPONSE");
    }

    const parsed = parseJsonStrict(content);
    return validateStructuredCV(parsed);
  } catch (error) {
    if (error instanceof CVParserError) {
      throw error;
    }

    const details = error instanceof Error ? error.message : "Erro desconhecido";
    throw new CVParserError("Falha ao processar CV com IA", "AI_PROCESSING_FAILED", details);
  }
}

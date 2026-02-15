import express from "express";
import request from "supertest";
import fs from "fs/promises";
import { createAnalyzeRouter } from "./analyze.js";
import { extractTextFromPDF } from "../services/cvParserService.js";
import type { AIService } from "../services/aiService.js";
import { AI_FAILURE_REASON, AI_FALLBACK_PROVIDER } from "../types/analysis.js";
import type { AnalysisResult } from "../types/analysis.js";
import { AIProviderError } from "../services/providers/providerErrors.js";
import { AI_PROVIDER } from "../services/providers/types.js";

jest.mock("fs/promises");
jest.mock("../services/cvParserService.js", () => ({
  extractTextFromPDF: jest.fn(),
}));

const mockFs = fs as jest.Mocked<typeof fs>;
const mockExtract = extractTextFromPDF as jest.MockedFunction<typeof extractTextFromPDF>;

function createApp(aiService: AIService) {
  const app = express();
  app.use(express.json({ limit: "10mb" }));
  app.use("/api/analyze", createAnalyzeRouter(aiService));
  return app;
}

const baseResult: AnalysisResult = {
  fitScore: 70,
  decision: "apply",
  strengths: [],
  gaps: [],
  cvSuggestions: [],
  recruiterMessage: "ok",
  coverLetter: "ok",
  explanation: {
    positives: [],
    negatives: [],
    summary: "ok",
  },
  promptVersion: "test",
};

describe("POST /api/analyze", () => {
  const jobDescription = "x".repeat(60);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects resumeUrl outside upload dir", async () => {
    const aiService = {
      analyzeJobFit: jest.fn().mockResolvedValue(baseResult),
    } as unknown as AIService;

    const app = createApp(aiService);

    const response = await request(app)
      .post("/api/analyze")
      .send({ cv: "", jobDescription, resumeUrl: "../evil.pdf", language: "pt" });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/Falha ao extrair CV do PDF/i);
    expect(mockExtract).not.toHaveBeenCalled();
  });

  it("rejects non-pdf resumeUrl", async () => {
    const aiService = {
      analyzeJobFit: jest.fn().mockResolvedValue(baseResult),
    } as unknown as AIService;

    const app = createApp(aiService);

    const response = await request(app)
      .post("/api/analyze")
      .send({ cv: "", jobDescription, resumeUrl: "resume.txt", language: "pt" });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/Falha ao extrair CV do PDF/i);
    expect(mockExtract).not.toHaveBeenCalled();
  });

  it("extracts PDF when resumeUrl is valid", async () => {
    const aiService = {
      analyzeJobFit: jest.fn().mockResolvedValue(baseResult),
    } as unknown as AIService;

    mockFs.access.mockResolvedValue(undefined);
    mockExtract.mockResolvedValue("cv text");

    const app = createApp(aiService);

    const response = await request(app)
      .post("/api/analyze")
      .send({ cv: "", jobDescription, resumeUrl: "resume.pdf" });

    expect(response.status).toBe(200);
    expect(mockExtract).toHaveBeenCalledTimes(1);
    expect(aiService.analyzeJobFit).toHaveBeenCalledWith("cv text", jobDescription, "en");
  });

  it("returns fallback response on provider rate limit", async () => {
    const aiService = {
      analyzeJobFit: jest.fn().mockRejectedValue(
        new AIProviderError({
          provider: AI_PROVIDER.GROQ,
          reason: AI_FAILURE_REASON.RateLimit,
          message: "Rate limit",
          prompt: {
            system: "system prompt",
            user: "user prompt",
          },
        })
      ),
    } as unknown as AIService;

    const app = createApp(aiService);

    const response = await request(app)
      .post("/api/analyze")
      .send({ cv: "sample cv text".repeat(5), jobDescription, language: "en" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: false,
      fallback: AI_FALLBACK_PROVIDER.Firebase,
      reason: AI_FAILURE_REASON.RateLimit,
      message: "Primary AI provider unavailable",
      prompt: {
        system: "system prompt",
        user: "user prompt",
      },
    });
  });
});

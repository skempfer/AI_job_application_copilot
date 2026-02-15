import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs/promises";
import { AIService } from "../services/aiService.js";
import { saveAnalysis } from "../services/databaseService.js";
import { extractTextFromPDF } from "../services/cvParserService.js";
import { AI_FALLBACK_PROVIDER } from "../types/analysis.js";
import type { AIProviderFallbackResponse, AnalysisRequest } from "../types/analysis.js";
import { AIProviderError } from "../services/providers/providerErrors.js";
import { getErrorMessage, getLanguageFromRequest } from "../i18n/index.js";

export function createAnalyzeRouter(aiService: AIService): Router {
  const router = Router();

  router.post("/", async (req: Request, res: Response) => {
    try {
      const { cv, jobDescription, resumeUrl, language } = req.body as AnalysisRequest & { resumeUrl?: string };
      const lang = getLanguageFromRequest(language);

      if (!resumeUrl && (!cv || typeof cv !== "string" || cv.trim().length === 0)) {
        res.status(400).json({ error: getErrorMessage('cvRequired', lang) });
        return;
      }

      if (!jobDescription || typeof jobDescription !== "string" || jobDescription.trim().length === 0) {
        res.status(400).json({ error: getErrorMessage('jobDescriptionRequired', lang) });
        return;
      }

      if (!resumeUrl && cv && cv.trim().length < 50) {
        res.status(400).json({ error: getErrorMessage('cvTooShort', lang) });
        return;
      }

      if (jobDescription.trim().length < 50) {
        res.status(400).json({ error: getErrorMessage('jobDescriptionTooShort', lang) });
        return;
      }
      let cvText = cv?.trim() || "";

      if (!cvText && resumeUrl) {
        try {
          const uploadDir = path.resolve(process.cwd(), "tmp", "uploads");
          const pdfPath = path.resolve(uploadDir, resumeUrl);
          
          if (!pdfPath.startsWith(uploadDir)) {
            throw new Error(getErrorMessage('invalidResumePath', lang));
          }

          if (path.extname(pdfPath).toLowerCase() !== ".pdf") {
            throw new Error(getErrorMessage('invalidFileType', lang));
          }
          
          await fs.access(pdfPath, fs.constants.F_OK).catch(() => {
            throw new Error(getErrorMessage('fileNotFound', lang, { filename: resumeUrl }));
          });

          cvText = await extractTextFromPDF(pdfPath);
        } catch (error) {
          cvText = "";
        }
      }

      if (!cvText || cvText.trim().length === 0) {
        res.status(400).json({ error: getErrorMessage('pdfExtractionFailed', lang) });
        return;
      }

      const analysisLanguage = (language as "pt" | "en" | undefined) || "en";
      const result = await aiService.analyzeJobFit(cvText, jobDescription.trim(), analysisLanguage);

      if (process.env.USE_FIREBASE === "true") {
        try {
          await saveAnalysis({
            timestamp: Date.now(),
            fitScore: result.fitScore,
            decision: result.decision,
            resumeFileName: resumeUrl || undefined,
            strengths: result.strengths,
            weaknesses: result.gaps,
            improvements: result.cvSuggestions,
          });
        } catch (dbError) {
          console.error("⚠️  Error saving to database (non-critical):", dbError);
        }
      }
      
      res.json(result);
    } catch (error) {
      console.error("Error analyzing job fit:", error);
      const lang = getLanguageFromRequest((req.body as AnalysisRequest)?.language);

      if (error instanceof AIProviderError && error.prompt) {
        const fallbackResponse: AIProviderFallbackResponse = {
          success: false,
          fallback: AI_FALLBACK_PROVIDER.Firebase,
          reason: error.reason,
          message: "Primary AI provider unavailable",
          prompt: error.prompt,
        };

        res.status(200).json(fallbackResponse);
        return;
      }

      if (error instanceof AIProviderError) {
        res.status(500).json({
          error: getErrorMessage('internalServerError', lang),
          details: "Provider fallback prompt missing",
        });
        return;
      }

      if (error instanceof Error) {
        res.status(500).json({
          error: getErrorMessage('internalServerError', lang),
          details: error.message,
        });
      } else {
        res.status(500).json({ error: getErrorMessage('unknownError', lang) });
      }
    }
  });

  return router;
}

import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs/promises";
import { AIService, extractTextFromPDF } from "@viora/core";
import { saveAnalysis } from "../services/databaseService.js";
import type { AnalysisRequest } from "../types/analysis.js";
import { AIProviderError } from "@viora/core";
import { getErrorMessage, getLanguageFromRequest } from "../i18n/index.js";
import { checkRateLimit, incrementUsage } from "../services/rateLimitService.js";
import { logAnalysisUsage } from "../services/usageLoggingService.js";

function getClientIP(req: Request): string {
  const xForwardedFor = req.headers["x-forwarded-for"];
  if (xForwardedFor) {
    const ips = typeof xForwardedFor === "string" ? xForwardedFor.split(",") : xForwardedFor;
    return ips[0].trim();
  }
  return req.ip || req.socket.remoteAddress || "unknown";
}

export function createAnalyzeRouter(aiService: AIService): Router {
  const router = Router();

  router.post("/", async (req: Request, res: Response) => {
    try {
      const clientIP = getClientIP(req);
      const lang = getLanguageFromRequest((req.body as AnalysisRequest)?.language);

      const rateLimit = checkRateLimit(clientIP);
      if (!rateLimit.allowed) {
        logAnalysisUsage(clientIP, false, "rate_limited", {});

        const nowMs = Date.now();
        const resetTimeMs = rateLimit.resetTime.getTime();
        const remainingMs = Math.max(0, resetTimeMs - nowMs);
        const hours = Math.floor(remainingMs / (1000 * 60 * 60));
        const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

        res.status(429).json({
          error: "daily_limit_exceeded",
          message: getErrorMessage('dailyLimitExceeded', lang, {
            hours: hours.toString(),
            minutes: minutes.toString(),
          }),
          remaining: 0,
          resetTime: rateLimit.resetTime.toISOString(),
        });
        return;
      }

      const { cv, jobDescription, resumeUrl, language, uiLanguage, jobLanguage } = req.body as AnalysisRequest & { resumeUrl?: string };

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

      const effectiveUiLanguage = (uiLanguage as "pt" | "en" | undefined) ||
        (language as "pt" | "en" | undefined) ||
        "en";
      const effectiveJobLanguage = jobLanguage as "pt" | "en" | undefined;

      const startTime = Date.now();
      const result = await aiService.analyzeJobFit(
        cvText,
        jobDescription.trim(),
        effectiveUiLanguage,
        effectiveJobLanguage
      );
      const responseTimeMs = Date.now() - startTime;

      const cacheHit = (result as any).cacheHit === true;
      logAnalysisUsage(clientIP, cacheHit, "llama-3.3-70b-versatile", {
        responseTimeMs,
        cvLength: cvText.length,
        jobDescriptionLength: jobDescription.length,
      });

      incrementUsage(clientIP);

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
      const clientIP = getClientIP(req);
      console.error("Error analyzing job fit:", error);
      const lang = getLanguageFromRequest((req.body as AnalysisRequest)?.language);

      logAnalysisUsage(clientIP, false, "error", {});

      if (error instanceof AIProviderError) {
        res.status(500).json({
          error: getErrorMessage('internalServerError', lang),
          details: error.message,
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

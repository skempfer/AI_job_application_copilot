import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs/promises";
import { AIService } from "../services/aiService.js";
import { saveAnalysis } from "../services/databaseService.js";
import { extractTextFromPDF } from "../services/cvParserService.js";
import type { AnalysisRequest } from "../types/analysis.js";
import { getErrorMessage, getLanguageFromRequest } from "../i18n/index.js";

export function createAnalyzeRouter(aiService: AIService): Router {
  const router = Router();

  router.post("/", async (req: Request, res: Response) => {
    try {
      const { cv, jobDescription, resumeUrl, language } = req.body as AnalysisRequest & { resumeUrl?: string };
      const lang = getLanguageFromRequest(language);

      console.log("\n\n");
      console.log("====================================================");
      console.log("🚀🚀🚀 ROUTE /API/ANALYZE CALLED - NEW CODE! 🚀🚀🚀");
      console.log("====================================================");
      console.log("\n[POST /api/analyze] Request received");
      console.log("[POST /api/analyze] CV provided:", !!cv, "| CV length:", cv?.length || 0);
      console.log("[POST /api/analyze] Job description length:", jobDescription?.length || 0);
      console.log("[POST /api/analyze] Resume URL:", resumeUrl || "none");
      console.log("[POST /api/analyze] Language:", language || "en");

      if (!resumeUrl && (!cv || typeof cv !== "string" || cv.trim().length === 0)) {
        console.error("❌ ERROR: Empty CV and no resumeUrl");
        res.status(400).json({ error: getErrorMessage('cvRequired', lang) });
        return;
      }

      if (!jobDescription || typeof jobDescription !== "string" || jobDescription.trim().length === 0) {
        console.error("❌ ERROR: Job description is empty");
        res.status(400).json({ error: getErrorMessage('jobDescriptionRequired', lang) });
        return;
      }

      if (!resumeUrl && cv && cv.trim().length < 50) {
        console.error("❌ ERROR: CV too short");
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
            console.error("   ❌ Invalid resume path (outside upload directory)");
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
          console.error(`\n❌ Error extracting PDF:`, error instanceof Error ? error.message : error);
          cvText = "";
        }
      }

      if (!cvText || cvText.trim().length === 0) {
        console.error("❌ ERROR: CV empty after PDF extraction");
        res.status(400).json({ error: getErrorMessage('pdfExtractionFailed', lang) });
        return;
      }

      const analysisLanguage = (language as "pt" | "en" | undefined) || "en";
      console.log("\n[POST /api/analyze] Starting AI analysis with CV length:", cvText.length);
      console.log("[POST /api/analyze] CV first 150 chars:", cvText.substring(0, 150));
      const result = await aiService.analyzeJobFit(cvText, jobDescription.trim(), analysisLanguage);

      console.log("\n[POST /api/analyze] ✅ Analysis complete");
      console.log("[POST /api/analyze] Result has preprocessedCV:", !!result.preprocessedCV);
      if (result.preprocessedCV) {
        console.log("[POST /api/analyze] Preprocessing data:", {
          yearsExperience: result.preprocessedCV.yearsExperience,
          yearsExperienceConfidence: result.preprocessedCV.yearsExperienceConfidence,
          domains: result.preprocessedCV.domainExperience,
          seniority: result.preprocessedCV.seniority,
        });
      }

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

      console.log("\n[POST /api/analyze] 📤 Sending response to client...");
      console.log("[POST /api/analyze] Response object keys:", Object.keys(result));
      console.log("[POST /api/analyze] preprocessedCV included:", !!result.preprocessedCV);
      
      res.json(result);
    } catch (error) {
      console.error("Error analyzing job fit:", error);
      const lang = getLanguageFromRequest((req.body as AnalysisRequest)?.language);

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

import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs/promises";
import { AIService } from "../services/aiService.js";
import { saveAnalysis } from "../services/databaseService.js";
import { extractTextFromPDF } from "../services/cvParserService.js";
import type { AnalysisRequest } from "../types/analysis.js";

export function createAnalyzeRouter(aiService: AIService): Router {
  const router = Router();

  router.post("/", async (req: Request, res: Response) => {
    try {
      const { cv, jobDescription, resumeUrl, language } = req.body as AnalysisRequest & { resumeUrl?: string };

      if (!resumeUrl && (!cv || typeof cv !== "string" || cv.trim().length === 0)) {
        console.error("❌ ERROR: Empty CV and no resumeUrl");
        res.status(400).json({ error: "CV or PDF file is required" });
        return;
      }

      if (!jobDescription || typeof jobDescription !== "string" || jobDescription.trim().length === 0) {
        console.error("❌ ERROR: Job description is empty");
        res.status(400).json({ error: "Job description is required" });
        return;
      }

      if (!resumeUrl && cv && cv.trim().length < 50) {
        console.error("❌ ERROR: CV too short");
        res.status(400).json({ error: "CV too short. Provide more details." });
        return;
      }

      if (jobDescription.trim().length < 50) {
        res.status(400).json({ error: "Job description too short. Paste the full job description." });
        return;
      }

      let cvText = cv?.trim() || "";

      if (!cvText && resumeUrl) {
        try {
          const uploadDir = path.resolve(process.cwd(), "tmp", "uploads");
          const pdfPath = path.resolve(uploadDir, resumeUrl);
          
          if (!pdfPath.startsWith(uploadDir)) {
            console.error("   ❌ Invalid resume path (outside upload directory)");
            throw new Error("Invalid resume path");
          }

          if (path.extname(pdfPath).toLowerCase() !== ".pdf") {
            throw new Error("Invalid resume file type");
          }
          
          await fs.access(pdfPath, fs.constants.F_OK).catch(() => {
            throw new Error(`File not found: ${resumeUrl}`);
          });

          cvText = await extractTextFromPDF(pdfPath);
        } catch (error) {
          console.error(`\n❌ Error extracting PDF:`, error instanceof Error ? error.message : error);
          cvText = "";
        }
      }

      if (!cvText || cvText.trim().length === 0) {
        console.error("❌ ERROR: CV empty after PDF extraction");
        res.status(400).json({ error: "Failed to extract CV from PDF. Try sending the CV as text." });
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

      if (error instanceof Error) {
        res.status(500).json({
          error: "Error processing analysis",
          details: error.message,
        });
      } else {
        res.status(500).json({ error: "Unknown error while processing analysis" });
      }
    }
  });

  return router;
}

import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs/promises";
import { AIService, extractTextFromPDF } from "@viora/core";
import { saveAnalysis } from "../services/databaseService.js";
import type { AnalysisRequest } from "../types/analysis.js";

export function createAnalyzeRouter(aiService: AIService): Router {
  const router = Router();

  const uploadDir = "/tmp/uploads";

  async function ensureUploadDir() {
    await fs.mkdir(uploadDir, { recursive: true });
  }

  async function downloadResumeToTmp(resumeUrl: string): Promise<string> {
    await ensureUploadDir();

    const response = await fetch(resumeUrl);
    if (!response.ok) {
      throw new Error(`Failed to download resume: ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("pdf")) {
      throw new Error("Resume URL did not return a PDF");
    }

    const arrayBuffer = await response.arrayBuffer();
    const fileName = `resume-${Date.now()}.pdf`;
    const pdfPath = path.resolve(uploadDir, fileName);
    await fs.writeFile(pdfPath, Buffer.from(arrayBuffer));
    return pdfPath;
  }

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
          let pdfPath = "";

          if (/^https?:\/\//i.test(resumeUrl)) {
            pdfPath = await downloadResumeToTmp(resumeUrl);
          } else {
            await ensureUploadDir();
            pdfPath = path.resolve(uploadDir, resumeUrl);
          }
          
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

      // Extract language parameters for proper routing
      // Priority: uiLanguage > language > default to 'en'
      const effectiveUiLanguage = (req.body.uiLanguage as "pt" | "en" | undefined) || 
                                   (language as "pt" | "en" | undefined) || 
                                   "en";
      const effectiveJobLanguage = req.body.jobLanguage as "pt" | "en" | undefined;

      const result = await aiService.analyzeJobFit(
        cvText, 
        jobDescription.trim(), 
        effectiveUiLanguage,
        effectiveJobLanguage
      );

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

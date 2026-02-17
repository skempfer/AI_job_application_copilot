import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs/promises";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import http from "http";
import https from "https";
import { extractTextFromPDF, parseCVToStructuredData, CVParserError, analyzeGap, GapAnalyzerError } from "@viora/core";
import { saveAnalysis } from "../services/databaseService.js";
import type { GapAnalysisRequest } from "../types/analysis.js";

const uploadDir = path.join(process.cwd(), "tmp", "uploads");

function resolveResumePath(resumePath: string): string {
  if (path.isAbsolute(resumePath)) {
    return resumePath;
  }

  return path.join(uploadDir, resumePath);
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

async function downloadResumeFromUrl(url: string, targetPath: string): Promise<void> {
  await fs.mkdir(uploadDir, { recursive: true });

  return new Promise((resolve, reject) => {
    const client = url.startsWith("https:") ? https : http;

    const request = client.get(url, (response) => {
      if (response.statusCode && response.statusCode >= 400) {
        reject(new Error(`Failed to download resume: HTTP ${response.statusCode}`));
        response.resume();
        return;
      }

      const fileStream = createWriteStream(targetPath);
      pipeline(response, fileStream).then(resolve).catch(reject);
    });

    request.on("error", reject);
  });
}

export function createAnalyzeWithGapRouter(): Router {
  const router = Router();

  router.post("/", async (req: Request, res: Response) => {
    let downloadedFilePath: string | null = null;

    try {
      const { jobDescription, resumePath, cv } = req.body as GapAnalysisRequest & { cv?: string };

      const hasResumePath = resumePath && typeof resumePath === "string" && resumePath.trim().length > 0;
      const hasCv = cv && typeof cv === "string" && cv.trim().length > 0;

      if (!hasResumePath && !hasCv) {
        res.status(400).json({ error: "Resume path or CV is required" });
        return;
      }

      if (!jobDescription || typeof jobDescription !== "string" || jobDescription.trim().length === 0) {
        res.status(400).json({ error: "Job description is required" });
        return;
      }

      if (jobDescription.trim().length < 50) {
        res.status(400).json({ error: "Job description too short. Paste the full job description." });
        return;
      }

      let cvText: string;

      if (hasResumePath) {
        let resumePathToUse = resumePath.trim();

        if (isHttpUrl(resumePathToUse)) {
          downloadedFilePath = path.join(
            uploadDir,
            `remote-${Date.now()}-${Math.random().toString(36).slice(2)}.pdf`
          );
          await downloadResumeFromUrl(resumePathToUse, downloadedFilePath);
          resumePathToUse = downloadedFilePath;
        }

        const resolvedPath = resolveResumePath(resumePathToUse);
        const normalizedPath = path.resolve(resolvedPath);

        if (!path.isAbsolute(resumePathToUse)) {
          const normalizedUploadDir = path.resolve(uploadDir);
          if (!normalizedPath.startsWith(normalizedUploadDir)) {
            res.status(400).json({ error: "Invalid resume path" });
            return;
          }
        }

        try {
          const stat = await fs.stat(normalizedPath);
          if (!stat.isFile()) {
            res.status(400).json({ error: "Resume path does not point to a valid file" });
            return;
          }
        } catch {
          res.status(400).json({ error: "Resume file not found" });
          return;
        }

        if (path.extname(normalizedPath).toLowerCase() !== ".pdf") {
          res.status(400).json({ error: "Only PDF files are allowed" });
          return;
        }

        cvText = await extractTextFromPDF(normalizedPath);
      } else {
        if (!cv || cv.trim().length < 50) {
          res.status(400).json({ error: "CV too short. Provide more details." });
          return;
        }
        cvText = cv.trim();      }
      
      const structuredCV = await parseCVToStructuredData(cvText);
      
      const gapResult = await analyzeGap(structuredCV, jobDescription.trim());

      if (process.env.USE_FIREBASE === "true") {
        try {
          await saveAnalysis({
            timestamp: Date.now(),
            fitScore: gapResult.matchScore,
            decision: gapResult.matchScore >= 70 ? "apply" : gapResult.matchScore >= 50 ? "apply_with_fixes" : "skip",
            resumeFileName: hasResumePath ? resumePath : "[CV Text]",
            strengths: gapResult.strongMatches,
            weaknesses: gapResult.missingCriticalSkills,
            improvements: gapResult.suggestedFocusAreas,
          });
        } catch (dbError) {
          console.error("⚠️ Error saving to Firebase (non-critical):", dbError);
        }
      }

      res.json({
        ...gapResult,
        structuredCV,
      });
    } catch (error) {
      console.error("Error running gap analysis:", error);

      if (error instanceof CVParserError || error instanceof GapAnalyzerError) {
        res.status(422).json({
          error: error.message,
          code: error.code,
          details: error.details,
        });
        return;
      }

      if (error instanceof Error) {
        res.status(500).json({
          error: "Error processing gap analysis",
          details: error.message,
        });
      } else {
        res.status(500).json({ error: "Unknown error while processing gap analysis" });
      }
    } finally {
      if (downloadedFilePath) {
        try {
          await fs.unlink(downloadedFilePath);
        } catch (cleanupError) {
          console.warn("⚠️ Failed to remove temporary file:", cleanupError);
        }
      }
    }
  });

  return router;
}

/**
 * Test route: Validate preprocessing without calling the AI
 *
 * POST /api/test-preprocessing
 *
 * Returns:
 * - Raw CV
 * - Preprocessed CV
 * - Raw Job Description
 * - Preprocessed Job Description
 * - Final prompt that would be sent to the AI
 */

import { Router, Request, Response } from "express";
import { preprocessCV, preprocessJobDescription } from "../services/preprocessing.js";
import { buildOptimizedPrompt } from "../services/promptBuilder.js";
import type { AnalysisRequest } from "../types/analysis.js";

export function createTestPreprocessingRouter(): Router {
  const router = Router();

  router.post("/", async (req: Request, res: Response) => {
    try {
      const { cv, jobDescription, language = "pt" } = req.body as AnalysisRequest & { language?: string };

      // Basic validation
      if (!cv || typeof cv !== "string" || cv.trim().length === 0) {
        res.status(400).json({
          error: "CV is required and cannot be empty",
          received: {
            cv: cv ? `${cv.length} characters` : "EMPTY",
            jobDescription: jobDescription ? `${jobDescription.length} characters` : "EMPTY",
          },
        });
        return;
      }

      if (!jobDescription || typeof jobDescription !== "string" || jobDescription.trim().length === 0) {
        res.status(400).json({
          error: "Job Description is required and cannot be empty",
          received: {
            cv: cv ? `${cv.length} characters` : "EMPTY",
            jobDescription: jobDescription ? `${jobDescription.length} characters` : "EMPTY",
          },
        });
        return;
      }

      const processedCV = preprocessCV(cv);

      const processedJob = preprocessJobDescription(jobDescription);

      const analyzeLanguage = (language as "pt" | "en") || "pt";
      const prompt = buildOptimizedPrompt(processedCV, processedJob, analyzeLanguage);

      res.json({
        success: true,
        input: {
          cvLength: cv.length,
          jobDescriptionLength: jobDescription.length,
          language: analyzeLanguage,
        },
        processed: {
          cv: processedCV,
          job: processedJob,
        },
        prompt: {
          content: prompt,
          length: prompt.length,
          estimatedTokens: Math.ceil(prompt.length / 4),
        },
        analysis: {
          cvHasContent: cv.trim().length > 0,
          jobHasContent: jobDescription.trim().length > 0,
          cvSkillsDetected: processedCV.skills.length,
          jobMandatoryRequirements: processedJob.mandatoryRequirements.length,
          reduction: {
            originalSize: cv.length + jobDescription.length,
            promptSize: prompt.length,
            percentReduced: Math.round((1 - prompt.length / (cv.length + jobDescription.length)) * 100),
          },
        },
      });
    } catch (error) {
      console.error("❌ Error testing preprocessing:", error);
      res.status(500).json({
        error: "Error processing test",
        details: error instanceof Error ? error.message : "Unknown",
      });
    }
  });

  return router;
}

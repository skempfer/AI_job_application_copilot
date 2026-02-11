/**
 * Rota de teste: Valida preprocessamento sem enviar para IA
 * 
 * POST /api/test-preprocessing
 * 
 * Retorna:
 * - CV original
 * - CV após preprocessamento
 * - Job Description original
 * - Job Description após preprocessamento
 * - Prompt final que seria enviado à IA
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

      // Validação básica
      if (!cv || typeof cv !== "string" || cv.trim().length === 0) {
        res.status(400).json({
          error: "CV é obrigatório e não pode estar vazio",
          received: {
            cv: cv ? `${cv.length} caracteres` : "VAZIO",
            jobDescription: jobDescription ? `${jobDescription.length} caracteres` : "VAZIO",
          },
        });
        return;
      }

      if (!jobDescription || typeof jobDescription !== "string" || jobDescription.trim().length === 0) {
        res.status(400).json({
          error: "Job Description é obrigatória e não pode estar vazia",
          received: {
            cv: cv ? `${cv.length} caracteres` : "VAZIO",
            jobDescription: jobDescription ? `${jobDescription.length} caracteres` : "VAZIO",
          },
        });
        return;
      }

      // 1. Preprocessar CV
      console.log("\n🔍 TESTANDO: Preprocessando CV...");
      const processedCV = preprocessCV(cv);
      console.log("✅ CV preprocessado");

      // 2. Preprocessar Job Description
      console.log("\n🔍 TESTANDO: Preprocessando Job Description...");
      const processedJob = preprocessJobDescription(jobDescription);
      console.log("✅ Job Description preprocessada");

      // 3. Construir prompt
      console.log("\n🔍 TESTANDO: Construindo prompt otimizado...");
      const analyzeLanguage = (language as "pt" | "en") || "pt";
      const prompt = buildOptimizedPrompt(processedCV, processedJob, analyzeLanguage);
      console.log("✅ Prompt construído");

      // Retornar dados estruturados para o cliente
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
      console.error("❌ Erro ao testar preprocessamento:", error);
      res.status(500).json({
        error: "Erro ao processar teste",
        details: error instanceof Error ? error.message : "Desconhecido",
      });
    }
  });

  return router;
}

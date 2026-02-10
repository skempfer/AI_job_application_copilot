import { Router, Request, Response } from "express";
import { AIService } from "../services/aiService.js";
import type { AnalysisRequest } from "../types/analysis.js";

export function createAnalyzeRouter(aiService: AIService): Router {
  const router = Router();

  router.post("/", async (req: Request, res: Response) => {
    try {
      const { cv, jobDescription } = req.body as AnalysisRequest;

      // Validação de input
      if (!cv || typeof cv !== "string" || cv.trim().length === 0) {
        res.status(400).json({ error: "CV é obrigatório" });
        return;
      }

      if (!jobDescription || typeof jobDescription !== "string" || jobDescription.trim().length === 0) {
        res.status(400).json({ error: "Job description é obrigatória" });
        return;
      }

      // Input muito curto provavelmente é inválido
      if (cv.trim().length < 50) {
        res.status(400).json({ error: "CV muito curto. Forneça informações mais detalhadas." });
        return;
      }

      if (jobDescription.trim().length < 50) {
        res.status(400).json({ error: "Job description muito curta. Cole a descrição completa da vaga." });
        return;
      }

      // Chamar IA
      const result = await aiService.analyzeJobFit(cv.trim(), jobDescription.trim());

      res.json(result);
    } catch (error) {
      console.error("Erro ao analisar job fit:", error);

      if (error instanceof Error) {
        res.status(500).json({
          error: "Erro ao processar análise",
          details: error.message,
        });
      } else {
        res.status(500).json({ error: "Erro desconhecido ao processar análise" });
      }
    }
  });

  return router;
}

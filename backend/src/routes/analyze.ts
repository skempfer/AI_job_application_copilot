import { Router, Request, Response } from "express";
import { AIService } from "../services/aiService.js";
import { saveAnalysis } from "../services/databaseService.js";
import type { AnalysisRequest } from "../types/analysis.js";

export function createAnalyzeRouter(aiService: AIService): Router {
  const router = Router();

  router.post("/", async (req: Request, res: Response) => {
    try {
      const { cv, jobDescription, resumeUrl } = req.body as AnalysisRequest & { resumeUrl?: string };

      // Validação de input - CV é opcional se houver resumeUrl
      if (!resumeUrl && (!cv || typeof cv !== "string" || cv.trim().length === 0)) {
        res.status(400).json({ error: "CV ou arquivo PDF é obrigatório" });
        return;
      }

      if (!jobDescription || typeof jobDescription !== "string" || jobDescription.trim().length === 0) {
        res.status(400).json({ error: "Job description é obrigatória" });
        return;
      }

      // Input muito curto provavelmente é inválido (apenas se não houver resumeUrl)
      if (!resumeUrl && cv && cv.trim().length < 50) {
        res.status(400).json({ error: "CV muito curto. Forneça informações mais detalhadas." });
        return;
      }

      if (jobDescription.trim().length < 50) {
        res.status(400).json({ error: "Job description muito curta. Cole a descrição completa da vaga." });
        return;
      }

      // Chamar IA
      const cvText = cv?.trim() || "[CV fornecido via PDF]";
      const result = await aiService.analyzeJobFit(cvText, jobDescription.trim());

      // Salvar no Realtime Database (se Firebase estiver habilitado)
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
          console.error("⚠️  Erro ao salvar no database (não crítico):", dbError);
          // Não falhar a requisição se o database falhar
        }
      }

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

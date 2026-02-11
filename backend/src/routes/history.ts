import { Router, Request, Response } from "express";
import { getAnalysisHistory, getAnalysisById, getAnalyticsStats } from "../services/databaseService.js";

export function createHistoryRouter(): Router {
  const router = Router();

  /**
   * GET /api/history
   * Retorna histórico de análises
   */
  router.get("/", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;

      if (limit < 1 || limit > 100) {
        res.status(400).json({ error: "Limit deve estar entre 1 e 100" });
        return;
      }

      const history = await getAnalysisHistory(limit);
      res.json({ success: true, data: history, count: history.length });
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);

      if (error instanceof Error) {
        res.status(500).json({
          error: "Erro ao buscar histórico",
          details: error.message,
        });
      } else {
        res.status(500).json({ error: "Erro desconhecido ao buscar histórico" });
      }
    }
  });

  /**
   * GET /api/history/:id
   * Retorna uma análise específica
   */
  router.get("/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const analysis = await getAnalysisById(id);

      if (!analysis) {
        res.status(404).json({ error: "Análise não encontrada" });
        return;
      }

      res.json({ success: true, data: analysis });
    } catch (error) {
      console.error("Erro ao buscar análise:", error);

      if (error instanceof Error) {
        res.status(500).json({
          error: "Erro ao buscar análise",
          details: error.message,
        });
      } else {
        res.status(500).json({ error: "Erro desconhecido ao buscar análise" });
      }
    }
  });

  /**
   * GET /api/history/analytics/stats
   * Retorna estatísticas das análises
   */
  router.get("/analytics/stats", async (_req: Request, res: Response) => {
    try {
      const stats = await getAnalyticsStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);

      if (error instanceof Error) {
        res.status(500).json({
          error: "Erro ao buscar estatísticas",
          details: error.message,
        });
      } else {
        res.status(500).json({ error: "Erro desconhecido ao buscar estatísticas" });
      }
    }
  });

  return router;
}

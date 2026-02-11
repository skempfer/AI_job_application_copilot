import { Router, Request, Response } from "express";
import { getAnalysisHistory, getAnalysisById, getAnalyticsStats } from "../services/databaseService.js";

export function createHistoryRouter(): Router {
  const router = Router();

  /**
   * GET /api/history
   * Returns analysis history
   */
  router.get("/", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;

      if (limit < 1 || limit > 100) {
        res.status(400).json({ error: "Limit must be between 1 and 100" });
        return;
      }

      const history = await getAnalysisHistory(limit);
      res.json({ success: true, data: history, count: history.length });
    } catch (error) {
      console.error("Error fetching history:", error);

      if (error instanceof Error) {
        res.status(500).json({
          error: "Error fetching history",
          details: error.message,
        });
      } else {
        res.status(500).json({ error: "Unknown error while fetching history" });
      }
    }
  });

  /**
   * GET /api/history/:id
   * Returns a specific analysis
   */
  router.get("/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const analysis = await getAnalysisById(id);

      if (!analysis) {
        res.status(404).json({ error: "Analysis not found" });
        return;
      }

      res.json({ success: true, data: analysis });
    } catch (error) {
      console.error("Error fetching analysis:", error);

      if (error instanceof Error) {
        res.status(500).json({
          error: "Error fetching analysis",
          details: error.message,
        });
      } else {
        res.status(500).json({ error: "Unknown error while fetching analysis" });
      }
    }
  });

  /**
   * GET /api/history/analytics/stats
   * Returns analysis statistics
   */
  router.get("/analytics/stats", async (_req: Request, res: Response) => {
    try {
      const stats = await getAnalyticsStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error("Error fetching statistics:", error);

      if (error instanceof Error) {
        res.status(500).json({
          error: "Error fetching statistics",
          details: error.message,
        });
      } else {
        res.status(500).json({ error: "Unknown error while fetching statistics" });
      }
    }
  });

  return router;
}

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AIService } from "@viora/core";
import { createAnalyzeRouter } from "./routes/analyze.js";
import { createUploadRouter } from "./routes/upload.js";
import { createHistoryRouter } from "./routes/history.js";
import { createAnalyzeWithGapRouter } from "./routes/analyzeWithGap.js";
import { createTestPreprocessingRouter } from "./routes/testPreprocessing.js";
import { initializeFirebase } from "./config/firebase.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

if (process.env.USE_FIREBASE === "true") {
  try {
    initializeFirebase();
  } catch (error) {
    console.error("⚠️  Firebase could not be initialized. Local uploads will be used.");
  }
}

const aiService = new AIService({
  model: process.env.AI_MODEL_DEFAULT || "llama-3.3-70b-versatile",
});

app.use("/api/analyze", createAnalyzeRouter(aiService));
app.use("/api/analyze-with-gap", createAnalyzeWithGapRouter());
app.use("/api/upload", createUploadRouter());
app.use("/api/history", createHistoryRouter());
app.use("/api/test-preprocessing", createTestPreprocessingRouter());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((_req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Viora Backend running on http://localhost:${PORT}`);
  console.log(`⚡ AI Model: ${process.env.AI_MODEL_DEFAULT || "llama-3.3-70b-versatile (economic)"}`);
});

const gracefulShutdown = (signal: string) => {
  console.log(`\n${signal} received, closing server gracefully...`);
  server.close(() => {
    console.log("✅ Server closed, port released");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("❌ Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGINT", () => gracefulShutdown("SIGINT (Ctrl+C)"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  gracefulShutdown("uncaughtException");
});

import dotenv from "dotenv";
import path from "path";

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
}

import * as functions from "firebase-functions";
import express from "express";
import cors from "cors";
import { initializeFirebaseAdmin } from "./config/firebase";
import { AIService } from "@viora/core";
import { createAnalyzeRouter } from "./routes/analyze";
import { createUploadRouter } from "./routes/upload";
import { createHistoryRouter } from "./routes/history";
import { createAnalyzeWithGapRouter } from "./routes/analyzeWithGap";

initializeFirebaseAdmin();

const app = express();

app.use(cors({ origin: true }));
app.use(express.json({ limit: "10mb" }));

const groqApiKey = process.env.GROQ_API_KEY?.trim();
const groqModel = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const groqApiUrl = process.env.GROQ_API_URL || "https://api.groq.com/openai/v1";

if (!groqApiKey) {
  console.error("❌ GROQ_API_KEY not configured. Set it using:");
  console.error("   Option 1 (Recommended for production): firebase functions:secrets:set GROQ_API_KEY");
  console.error("   Option 2 (For testing): Create functions/.env.local with GROQ_API_KEY=your-key");
}

const aiService = new AIService({
  apiKey: groqApiKey || "",
  apiUrl: groqApiUrl,
  model: groqModel,
});

app.use("/api/analyze", createAnalyzeRouter(aiService));
app.use("/api/analyze-with-gap", createAnalyzeWithGapRouter());
app.use("/api/upload", createUploadRouter());
app.use("/api/history", createHistoryRouter());

app.get("/api/health", (_req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    environment: "firebase-functions",
    version: "1.0.1"
  });
});

app.use((_req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

export const api = functions
  .runWith({
    secrets: ["GROQ_API_KEY"],
  })
  .https.onRequest(app);

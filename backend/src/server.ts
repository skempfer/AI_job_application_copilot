import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AIService } from "./services/aiService.js";
import { createAnalyzeRouter } from "./routes/analyze.js";
import { createUploadRouter } from "./routes/upload.js";
import { createHistoryRouter } from "./routes/history.js";
import { createAnalyzeWithGapRouter } from "./routes/analyzeWithGap.js";
import { createTestPreprocessingRouter } from "./routes/testPreprocessing.js";
import { initializeFirebase } from "./config/firebase.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const requiredEnvVars = ["GROQ_API_KEY"];
const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`❌ Missing environment variables: ${missingEnvVars.join(", ")}`);
  console.error("Create a .env file based on .env.example");
  process.exit(1);
}

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
  apiKey: process.env.GROQ_API_KEY!,
  apiUrl: process.env.GROQ_API_URL || "https://api.groq.com/openai/v1",
  model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
  fallbackApiKey: process.env.DEEPSEEK_API_KEY,
  fallbackApiUrl: process.env.DEEPSEEK_API_URL || "https://api.deepseek.com",
  fallbackModel: process.env.DEEPSEEK_MODEL || "deepseek-chat",
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

app.listen(PORT, () => {
  console.log(`🚀 Viora Backend running on http://localhost:${PORT}`);
  console.log(`⚡ Primary provider: Groq (${process.env.GROQ_MODEL || "llama-3.3-70b-versatile"})`);
  if (process.env.DEEPSEEK_API_KEY) {
    console.log(`🔄 Fallback provider: DeepSeek (${process.env.DEEPSEEK_MODEL || "deepseek-chat"})`);
  } else {
    console.log(`⚠️  No fallback provider configured (set DEEPSEEK_API_KEY to enable)`);
  }
});

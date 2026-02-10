import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AIService } from "./services/aiService.js";
import { createAnalyzeRouter } from "./routes/analyze.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Validar variáveis de ambiente obrigatórias
const requiredEnvVars = ["GROQ_API_KEY"];
const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`❌ Variáveis de ambiente faltando: ${missingEnvVars.join(", ")}`);
  console.error("Crie um arquivo .env baseado no .env.example");
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" })); // Permitir CVs grandes

// Inicializar AI Service
const aiService = new AIService({
  apiKey: process.env.GROQ_API_KEY!,
  apiUrl: process.env.GROQ_API_URL || "https://api.groq.com/openai/v1",
  model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
});

// Routes
app.use("/api/analyze", createAnalyzeRouter(aiService));

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: "Endpoint não encontrado" });
});

app.listen(PORT, () => {
  console.log(`🚀 AI Job Copilot Backend rodando em http://localhost:${PORT}`);
  console.log(`⚡ Usando Groq: ${process.env.GROQ_MODEL || "llama-3.3-70b-versatile"}`);
});

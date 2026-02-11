import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs/promises";
import { AIService } from "../services/aiService.js";
import { saveAnalysis } from "../services/databaseService.js";
import { extractTextFromPDF } from "../services/cvParserService.js";
import type { AnalysisRequest } from "../types/analysis.js";

export function createAnalyzeRouter(aiService: AIService): Router {
  const router = Router();

  router.post("/", async (req: Request, res: Response) => {
    try {
      const { cv, jobDescription, resumeUrl, language } = req.body as AnalysisRequest & { resumeUrl?: string };

      console.log("\n📥 REQUISIÇÃO RECEBIDA EM /api/analyze:");
      console.log("   CV recebido:", {
        length: cv?.length || 0,
        isEmpty: !cv || cv.trim().length === 0,
        preview: cv ? (cv.substring(0, 80) + (cv.length > 80 ? "..." : "")) : "[VAZIO]"
      });
      console.log("   Job Description recebido:", {
        length: jobDescription?.length || 0,
        isEmpty: !jobDescription || jobDescription.trim().length === 0,
        preview: jobDescription ? (jobDescription.substring(0, 80) + (jobDescription.length > 80 ? "..." : "")) : "[VAZIO]"
      });
      console.log("   Resume URL:", resumeUrl ? "Sim" : "Não");
      console.log("   Language:", language || "default");

      // Validação de input - CV é opcional se houver resumeUrl
      if (!resumeUrl && (!cv || typeof cv !== "string" || cv.trim().length === 0)) {
        console.log("❌ ERRO: CV vazio e sem resumeUrl");
        res.status(400).json({ error: "CV ou arquivo PDF é obrigatório" });
        return;
      }

      if (!jobDescription || typeof jobDescription !== "string" || jobDescription.trim().length === 0) {
        console.log("❌ ERRO: Job Description vazia");
        res.status(400).json({ error: "Job description é obrigatória" });
        return;
      }

      // Input muito curto provavelmente é inválido (apenas se não houver resumeUrl)
      if (!resumeUrl && cv && cv.trim().length < 50) {
        console.log("❌ ERRO: CV muito curto");
        res.status(400).json({ error: "CV muito curto. Forneça informações mais detalhadas." });
        return;
      }

      if (jobDescription.trim().length < 50) {
        res.status(400).json({ error: "Job description muito curta. Cole a descrição completa da vaga." });
        return;
      }

      // Extract CV text (from input or PDF)
      let cvText = cv?.trim() || "";

      // If CV is empty but resumeUrl provided, extract from PDF
      if (!cvText && resumeUrl) {
        try {
          console.log(`\n🔄 CV vazio detectado. Tentando extrair do PDF...`);
          console.log(`   - resumeUrl: ${resumeUrl}`);
          const uploadDir = path.join(process.cwd(), "tmp", "uploads");
          const pdfPath = path.join(uploadDir, resumeUrl);
          console.log(`   - uploadDir: ${uploadDir}`);
          console.log(`   - pdfPath: ${pdfPath}`);
          
          // Check if file exists
          try {
            const stat = await fs.stat(pdfPath);
            console.log(`   ✅ Arquivo existe (${stat.size} bytes)`);
          } catch (err) {
            console.error(`   ❌ Arquivo não encontrado em ${pdfPath}`);
            throw new Error(`File not found at ${pdfPath}`);
          }

          console.log(`   🔍 Extraindo texto do PDF...`);
          cvText = await extractTextFromPDF(pdfPath);
          console.log(`   ✅ Extração bem-sucedida: ${cvText.length} caracteres extraídos`);
        } catch (error) {
          console.error(`\n❌ Erro na extração do PDF:`, error instanceof Error ? error.message : error);
          // If extraction fails, continue with empty CV and let validation handle it
          cvText = "";
        }
      }

      // Validação DEPOIS da extração de PDF
      if (!cvText || cvText.trim().length === 0) {
        console.log("❌ ERRO: CV vazio após extração de PDF");
        res.status(400).json({ error: "Falha ao extrair CV do PDF. Tente enviar o CV como texto." });
        return;
      }

      // Chamar IA
      const analysisLanguage = (language as "pt" | "en" | undefined) || "en";
      const result = await aiService.analyzeJobFit(cvText, jobDescription.trim(), analysisLanguage);

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

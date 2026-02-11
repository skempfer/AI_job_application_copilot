import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs/promises";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import http from "http";
import https from "https";
import { extractTextFromPDF, parseCVToStructuredData, CVParserError } from "../services/cvParserService.js";
import { analyzeGap, GapAnalyzerError } from "../services/gapAnalyzerService.js";
import { saveAnalysis } from "../services/databaseService.js";
import type { GapAnalysisRequest } from "../types/analysis.js";

const uploadDir = path.join(process.cwd(), "tmp", "uploads");

function resolveResumePath(resumePath: string): string {
  if (path.isAbsolute(resumePath)) {
    return resumePath;
  }

  return path.join(uploadDir, resumePath);
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

async function downloadResumeFromUrl(url: string, targetPath: string): Promise<void> {
  await fs.mkdir(uploadDir, { recursive: true });

  return new Promise((resolve, reject) => {
    const client = url.startsWith("https:") ? https : http;

    const request = client.get(url, (response) => {
      if (response.statusCode && response.statusCode >= 400) {
        reject(new Error(`Falha ao baixar resume: HTTP ${response.statusCode}`));
        response.resume();
        return;
      }

      const fileStream = createWriteStream(targetPath);
      pipeline(response, fileStream).then(resolve).catch(reject);
    });

    request.on("error", reject);
  });
}

export function createAnalyzeWithGapRouter(): Router {
  const router = Router();

  router.post("/", async (req: Request, res: Response) => {
    let downloadedFilePath: string | null = null;

    try {
      const { jobDescription, resumePath, cv } = req.body as GapAnalysisRequest & { cv?: string };

      const hasResumePath = resumePath && typeof resumePath === "string" && resumePath.trim().length > 0;
      const hasCv = cv && typeof cv === "string" && cv.trim().length > 0;

      if (!hasResumePath && !hasCv) {
        res.status(400).json({ error: "Resume path ou CV é obrigatório" });
        return;
      }

      if (!jobDescription || typeof jobDescription !== "string" || jobDescription.trim().length === 0) {
        res.status(400).json({ error: "Job description e obrigatoria" });
        return;
      }

      if (jobDescription.trim().length < 50) {
        res.status(400).json({ error: "Job description muito curta. Cole a descricao completa da vaga." });
        return;
      }

      let cvText: string;

      if (hasResumePath) {
        let resumePathToUse = resumePath.trim();

        if (isHttpUrl(resumePathToUse)) {
          downloadedFilePath = path.join(
            uploadDir,
            `remote-${Date.now()}-${Math.random().toString(36).slice(2)}.pdf`
          );
          console.log("⬇️ Downloading resume from URL:", resumePathToUse);
          await downloadResumeFromUrl(resumePathToUse, downloadedFilePath);
          resumePathToUse = downloadedFilePath;
        }

        const resolvedPath = resolveResumePath(resumePathToUse);
        const normalizedPath = path.resolve(resolvedPath);

        if (!path.isAbsolute(resumePathToUse)) {
          const normalizedUploadDir = path.resolve(uploadDir);
          if (!normalizedPath.startsWith(normalizedUploadDir)) {
            res.status(400).json({ error: "Resume path invalido" });
            return;
          }
        }

        try {
          const stat = await fs.stat(normalizedPath);
          if (!stat.isFile()) {
            res.status(400).json({ error: "Resume path nao aponta para um arquivo valido" });
            return;
          }
        } catch {
          res.status(400).json({ error: "Arquivo de resume nao encontrado" });
          return;
        }

        if (path.extname(normalizedPath).toLowerCase() !== ".pdf") {
          res.status(400).json({ error: "Apenas arquivos PDF sao permitidos" });
          return;
        }

        console.log("\n🔍 Starting Gap Analysis with PDF Resume...");
        console.log("📄 Extracting text from PDF:", normalizedPath);
        cvText = await extractTextFromPDF(normalizedPath);
        console.log(`✅ Extracted ${cvText.length} characters from PDF\n`);
      } else {
        // Usar CV de texto fornecido
        if (!cv || cv.trim().length < 50) {
          res.status(400).json({ error: "CV muito curto. Forneça informações mais detalhadas." });
          return;
        }
        console.log("\n🔍 Starting Gap Analysis with text CV...");
        cvText = cv.trim();
        console.log(`✅ Using provided CV text (${cvText.length} characters)\n`);
      }
      
      console.log("🤖 Parsing CV to structured data...");
      const structuredCV = await parseCVToStructuredData(cvText);
      console.log("✅ CV parsed successfully:");
      console.log(`   - Skills: ${structuredCV.skills.length}`);
      console.log(`   - Technologies: ${structuredCV.technologies.length}`);
      console.log(`   - Seniority: ${structuredCV.seniorityLevel}`);
      console.log(`   - Experience: ${structuredCV.yearsOfExperience || 'N/A'} years\n`);
      
      console.log("⚖️ Running gap analysis...");
      const gapResult = await analyzeGap(structuredCV, jobDescription.trim());

      if (process.env.USE_FIREBASE === "true") {
        try {
          await saveAnalysis({
            timestamp: Date.now(),
            fitScore: gapResult.matchScore,
            decision: gapResult.matchScore >= 70 ? "apply" : gapResult.matchScore >= 50 ? "apply_with_fixes" : "skip",
            resumeFileName: hasResumePath ? resumePath : "[CV Text]",
            strengths: gapResult.strongMatches,
            weaknesses: gapResult.missingCriticalSkills,
            improvements: gapResult.suggestedFocusAreas,
          });
          console.log("✅ Analysis saved to Firebase\n");
        } catch (dbError) {
          console.error("⚠️ Error saving to Firebase (non-critical):", dbError);
        }
      }

      res.json({
        ...gapResult,
        structuredCV,
      });
    } catch (error) {
      console.error("Erro ao analisar gap:", error);

      if (error instanceof CVParserError || error instanceof GapAnalyzerError) {
        res.status(422).json({
          error: error.message,
          code: error.code,
          details: error.details,
        });
        return;
      }

      if (error instanceof Error) {
        res.status(500).json({
          error: "Erro ao processar analise com gap",
          details: error.message,
        });
      } else {
        res.status(500).json({ error: "Erro desconhecido ao processar analise com gap" });
      }
    } finally {
      if (downloadedFilePath) {
        try {
          await fs.unlink(downloadedFilePath);
        } catch (cleanupError) {
          console.warn("⚠️ Falha ao remover arquivo temporario:", cleanupError);
        }
      }
    }
  });

  return router;
}

import OpenAI from "openai";
import type { AnalysisResult, AIServiceConfig, AISignals } from "../types/analysis.js";
import { calculateFitScore, generateExplanation, determineDecision } from "./scoring.js";
import { preprocessCV, preprocessJobDescription } from "./preprocessing.js";
import { buildOptimizedPrompt } from "./promptBuilder.js";

/**
 * Versão do prompt
 * (Agora em promptBuilder.ts como PROMPT_VERSION = "v2.0-optimized")
 */

/**
 * Serviço de IA usando Groq (API compatível com OpenAI)
 * Groq fornece acesso grátis aos modelos Llama com velocidade ultra-rápida
 * 
 * ARQUITETURA HÍBRIDA:
 * - IA: extrai sinais e classifica requisitos
 * - Código: calcula score final de forma determinística
 */
export class AIService {
  private client: OpenAI;
  private model: string;

  constructor(config: AIServiceConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.apiUrl,
    });
    this.model = config.model;
  }

  /**
   * Analisa o fit do candidato com a vaga usando preprocessamento estruturado
   * 
   * NOVO FLUXO (v2.0):
   * 1. Preprocessar CV (remover dados pessoais, normalizar, extrair estrutura)
   * 2. Preprocessar Job Description (remover marketing, extrair requisitos)
   * 3. Construir prompt otimizado com dados estruturados
   * 4. Enviar à IA (muito menos tokens)
   * 5. Extrair sinais e calcular score
   */
  async analyzeJobFit(cv: string, jobDescription: string, language: "pt" | "en" = "en"): Promise<AnalysisResult> {
    console.log("🔍 Preprocessando CV...");
    const processedCV = preprocessCV(cv);
    console.log(`✅ CV preprocessado: ${processedCV.skills.length} skills, ${processedCV.companies.length} empresas`);

    console.log("🔍 Preprocessando Job Description...");
    const processedJob = preprocessJobDescription(jobDescription);
    console.log(`✅ Job preprocessada: ${processedJob.mandatoryRequirements.length} requisitos obrigatórios`);

    const prompt = buildOptimizedPrompt(processedCV, processedJob, language);

    try {
      console.log("🤖 Enviando para IA (prompt otimizado)...");
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "Você é um assistente que retorna APENAS JSON válido, sem markdown ou texto adicional.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error("AI retornou resposta vazia");
      }

      const cleanJson = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const signals = JSON.parse(cleanJson) as AISignals;

      this.validateSignals(signals);

      const fitScore = calculateFitScore(signals);
      
      const explanation = generateExplanation(signals, fitScore);
      
      const decision = determineDecision(fitScore);

      const result: AnalysisResult = {
        fitScore,
        decision,
        strengths: [
          ...signals.hardSkillsDetected.map(s => `Hard skill: ${s}`),
          ...signals.mandatoryRequirementsMet.map(r => `Requisito atendido: ${r}`),
          ...signals.desirableRequirementsMet.map(d => `Diferencial: ${d}`),
        ],
        gaps: [
          ...signals.mandatoryRequirementsMissing.map(r => `Requisito faltando: ${r}`),
          ...signals.desirableRequirementsMissing.map(d => `Diferencial ausente: ${d}`),
          ...signals.redFlags,
        ],
        cvSuggestions: this.generateCVSuggestions(signals),
        recruiterMessage: signals.recruiterMessage,
        coverLetter: signals.coverLetter,
        explanation,
        promptVersion: "v2.0-optimized",
      };

      return result;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Falha ao parsear resposta da IA: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Gera sugestões de ajustes no CV baseado nos sinais
   */
  private generateCVSuggestions(signals: AISignals): string[] {
    const suggestions: string[] = [];

    if (signals.mandatoryRequirementsMissing.length > 0) {
      suggestions.push(
        `Destaque experiências relacionadas a: ${signals.mandatoryRequirementsMissing.slice(0, 2).join(', ')}`
      );
    }

    if (signals.hardSkillsDetected.length < 3) {
      suggestions.push('Adicione mais detalhes sobre suas habilidades técnicas');
    }

    if (signals.seniorityMatch === 'below') {
      suggestions.push('Enfatize projetos complexos e liderança técnica para demonstrar senioridade');
    }

    if (signals.desirableRequirementsMissing.length > 0 && signals.desirableRequirementsMet.length > 0) {
      suggestions.push('Destaque seus diferenciais no topo do CV');
    }

    if (suggestions.length === 0) {
      suggestions.push('Seu CV está bem alinhado. Apenas revise formatação e clareza.');
    }

    return suggestions;
  }

  /**
   * Valida os sinais extraídos pela IA
   */
  private validateSignals(signals: any): asserts signals is AISignals {
    const required = [
      "hardSkillsDetected",
      "mandatoryRequirementsMet",
      "mandatoryRequirementsMissing",
      "desirableRequirementsMet",
      "desirableRequirementsMissing",
      "softSkillsEvidence",
      "seniorityMatch",
      "redFlags",
      "recruiterMessage",
      "coverLetter"
    ];
    
    const missing = required.filter((field) => !(field in signals));

    if (missing.length > 0) {
      throw new Error(`Resposta da IA inválida. Campos faltando: ${missing.join(", ")}`);
    }

    const arrayFields = [
      "hardSkillsDetected",
      "mandatoryRequirementsMet",
      "mandatoryRequirementsMissing",
      "desirableRequirementsMet",
      "desirableRequirementsMissing",
      "softSkillsEvidence",
      "redFlags"
    ];

    for (const field of arrayFields) {
      if (!Array.isArray(signals[field])) {
        throw new Error(`${field} deve ser um array`);
      }
    }

    if (!["below", "match", "above"].includes(signals.seniorityMatch)) {
      throw new Error("seniorityMatch deve ser 'below', 'match' ou 'above'");
    }

    if (typeof signals.recruiterMessage !== "string" || signals.recruiterMessage.length === 0) {
      throw new Error("recruiterMessage deve ser uma string não vazia");
    }

    if (typeof signals.coverLetter !== "string" || signals.coverLetter.length === 0) {
      throw new Error("coverLetter deve ser uma string não vazia");
    }
  }
}

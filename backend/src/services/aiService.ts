import OpenAI from "openai";
import type { AnalysisResult, AIServiceConfig, AISignals } from "../types/analysis.js";
import { calculateFitScore, generateExplanation, determineDecision } from "./scoring.js";

/**
 * Versão do prompt (atualizar quando houver mudanças significativas)
 */
const PROMPT_VERSION = "v1.1";

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
   * Prompt engineering V1.1 - Focado em extrair sinais estruturados
   * 
   * MUDANÇA: IA não calcula score, apenas identifica e classifica
   * Score é calculado deterministicamente pelo código
   */
  private buildPrompt(cv: string, jobDescription: string): string {
    return `Você é um senior tech recruiter experiente. Analise objetivamente o CV do candidato e a vaga.

**VERSÃO DO PROMPT:** ${PROMPT_VERSION}

**SUA TAREFA:** Extrair sinais estruturados (NÃO calcular score).

**CV DO CANDIDATO:**
${cv}

**DESCRIÇÃO DA VAGA:**
${jobDescription}

**SINAIS A EXTRAIR:**

1. **hardSkillsDetected**: Lista de hard skills técnicas do CV que são relevantes para a vaga
2. **softSkillsDetected**: Lista de soft skills identificadas (liderança, comunicação, etc.)
3. **mandatoryRequirementsMet**: Requisitos obrigatórios da vaga que o candidato atende
4. **mandatoryRequirementsMissing**: Requisitos obrigatórios que o candidato NÃO atende
5. **desirableRequirementsMet**: Diferenciais/requisitos desejáveis que o candidato possui
6. **desirableRequirementsMissing**: Diferenciais que o candidato não possui
7. **seniorityMatch**: "above" (overqualified), "match" (perfeito) ou "below" (underqualified)
8. **redFlags**: Problemas graves (ex: falta experiência mínima, skill crítica ausente, etc.)
9. **recruiterMessage**: Mensagem personalizada em 2-3 frases para enviar ao recrutador

**CRITÉRIOS:**
- Seja OBJETIVO ao classificar hard skills vs soft skills
- Diferencie claramente requisitos obrigatórios vs desejáveis
- Red flags devem ser problemas GRAVES, não pequenos gaps
- Mensagem ao recrutador deve ser profissional e específica

**IMPORTANTE:** 
- Retorne APENAS JSON válido (sem markdown)
- NÃO calcule fitScore nem decision (o código fará isso)
- NÃO invente skills que não estão no CV

**FORMATO DE RESPOSTA:**
{
  "hardSkillsDetected": ["skill1", "skill2", ...],
  "softSkillsEvidence": ["evidência1", "evidência2", ...],
  "mandatoryRequirementsMet": ["req1", "req2", ...],
  "mandatoryRequirementsMissing": ["req1", "req2", ...],
  "desirableRequirementsMet": ["req1", "req2", ...],
  "desirableRequirementsMissing": ["req1", "req2", ...],
  "seniorityMatch": "match"|"above"|"below",
  "redFlags": ["flag1", "flag2", ...],
  "recruiterMessage": "mensagem curta e humana"
}`;
  }

  async analyzeJobFit(cv: string, jobDescription: string): Promise<AnalysisResult> {
    const prompt = this.buildPrompt(cv, jobDescription);

    try {
      // 1️⃣ IA extrai sinais estruturados
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

      // Parse JSON da IA
      const cleanJson = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const signals = JSON.parse(cleanJson) as AISignals;

      // Validar sinais da IA
      this.validateSignals(signals);

      // 2️⃣ Código calcula score de forma determinística
      const fitScore = calculateFitScore(signals);
      
      // 3️⃣ Gerar explicação do score
      const explanation = generateExplanation(signals, fitScore);
      
      // 4️⃣ Determinar decisão baseada no score
      const decision = determineDecision(fitScore);

      // 5️⃣ Montar resultado final
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
        explanation,
        promptVersion: PROMPT_VERSION,
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
      "recruiterMessage"
    ];
    
    const missing = required.filter((field) => !(field in signals));

    if (missing.length > 0) {
      throw new Error(`Resposta da IA inválida. Campos faltando: ${missing.join(", ")}`);
    }

    // Valida arrays
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

    // Valida seniorityMatch
    if (!["below", "match", "above"].includes(signals.seniorityMatch)) {
      throw new Error("seniorityMatch deve ser 'below', 'match' ou 'above'");
    }

    // Valida recruiterMessage
    if (typeof signals.recruiterMessage !== "string" || signals.recruiterMessage.length === 0) {
      throw new Error("recruiterMessage deve ser uma string não vazia");
    }
  }
}

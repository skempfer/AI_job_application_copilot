/**
 * Tipos centrais do domínio de análise de job fit
 */

export type Decision = "apply" | "apply_with_fixes" | "skip";

export interface AnalysisRequest {
  cv: string;
  jobDescription: string;
  language?: "pt" | "en";
}

/**
 * Sinais extraídos pela IA (sem cálculo de score)
 * A IA apenas identifica e classifica skills/requisitos
 */
export interface AISignals {
  hardSkillsDetected: string[]; // Skills técnicas encontradas no CV
  softSkillsEvidence: string[]; // Evidências de soft skills
  mandatoryRequirementsMet: string[]; // Requisitos obrigatórios atendidos
  mandatoryRequirementsMissing: string[]; // Requisitos obrigatórios faltando
  desirableRequirementsMet: string[]; // Diferenciais atendidos
  desirableRequirementsMissing: string[]; // Diferenciais faltando
  seniorityMatch: "above" | "match" | "below"; // Senioridade do candidato vs vaga
  redFlags: string[]; // Problemas graves identificados
  recruiterMessage: string; // Mensagem personalizada
  coverLetter: string; // Carta de apresentacao
}

/**
 * Explicação detalhada do score calculado
 */
export interface ScoreExplanation {
  positives: string[]; // Fatores que aumentaram o score
  negatives: string[]; // Fatores que reduziram o score
  summary: string; // Resumo em uma frase
}

/**
 * Resultado final da análise (híbrido: IA + cálculo determinístico)
 */
export interface AnalysisResult {
  fitScore: number; // 0-100 (calculado por função determinística)
  decision: Decision; // Baseado no fitScore
  strengths: string[]; // Pontos fortes do candidato
  gaps: string[]; // Gaps a endereçar
  cvSuggestions: string[]; // Sugestões de ajustes
  recruiterMessage: string; // Mensagem personalizada
  coverLetter: string; // Carta de apresentacao
  explanation: ScoreExplanation; // NOVO: explica como o score foi calculado
  promptVersion: string; // NOVO: versão do prompt usado
}

export interface StructuredCV {
  skills: string[];
  technologies: string[];
  seniorityLevel: "junior" | "mid" | "senior" | "unknown";
  yearsOfExperience: number | null;
  languages: string[];
  education: string[];
  certifications: string[];
  strengths: string[];
}

export interface JobRequirements {
  skills: string[];
  technologies: string[];
}

export interface GapAnalysisRequest {
  jobDescription: string;
  resumePath: string;
}

export interface GapAnalysisResult {
  matchScore: number;
  missingCriticalSkills: string[];
  strongMatches: string[];
  suggestedFocusAreas: string[];
  structuredCV?: StructuredCV;
}

export interface AIServiceConfig {
  apiKey: string;
  apiUrl: string;
  model: string;
}

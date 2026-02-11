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
  hardSkillsDetected: string[];
  softSkillsEvidence: string[]; 
  mandatoryRequirementsMet: string[];
  mandatoryRequirementsMissing: string[]; 
  desirableRequirementsMet: string[]; 
  desirableRequirementsMissing: string[]; 
  seniorityMatch: "above" | "match" | "below"; 
  redFlags: string[]; 
  recruiterMessage: string; 
  coverLetter: string; 
}

/**
 * Explicação detalhada do score calculado
 */
export interface ScoreExplanation {
  positives: string[]; 
  negatives: string[]; 
  summary: string; 
}

/**
 * Resultado final da análise (híbrido: IA + cálculo determinístico)
 */
export interface AnalysisResult {
  fitScore: number; 
  decision: Decision;
  strengths: string[]; 
  gaps: string[]; 
  cvSuggestions: string[]; 
  recruiterMessage: string; 
  coverLetter: string; 
  explanation: ScoreExplanation; 
  promptVersion: string;
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

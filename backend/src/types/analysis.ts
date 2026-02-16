/**
 * Core types for the job fit analysis domain
 */

export type Decision = "apply" | "apply_with_fixes" | "skip";

export interface AnalysisRequest {
  cv: string;
  jobDescription: string;
  language?: "pt" | "en";
  uiLanguage?: "pt" | "en";
  jobLanguage?: "pt" | "en";
}

export const AI_FAILURE_REASON = {
  RateLimit: "rate_limit",
  QuotaExceeded: "quota_exceeded",
  ProviderUnavailable: "provider_unavailable",
  Timeout: "timeout",
} as const;

export type AIProviderFailureReason =
  (typeof AI_FAILURE_REASON)[keyof typeof AI_FAILURE_REASON];

export const AI_FALLBACK_PROVIDER = {
  Firebase: "firebase",
} as const;

export type AIFallbackProvider =
  (typeof AI_FALLBACK_PROVIDER)[keyof typeof AI_FALLBACK_PROVIDER];

export interface AIProviderFallbackResponse {
  success: false;
  fallback: AIFallbackProvider;
  reason: AIProviderFailureReason;
  message: string;
  prompt: {
    system: string;
    user: string;
  };
}

/**
 * Signals extracted by the AI (no score calculation)
 * The AI only identifies and classifies skills/requirements
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
  
  // PREPROCESSED DATA (from deterministic layer - use these values)
  detectedYearsExperience?: number | null;
  detectedDomainExperience?: {
    frontend?: boolean;
    backend?: boolean;
    fullstack?: boolean;
    qa?: boolean;
    devops?: boolean;
    product?: boolean;
  } | null;
}

/**
 * Detailed explanation of the calculated score
 */
export interface ScoreExplanation {
  positives: string[]; 
  negatives: string[]; 
  summary: string; 
}

/**
 * Final analysis result (hybrid: AI + deterministic calculation)
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
  promptVersion?: string;
  detectedLanguage?: string;
  preprocessedCV?: {
    yearsExperience: number | null;
    yearsExperienceConfidence: "high" | "medium" | "low";
    domainExperience: {
      frontend: boolean;
      backend: boolean;
      fullstack: boolean;
      qa: boolean;
      devops: boolean;
      product: boolean;
    };
    seniority: "junior" | "mid" | "senior" | "unknown";
    skills: string[];
  };

  // STRUCTURED DATA (NEW - for UI mapping)
  // These are the raw signals from the AI, not formatted strings
  aiSignals?: {
    hardSkillsDetected: string[];
    softSkillsEvidence: string[]; 
    mandatoryRequirementsMet: string[];
    mandatoryRequirementsMissing: string[]; 
    desirableRequirementsMet: string[]; 
    desirableRequirementsMissing: string[]; 
    seniorityMatch: "above" | "match" | "below"; 
    redFlags: string[]; 
  };
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
  model: string;
  projectId?: string;
  location?: string;
  apiKey?: string;
  apiUrl?: string;
}

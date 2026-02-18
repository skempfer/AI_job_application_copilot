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

export interface ScoreExplanation {
  positives: string[];
  negatives: string[];
  summary: string;
}

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

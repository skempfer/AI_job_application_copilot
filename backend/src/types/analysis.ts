/**
 * Core types for the job fit analysis domain
 */

export type Decision = "apply" | "apply_with_fixes" | "skip";

export interface AnalysisRequest {
  cv: string;
  jobDescription: string;
  language?: "pt" | "en";
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
  };
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

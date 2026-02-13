/**
 * Core types for the job fit analysis domain
 */

export type Decision = "apply" | "apply_with_fixes" | "skip";

export interface AnalysisRequest {
  cv: string;
  jobDescription: string;
  language?: "pt" | "en";
}

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
  promptVersion: string;
  detectedLanguage?: 'pt' | 'en';
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

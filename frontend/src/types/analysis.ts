export type Decision = "apply" | "apply_with_fixes" | "skip";
export type SeniorityMatch = "below" | "match" | "above";
export type SeniorityLevel = "junior" | "mid" | "senior" | "unknown";
export type ConfidenceLevel = "high" | "medium" | "low";

/**
 * AI-detected domain experience (6 role types)
 */
export interface DomainExperience {
  frontend: boolean;
  backend: boolean;
  fullstack: boolean;
  qa: boolean;
  devops: boolean;
  product: boolean;
}

/**
 * Preprocessed CV data from deterministic layer
 */
export interface PreprocessedCV {
  yearsExperience: number | null;
  yearsExperienceConfidence: ConfidenceLevel;
  domainExperience: DomainExperience;
  seniority: SeniorityLevel;
  skills: string[];
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
 * Complete AI alignment response from backend
 */
export interface AISignals {
  hardSkillsDetected: string[];
  softSkillsEvidence: string[];
  mandatoryRequirementsMet: string[];
  mandatoryRequirementsMissing: string[];
  desirableRequirementsMet: string[];
  desirableRequirementsMissing: string[];
  seniorityMatch: SeniorityMatch;
  redFlags: string[];
  recruiterMessage: string;
  coverLetter: string;
  detectedYearsExperience?: number | null;
  detectedDomainExperience?: DomainExperience | null;
}

/**
 * Final analysis result combining AI signals + deterministic preprocessing
 */
export interface AnalysisResult {
  fitScore: number;
  decision: Decision;
  strengths: string[];
  gaps: string[];
  cvSuggestions: string[];
  recruiterMessage: string;
  coverLetter: string;
  explanation?: ScoreExplanation;
  promptVersion?: string;
  detectedLanguage?: 'pt' | 'en';
  preprocessedCV?: PreprocessedCV;
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

export interface GapAnalysisResult {
  matchScore: number;
  missingCriticalSkills: string[];
  strongMatches: string[];
  suggestedFocusAreas: string[];
  structuredCV: StructuredCV;
}

export interface FormattedAnalysisResult extends AnalysisResult {
  scoreColor: string;
  scoreBadgeClass: string;
  decisionText: string;
  decisionIcon: string;
  detectedLanguage?: 'pt' | 'en';
}
/**
 * ============================================================
 * UI MODEL LAYER
 * ============================================================
 * These types represent how data is presented to the UI,
 * NOT the raw API response. This decouples business logic
 * from component rendering.
 */

/**
 * Seniority match with UI-ready information
 */
export interface SeniorityUIInfo {
  match: SeniorityMatch;
  label: string; // "Senior Match", "Below Expected", etc.
  badgeClass: string; // CSS class for styling
  priority: 'critical' | 'warning' | 'success';
  explanation: string; // Human-readable explanation
  detectedYears: number | null;
  expectedSeniority: SeniorityLevel;
}

/**
 * Requirement item with context
 */
export interface RequirementUIItem {
  text: string;
  category: 'mandatory' | 'desirable';
  status: 'met' | 'missing';
}

/**
 * Grouped requirements by category and status
 */
export interface RequirementsUIModel {
  mandatory: {
    met: RequirementUIItem[];
    missing: RequirementUIItem[];
  };
  desirable: {
    met: RequirementUIItem[];
    missing: RequirementUIItem[];
  };
}

/**
 * Domain role with badge information
 */
export interface DetectedDomainUIItem {
  domain: keyof DomainExperience;
  label: string; // "Backend", "Frontend", etc.
  badgeClass: string; // CSS class for styling
}

/**
 * Complete UI model for alignment display
 * Derived from AnalysisResult, ready for rendering
 */
export interface AlignmentUIModel {
  // Core metadata
  fitScore: number;
  decision: Decision;
  detectedLanguage: 'pt' | 'en';

  // Seniority information
  seniority: SeniorityUIInfo;

  // Requirements
  requirements: RequirementsUIModel;

  // Skills
  hardSkills: string[];
  softSkills: string[];

  // Domain experience
  detectedDomains: DetectedDomainUIItem[];

  // Red flags
  redFlags: string[];

  // Messages
  recruiterMessage: string;
  coverLetter: string;

  // Preprocessed data
  yearsExperience: number | null;
  yearsConfidence: ConfidenceLevel;
  cvSuggestions: string[];

  // Empty states indicators
  hasAnyMissingMandatory: boolean;
  hasRedFlags: boolean;
  hasDetectedDomains: boolean;
}
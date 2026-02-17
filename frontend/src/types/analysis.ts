export type Decision = "apply" | "apply_with_fixes" | "skip";
export type SeniorityMatch = "below" | "match" | "above";
export type SeniorityLevel = "junior" | "mid" | "senior" | "unknown";
export type ConfidenceLevel = "high" | "medium" | "low";

export interface DomainExperience {
  frontend: boolean;
  backend: boolean;
  fullstack: boolean;
  qa: boolean;
  devops: boolean;
  product: boolean;
}

export interface PreprocessedCV {
  yearsExperience: number | null;
  yearsExperienceConfidence: ConfidenceLevel;
  domainExperience: DomainExperience;
  seniority: SeniorityLevel;
  skills: string[];
}

export interface ScoreExplanation {
  positives: string[];
  negatives: string[];
  summary: string;
}

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
  
  aiSignals?: AISignals;
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
export interface SeniorityUIInfo {
  match: SeniorityMatch;
  label: string;
  badgeClass: string;
  priority: 'critical' | 'warning' | 'success';
  explanation: string;
  detectedYears: number | null;
  expectedSeniority: SeniorityLevel;
}

export interface RequirementUIItem {
  text: string;
  category: 'mandatory' | 'desirable';
  status: 'met' | 'missing';
}

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

export interface DetectedDomainUIItem {
  domain: keyof DomainExperience;
  label: string;
  badgeClass: string;
}

export interface AlignmentUIModel {
  fitScore: number;
  decision: Decision;
  detectedLanguage: 'pt' | 'en';

  seniority: SeniorityUIInfo;

  requirements: RequirementsUIModel;

  hardSkills: string[];
  softSkills: string[];

  detectedDomains: DetectedDomainUIItem[];

  redFlags: string[];

  recruiterMessage: string;
  coverLetter: string;

  yearsExperience: number | null;
  yearsConfidence: ConfidenceLevel;
  cvSuggestions: string[];

  hasAnyMissingMandatory: boolean;
  hasRedFlags: boolean;
  hasDetectedDomains: boolean;
}


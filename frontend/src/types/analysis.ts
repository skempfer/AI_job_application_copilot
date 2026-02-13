export type Decision = "apply" | "apply_with_fixes" | "skip";
export type SeniorityMatch = "below" | "match" | "above";

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
  explanation?: ScoreExplanation;
  promptVersion?: string;
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

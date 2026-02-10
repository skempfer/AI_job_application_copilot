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
  explanation?: ScoreExplanation;
  promptVersion?: string;
}

export interface FormattedAnalysisResult extends AnalysisResult {
  scoreColor: string;
  scoreBadgeClass: string;
  decisionText: string;
  decisionIcon: string;
}

import { detectLanguage } from '../utils/languageDetection';
import type { AnalysisResult } from '../types/analysis';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

/**
 * API request payload for job fit analysis
 */
interface AnalyzeJobFitRequest {
  cv: string;
  jobDescription: string;
  language: 'pt' | 'en';
  resumeUrl?: string;
}

/**
 * API response for job fit analysis
 * Includes detected language for frontend consumption
 */
interface AnalyzeJobFitResponse extends AnalysisResult {
  detectedLanguage: 'pt' | 'en';
}

/**
 * Analyzes job fit via API with strict typing
 * @param cv - Candidate's resume text
 * @param jobDescription - Job description
 * @param resumeUrl - Optional PDF resume URL
 * @returns Typed analysis result with detected language
 * @throws Error with status code on API failure
 */
export async function analyzeJobFit(
  cv: string,
  jobDescription: string,
  resumeUrl: string | null = null
): Promise<AnalyzeJobFitResponse> {
  const detectedLanguage = detectLanguage(jobDescription) as 'pt' | 'en';

  const payload: AnalyzeJobFitRequest = {
    cv: cv.trim(),
    jobDescription: jobDescription.trim(),
    language: detectedLanguage,
  };

  if (resumeUrl) {
    payload.resumeUrl = resumeUrl;
  }

   const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    console.error('❌ [apiClient.analyzeJobFit] Error:', errorData);
    const error = new Error(errorData.error as string || `HTTP Error: ${response.status}`);
    (error as any).status = response.status;
    throw error;
  }

  const responseData = (await response.json()) as AnalysisResult;
  // Log preprocessed data if available
 
  return {
    ...responseData,
    detectedLanguage,
  };
}

/**
 * Gap analysis result type
 */
export interface GapAnalysisResponse {
  matchScore: number;
  missingCriticalSkills: string[];
  strongMatches: string[];
  suggestedFocusAreas: string[];
  structuredCV: {
    skills: string[];
    technologies: string[];
    seniorityLevel: 'junior' | 'mid' | 'senior' | 'unknown';
    yearsOfExperience: number | null;
    languages: string[];
    education: string[];
    certifications: string[];
    strengths: string[];
  };
}

/**
 * Analyzes gap between CV and job requirements
 * @param jobDescription - Job description
 * @param resumePath - Optional path to PDF resume
 * @param cv - Optional CV text as fallback
 * @returns Gap analysis results
 * @throws Error with status code on API failure
 */
export async function analyzeWithGap(
  jobDescription: string,
  resumePath: string | null = null,
  cv: string | null = null
): Promise<GapAnalysisResponse> {
  const payload: Record<string, string> = {
    jobDescription: jobDescription.trim(),
  };

  if (resumePath) {
    payload.resumePath = resumePath;
  }

  if (cv) {
    payload.cv = cv.trim();
  }

  const response = await fetch(`${API_BASE_URL}/api/analyze-gap`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    const error = new Error(errorData.error as string || `HTTP Error: ${response.status}`);
    (error as any).status = response.status;
    throw error;
  }

  const result = (await response.json()) as GapAnalysisResponse;

  return result;
}

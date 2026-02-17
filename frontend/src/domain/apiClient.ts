import { detectLanguage } from '../utils/languageDetection';
import type { AnalysisResult } from '../types/analysis';

// Get API URL from environment variable, with fallback for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003';

/**
 * Get API base URL
 */
function getApiBaseUrl(): string {
  return API_BASE_URL;
}



/**
 * API request payload for job fit analysis
 */
interface AnalyzeJobFitRequest {
  cv: string;
  jobDescription: string;
  language: 'pt' | 'en';
  uiLanguage: 'pt' | 'en';
  jobLanguage?: 'pt' | 'en';
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
 *
 * @param cv - Candidate's resume text
 * @param jobDescription - Job description
 * @param uiLanguage - Language selected by user in UI (for analysis fields)
 * @param resumeUrl - Optional PDF resume URL
 * @returns Typed analysis result with detected language
 * @throws Error with status code on API failure (non-200 response)
 */
export async function analyzeJobFit(
  cv: string,
  jobDescription: string,
  uiLanguage: 'pt' | 'en' = 'en',
  resumeUrl: string | null = null
): Promise<AnalyzeJobFitResponse> {
  const detectedJobLanguage = detectLanguage(jobDescription) as 'pt' | 'en';

  const payload: AnalyzeJobFitRequest = {
    cv: cv.trim(),
    jobDescription: jobDescription.trim(),
    language: detectedJobLanguage, // Legacy support
    uiLanguage: uiLanguage, // Language for analysis fields
    jobLanguage: detectedJobLanguage, // Language for recruiterMessage and coverLetter
  };

  if (resumeUrl) {
    payload.resumeUrl = resumeUrl;
  }

  const apiUrl = getApiBaseUrl();

  const response = await fetch(`${apiUrl}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    console.error('❌ [apiClient.analyzeJobFit] API Error:', errorData);
    const error = new Error(errorData.error as string || `HTTP Error: ${response.status}`);
    (error as any).status = response.status;
    throw error;
  }

  const responseData = (await response.json()) as unknown;
  const analysisResult = responseData as AnalysisResult;
  return {
    ...analysisResult,
    detectedLanguage: detectedJobLanguage,
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

  const apiUrl = getApiBaseUrl();

  const response = await fetch(`${apiUrl}/api/analyze-with-gap`, {
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

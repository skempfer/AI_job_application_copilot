import { detectLanguage } from '../utils/languageDetection';
import type { AnalysisResult, AIProviderFallbackResponse } from '../types/analysis';
import { handleProviderFallback } from '../services/fallbackAIService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

/**
 * Type guard to check if response is an AIProviderFallbackResponse
 */
function isAIProviderFallbackResponse(
  data: unknown
): data is AIProviderFallbackResponse {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj = data as Record<string, unknown>;
  
  // Check all required fields exist and have correct types
  if (obj.success !== false) return false;
  if (obj.fallback !== 'firebase') return false;
  if (typeof obj.reason !== 'string') return false;
  if (typeof obj.message !== 'string') return false;
  if (typeof obj.prompt !== 'object' || obj.prompt === null) return false;
  
  const prompt = obj.prompt as Record<string, unknown>;
  if (typeof prompt.system !== 'string') return false;
  if (typeof prompt.user !== 'string') return false;
  
  return true;
}

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
 * Handles both primary provider success and fallback to Firebase Vertex AI
 *
 * Flow:
 * 1. Call backend with CV and job description
 * 2. If backend succeeds (HTTP 200): return analysis result
 * 3. If backend fails with fallback response (HTTP 200, fallback=firebase):
 *    - Call Firebase Vertex AI with preserved prompts
 *    - Return analysis result from Firebase
 * 4. If both fail: return degraded response with safe defaults
 *
 * @param cv - Candidate's resume text
 * @param jobDescription - Job description
 * @param resumeUrl - Optional PDF resume URL
 * @returns Typed analysis result with detected language
 * @throws Error with status code on API failure (non-200 response)
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
    console.error('❌ [apiClient.analyzeJobFit] API Error:', errorData);
    const error = new Error(errorData.error as string || `HTTP Error: ${response.status}`);
    (error as any).status = response.status;
    throw error;
  }

  const responseData = (await response.json()) as unknown;

  // Check if response is a fallback response from backend
  if (isAIProviderFallbackResponse(responseData)) {
    console.log(
      '[apiClient.analyzeJobFit] Backend provider failed, attempting Firebase fallback...'
    );
    
    // Attempt to use Firebase Vertex AI with the preserved prompts
    const fallbackResult = await handleProviderFallback(responseData);
    
    return {
      ...fallbackResult,
      detectedLanguage,
    };
  }

  // Normal success response
  const analysisResult = responseData as AnalysisResult;
  return {
    ...analysisResult,
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

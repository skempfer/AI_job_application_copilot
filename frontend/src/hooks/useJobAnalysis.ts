import { useState } from 'react';
import { analyzeJobFit, analyzeWithGap } from '../domain/apiClient';
import { validateInputs, formatAnalysisResult } from '../domain/analyzer';
import type { AnalysisResult, FormattedAnalysisResult, GapAnalysisResult } from '../types/analysis';
import { trackEvent } from '../lib/analytics';
import { secureAnalysisResult } from '../lib/typeGuards';

/**
 * Custom hook for managing job analysis state and logic
 * Extracts complex analysis workflow from App component
 */
export function useJobAnalysis() {
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [result, setResult] = useState<FormattedAnalysisResult | null>(null);
  const [gapResult, setGapResult] = useState<GapAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (cv: string, jobDescription: string, resumeUrl: string | null) => {
    setResult(null);
    setGapResult(null);
    setAnalysisResult(null);
    setError(null);

    const validation = validateInputs(cv, jobDescription, resumeUrl);
    if (!validation.valid) {
      setError(validation.error || 'Validation error');
      return;
    }

    setLoading(true);

    try {
      const rawResult = await analyzeJobFit(cv, jobDescription, resumeUrl);
      const analysisResult = secureAnalysisResult(rawResult);

      setAnalysisResult(analysisResult);

      const formatted = formatAnalysisResult(analysisResult);

      setResult(formatted);

      trackEvent('analysis_success', {
        has_resume_url: Boolean(resumeUrl),
        job_length: jobDescription.trim().length,
        cv_length: cv.trim().length,
      });

      if (formatted.coverLetter?.trim()) {
        trackEvent('cover_letter_generated', {
          length: formatted.coverLetter.trim().length,
        });
      }

      if (formatted.recruiterMessage?.trim()) {
        trackEvent('recruiter_message_generated', {
          length: formatted.recruiterMessage.trim().length,
        });
      }

      // Try gap analysis with resume URL or CV text
      if (resumeUrl) {
        try {
          const gapAnalysis = await analyzeWithGap(jobDescription, resumeUrl);
          setGapResult(gapAnalysis);
        } catch (gapError) {
          console.warn('⚠️ Gap analysis failed (non-critical):', gapError);
        }
      } else if (cv.trim().length >= 50) {
        try {
          const gapAnalysis = await analyzeWithGap(jobDescription, undefined, cv);
          setGapResult(gapAnalysis);
        } catch (gapError) {
          console.warn('⚠️ Gap analysis with CV failed (non-critical):', gapError);
        }
      }
    } catch (err) {
      const status = typeof (err as { status?: number }).status === 'number'
        ? (err as { status?: number }).status
        : undefined;

      trackEvent('analysis_error', status ? { status } : undefined);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during analysis';
      setError(errorMessage);
      setAnalysisResult(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    analysisResult,
    result,
    gapResult,
    error,
    analyze,
    clearError: () => setError(null),
  };
}

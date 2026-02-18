import { useState } from 'react';
import { analyzeJobFit, analyzeWithGap } from '../../../domain/apiClient';
import type { AnalysisResult, FormattedAnalysisResult, GapAnalysisResult } from '../../../types/analysis';
import { trackEvent } from '../../../lib/analytics';
import { checkRateLimit } from '../../../utils/rateLimiter';
import { getScoreColor, getScoreBadgeClass } from '../../../utils/scoreHelpers';
import { useLanguage } from '../../../hooks/useLanguage';

function validateInputs(cv: string, jobDescription: string, resumeUrl: string | null) {
  const trimmedCv = cv.trim();
  const hasResumeUrl = Boolean(resumeUrl);

  if (!hasResumeUrl && trimmedCv.length === 0) {
    return { valid: false, error: 'CV is required' };
  }

  if (!jobDescription || jobDescription.trim().length === 0) {
    return { valid: false, error: 'Job description is required' };
  }

  if (!hasResumeUrl && trimmedCv.length < 50) {
    return { valid: false, error: 'CV must be at least 50 characters or include a resume PDF' };
  }

  if (hasResumeUrl && trimmedCv.length > 0 && trimmedCv.length < 50) {
    return { valid: false, error: 'CV must be at least 50 characters or include a resume PDF' };
  }

  if (jobDescription.trim().length < 50) {
    return { valid: false, error: 'Job description must be at least 50 characters' };
  }

  return { valid: true };
}

function getDecisionText(decision: 'apply' | 'apply_with_fixes' | 'skip'): string {
  const texts = {
    apply: 'Strong match - Apply now!',
    apply_with_fixes: 'Good match - Apply after improvements',
    skip: 'Not recommended - Consider other opportunities'
  };
  return texts[decision];
}

function getDecisionIcon(decision: 'apply' | 'apply_with_fixes' | 'skip'): string {
  const icons = {
    apply: '✅',
    apply_with_fixes: '⚠️',
    skip: '❌'
  };
  return icons[decision];
}

function formatAnalysisResult(result: AnalysisResult): FormattedAnalysisResult {
  const scorePercent = result.fitScore * 100;
  
  return {
    ...result,
    fitScore: result.fitScore,
    decision: result.decision,
    strengths: result.strengths || [],
    gaps: result.gaps || [],
    cvSuggestions: result.cvSuggestions || [],
    recruiterMessage: result.recruiterMessage || '',
    coverLetter: result.coverLetter || '',
    explanation: result.explanation,
    scoreColor: getScoreColor(scorePercent),
    scoreBadgeClass: getScoreBadgeClass(scorePercent),
    decisionText: getDecisionText(result.decision),
    decisionIcon: getDecisionIcon(result.decision),
  };
}

export function useJobAnalysis() {
  const { language: uiLanguage } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FormattedAnalysisResult | null>(null);
  const [gapResult, setGapResult] = useState<GapAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (cv: string, jobDescription: string, resumeUrl: string | null) => {
    setResult(null);
    setGapResult(null);
    setError(null);

    const validation = validateInputs(cv, jobDescription, resumeUrl);
    if (!validation.valid) {
      setError(validation.error || 'Validation error');
      return;
    }

    const rateLimitCheck = checkRateLimit();
    if (!rateLimitCheck.allowed) {
      const errorMsg = rateLimitCheck.message || 'Too many requests. Please try again later.';
      setError(errorMsg);
      return;
    }

    setLoading(true);

    try {
      const analysisResult = await analyzeJobFit(cv, jobDescription, uiLanguage, resumeUrl);
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
      
      let errorMessage: string;
      if (status === 429) {
        errorMessage = err instanceof Error ? err.message : 'Rate limit exceeded';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        errorMessage = 'Unknown error during analysis';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    result,
    gapResult,
    error,
    analyze,
    clearError: () => setError(null),
  };
}

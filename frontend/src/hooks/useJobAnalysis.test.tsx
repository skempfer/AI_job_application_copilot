import { renderHook, act, waitFor } from '@testing-library/react';
import { useJobAnalysis } from './useJobAnalysis';

// Mock domain modules
jest.mock('../domain/apiClient', () => ({
  analyzeJobFit: jest.fn(),
  analyzeWithGap: jest.fn(),
}));

jest.mock('../domain/analyzer', () => ({
  validateInputs: jest.fn(),
  formatAnalysisResult: jest.fn(),
}));

jest.mock('../lib/analytics', () => ({
  trackEvent: jest.fn(),
}));

import { analyzeJobFit, analyzeWithGap } from '../domain/apiClient';
import { validateInputs, formatAnalysisResult } from '../domain/analyzer';
import { trackEvent } from '../lib/analytics';

describe('useJobAnalysis', () => {
  const mockAnalysisResponse = {
    score: 85,
    summary: 'Good fit',
    coverLetter: 'Dear Hiring Manager...',
    recruiterMessage: 'This candidate is great',
  };

  const mockGapAnalysisResponse = {
    gaps: ['Python', 'Docker'],
    strengths: ['JavaScript', 'React'],
    score: 75,
  };

  const mockFormattedResult = {
    score: 85,
    summary: 'Good fit',
    coverLetter: 'Dear Hiring Manager...',
    recruiterMessage: 'This candidate is great',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useJobAnalysis());

      expect(result.current.loading).toBe(false);
      expect(result.current.result).toBeNull();
      expect(result.current.gapResult).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should provide analyze function', () => {
      const { result } = renderHook(() => useJobAnalysis());

      expect(typeof result.current.analyze).toBe('function');
    });

    it('should provide clearError function', () => {
      const { result } = renderHook(() => useJobAnalysis());

      expect(typeof result.current.clearError).toBe('function');
    });
  });

  describe('analyze functionality', () => {
    it('should set loading to true while analyzing', async () => {
      (validateInputs as jest.Mock).mockReturnValue({ valid: true });
      (analyzeJobFit as jest.Mock).mockResolvedValue(mockAnalysisResponse);
      (formatAnalysisResult as jest.Mock).mockReturnValue(mockFormattedResult);

      const { result } = renderHook(() => useJobAnalysis());

      act(() => {
        result.current.analyze('my cv', 'job description', 'resume-url');
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should set result after successful analysis', async () => {
      (validateInputs as jest.Mock).mockReturnValue({ valid: true });
      (analyzeJobFit as jest.Mock).mockResolvedValue(mockAnalysisResponse);
      (formatAnalysisResult as jest.Mock).mockReturnValue(mockFormattedResult);
      (analyzeWithGap as jest.Mock).mockResolvedValue(mockGapAnalysisResponse);

      const { result } = renderHook(() => useJobAnalysis());

      act(() => {
        result.current.analyze('my cv', 'job description', 'resume-url');
      });

      await waitFor(() => {
        expect(result.current.result).toEqual(mockFormattedResult);
      });
    });

    it('should set gapResult when gap analysis succeeds', async () => {
      (validateInputs as jest.Mock).mockReturnValue({ valid: true });
      (analyzeJobFit as jest.Mock).mockResolvedValue(mockAnalysisResponse);
      (formatAnalysisResult as jest.Mock).mockReturnValue(mockFormattedResult);
      (analyzeWithGap as jest.Mock).mockResolvedValue(mockGapAnalysisResponse);

      const { result } = renderHook(() => useJobAnalysis());

      act(() => {
        result.current.analyze('my cv', 'job description', 'resume-url');
      });

      await waitFor(() => {
        expect(result.current.gapResult).toEqual(mockGapAnalysisResponse);
      });
    });

    it('should clear previous results on new analysis', async () => {
      (validateInputs as jest.Mock).mockReturnValue({ valid: true });
      (analyzeJobFit as jest.Mock).mockResolvedValue(mockAnalysisResponse);
      (formatAnalysisResult as jest.Mock).mockReturnValue(mockFormattedResult);

      const { result } = renderHook(() => useJobAnalysis());

      act(() => {
        result.current.analyze('cv1', 'job1', null);
      });

      await waitFor(() => {
        expect(result.current.result).toEqual(mockFormattedResult);
      });

      jest.clearAllMocks();
      (validateInputs as jest.Mock).mockReturnValue({ valid: true });
      (analyzeJobFit as jest.Mock).mockResolvedValue(mockAnalysisResponse);
      (formatAnalysisResult as jest.Mock).mockReturnValue(mockFormattedResult);

      act(() => {
        result.current.analyze('cv2', 'job2', null);
      });

      expect(result.current.gapResult).toBeNull();
    });
  });

  describe('input validation', () => {
    it('should validate inputs before analysis', async () => {
      (validateInputs as jest.Mock).mockReturnValue({ valid: true });
      (analyzeJobFit as jest.Mock).mockResolvedValue(mockAnalysisResponse);
      (formatAnalysisResult as jest.Mock).mockReturnValue(mockFormattedResult);

      const { result } = renderHook(() => useJobAnalysis());

      const cv = 'my cv';
      const jobDesc = 'job description';
      const resumeUrl = 'resume-url';

      act(() => {
        result.current.analyze(cv, jobDesc, resumeUrl);
      });

      expect(validateInputs).toHaveBeenCalledWith(cv, jobDesc, resumeUrl);
    });

    it('should set error if validation fails', async () => {
      const errorMessage = 'CV is too short';
      (validateInputs as jest.Mock).mockReturnValue({
        valid: false,
        error: errorMessage,
      });

      const { result } = renderHook(() => useJobAnalysis());

      act(() => {
        result.current.analyze('cv', 'job', null);
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.loading).toBe(false);
    });

    it('should use generic error message if validation fails without custom message', async () => {
      (validateInputs as jest.Mock).mockReturnValue({
        valid: false,
      });

      const { result } = renderHook(() => useJobAnalysis());

      act(() => {
        result.current.analyze('cv', 'job', null);
      });

      expect(result.current.error).toBe('Validation error');
    });

    it('should not call API if validation fails', async () => {
      (validateInputs as jest.Mock).mockReturnValue({
        valid: false,
        error: 'Invalid input',
      });

      const { result } = renderHook(() => useJobAnalysis());

      act(() => {
        result.current.analyze('cv', 'job', null);
      });

      expect(analyzeJobFit).not.toHaveBeenCalled();
    });
  });

  describe('analytics tracking', () => {
    it('should track analysis_success event', async () => {
      (validateInputs as jest.Mock).mockReturnValue({ valid: true });
      (analyzeJobFit as jest.Mock).mockResolvedValue(mockAnalysisResponse);
      (formatAnalysisResult as jest.Mock).mockReturnValue(mockFormattedResult);
      (analyzeWithGap as jest.Mock).mockResolvedValue(mockGapAnalysisResponse);

      const { result } = renderHook(() => useJobAnalysis());

      const cv = 'my cv';
      const jobDesc = 'job description';

      act(() => {
        result.current.analyze(cv, jobDesc, 'resume-url');
      });

      await waitFor(() => {
        expect(trackEvent).toHaveBeenCalledWith('analysis_success', {
          has_resume_url: true,
          job_length: jobDesc.trim().length,
          cv_length: cv.trim().length,
        });
      });
    });

    it('should track analysis_error event on failure', async () => {
      const errorSpy = jest.spyOn(console, 'warn').mockImplementation();

      (validateInputs as jest.Mock).mockReturnValue({ valid: true });
      (analyzeJobFit as jest.Mock).mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useJobAnalysis());

      act(() => {
        result.current.analyze('cv', 'job', null);
      });

      await waitFor(() => {
        expect(trackEvent).toHaveBeenCalledWith('analysis_error', undefined);
      });

      errorSpy.mockRestore();
    });
  });

  describe('gap analysis', () => {
    it('should attempt gap analysis with resume URL', async () => {
      (validateInputs as jest.Mock).mockReturnValue({ valid: true });
      (analyzeJobFit as jest.Mock).mockResolvedValue(mockAnalysisResponse);
      (formatAnalysisResult as jest.Mock).mockReturnValue(mockFormattedResult);
      (analyzeWithGap as jest.Mock).mockResolvedValue(mockGapAnalysisResponse);

      const { result } = renderHook(() => useJobAnalysis());

      const resumeUrl = 'resume-url';
      act(() => {
        result.current.analyze('cv', 'job', resumeUrl);
      });

      await waitFor(() => {
        expect(analyzeWithGap).toHaveBeenCalledWith('job', resumeUrl);
      });
    });

    it('should attempt gap analysis with CV text if no resume URL', async () => {
      (validateInputs as jest.Mock).mockReturnValue({ valid: true });
      (analyzeJobFit as jest.Mock).mockResolvedValue(mockAnalysisResponse);
      (formatAnalysisResult as jest.Mock).mockReturnValue(mockFormattedResult);
      (analyzeWithGap as jest.Mock).mockResolvedValue(mockGapAnalysisResponse);

      const { result } = renderHook(() => useJobAnalysis());

      const cv = 'a'.repeat(100);
      act(() => {
        result.current.analyze(cv, 'job', null);
      });

      await waitFor(() => {
        expect(analyzeWithGap).toHaveBeenCalledWith('job', undefined, cv);
      });
    });

    it('should not attempt gap analysis if CV too short and no resume URL', async () => {
      (validateInputs as jest.Mock).mockReturnValue({ valid: true });
      (analyzeJobFit as jest.Mock).mockResolvedValue(mockAnalysisResponse);
      (formatAnalysisResult as jest.Mock).mockReturnValue(mockFormattedResult);

      const { result } = renderHook(() => useJobAnalysis());

      const cv = 'short';
      act(() => {
        result.current.analyze(cv, 'job', null);
      });

      await waitFor(() => {
        expect(analyzeWithGap).not.toHaveBeenCalled();
      });
    });

    it('should handle gap analysis failures gracefully', async () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      (validateInputs as jest.Mock).mockReturnValue({ valid: true });
      (analyzeJobFit as jest.Mock).mockResolvedValue(mockAnalysisResponse);
      (formatAnalysisResult as jest.Mock).mockReturnValue(mockFormattedResult);
      (analyzeWithGap as jest.Mock).mockRejectedValue(new Error('Gap analysis failed'));

      const { result } = renderHook(() => useJobAnalysis());

      act(() => {
        result.current.analyze('a'.repeat(100), 'job', null);
      });

      await waitFor(() => {
        expect(result.current.result).toEqual(mockFormattedResult);
        expect(result.current.gapResult).toBeNull();
      });

      warnSpy.mockRestore();
    });
  });

  describe('error handling', () => {
    it('should set error when analysis fails', async () => {
      const errorMessage = 'Network error';

      (validateInputs as jest.Mock).mockReturnValue({ valid: true });
      (analyzeJobFit as jest.Mock).mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useJobAnalysis());

      act(() => {
        result.current.analyze('cv', 'job', null);
      });

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
        expect(result.current.result).toBeNull();
      });
    });

    it('should handle non-Error exceptions', async () => {
      (validateInputs as jest.Mock).mockReturnValue({ valid: true });
      (analyzeJobFit as jest.Mock).mockRejectedValue('String error');

      const { result } = renderHook(() => useJobAnalysis());

      act(() => {
        result.current.analyze('cv', 'job', null);
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Unknown error during analysis');
      });
    });

    it('should continue loading false on error', async () => {
      (validateInputs as jest.Mock).mockReturnValue({ valid: true });
      (analyzeJobFit as jest.Mock).mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useJobAnalysis());

      act(() => {
        result.current.analyze('cv', 'job', null);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      (validateInputs as jest.Mock).mockReturnValue({
        valid: false,
        error: 'Validation error',
      });

      const { result } = renderHook(() => useJobAnalysis());

      act(() => {
        result.current.analyze('cv', 'job', null);
      });

      expect(result.current.error).toBe('Validation error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('hook return type', () => {
    it('should return object with expected properties', () => {
      const { result } = renderHook(() => useJobAnalysis());

      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('result');
      expect(result.current).toHaveProperty('gapResult');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('analyze');
      expect(result.current).toHaveProperty('clearError');
    });

    it('should return correct property types', () => {
      const { result } = renderHook(() => useJobAnalysis());

      expect(typeof result.current.loading).toBe('boolean');
      expect(typeof result.current.analyze).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
    });
  });
});

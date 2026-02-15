import { analyzeJobFit } from '../domain/apiClient';
import * as fallbackService from '../services/fallbackAIService';
import type { AIProviderFallbackResponse, AnalysisResult } from '../types/analysis';

// Mock the fallback service
jest.mock('../services/fallbackAIService');

// Mock fetch
global.fetch = jest.fn();

// Mock language detection
jest.mock('../utils/languageDetection', () => ({
  detectLanguage: jest.fn(() => 'en'),
}));

describe('API Client - Fallback Response Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeJobFit with successful backend response', () => {
    it('returns analysis result when backend succeeds', async () => {
      const mockResponse: AnalysisResult = {
        fitScore: 0.85,
        decision: 'apply',
        recruiterMessage: 'Great fit!',
        coverLetter: 'Dear Hiring Manager...',
        strengths: [],
        gaps: [],
        cvSuggestions: [],
        explanation: {
          positives: ['Python expert'],
          negatives: [],
          summary: 'Strong match',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      const result = await analyzeJobFit('My CV', 'Job description');

      expect(result.fitScore).toBe(0.85);
      expect(result.decision).toBe('apply');
      expect(result.detectedLanguage).toBe('en');
      expect(fallbackService.handleProviderFallback).not.toHaveBeenCalled();
    });

    it('includes detected language in response', async () => {
      const mockResponse: AnalysisResult = {
        fitScore: 0.75,
        decision: 'apply',
        recruiterMessage: 'Good candidate',
        coverLetter: 'Cover letter',
        strengths: [],
        gaps: [],
        cvSuggestions: [],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      const result = await analyzeJobFit('CV', 'Job');

      expect(result.detectedLanguage).toBe('en');
    });
  });

  describe('analyzeJobFit with fallback response', () => {
    it('detects fallback response and calls fallback service', async () => {
      const fallbackResponse: AIProviderFallbackResponse = {
        success: false,
        fallback: 'firebase',
        reason: 'rate_limit',
        message: 'Groq rate limit exceeded',
        prompt: {
          system: 'Analyze job fit',
          user: 'Check if I match',
        },
      };

      const degradedResult: AnalysisResult = {
        fitScore: 0.5,
        decision: 'apply',
        recruiterMessage: 'Service temporarily unavailable',
        coverLetter: 'Cover letter template',
        strengths: [],
        gaps: [],
        cvSuggestions: [],
        explanation: {
          positives: ['You applied'],
          negatives: ['Service unavailable'],
          summary: 'Try again later',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(fallbackResponse),
      });

      (fallbackService.handleProviderFallback as jest.Mock).mockResolvedValueOnce(
        degradedResult
      );

      const result = await analyzeJobFit('CV', 'Job description');

      expect(fallbackService.handleProviderFallback).toHaveBeenCalledWith(
        fallbackResponse
      );
      expect(result.fitScore).toBe(0.5);
      expect(result.decision).toBe('apply');
      expect(result.detectedLanguage).toBe('en');
    });

    it('passes complete fallback response to fallback service', async () => {
      const fallbackResponse: AIProviderFallbackResponse = {
        success: false,
        fallback: 'firebase',
        reason: 'provider_unavailable',
        message: 'Groq unavailable',
        prompt: {
          system: 'System prompt content',
          user: 'User prompt content',
        },
      };

      const mockResult: AnalysisResult = {
        fitScore: 0.5,
        decision: 'apply',
        recruiterMessage: 'Fallback response',
        coverLetter: 'Letter',
        strengths: [],
        gaps: [],
        cvSuggestions: [],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(fallbackResponse),
      });

      (fallbackService.handleProviderFallback as jest.Mock).mockResolvedValueOnce(
        mockResult
      );

      await analyzeJobFit('CV', 'Job');

      const callArgs = (fallbackService.handleProviderFallback as jest.Mock)
        .mock.calls[0][0];

      expect(callArgs.reason).toBe('provider_unavailable');
      expect(callArgs.prompt.system).toBe('System prompt content');
      expect(callArgs.prompt.user).toBe('User prompt content');
    });

    it('handles multiple failure reasons from backend', async () => {
      const reasons: Array<'rate_limit' | 'quota_exceeded' | 'provider_unavailable' | 'timeout'> = [
        'rate_limit',
        'quota_exceeded',
        'provider_unavailable',
        'timeout',
      ];

      const mockResult: AnalysisResult = {
        fitScore: 0.5,
        decision: 'apply',
        recruiterMessage: 'Fallback',
        coverLetter: 'Letter',
        strengths: [],
        gaps: [],
        cvSuggestions: [],
      };

      for (const reason of reasons) {
        jest.clearAllMocks();

        const fallbackResponse: AIProviderFallbackResponse = {
          success: false,
          fallback: 'firebase',
          reason,
          message: `Provider failed: ${reason}`,
          prompt: {
            system: 'System',
            user: 'User',
          },
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(fallbackResponse),
        });

        (fallbackService.handleProviderFallback as jest.Mock).mockResolvedValueOnce(
          mockResult
        );

        await analyzeJobFit('CV', 'Job');

        expect(fallbackService.handleProviderFallback).toHaveBeenCalled();
      }
    });
  });

  describe('analyzeJobFit with HTTP errors', () => {
    it('throws error on non-200 responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValueOnce({
          error: 'Internal server error',
        }),
      });

      await expect(analyzeJobFit('CV', 'Job')).rejects.toThrow(
        'Internal server error'
      );
      expect(fallbackService.handleProviderFallback).not.toHaveBeenCalled();
    });

    it('includes HTTP status in error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 502,
        json: jest.fn().mockRejectedValueOnce(new Error('Parse error')),
      });

      try {
        await analyzeJobFit('CV', 'Job');
        fail('Should have thrown');
      } catch (error: any) {
        expect(error.status).toBe(502);
      }
    });

    it('handles error response without error field', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: jest.fn().mockResolvedValueOnce({}),
      });

      await expect(analyzeJobFit('CV', 'Job')).rejects.toThrow('HTTP Error: 429');
      expect(fallbackService.handleProviderFallback).not.toHaveBeenCalled();
    });
  });

  describe('analyzeJobFit distinguishes normal vs fallback responses', () => {
    it('recognizes normal response with success-like structure', async () => {
      const normalResponse: AnalysisResult = {
        fitScore: 0.8,
        decision: 'apply',
        recruiterMessage: 'Match',
        coverLetter: 'Letter',
        strengths: [],
        gaps: [],
        cvSuggestions: [],
        // Note: no "success" field, and no "fallback" field
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(normalResponse),
      });

      const result = await analyzeJobFit('CV', 'Job');

      expect(result.fitScore).toBe(0.8);
      expect(fallbackService.handleProviderFallback).not.toHaveBeenCalled();
    });

    it('recognizes fallback response with success: false', async () => {
      const fallbackResponse: AIProviderFallbackResponse = {
        success: false,
        fallback: 'firebase',
        reason: 'rate_limit',
        message: 'Rate limited',
        prompt: {
          system: 'System',
          user: 'User',
        },
      };

      const mockResult: AnalysisResult = {
        fitScore: 0.5,
        decision: 'apply',
        recruiterMessage: 'Fallback',
        coverLetter: 'Letter',
        strengths: [],
        gaps: [],
        cvSuggestions: [],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(fallbackResponse),
      });

      (fallbackService.handleProviderFallback as jest.Mock).mockResolvedValueOnce(
        mockResult
      );

      const result = await analyzeJobFit('CV', 'Job');

      expect(fallbackService.handleProviderFallback).toHaveBeenCalled();
      expect(result.fitScore).toBe(0.5);
    });

    it('ignores responses with success: true field (not fallbacks)', async () => {
      const fakeResponse = {
        success: true,
        fitScore: 0.75,
        decision: 'apply' as const,
        recruiterMessage: 'Good',
        coverLetter: 'Letter',
        strengths: [],
        gaps: [],
        cvSuggestions: [],
        // Includes success: true, so it's not a fallback response
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(fakeResponse),
      });

      // The type guard should reject this because it checks success === false
      await analyzeJobFit('CV', 'Job');

      // It should be treated as a normal response
      expect(fallbackService.handleProviderFallback).not.toHaveBeenCalled();
    });
  });

  describe('analyzeJobFit API call details', () => {
    it('sends correct request format to API', async () => {
      const mockResponse: AnalysisResult = {
        fitScore: 0.7,
        decision: 'apply',
        recruiterMessage: 'Good',
        coverLetter: 'Letter',
        strengths: [],
        gaps: [],
        cvSuggestions: [],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      await analyzeJobFit('My CV text', 'Senior role');

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      expect(fetchCall[0]).toContain('/api/analyze');
      expect(fetchCall[1].method).toBe('POST');
      expect(fetchCall[1].headers['Content-Type']).toBe('application/json');

      const body = JSON.parse(fetchCall[1].body);
      expect(body.cv).toBe('My CV text');
      expect(body.jobDescription).toBe('Senior role');
      expect(body.language).toBe('en');
    });

    it('includes resume URL in request when provided', async () => {
      const mockResponse: AnalysisResult = {
        fitScore: 0.7,
        decision: 'apply',
        recruiterMessage: 'Good',
        coverLetter: 'Letter',
        strengths: [],
        gaps: [],
        cvSuggestions: [],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      await analyzeJobFit('CV', 'Job', 'https://example.com/resume.pdf');

      const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(body.resumeUrl).toBe('https://example.com/resume.pdf');
    });

    it('does not include resume URL when not provided', async () => {
      const mockResponse: AnalysisResult = {
        fitScore: 0.7,
        decision: 'apply',
        recruiterMessage: 'Good',
        coverLetter: 'Letter',
        strengths: [],
        gaps: [],
        cvSuggestions: [],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      await analyzeJobFit('CV', 'Job', null);

      const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(body.resumeUrl).toBeUndefined();
    });
  });
});

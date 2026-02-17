import { analyzeJobFit } from '../domain/apiClient';
import type { AnalysisResult } from '../types/analysis';

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

      const result = await analyzeJobFit('My CV', 'Job description', 'en');

      expect(result.fitScore).toBe(0.85);
      expect(result.decision).toBe('apply');
      expect(result.detectedLanguage).toBe('en');
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

      const result = await analyzeJobFit('CV', 'Job', 'en');

      expect(result.detectedLanguage).toBe('en');
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

      await expect(analyzeJobFit('CV', 'Job', 'en')).rejects.toThrow(
        'Internal server error'
      );
    });

    it('includes HTTP status in error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 502,
        json: jest.fn().mockRejectedValueOnce(new Error('Parse error')),
      });

      try {
        await analyzeJobFit('CV', 'Job', 'en');
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

      await expect(analyzeJobFit('CV', 'Job', 'en')).rejects.toThrow('HTTP Error: 429');
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

      await analyzeJobFit('My CV text', 'Senior role', 'en');

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      expect(fetchCall[0]).toContain('/api/analyze');
      expect(fetchCall[1].method).toBe('POST');
      expect(fetchCall[1].headers['Content-Type']).toBe('application/json');

      const body = JSON.parse(fetchCall[1].body);
      expect(body.cv).toBe('My CV text');
      expect(body.jobDescription).toBe('Senior role');
      expect(body.language).toBe('en');
      expect(body.uiLanguage).toBe('en');
      expect(body.jobLanguage).toBe('en');
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

      await analyzeJobFit('CV', 'Job', 'en', 'https://example.com/resume.pdf');

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

      await analyzeJobFit('CV', 'Job', 'en', null);

      const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(body.resumeUrl).toBeUndefined();
    });
  });
});

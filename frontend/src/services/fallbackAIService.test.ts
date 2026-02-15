import {
  handleProviderFallback,
  createDegradedResponse,
  callFirebaseVertexAI,
} from '../services/fallbackAIService';
import type { AIProviderFallbackResponse } from '../types/analysis';

describe('Fallback AI Service', () => {
  describe('createDegradedResponse', () => {
    it('creates a safe response with neutral fit score', () => {
      const response = createDegradedResponse('rate_limit');
      expect(response.fitScore).toBe(0.5);
      expect(response.decision).toBe('apply');
    });

    it('includes helpful message for rate_limit failure', () => {
      const response = createDegradedResponse('rate_limit');
      expect(response.recruiterMessage).toContain('temporarily overloaded');
      expect(response.recruiterMessage).toContain('try again in a few moments');
    });

    it('includes helpful message for quota_exceeded failure', () => {
      const response = createDegradedResponse('quota_exceeded');
      expect(response.recruiterMessage).toContain('reach its usage limit');
      expect(response.recruiterMessage).toContain('try again later');
    });

    it('includes helpful message for provider_unavailable failure', () => {
      const response = createDegradedResponse('provider_unavailable');
      expect(response.recruiterMessage).toContain('currently unavailable');
    });

    it('includes helpful message for timeout failure', () => {
      const response = createDegradedResponse('timeout');
      expect(response.recruiterMessage).toContain('took too long to respond');
      expect(response.recruiterMessage).toContain('shorter CV');
    });

    it('includes practical cover letter template', () => {
      const response = createDegradedResponse('rate_limit');
      expect(response.coverLetter).toContain('Dear Hiring Manager');
      expect(response.coverLetter).toContain('Thank you for considering');
    });

    it('includes explanation with positives and negatives', () => {
      const response = createDegradedResponse('rate_limit');
      expect(response.explanation).toBeDefined();
      expect(Array.isArray(response.explanation?.positives)).toBe(true);
      expect(Array.isArray(response.explanation?.negatives)).toBe(true);
      expect(response.explanation?.positives.length).toBeGreaterThan(0);
      expect(response.explanation?.negatives.length).toBeGreaterThan(0);
    });

    it('mentions manual review in explanation summary', () => {
      const response = createDegradedResponse('rate_limit');
      expect(response.explanation?.summary).toContain('manual review');
    });
  });

  describe('callFirebaseVertexAI', () => {
    it('returns null when user prompt is missing', async () => {
      const fallbackResponse: AIProviderFallbackResponse = {
        success: false,
        fallback: 'firebase',
        reason: 'rate_limit',
        message: 'Provider rate limited',
        prompt: {
          system: 'You are a job fit analyzer',
          user: '', // Empty user prompt
        },
      };

      const result = await callFirebaseVertexAI(fallbackResponse);
      expect(result).toBeNull();
    });

    it('returns null when system prompt is missing', async () => {
      const fallbackResponse: AIProviderFallbackResponse = {
        success: false,
        fallback: 'firebase',
        reason: 'provider_unavailable',
        message: 'Provider unavailable',
        prompt: {
          system: '', // Empty system prompt
          user: 'Analyze my CV for a senior developer role',
        },
      };

      const result = await callFirebaseVertexAI(fallbackResponse);
      expect(result).toBeNull();
    });

    it('returns null when Firebase is not configured', async () => {
      const fallbackResponse: AIProviderFallbackResponse = {
        success: false,
        fallback: 'firebase',
        reason: 'quota_exceeded',
        message: 'Provider quota exceeded',
        prompt: {
          system: 'You are a job fit analyzer',
          user: 'Analyze my CV for this role',
        },
      };

      const result = await callFirebaseVertexAI(fallbackResponse);
      expect(result).toBeNull();
    });
  });

  describe('handleProviderFallback', () => {
    it('logs failure reason when handling fallback', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const fallbackResponse: AIProviderFallbackResponse = {
        success: false,
        fallback: 'firebase',
        reason: 'rate_limit',
        message: 'Provider rate limited',
        prompt: {
          system: 'You are analyzing job fit',
          user: 'Check if I match this role',
        },
      };

      await handleProviderFallback(fallbackResponse);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[FallbackAI] Handling provider fallback')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('reason:')
      );

      consoleSpy.mockRestore();
    });

    it('returns degraded response when both providers fail', async () => {
      const fallbackResponse: AIProviderFallbackResponse = {
        success: false,
        fallback: 'firebase',
        reason: 'timeout',
        message: 'Primary provider timed out',
        prompt: {
          system: 'You are analyzing job fit',
          user: 'Check if I match this role',
        },
      };

      const result = await handleProviderFallback(fallbackResponse);

      // Should return degraded response structure
      expect(result).toBeDefined();
      expect(result.fitScore).toBe(0.5); // Neutral degraded score
      expect(result.decision).toBe('apply');
      expect(result.recruiterMessage).toBeDefined();
      expect(result.coverLetter).toBeDefined();
      expect(result.explanation).toBeDefined();
    });

    it('degraded response mentions specific failure reason', async () => {
      const fallbackResponse: AIProviderFallbackResponse = {
        success: false,
        fallback: 'firebase',
        reason: 'provider_unavailable',
        message: 'Provider is unavailable',
        prompt: {
          system: 'Analyze job fit',
          user: 'Is this a good fit?',
        },
      };

      const result = await handleProviderFallback(fallbackResponse);
      expect(result.recruiterMessage).toContain('currently unavailable');
    });

    it('includes helpful suggestions in degraded response', async () => {
      const fallbackResponse: AIProviderFallbackResponse = {
        success: false,
        fallback: 'firebase',
        reason: 'quota_exceeded',
        message: 'API quota exceeded',
        prompt: {
          system: 'Mode: job analyzer',
          user: 'Evaluate fit',
        },
      };

      const result = await handleProviderFallback(fallbackResponse);

      // Explanation should guide user
      expect(result.explanation?.summary).toContain(
        'unable to fully analyze'
      );
    });
  });

  describe('Fallback Response Handling Flow', () => {
    it('handles complete fallback flow from backend response', async () => {
      const backendFallbackResponse: AIProviderFallbackResponse = {
        success: false,
        fallback: 'firebase',
        reason: 'rate_limit',
        message: 'Groq rate limit exceeded',
        prompt: {
          system:
            'Analyze this CV against a job description and provide fit analysis',
          user:
            'CV: 10 years frontend experience\nJob: Senior React Developer',
        },
      };

      // This flow matches what apiClient.ts does:
      // 1. Backend returns fallback response
      // 2. apiClient detects it's a fallback response
      // 3. apiClient calls handleProviderFallback
      // 4. handleProviderFallback attempts Firebase (fails, not configured)
      // 5. Returns degraded response

      const result = await handleProviderFallback(backendFallbackResponse);

      // Result should be usable by UI
      expect(result.fitScore).toBeDefined();
      expect(result.decision).toBeDefined();
      expect(result.recruiterMessage).toBeDefined();
      expect(result.coverLetter).toBeDefined();
      expect(result.explanation).toBeDefined();

      // All fields should be strings or arrays
      expect(typeof result.recruiterMessage).toBe('string');
      expect(typeof result.coverLetter).toBe('string');
      expect(Array.isArray(result.explanation?.positives)).toBe(true);
      expect(Array.isArray(result.explanation?.negatives)).toBe(true);
      expect(typeof result.explanation?.summary).toBe('string');
    });
  });
});

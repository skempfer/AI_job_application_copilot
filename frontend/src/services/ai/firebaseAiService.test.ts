import {
  generateWithFirebaseAI,
  isFirebaseAIAvailable,
  createDegradedResponse,
} from './firebaseAiService';
import type { StructuredPrompt } from './firebaseAiService';

describe('Firebase AI Service', () => {
  // Store original import
  const originalImport = (global as any).import;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original import
    (global as any).import = originalImport;
  });

  describe('generateWithFirebaseAI', () => {
    it('returns null when Firebase AI module is not available', async () => {
      // Mock the dynamic import to throw an error
      (global as any).import = jest.fn().mockRejectedValue(
        new Error('Firebase AI module not found')
      );

      const prompt: StructuredPrompt = {
        system: 'Analyze job fit',
        user: 'Check CV against role',
      };

      const result = await generateWithFirebaseAI(prompt);

      expect(result).toBeNull();
    });

    it('returns null when Firebase AI is not available', async () => {
      const prompt: StructuredPrompt = {
        system: 'System',
        user: 'User',
      };

      // Set a spy to detect behavior
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = await generateWithFirebaseAI(prompt);

      expect(result).toBeNull();

      consoleSpy.mockRestore();
    });

    it('validates prompt structure', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Empty system prompt
      const result1 = await generateWithFirebaseAI({
        system: '',
        user: 'User',
      });

      expect(result1).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid prompt'),
        expect.any(Object)
      );

      consoleSpy.mockRestore();
    });

    it('handles network errors gracefully', async () => {
      (global as any).import = jest.fn().mockRejectedValue(
        new Error('Network error occurred')
      );

      const prompt: StructuredPrompt = {
        system: 'System',
        user: 'User',
      };

      const result = await generateWithFirebaseAI(prompt);

      expect(result).toBeNull();
    });
  });

  describe('isFirebaseAIAvailable', () => {
    it('returns false when Firebase AI module is not available', async () => {
      // Mock the dynamic import to throw an error
      (global as any).import = jest.fn().mockRejectedValue(
        new Error('Module not found')
      );

      const result = await isFirebaseAIAvailable();

      expect(result).toBe(false);
    });
  });

  describe('createDegradedResponse', () => {
    it('creates response with neutral fit score of 0.5', () => {
      const response = createDegradedResponse('rate_limit');

      expect(response.fitScore).toBe(0.5);
    });

    it('sets decision to "apply" for neutral recommendation', () => {
      const response = createDegradedResponse('rate_limit');

      expect(response.decision).toBe('apply');
    });

    it('returns complete AnalysisResult structure', () => {
      const response = createDegradedResponse('timeout');

      expect(response.recruiterMessage).toBeDefined();
      expect(response.coverLetter).toBeDefined();
      expect(response.strengths).toBeDefined();
      expect(response.gaps).toBeDefined();
      expect(response.cvSuggestions).toBeDefined();
      expect(Array.isArray(response.strengths)).toBe(true);
      expect(Array.isArray(response.gaps)).toBe(true);
      expect(Array.isArray(response.cvSuggestions)).toBe(true);
    });

    it('includes failure-specific message for rate_limit', () => {
      const response = createDegradedResponse('rate_limit');

      expect(response.recruiterMessage).toContain('temporarily overloaded');
      expect(response.recruiterMessage).toContain('try again in a few moments');
    });

    it('includes failure-specific message for quota_exceeded', () => {
      const response = createDegradedResponse('quota_exceeded');

      expect(response.recruiterMessage).toContain('usage limit');
      expect(response.recruiterMessage).toContain('try again later');
    });

    it('includes failure-specific message for provider_unavailable', () => {
      const response = createDegradedResponse('provider_unavailable');

      expect(response.recruiterMessage).toContain('currently unavailable');
    });

    it('includes failure-specific message for timeout', () => {
      const response = createDegradedResponse('timeout');

      expect(response.recruiterMessage).toContain('took too long');
    });

    it('provides practical template cover letter', () => {
      const response = createDegradedResponse('rate_limit');

      expect(response.coverLetter).toContain('Dear Hiring Manager');
      expect(response.coverLetter).toContain('Thank you');
      expect(response.coverLetter.length).toBeGreaterThan(50);
    });

    it('includes helpful suggestions for timeout reason', () => {
      const response = createDegradedResponse('timeout');

      expect(response.recruiterMessage).toContain('shorter CV');
    });

    it('includes helpful suggestion for quota_exceeded reason', () => {
      const response = createDegradedResponse('quota_exceeded');

      expect(response.recruiterMessage).toContain('try again later');
    });

    it('provides structured explanation with all components', () => {
      const response = createDegradedResponse('provider_unavailable');

      expect(response.explanation).toBeDefined();
      expect(Array.isArray(response.explanation?.positives)).toBe(true);
      expect(Array.isArray(response.explanation?.negatives)).toBe(true);
      expect(typeof response.explanation?.summary).toBe('string');
    });

    it('includes guidance about automated analysis availability', () => {
      const response = createDegradedResponse('rate_limit');

      expect(response.explanation?.summary).toContain('manually reviewing');
      expect(response.explanation?.summary).toContain('automated analysis');
    });

    it('handles unknown failure reason gracefully', () => {
      const response = createDegradedResponse('unknown_reason' as any);

      // Should still return valid response
      expect(response.fitScore).toBe(0.5);
      expect(response.decision).toBe('apply');
      expect(response.recruiterMessage).toBeDefined();
      expect(response.recruiterMessage.length).toBeGreaterThan(0);
    });

    it('includes positives explaining what went well', () => {
      const response = createDegradedResponse('timeout');

      expect(response.explanation?.positives.length).toBeGreaterThan(0);
      expect(response.explanation?.positives[0]).toContain('applied');
    });

    it('includes negatives about limitation', () => {
      const response = createDegradedResponse('quota_exceeded');

      expect(response.explanation?.negatives.length).toBeGreaterThan(0);
      expect(response.explanation?.negatives[0]).toContain('analysis');
    });
  });

  describe('Integration Scenarios', () => {
    it('degrades gracefully when Firebase unavailable', async () => {
      (global as any).import = jest.fn().mockRejectedValue(
        new Error('Firebase not configured')
      );

      const prompt: StructuredPrompt = {
        system: 'System',
        user: 'User',
      };

      const result = await generateWithFirebaseAI(prompt);

      expect(result).toBeNull();

      // Fallback handler would then create degraded response
      const degraded = createDegradedResponse('provider_unavailable');
      expect(degraded).toBeDefined();
      expect(degraded.fitScore).toBe(0.5);
    });

    it('returns null for all error conditions allowing fallback chain', async () => {
      const errorConditions = [
        'Module error',
        'Network error',
        'Timeout',
        'Invalid response',
        'Permission denied',
      ];

      for (const error of errorConditions) {
        jest.clearAllMocks();
        (global as any).import = jest.fn().mockRejectedValue(
          new Error(error)
        );

        const prompt: StructuredPrompt = {
          system: 'System',
          user: 'User',
        };

        const result = await generateWithFirebaseAI(prompt);
        expect(result).toBeNull();
      }
    });

    it('always provides valid fallback even if everything fails', async () => {
      const result = await generateWithFirebaseAI({
        system: 'System',
        user: 'User',
      });

      if (result === null) {
        // Firebase failed, use degraded response
        const degraded = createDegradedResponse('provider_unavailable');
        expect(degraded.fitScore).toBe(0.5);
        expect(degraded.decision).toBe('apply');
        expect(degraded.recruiterMessage).toBeDefined();
      } else {
        // Firebase succeeded
        expect(result.fitScore).toBeDefined();
        expect(result.decision).toBeDefined();
      }
    });

    it('ensures all failure reasons produce valid response', () => {
      const reasons: Array<'rate_limit' | 'quota_exceeded' | 'provider_unavailable' | 'timeout'> = [
        'rate_limit',
        'quota_exceeded',
        'provider_unavailable',
        'timeout',
      ];

      for (const reason of reasons) {
        const response = createDegradedResponse(reason);

        expect(response.fitScore).toBe(0.5);
        expect(response.decision).toBe('apply');
        expect(response.recruiterMessage).toBeDefined();
        expect(response.recruiterMessage.length).toBeGreaterThan(0);
        expect(response.coverLetter).toBeDefined();
        expect(response.strengths).toEqual([]);
        expect(response.gaps).toEqual([]);
        expect(response.explanation).toBeDefined();
      }
    });
  });
});

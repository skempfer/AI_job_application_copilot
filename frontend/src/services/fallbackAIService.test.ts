import { handleProviderFallback } from './fallbackAIService';
import * as firebaseAiService from './ai/firebaseAiService';
import type { AIProviderFallbackResponse, AnalysisResult } from '../types/analysis';

jest.mock('./ai/firebaseAiService');

const mockGenerateWithFirebaseAI = firebaseAiService.generateWithFirebaseAI as jest.MockedFunction<
  typeof firebaseAiService.generateWithFirebaseAI
>;
const mockCreateDegradedResponse = firebaseAiService.createDegradedResponse as jest.MockedFunction<
  typeof firebaseAiService.createDegradedResponse
>;

describe('Frontend Fallback Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock behavior: Firebase fails, degraded response succeeds
    mockGenerateWithFirebaseAI.mockResolvedValue(null);
    mockCreateDegradedResponse.mockReturnValue({
      fitScore: 0.5,
      decision: 'apply',
      recruiterMessage: 'Unable to provide detailed analysis. Manual review recommended.',
      coverLetter: 'Cover letter template',
      strengths: [],
      gaps: [],
      cvSuggestions: [],
      explanation: {
        positives: [],
        negatives: [],
        summary: 'Analysis unavailable',
      },
    });
  });

  describe('handleProviderFallback', () => {
    it('attempts Firebase Vertex AI when backend fallback response received', async () => {
      const mockResult: AnalysisResult = {
        fitScore: 0.8,
        decision: 'apply',
        recruiterMessage: 'Good fit',
        coverLetter: 'Letter',
        strengths: ['Python'],
        gaps: [],
        cvSuggestions: [],
      };

      mockGenerateWithFirebaseAI.mockResolvedValueOnce(mockResult);

      const fallbackResponse: AIProviderFallbackResponse = {
        success: false,
        fallback: 'firebase',
        reason: 'rate_limit',
        message: 'Groq rate limited',
        prompt: {
          system: 'You are analyzing job fit',
          user: 'Check if I match this role',
        },
      };

      const result = await handleProviderFallback(fallbackResponse);

      expect(mockGenerateWithFirebaseAI).toHaveBeenCalledWith(
        fallbackResponse.prompt
      );
      expect(result).toEqual(mockResult);
    });

    it('returns degraded response when Firebase AI fails', async () => {
      mockGenerateWithFirebaseAI.mockResolvedValueOnce(null);
      
      const expectedDegraded: AnalysisResult = {
        fitScore: 0.5,
        decision: 'apply',
        recruiterMessage: 'Firebase unavailable',
        coverLetter: 'Template',
        strengths: [],
        gaps: [],
        cvSuggestions: [],
      };

      mockCreateDegradedResponse.mockReturnValueOnce(expectedDegraded);

      const fallbackResponse: AIProviderFallbackResponse = {
        success: false,
        fallback: 'firebase',
        reason: 'provider_unavailable',
        message: 'Provider unavailable',
        prompt: {
          system: 'System prompt',
          user: 'User prompt',
        },
      };

      const result = await handleProviderFallback(fallbackResponse);

      expect(result.fitScore).toBe(0.5);
      expect(result.decision).toBe('apply');
      expect(mockCreateDegradedResponse).toHaveBeenCalledWith('provider_unavailable');
    });

    it('returns degraded response when prompts are missing', async () => {
      const expectedDegraded: AnalysisResult = {
        fitScore: 0.5,
        decision: 'apply',
        recruiterMessage: 'Missing prompts',
        coverLetter: 'Template',
        strengths: [],
        gaps: [],
        cvSuggestions: [],
      };

      mockCreateDegradedResponse.mockReturnValueOnce(expectedDegraded);

      const fallbackResponse: AIProviderFallbackResponse = {
        success: false,
        fallback: 'firebase',
        reason: 'timeout',
        message: 'Timeout',
        prompt: {
          system: '',
          user: '',
        },
      };

      const result = await handleProviderFallback(fallbackResponse);

      expect(result.fitScore).toBe(0.5);
      expect(mockGenerateWithFirebaseAI).not.toHaveBeenCalled();
    });

    it('includes appropriate message for each failure reason', async () => {
      const reasons: Array<'rate_limit' | 'quota_exceeded' | 'provider_unavailable' | 'timeout'> = [
        'rate_limit',
        'quota_exceeded',
        'provider_unavailable',
        'timeout',
      ];

      for (const reason of reasons) {
        jest.clearAllMocks();
        mockGenerateWithFirebaseAI.mockResolvedValueOnce(null);
        
        const degradedResponse: AnalysisResult = {
          fitScore: 0.5,
          decision: 'apply',
          recruiterMessage: `Message for ${reason}`,
          coverLetter: 'Letter',
          strengths: [],
          gaps: [],
          cvSuggestions: [],
        };

        mockCreateDegradedResponse.mockReturnValueOnce(degradedResponse);

        const fallbackResponse: AIProviderFallbackResponse = {
          success: false,
          fallback: 'firebase',
          reason,
          message: `Failed: ${reason}`,
          prompt: {
            system: 'System',
            user: 'User',
          },
        };

        const result = await handleProviderFallback(fallbackResponse);

        expect(mockCreateDegradedResponse).toHaveBeenCalledWith(reason);
        expect(result).toBeDefined();
      }
    });

    it('always provides valid AnalysisResult structure', async () => {
      const validResponse: AnalysisResult = {
        fitScore: 0.5,
        decision: 'apply',
        recruiterMessage: 'Valid structure',
        coverLetter: 'Letter',
        strengths: [],
        gaps: [],
        cvSuggestions: [],
        explanation: {
          positives: [],
          negatives: [],
          summary: 'Summary',
        },
      };

      mockGenerateWithFirebaseAI.mockResolvedValueOnce(null);
      mockCreateDegradedResponse.mockReturnValueOnce(validResponse);

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

      const result = await handleProviderFallback(fallbackResponse);

      // Verify all required fields exist
      expect(result.fitScore).toBeDefined();
      expect(result.decision).toBeDefined();
      expect(result.recruiterMessage).toBeDefined();
      expect(result.coverLetter).toBeDefined();
      expect(result.strengths).toBeDefined();
      expect(result.gaps).toBeDefined();
      expect(result.cvSuggestions).toBeDefined();
      expect(result.explanation).toBeDefined();

      // Verify types
      expect(typeof result.fitScore).toBe('number');
      expect(typeof result.recruiterMessage).toBe('string');
      expect(Array.isArray(result.strengths)).toBe(true);
    });
  });
});

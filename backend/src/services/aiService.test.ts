import { AIService } from './aiService';
import type { AISignals, AnalysisResult } from '../types/analysis';
import OpenAI from 'openai';

// Mock OpenAI module
jest.mock('openai');

describe('AIService - Response Parsing and Output Contract', () => {
  let aiService: AIService;
  let mockCreate: jest.Mock;

  // Valid mock AI response matching the expected schema
  const validAIResponse: AISignals = {
    hardSkillsDetected: ['React', 'TypeScript', 'Node.js'],
    softSkillsEvidence: ['Leadership', 'Communication'],
    mandatoryRequirementsMet: ['5+ years experience', 'TypeScript'],
    mandatoryRequirementsMissing: [],
    desirableRequirementsMet: ['Docker'],
    desirableRequirementsMissing: ['AWS', 'Kubernetes'],
    seniorityMatch: 'match',
    redFlags: [],
    recruiterMessage: 'I am excited to apply for this position...',
    coverLetter: 'Dear Hiring Manager,\n\nI am writing to express my interest...',
    detectedYearsExperience: 5,
    detectedDomainExperience: {
      frontend: true,
      backend: true,
      fullstack: true,
      qa: false,
      devops: false,
      product: false,
    },
  };

  const mockCV = `
    John Doe
    Senior Software Engineer
    5 years of experience in React, TypeScript, and Node.js
    Led frontend team at TechCorp
  `;

  const mockJobDescription = `
    Senior Full Stack Developer
    Requirements:
    - 5+ years experience
    - TypeScript
    - React
    - Docker (nice to have)
    - AWS (nice to have)
  `;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create mock for chat.completions.create
    mockCreate = jest.fn();

    // Mock OpenAI constructor
    (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => {
      return {
        chat: {
          completions: {
            create: mockCreate,
          },
        },
      } as any;
    });

    // Initialize service
    aiService = new AIService({
      apiKey: 'test-api-key',
      apiUrl: 'https://test.openai.com',
      model: 'gpt-4',
    });
  });

  describe('Valid AI Response Parsing', () => {
    it('should successfully parse valid JSON response', async () => {
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(validAIResponse),
            },
          },
        ],
      });

      const result = await aiService.analyzeJobFit(mockCV, mockJobDescription, 'en');

      expect(result).toBeDefined();
      expect(result.fitScore).toBeGreaterThanOrEqual(0);
      expect(result.fitScore).toBeLessThanOrEqual(100);
    });

    it('should handle JSON wrapped in markdown code blocks', async () => {
      const wrappedResponse = `\`\`\`json\n${JSON.stringify(validAIResponse)}\n\`\`\``;

      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: wrappedResponse,
            },
          },
        ],
      });

      const result = await aiService.analyzeJobFit(mockCV, mockJobDescription, 'en');

      expect(result).toBeDefined();
      expect(result.recruiterMessage).toBe(validAIResponse.recruiterMessage);
    });

    it('should handle plain markdown code blocks', async () => {
      const wrappedResponse = `\`\`\`\n${JSON.stringify(validAIResponse)}\n\`\`\``;

      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: wrappedResponse,
            },
          },
        ],
      });

      const result = await aiService.analyzeJobFit(mockCV, mockJobDescription, 'en');

      expect(result).toBeDefined();
    });
  });

  describe('Output Contract Validation', () => {
    beforeEach(() => {
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(validAIResponse),
            },
          },
        ],
      });
    });

    it('should return AnalysisResult with all required fields', async () => {
      const result = await aiService.analyzeJobFit(mockCV, mockJobDescription, 'en');

      // Validate top-level required fields
      expect(result).toHaveProperty('fitScore');
      expect(result).toHaveProperty('decision');
      expect(result).toHaveProperty('strengths');
      expect(result).toHaveProperty('gaps');
      expect(result).toHaveProperty('cvSuggestions');
      expect(result).toHaveProperty('recruiterMessage');
      expect(result).toHaveProperty('coverLetter');
      expect(result).toHaveProperty('explanation');
      expect(result).toHaveProperty('promptVersion');
      expect(result).toHaveProperty('detectedLanguage');
      expect(result).toHaveProperty('preprocessedCV');
    });

    it('should return fitScore as a number between 0 and 100', async () => {
      const result = await aiService.analyzeJobFit(mockCV, mockJobDescription, 'en');

      expect(typeof result.fitScore).toBe('number');
      expect(result.fitScore).toBeGreaterThanOrEqual(0);
      expect(result.fitScore).toBeLessThanOrEqual(100);
    });

    it('should return decision as one of the valid values', async () => {
      const result = await aiService.analyzeJobFit(mockCV, mockJobDescription, 'en');

      expect(['apply', 'apply_with_fixes', 'skip']).toContain(result.decision);
    });

    it('should return strengths as an array of strings', async () => {
      const result = await aiService.analyzeJobFit(mockCV, mockJobDescription, 'en');

      expect(Array.isArray(result.strengths)).toBe(true);
      result.strengths.forEach((strength) => {
        expect(typeof strength).toBe('string');
      });
    });

    it('should return gaps as an array of strings', async () => {
      const result = await aiService.analyzeJobFit(mockCV, mockJobDescription, 'en');

      expect(Array.isArray(result.gaps)).toBe(true);
      result.gaps.forEach((gap) => {
        expect(typeof gap).toBe('string');
      });
    });

    it('should return cvSuggestions as an array of strings', async () => {
      const result = await aiService.analyzeJobFit(mockCV, mockJobDescription, 'en');

      expect(Array.isArray(result.cvSuggestions)).toBe(true);
      expect(result.cvSuggestions.length).toBeGreaterThan(0);
      result.cvSuggestions.forEach((suggestion) => {
        expect(typeof suggestion).toBe('string');
      });
    });

    it('should return recruiterMessage as a non-empty string', async () => {
      const result = await aiService.analyzeJobFit(mockCV, mockJobDescription, 'en');

      expect(typeof result.recruiterMessage).toBe('string');
      expect(result.recruiterMessage.length).toBeGreaterThan(0);
    });

    it('should return coverLetter as a non-empty string', async () => {
      const result = await aiService.analyzeJobFit(mockCV, mockJobDescription, 'en');

      expect(typeof result.coverLetter).toBe('string');
      expect(result.coverLetter.length).toBeGreaterThan(0);
    });

    it('should return explanation with all required properties', async () => {
      const result = await aiService.analyzeJobFit(mockCV, mockJobDescription, 'en');

      expect(result.explanation).toHaveProperty('positives');
      expect(result.explanation).toHaveProperty('negatives');
      expect(result.explanation).toHaveProperty('summary');
      expect(Array.isArray(result.explanation.positives)).toBe(true);
      expect(Array.isArray(result.explanation.negatives)).toBe(true);
      expect(typeof result.explanation.summary).toBe('string');
    });

    it('should return preprocessedCV with all required properties', async () => {
      const result = await aiService.analyzeJobFit(mockCV, mockJobDescription, 'en');

      expect(result.preprocessedCV).toHaveProperty('yearsExperience');
      expect(result.preprocessedCV).toHaveProperty('yearsExperienceConfidence');
      expect(result.preprocessedCV).toHaveProperty('domainExperience');
      expect(result.preprocessedCV).toHaveProperty('seniority');
      expect(result.preprocessedCV).toHaveProperty('skills');
    });

    it('should return promptVersion matching expected value', async () => {
      const result = await aiService.analyzeJobFit(mockCV, mockJobDescription, 'en');

      expect(result.promptVersion).toBe('v2.0-optimized');
    });

    it('should return detectedLanguage matching input language', async () => {
      const result = await aiService.analyzeJobFit(mockCV, mockJobDescription, 'en');

      expect(result.detectedLanguage).toBe('en');
    });
  });

  describe('AI Response Validation', () => {
    it('should throw error when response is missing required field', async () => {
      const invalidResponse = {
        ...validAIResponse,
        hardSkillsDetected: undefined, // Missing required field
      };

      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(invalidResponse),
            },
          },
        ],
      });

      await expect(aiService.analyzeJobFit(mockCV, mockJobDescription, 'en')).rejects.toThrow();
    });

    it('should throw error when array field is not an array', async () => {
      const invalidResponse = {
        ...validAIResponse,
        hardSkillsDetected: 'not an array', // Should be array
      };

      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(invalidResponse),
            },
          },
        ],
      });

      await expect(aiService.analyzeJobFit(mockCV, mockJobDescription, 'en')).rejects.toThrow();
    });

    it('should throw error when seniorityMatch has invalid value', async () => {
      const invalidResponse = {
        ...validAIResponse,
        seniorityMatch: 'invalid', // Should be 'above', 'match', or 'below'
      };

      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(invalidResponse),
            },
          },
        ],
      });

      await expect(aiService.analyzeJobFit(mockCV, mockJobDescription, 'en')).rejects.toThrow();
    });

    it('should throw error when recruiterMessage is empty', async () => {
      const invalidResponse = {
        ...validAIResponse,
        recruiterMessage: '', // Should be non-empty
      };

      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(invalidResponse),
            },
          },
        ],
      });

      await expect(aiService.analyzeJobFit(mockCV, mockJobDescription, 'en')).rejects.toThrow();
    });

    it('should throw error when coverLetter is empty', async () => {
      const invalidResponse = {
        ...validAIResponse,
        coverLetter: '', // Should be non-empty
      };

      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(invalidResponse),
            },
          },
        ],
      });

      await expect(aiService.analyzeJobFit(mockCV, mockJobDescription, 'en')).rejects.toThrow();
    });

    it('should throw error when response content is empty', async () => {
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: '',
            },
          },
        ],
      });

      await expect(aiService.analyzeJobFit(mockCV, mockJobDescription, 'en')).rejects.toThrow();
    });

    it('should throw error when response content is null/undefined', async () => {
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: null,
            },
          },
        ],
      });

      await expect(aiService.analyzeJobFit(mockCV, mockJobDescription, 'en')).rejects.toThrow();
    });

    it('should throw error when response is not valid JSON', async () => {
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: 'This is not valid JSON',
            },
          },
        ],
      });

      await expect(aiService.analyzeJobFit(mockCV, mockJobDescription, 'en')).rejects.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle response with all mandatory requirements missing', async () => {
      const responseWithGaps = {
        ...validAIResponse,
        mandatoryRequirementsMet: [],
        mandatoryRequirementsMissing: ['TypeScript', 'React', '5+ years'],
      };

      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(responseWithGaps),
            },
          },
        ],
      });

      const result = await aiService.analyzeJobFit(mockCV, mockJobDescription, 'en');

      expect(result.gaps.length).toBeGreaterThan(0);
      expect(result.fitScore).toBeLessThan(70); // Should have lower score
    });

    it('should handle response with red flags', async () => {
      const responseWithRedFlags = {
        ...validAIResponse,
        redFlags: ['Years experience mismatch', 'Missing key technology'],
      };

      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(responseWithRedFlags),
            },
          },
        ],
      });

      const result = await aiService.analyzeJobFit(mockCV, mockJobDescription, 'en');

      expect(result.gaps.length).toBeGreaterThan(0);
      expect(result.gaps.some(gap => gap.includes('Years experience mismatch'))).toBe(true);
    });

    it('should handle below seniority match', async () => {
      const belowSeniorityResponse = {
        ...validAIResponse,
        seniorityMatch: 'below' as const,
      };

      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(belowSeniorityResponse),
            },
          },
        ],
      });

      const result = await aiService.analyzeJobFit(mockCV, mockJobDescription, 'en');

      expect(result.cvSuggestions.some(s => s.toLowerCase().includes('seniority'))).toBe(true);
    });

    it('should handle above seniority match', async () => {
      const aboveSeniorityResponse = {
        ...validAIResponse,
        seniorityMatch: 'above' as const,
      };

      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(aboveSeniorityResponse),
            },
          },
        ],
      });

      const result = await aiService.analyzeJobFit(mockCV, mockJobDescription, 'en');

      expect(result).toBeDefined();
      expect(result.fitScore).toBeGreaterThan(0);
    });
  });

  describe('Language Support', () => {
    it('should handle Portuguese language parameter', async () => {
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(validAIResponse),
            },
          },
        ],
      });

      const result = await aiService.analyzeJobFit(mockCV, mockJobDescription, 'pt');

      expect(result.detectedLanguage).toBe('pt');
    });

    it('should handle English language parameter', async () => {
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(validAIResponse),
            },
          },
        ],
      });

      const result = await aiService.analyzeJobFit(mockCV, mockJobDescription, 'en');

      expect(result.detectedLanguage).toBe('en');
    });
  });

  describe('No Breaking Changes in Output Shape', () => {
    it('should maintain backward compatibility with existing AnalysisResult shape', async () => {
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(validAIResponse),
            },
          },
        ],
      });

      const result = await aiService.analyzeJobFit(mockCV, mockJobDescription, 'en');

      // These fields must always exist for backward compatibility
      const requiredFields: (keyof AnalysisResult)[] = [
        'fitScore',
        'decision',
        'strengths',
        'gaps',
        'cvSuggestions',
        'recruiterMessage',
        'coverLetter',
        'explanation',
      ];

      requiredFields.forEach(field => {
        expect(result).toHaveProperty(field);
      });
    });

    it('should maintain explanation structure', async () => {
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(validAIResponse),
            },
          },
        ],
      });

      const result = await aiService.analyzeJobFit(mockCV, mockJobDescription, 'en');

      expect(result.explanation).toHaveProperty('positives');
      expect(result.explanation).toHaveProperty('negatives');
      expect(result.explanation).toHaveProperty('summary');
    });
  });
});

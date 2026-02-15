/**
 * Tests for AI Response Schema Validation
 * Ensures runtime validation of AI responses using Zod
 */

import {
  AISignalsSchema,
  validateAIResponse,
  validateAIResponseSafe,
  AIResponseValidationError,
  getAISignalsSchemaDocumentation,
} from './aiResponseSchema';

describe('AI Response Schema Validation', () => {
  const validAIResponse = {
    hardSkillsDetected: ['React', 'TypeScript'],
    softSkillsEvidence: ['Leadership', 'Communication'],
    mandatoryRequirementsMet: ['TypeScript', '5+ years'],
    mandatoryRequirementsMissing: [],
    desirableRequirementsMet: ['Docker'],
    desirableRequirementsMissing: ['AWS'],
    seniorityMatch: 'match' as const,
    redFlags: [],
    recruiterMessage: 'I am excited about this role',
    coverLetter: 'Dear Hiring Manager, I am writing...',
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

  describe('AISignalsSchema', () => {
    it('should accept valid data', () => {
      const result = AISignalsSchema.safeParse(validAIResponse);
      expect(result.success).toBe(true);
    });

    it('should have all required fields', () => {
      const schema = AISignalsSchema;
      const shape = schema.shape;

      expect(shape).toHaveProperty('hardSkillsDetected');
      expect(shape).toHaveProperty('softSkillsEvidence');
      expect(shape).toHaveProperty('mandatoryRequirementsMet');
      expect(shape).toHaveProperty('mandatoryRequirementsMissing');
      expect(shape).toHaveProperty('desirableRequirementsMet');
      expect(shape).toHaveProperty('desirableRequirementsMissing');
      expect(shape).toHaveProperty('seniorityMatch');
      expect(shape).toHaveProperty('redFlags');
      expect(shape).toHaveProperty('recruiterMessage');
      expect(shape).toHaveProperty('coverLetter');
    });
  });

  describe('validateAIResponse', () => {
    it('should validate correct data', () => {
      const result = validateAIResponse(validAIResponse);
      expect(result).toBeDefined();
      expect(result.hardSkillsDetected).toEqual(['React', 'TypeScript']);
      expect(result.seniorityMatch).toBe('match');
    });

    it('should throw when required field is missing', () => {
      const invalid = { ...validAIResponse } as Record<string, any>;
      delete invalid.hardSkillsDetected;

      expect(() => validateAIResponse(invalid)).toThrow(AIResponseValidationError);
    });

    it('should throw when array field is not an array', () => {
      const invalid = {
        ...validAIResponse,
        hardSkillsDetected: 'not an array',
      };

      expect(() => validateAIResponse(invalid)).toThrow(AIResponseValidationError);
    });

    it('should throw when seniorityMatch has invalid value', () => {
      const invalid = {
        ...validAIResponse,
        seniorityMatch: 'invalid',
      };

      expect(() => validateAIResponse(invalid)).toThrow(AIResponseValidationError);
    });

    it('should throw when recruiterMessage is empty', () => {
      const invalid = {
        ...validAIResponse,
        recruiterMessage: '',
      };

      expect(() => validateAIResponse(invalid)).toThrow(AIResponseValidationError);
    });

    it('should throw when coverLetter is empty', () => {
      const invalid = {
        ...validAIResponse,
        coverLetter: '',
      };

      expect(() => validateAIResponse(invalid)).toThrow(AIResponseValidationError);
    });

    it('should allow optional detectedYearsExperience', () => {
      const data = {
        ...validAIResponse,
        detectedYearsExperience: undefined,
      };

      const result = validateAIResponse(data);
      expect(result).toBeDefined();
    });

    it('should allow null detectedYearsExperience', () => {
      const data = {
        ...validAIResponse,
        detectedYearsExperience: null,
      };

      const result = validateAIResponse(data);
      expect(result.detectedYearsExperience).toBeNull();
    });

    it('should allow optional detectedDomainExperience', () => {
      const data = {
        ...validAIResponse,
        detectedDomainExperience: undefined,
      };

      const result = validateAIResponse(data);
      expect(result).toBeDefined();
    });

    it('should allow null detectedDomainExperience', () => {
      const data = {
        ...validAIResponse,
        detectedDomainExperience: null,
      };

      const result = validateAIResponse(data);
      expect(result.detectedDomainExperience).toBeNull();
    });
  });

  describe('validateAIResponseSafe', () => {
    it('should return isValid: true for correct data', () => {
      const result = validateAIResponseSafe(validAIResponse);
      expect(result.isValid).toBe(true);
      
      if (result.isValid) {
        expect(result.data.hardSkillsDetected).toBeDefined();
      }
    });

    it('should return isValid: false for invalid data', () => {
      const invalid = { ...validAIResponse, recruiterMessage: '' };
      const result = validateAIResponseSafe(invalid);

      expect(result.isValid).toBe(false);
      
      if (!result.isValid) {
        expect(result.error).toBeInstanceOf(AIResponseValidationError);
      }
    });

    it('should not throw when data is invalid', () => {
      const invalid = { ...validAIResponse, seniorityMatch: 'invalid' };

      expect(() => validateAIResponseSafe(invalid)).not.toThrow();
    });

    it('should include error details in isValid: false case', () => {
      const invalid = {
        ...validAIResponse,
        hardSkillsDetected: 'not an array',
        recruiterMessage: '',
      };

      const result = validateAIResponseSafe(invalid);

      if (!result.isValid) {
        expect(result.error.violations).toBeDefined();
        expect(result.error.violations.length).toBeGreaterThan(0);
      }
    });
  });

  describe('AIResponseValidationError', () => {
    it('should contain violations information', () => {
      const invalid = {
        ...validAIResponse,
        hardSkillsDetected: 'not an array',
      };

      try {
        validateAIResponse(invalid);
      } catch (error) {
        if (error instanceof AIResponseValidationError) {
          expect(error.violations).toBeDefined();
          expect(error.violations.length).toBeGreaterThan(0);
          expect(error.violations[0].path).toBeDefined();
          expect(error.violations[0].message).toBeDefined();
        }
      }
    });

    it('should store received data for debugging', () => {
      const invalid = { test: 'data' };

      try {
        validateAIResponse(invalid);
      } catch (error) {
        if (error instanceof AIResponseValidationError) {
          expect(error.receivedData).toEqual(invalid);
        }
      }
    });

    it('should have descriptive error message', () => {
      const invalid = {
        ...validAIResponse,
        seniorityMatch: 'invalid',
      };

      try {
        validateAIResponse(invalid);
      } catch (error) {
        if (error instanceof AIResponseValidationError) {
          expect(error.message).toContain('validation failed');
          expect(error.message).toContain('seniorityMatch');
        }
      }
    });

    it('should have AIResponseValidationError as name', () => {
      const invalid = { ...validAIResponse, recruiterMessage: '' };

      try {
        validateAIResponse(invalid);
      } catch (error) {
        if (error instanceof Error) {
          expect(error.name).toBe('AIResponseValidationError');
        }
      }
    });
  });

  describe('Schema Enforcement', () => {
    it('should enforce seniority match values', () => {
      const validValues = ['above', 'match', 'below'];

      validValues.forEach(value => {
        const data = { ...validAIResponse, seniorityMatch: value };
        const result = AISignalsSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid seniority match values', () => {
      const invalidValues = ['high', 'low', 'medium', 'MATCH', 'Above', 'below '];

      invalidValues.forEach(value => {
        const data = { ...validAIResponse, seniorityMatch: value };
        const result = AISignalsSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });

    it('should enforce all array fields are arrays', () => {
      const arrayFields = [
        'hardSkillsDetected',
        'softSkillsEvidence',
        'mandatoryRequirementsMet',
        'mandatoryRequirementsMissing',
        'desirableRequirementsMet',
        'desirableRequirementsMissing',
        'redFlags',
      ];

      arrayFields.forEach(field => {
        const data = { ...validAIResponse, [field]: 'not an array' };
        const result = AISignalsSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });

    it('should enforce non-empty strings for message fields', () => {
      const messageFields = ['recruiterMessage', 'coverLetter'];

      messageFields.forEach(field => {
        const data = { ...validAIResponse, [field]: '' };
        const result = AISignalsSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });

    it('should allow empty arrays for list fields', () => {
      const arraysCanBeEmpty = [
        'hardSkillsDetected',
        'softSkillsEvidence',
        'mandatoryRequirementsMet',
        'mandatoryRequirementsMissing',
        'desirableRequirementsMet',
        'desirableRequirementsMissing',
        'redFlags',
      ];

      arraysCanBeEmpty.forEach(field => {
        const data = { ...validAIResponse, [field]: [] };
        const result = AISignalsSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('should validate domain experience structure', () => {
      const validDomainExperience = {
        frontend: true,
        backend: false,
        fullstack: true,
        qa: false,
        devops: true,
        product: false,
      };

      const data = {
        ...validAIResponse,
        detectedDomainExperience: validDomainExperience,
      };

      const result = validateAIResponse(data);
      expect(result.detectedDomainExperience).toEqual(validDomainExperience);
    });

    it('should reject incomplete domain experience', () => {
      const incompleteDomain = {
        frontend: true,
        backend: false,
        // Missing other fields
      };

      const data = {
        ...validAIResponse,
        detectedDomainExperience: incompleteDomain,
      };

      const result = AISignalsSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('getAISignalsSchemaDocumentation', () => {
    it('should return documentation string', () => {
      const doc = getAISignalsSchemaDocumentation();
      expect(typeof doc).toBe('string');
      expect(doc.length).toBeGreaterThan(0);
    });

    it('should document required fields', () => {
      const doc = getAISignalsSchemaDocumentation();
      expect(doc).toContain('REQUIRED FIELDS');
      expect(doc).toContain('hardSkillsDetected');
      expect(doc).toContain('recruiterMessage');
      expect(doc).toContain('coverLetter');
    });

    it('should document optional fields', () => {
      const doc = getAISignalsSchemaDocumentation();
      expect(doc).toContain('OPTIONAL FIELDS');
      expect(doc).toContain('detectedYearsExperience');
      expect(doc).toContain('detectedDomainExperience');
    });

    it('should include field descriptions', () => {
      const doc = getAISignalsSchemaDocumentation();
      expect(doc).toContain('technical skills');
      expect(doc).toContain('soft skills');
      expect(doc).toContain('domain area');
    });
  });

  describe('Type Safety', () => {
    it('should infer correct types from validated data', () => {
      const validated = validateAIResponse(validAIResponse);

      // This is a compile-time check, but we can verify runtime behavior
      expect(Array.isArray(validated.hardSkillsDetected)).toBe(true);
      expect(typeof validated.seniorityMatch).toBe('string');
      expect(typeof validated.recruiterMessage).toBe('string');
      expect(typeof validated.coverLetter).toBe('string');
    });

    it('should maintain TypeScript inference for optional fields', () => {
      const dataWithoutOptional = {
        ...validAIResponse,
        detectedYearsExperience: undefined,
        detectedDomainExperience: undefined,
      };

      const validated = validateAIResponse(dataWithoutOptional);
      
      // Should handle optional fields gracefully
      expect(validated).toBeDefined();
    });
  });
});

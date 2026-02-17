import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import {
  validateSkillsIntegrity,
  logIntegrityWarnings,
  hasValidSignals,
} from './skillValidationIntegrity';
import type { AnalysisResult, AlignmentUIModel } from '../../types/analysis';

describe('Skill Validation Integrity', () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  const createMockUIModel = (overrides?: Partial<AlignmentUIModel>): AlignmentUIModel => ({
    fitScore: 80,
    decision: 'apply',
    detectedLanguage: 'en',
    hardSkills: [],
    softSkills: [],
    seniority: {
      match: 'match',
      label: 'Match',
      badgeClass: 'badge-success',
      priority: 'success',
      explanation: 'Match',
      detectedYears: 5,
      expectedSeniority: 'mid',
    },
    requirements: {
      mandatory: { met: [], missing: [] },
      desirable: { met: [], missing: [] },
    },
    detectedDomains: [],
    redFlags: [],
    recruiterMessage: '',
    coverLetter: '',
    yearsExperience: 5,
    yearsConfidence: 'high',
    cvSuggestions: [],
    hasAnyMissingMandatory: false,
    hasRedFlags: false,
    hasDetectedDomains: false,
    ...overrides,
  });

  const createMockResponse = (overrides?: Partial<AnalysisResult>): AnalysisResult => ({
    fitScore: 80,
    decision: 'apply',
    strengths: [],
    gaps: [],
    cvSuggestions: [],
    recruiterMessage: '',
    coverLetter: '',
    detectedLanguage: 'en',
    aiSignals: {
      hardSkillsDetected: [],
      softSkillsEvidence: [],
      mandatoryRequirementsMet: [],
      mandatoryRequirementsMissing: [],
      desirableRequirementsMet: [],
      desirableRequirementsMissing: [],
      seniorityMatch: 'match',
      redFlags: [],
      recruiterMessage: '',
      coverLetter: '',
    },
    ...overrides,
  });

  describe('validateSkillsIntegrity', () => {
    it('should pass when skills in UI match aiSignals.hardSkillsDetected', () => {
      const response = createMockResponse({
        aiSignals: {
          hardSkillsDetected: ['React', 'TypeScript'],
          softSkillsEvidence: ['Leadership'],
          mandatoryRequirementsMet: [],
          mandatoryRequirementsMissing: [],
          desirableRequirementsMet: [],
          desirableRequirementsMissing: [],
          seniorityMatch: 'match',
          redFlags: [],
          recruiterMessage: '',
          coverLetter: '',
        },
      });

      const uiModel = createMockUIModel({
        hardSkills: ['React', 'TypeScript'],
        softSkills: ['Leadership'],
      });

      const result = validateSkillsIntegrity(uiModel, response);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should FAIL if hardSkill in UI is NOT in aiSignals.hardSkillsDetected', () => {
      const response = createMockResponse({
        aiSignals: {
          hardSkillsDetected: ['React'],
          softSkillsEvidence: [],
          mandatoryRequirementsMet: [],
          mandatoryRequirementsMissing: [],
          desirableRequirementsMet: [],
          desirableRequirementsMissing: [],
          seniorityMatch: 'match',
          redFlags: [],
          recruiterMessage: '',
          coverLetter: '',
        },
      });

      const uiModel = createMockUIModel({
        hardSkills: ['React', 'Angular'],
      });

      expect(() => validateSkillsIntegrity(uiModel, response)).toThrow(
        /CRITICAL.*Angular.*hardSkillsDetected/
      );
    });

    it('should FAIL if softSkill in UI is NOT in aiSignals.softSkillsEvidence', () => {
      const response = createMockResponse({
        aiSignals: {
          hardSkillsDetected: [],
          softSkillsEvidence: ['Communication'],
          mandatoryRequirementsMet: [],
          mandatoryRequirementsMissing: [],
          desirableRequirementsMet: [],
          desirableRequirementsMissing: [],
          seniorityMatch: 'match',
          redFlags: [],
          recruiterMessage: '',
          coverLetter: '',
        },
      });

      const uiModel = createMockUIModel({
        softSkills: ['Communication', 'Leadership'],
      });

      expect(() => validateSkillsIntegrity(uiModel, response)).toThrow(
        /CRITICAL.*Leadership.*softSkillsEvidence/
      );
    });

    it('should FAIL if skills displayed but aiSignals is missing', () => {
      const response = createMockResponse({
        aiSignals: undefined as any,
      });

      const uiModel = createMockUIModel({
        hardSkills: ['React'],
      });

      expect(() => validateSkillsIntegrity(uiModel, response)).toThrow(
        /aiSignals is missing/
      );
    });

    it('should FAIL if response.strengths was used as fallback', () => {
      const response = createMockResponse({
        strengths: ['React', 'Vue'],
        aiSignals: {
          hardSkillsDetected: ['Angular'],
          softSkillsEvidence: [],
          mandatoryRequirementsMet: [],
          mandatoryRequirementsMissing: [],
          desirableRequirementsMet: [],
          desirableRequirementsMissing: [],
          seniorityMatch: 'match',
          redFlags: [],
          recruiterMessage: '',
          coverLetter: '',
        },
      });

      const uiModel = createMockUIModel({
        hardSkills: ['React'],
      });

      expect(() => validateSkillsIntegrity(uiModel, response)).toThrow(
        /React.*hardSkillsDetected/
      );
    });

    it('should NOT fail if response.strengths differs from signals (by design)', () => {
      const response = createMockResponse({
        strengths: ['Old skill'],
        aiSignals: {
          hardSkillsDetected: ['New skill'],
          softSkillsEvidence: [],
          mandatoryRequirementsMet: [],
          mandatoryRequirementsMissing: [],
          desirableRequirementsMet: [],
          desirableRequirementsMissing: [],
          seniorityMatch: 'match',
          redFlags: [],
          recruiterMessage: '',
          coverLetter: '',
        },
      });

      const uiModel = createMockUIModel({
        hardSkills: ['New skill'],
      });

      const result = validateSkillsIntegrity(uiModel, response);

      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('response.strengths');
    });

    it('should WARN about skills that match requirement parts (inference detection)', () => {
      const response = createMockResponse({
        aiSignals: {
          hardSkillsDetected: ['React'],
          softSkillsEvidence: [],
          mandatoryRequirementsMet: ['React or React Native'],
          mandatoryRequirementsMissing: [],
          desirableRequirementsMet: [],
          desirableRequirementsMissing: [],
          seniorityMatch: 'match',
          redFlags: [],
          recruiterMessage: '',
          coverLetter: '',
        },
      });

      const uiModel = createMockUIModel({
        hardSkills: ['React'],
      });

      const result = validateSkillsIntegrity(uiModel, response);

      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should handle case-insensitive skill matching', () => {
      const response = createMockResponse({
        aiSignals: {
          hardSkillsDetected: ['react', 'typescript'],
          softSkillsEvidence: [],
          mandatoryRequirementsMet: [],
          mandatoryRequirementsMissing: [],
          desirableRequirementsMet: [],
          desirableRequirementsMissing: [],
          seniorityMatch: 'match',
          redFlags: [],
          recruiterMessage: '',
          coverLetter: '',
        },
      });

      const uiModel = createMockUIModel({
        hardSkills: ['React', 'TypeScript'],
      });

      const result = validateSkillsIntegrity(uiModel, response);

      expect(result.isValid).toBe(true);
    });

    it('should skip validation in production mode', () => {
      process.env.NODE_ENV = 'production';

      const response = createMockResponse({
        aiSignals: {
          hardSkillsDetected: ['React'],
          softSkillsEvidence: [],
          mandatoryRequirementsMet: [],
          mandatoryRequirementsMissing: [],
          desirableRequirementsMet: [],
          desirableRequirementsMissing: [],
          seniorityMatch: 'match',
          redFlags: [],
          recruiterMessage: '',
          coverLetter: '',
        },
      });

      const uiModel = createMockUIModel({
        hardSkills: ['InvalidSkill'],
      });

      const result = validateSkillsIntegrity(uiModel, response);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('hasValidSignals', () => {
    it('should return true when signals are properly structured', () => {
      const response = createMockResponse({
        aiSignals: {
          hardSkillsDetected: ['React'],
          softSkillsEvidence: ['Communication'],
          mandatoryRequirementsMet: [],
          mandatoryRequirementsMissing: [],
          desirableRequirementsMet: [],
          desirableRequirementsMissing: [],
          seniorityMatch: 'match',
          redFlags: [],
          recruiterMessage: '',
          coverLetter: '',
        },
      });

      expect(hasValidSignals(response)).toBe(true);
    });

    it('should return false when aiSignals is missing', () => {
      const response = createMockResponse({
        aiSignals: undefined as any,
      });

      expect(hasValidSignals(response)).toBe(false);
    });

    it('should return false when hardSkillsDetected is not an array', () => {
      const response = createMockResponse({
        aiSignals: {
          hardSkillsDetected: 'not-an-array' as any,
          softSkillsEvidence: [],
          mandatoryRequirementsMet: [],
          mandatoryRequirementsMissing: [],
          desirableRequirementsMet: [],
          desirableRequirementsMissing: [],
          seniorityMatch: 'match',
          redFlags: [],
          recruiterMessage: '',
          coverLetter: '',
        },
      });

      expect(hasValidSignals(response)).toBe(false);
    });
  });

  describe('logIntegrityWarnings', () => {
    it('should log warnings without throwing', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = {
        isValid: true,
        warnings: ['Warning 1', 'Warning 2'],
        errors: [],
      };

      logIntegrityWarnings(result);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[SkillsIntegrity] Development Warnings:',
        expect.arrayContaining(['Warning 1', 'Warning 2'])
      );

      consoleSpy.mockRestore();
    });

    it('should skip logging in production mode', () => {
      process.env.NODE_ENV = 'production';
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = {
        isValid: true,
        warnings: ['Warning 1'],
        errors: [],
      };

      logIntegrityWarnings(result);

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('React Native specific tests', () => {
    it('should NOT display React Native if only React is detected', () => {
      const response = createMockResponse({
        aiSignals: {
          hardSkillsDetected: ['React'],
          softSkillsEvidence: [],
          mandatoryRequirementsMet: [],
          mandatoryRequirementsMissing: [],
          desirableRequirementsMet: [],
          desirableRequirementsMissing: [],
          seniorityMatch: 'match',
          redFlags: [],
          recruiterMessage: '',
          coverLetter: '',
        },
      });

      const uiModel = createMockUIModel({
        hardSkills: ['React Native'],
      });

      expect(() => validateSkillsIntegrity(uiModel, response)).toThrow(
        /React Native.*hardSkillsDetected/
      );
    });

    it('should display React Native ONLY if explicitly detected', () => {
      const response = createMockResponse({
        aiSignals: {
          hardSkillsDetected: ['React Native'],
          softSkillsEvidence: [],
          mandatoryRequirementsMet: [],
          mandatoryRequirementsMissing: [],
          desirableRequirementsMet: [],
          desirableRequirementsMissing: [],
          seniorityMatch: 'match',
          redFlags: [],
          recruiterMessage: '',
          coverLetter: '',
        },
      });

      const uiModel = createMockUIModel({
        hardSkills: ['React Native'],
      });

      const result = validateSkillsIntegrity(uiModel, response);

      expect(result.isValid).toBe(true);
    });

    it('should detect inference from "React or React Native" requirement', () => {
      const response = createMockResponse({
        aiSignals: {
          hardSkillsDetected: ['JavaScript'],
          softSkillsEvidence: [],
          mandatoryRequirementsMet: [],
          mandatoryRequirementsMissing: ['React or React Native'],
          desirableRequirementsMet: [],
          desirableRequirementsMissing: [],
          seniorityMatch: 'match',
          redFlags: [],
          recruiterMessage: '',
          coverLetter: '',
        },
      });

      const uiModel = createMockUIModel({
        hardSkills: ['React'],
      });

      expect(() => validateSkillsIntegrity(uiModel, response)).toThrow(
        /React.*hardSkillsDetected/
      );
    });
  });
});

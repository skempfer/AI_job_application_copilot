import { describe, it, expect } from '@jest/globals';
import {
  isSeniorityMatch,
  isDomainExperience,
  isPreprocessedCV,
  isAnalysisResult,
  safeStringArray,
  safeNumber,
  safeSeniorityMatch,
  safeDomainExperience,
  safePreprocessedCV,
  secureAnalysisResult,
} from './typeGuards';
import type { DomainExperience, PreprocessedCV, AnalysisResult } from '../types/analysis';

describe('Type Guards', () => {
  describe('isSeniorityMatch', () => {
    it('accepts valid seniority values', () => {
      expect(isSeniorityMatch('below')).toBe(true);
      expect(isSeniorityMatch('match')).toBe(true);
      expect(isSeniorityMatch('above')).toBe(true);
    });

    it('rejects invalid values', () => {
      expect(isSeniorityMatch('invalid')).toBe(false);
      expect(isSeniorityMatch(null)).toBe(false);
      expect(isSeniorityMatch(undefined)).toBe(false);
      expect(isSeniorityMatch(123)).toBe(false);
    });
  });

  describe('isDomainExperience', () => {
    it('accepts valid domain experience', () => {
      const valid: DomainExperience = {
        frontend: true,
        backend: false,
        fullstack: false,
        qa: true,
        devops: false,
        product: false,
      };
      expect(isDomainExperience(valid)).toBe(true);
    });

    it('rejects incomplete domain experience', () => {
      expect(isDomainExperience({ frontend: true })).toBe(false);
      expect(isDomainExperience({})).toBe(false);
      expect(isDomainExperience(null)).toBe(false);
    });

    it('rejects non-boolean values', () => {
      expect(isDomainExperience({ frontend: 'true', backend: false, qa: false, devops: false, fullstack: false, product: false })).toBe(false);
    });
  });

  describe('isPreprocessedCV', () => {
    it('accepts valid preprocessed CV', () => {
      const valid: PreprocessedCV = {
        yearsExperience: 5,
        yearsExperienceConfidence: 'high',
        domainExperience: {
          frontend: true,
          backend: true,
          fullstack: false,
          qa: false,
          devops: false,
          product: false,
        },
        seniority: 'mid',
        skills: ['React', 'Node.js'],
      };
      expect(isPreprocessedCV(valid)).toBe(true);
    });

    it('accepts null years of experience', () => {
      const valid: PreprocessedCV = {
        yearsExperience: null,
        yearsExperienceConfidence: 'low',
        domainExperience: {
          frontend: false,
          backend: false,
          fullstack: false,
          qa: false,
          devops: false,
          product: false,
        },
        seniority: 'unknown',
        skills: [],
      };
      expect(isPreprocessedCV(valid)).toBe(true);
    });

    it('rejects incomplete preprocessed CV', () => {
      expect(isPreprocessedCV({ yearsExperience: 5 })).toBe(false);
      expect(isPreprocessedCV(null)).toBe(false);
    });
  });

  describe('isAnalysisResult', () => {
    it('accepts valid analysis result', () => {
      const valid: AnalysisResult = {
        fitScore: 85,
        decision: 'apply',
        strengths: ['Good match'],
        gaps: [],
        cvSuggestions: [],
        recruiterMessage: 'Nice candidate',
        coverLetter: 'Dear hiring manager...',
        detectedLanguage: 'en',
      };
      expect(isAnalysisResult(valid)).toBe(true);
    });

    it('accepts analysis with preprocessed CV', () => {
      const valid: AnalysisResult = {
        fitScore: 85,
        decision: 'apply',
        strengths: [],
        gaps: [],
        cvSuggestions: [],
        recruiterMessage: 'Good',
        coverLetter: 'Letter',
        detectedLanguage: 'en',
        preprocessedCV: {
          yearsExperience: 5,
          yearsExperienceConfidence: 'high',
          domainExperience: {
            frontend: true,
            backend: false,
            fullstack: false,
            qa: false,
            devops: false,
            product: false,
          },
          seniority: 'mid',
          skills: [],
        },
      };
      expect(isAnalysisResult(valid)).toBe(true);
    });

    it('rejects incomplete analysis result', () => {
      expect(isAnalysisResult({ fitScore: 85 })).toBe(false);
      expect(isAnalysisResult(null)).toBe(false);
    });
  });

  describe('safeStringArray', () => {
    it('returns valid string arrays', () => {
      expect(safeStringArray(['a', 'b'])).toEqual(['a', 'b']);
      expect(safeStringArray([])).toEqual([]);
    });

    it('filters non-string values', () => {
      expect(safeStringArray(['a', 123, 'b'])).toEqual(['a', 'b']);
    });

    it('returns empty array for non-arrays', () => {
      expect(safeStringArray(null)).toEqual([]);
      expect(safeStringArray('not an array')).toEqual([]);
      expect(safeStringArray(123)).toEqual([]);
    });
  });

  describe('safeNumber', () => {
    it('returns valid numbers', () => {
      expect(safeNumber(5)).toBe(5);
      expect(safeNumber(0)).toBe(0);
    });

    it('returns null for non-numbers', () => {
      expect(safeNumber('5')).toBeNull();
      expect(safeNumber(null)).toBeNull();
      expect(safeNumber(undefined)).toBeNull();
    });

    it('returns null for NaN', () => {
      expect(safeNumber(NaN)).toBeNull();
    });
  });

  describe('safeSeniorityMatch', () => {
    it('returns valid seniority match', () => {
      expect(safeSeniorityMatch('below')).toBe('below');
      expect(safeSeniorityMatch('match')).toBe('match');
      expect(safeSeniorityMatch('above')).toBe('above');
    });

    it('defaults to match for invalid values', () => {
      expect(safeSeniorityMatch('invalid')).toBe('match');
      expect(safeSeniorityMatch(null)).toBe('match');
    });
  });

  describe('safeDomainExperience', () => {
    it('returns valid domain experience', () => {
      const valid: DomainExperience = {
        frontend: true,
        backend: false,
        fullstack: false,
        qa: false,
        devops: false,
        product: false,
      };
      expect(safeDomainExperience(valid)).toEqual(valid);
    });

    it('returns all-false for invalid values', () => {
      const expected = {
        frontend: false,
        backend: false,
        fullstack: false,
        qa: false,
        devops: false,
        product: false,
      };
      expect(safeDomainExperience('invalid')).toEqual(expected);
      expect(safeDomainExperience(null)).toEqual(expected);
    });
  });

  describe('safePreprocessedCV', () => {
    it('returns valid preprocessed CV', () => {
      const valid: PreprocessedCV = {
        yearsExperience: 5,
        yearsExperienceConfidence: 'high',
        domainExperience: {
          frontend: true,
          backend: false,
          fullstack: false,
          qa: false,
          devops: false,
          product: false,
        },
        seniority: 'mid',
        skills: [],
      };
      expect(safePreprocessedCV(valid)).toEqual(valid);
    });

    it('returns null for invalid values', () => {
      expect(safePreprocessedCV('invalid')).toBeNull();
      expect(safePreprocessedCV(null)).toBeNull();
      expect(safePreprocessedCV(undefined)).toBeNull();
    });
  });

  describe('secureAnalysisResult', () => {
    it('returns valid analysis result unchanged', () => {
      const valid: AnalysisResult = {
        fitScore: 85,
        decision: 'apply',
        strengths: [],
        gaps: [],
        cvSuggestions: [],
        recruiterMessage: 'Good',
        coverLetter: 'Letter',
        detectedLanguage: 'en',
      };
      expect(secureAnalysisResult(valid)).toEqual(valid);
    });

    it('fills missing fields with defaults', () => {
      const partial = {
        recruiterMessage: 'Good',
        coverLetter: 'Letter',
      };
      const result = secureAnalysisResult(partial);
      expect(result.fitScore).toBe(0);
      expect(result.decision).toBe('skip');
      expect(result.strengths).toEqual([]);
      expect(result.detectedLanguage).toBe('en');
    });

    it('throws for non-object values', () => {
      expect(() => secureAnalysisResult(null)).toThrow();
      expect(() => secureAnalysisResult('string')).toThrow();
    });
  });
});

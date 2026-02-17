import { describe, it, expect } from '@jest/globals';
import { mapAlignmentResponseToUIModel, mapWithDefaults, __testing__ } from './alignmentMapper';
import type { AnalysisResult } from '../../types/analysis';

describe('Alignment Mapper', () => {
  const mockAnalysisResult: AnalysisResult = {
    fitScore: 85,
    decision: 'apply',
    strengths: ['Strong backend skills', 'Good communication'],
    gaps: ['Limited frontend experience'],
    cvSuggestions: ['Add React experience'],
    recruiterMessage: 'Great fit for the role',
    coverLetter: 'Dear Hiring Manager...',
    detectedLanguage: 'en',
    explanation: {
      positives: ['5+ years experience', 'Node.js proficiency'],
      negatives: ['No React experience'],
      summary: 'Good overall fit',
    },
    preprocessedCV: {
      yearsExperience: 5,
      yearsExperienceConfidence: 'high',
      domainExperience: {
        frontend: false,
        backend: true,
        fullstack: false,
        qa: false,
        devops: true,
        product: false,
      },
      seniority: 'mid',
      skills: ['Node.js', 'Python', 'Docker'],
    },
  };

  describe('mapAlignmentResponseToUIModel', () => {
    it('maps fitScore and decision correctly', () => {
      const uiModel = mapAlignmentResponseToUIModel(mockAnalysisResult);

      expect(uiModel.fitScore).toBe(85);
      expect(uiModel.decision).toBe('apply');
    });

    it('maps seniority information', () => {
      const uiModel = mapAlignmentResponseToUIModel(mockAnalysisResult);

      expect(uiModel.seniority).toBeDefined();
      expect(uiModel.seniority.detectedYears).toBe(5);
      expect(uiModel.seniority.badgeClass).toBeDefined();
      expect(uiModel.seniority.priority).toBeDefined();
      expect(uiModel.seniority.explanation).toBeDefined();
    });

    it('maps detected domains correctly (only true values)', () => {
      const uiModel = mapAlignmentResponseToUIModel(mockAnalysisResult);

      expect(uiModel.detectedDomains).toHaveLength(2);
      expect(uiModel.detectedDomains.map((d) => d.domain)).toContain('backend');
      expect(uiModel.detectedDomains.map((d) => d.domain)).toContain('devops');
      expect(uiModel.detectedDomains.map((d) => d.domain)).not.toContain('frontend');
    });

    it('provides labels for domains', () => {
      const uiModel = mapAlignmentResponseToUIModel(mockAnalysisResult);

      const backendDomain = uiModel.detectedDomains.find((d) => d.domain === 'backend');
      expect(backendDomain?.label).toBe('Backend');
      expect(backendDomain?.badgeClass).toBeDefined();
    });

    it('extracts skills from preprocessed CV', () => {
      const uiModel = mapAlignmentResponseToUIModel(mockAnalysisResult);

      expect(uiModel.cvSuggestions).toContain('Add React experience');
    });

    it('preserves messages', () => {
      const uiModel = mapAlignmentResponseToUIModel(mockAnalysisResult);

      expect(uiModel.recruiterMessage).toBe('Great fit for the role');
      expect(uiModel.coverLetter).toContain('Dear Hiring Manager');
    });

    it('handles missing preprocessedCV gracefully', () => {
      const resultWithoutPreprocessed: AnalysisResult = {
        ...mockAnalysisResult,
        preprocessedCV: undefined,
      };

      const uiModel = mapAlignmentResponseToUIModel(resultWithoutPreprocessed);

      expect(uiModel.yearsExperience).toBeNull();
      expect(uiModel.yearsConfidence).toBe('low');
      expect(uiModel.detectedDomains).toHaveLength(0);
      expect(uiModel.hasDetectedDomains).toBe(false);
    });

    it('handles null domain experience', () => {
      const resultWithNullDomain: AnalysisResult = {
        ...mockAnalysisResult,
        preprocessedCV: mockAnalysisResult.preprocessedCV
          ? {
              ...mockAnalysisResult.preprocessedCV,
              domainExperience: null as any,
            }
          : undefined,
      };

      const uiModel = mapAlignmentResponseToUIModel(resultWithNullDomain);

      expect(uiModel.detectedDomains).toHaveLength(0);
    });

    it('detects mandatory missing requirements', () => {
      const uiModel = mapAlignmentResponseToUIModel(mockAnalysisResult);

      // Check that hasAnyMissingMandatory flag works
      expect(typeof uiModel.hasAnyMissingMandatory).toBe('boolean');
    });

    it('sets empty state flags correctly', () => {
      const uiModel = mapAlignmentResponseToUIModel(mockAnalysisResult);

      expect(uiModel.hasRedFlags).toBe(false); // No red flags in mock
      expect(uiModel.hasDetectedDomains).toBe(true); // Has backend and devops
      expect(uiModel.hasAnyMissingMandatory).toBe(false); // No missing mandatory in mock
    });

    it('handles all domains detected', () => {
      const allDomainsResult: AnalysisResult = {
        ...mockAnalysisResult,
        preprocessedCV: mockAnalysisResult.preprocessedCV
          ? {
              ...mockAnalysisResult.preprocessedCV,
              domainExperience: {
                frontend: true,
                backend: true,
                fullstack: true,
                qa: true,
                devops: true,
                product: true,
              },
            }
          : undefined,
      };

      const uiModel = mapAlignmentResponseToUIModel(allDomainsResult);

      expect(uiModel.detectedDomains).toHaveLength(6);
      expect(uiModel.hasDetectedDomains).toBe(true);
    });

    it('handles no domains detected', () => {
      const noDomainsResult: AnalysisResult = {
        ...mockAnalysisResult,
        preprocessedCV: mockAnalysisResult.preprocessedCV
          ? {
              ...mockAnalysisResult.preprocessedCV,
              domainExperience: {
                frontend: false,
                backend: false,
                fullstack: false,
                qa: false,
                devops: false,
                product: false,
              },
            }
          : undefined,
      };

      const uiModel = mapAlignmentResponseToUIModel(noDomainsResult);

      expect(uiModel.detectedDomains).toHaveLength(0);
      expect(uiModel.hasDetectedDomains).toBe(false);
    });

    it('preserves detected language', () => {
      const resultPT: AnalysisResult = {
        ...mockAnalysisResult,
        detectedLanguage: 'pt',
      };

      const uiModel = mapAlignmentResponseToUIModel(resultPT);

      expect(uiModel.detectedLanguage).toBe('pt');
    });

    it('defaults to en for missing language', () => {
      const resultNoLang: AnalysisResult = {
        ...mockAnalysisResult,
        detectedLanguage: undefined,
      };

      const uiModel = mapAlignmentResponseToUIModel(resultNoLang);

      expect(uiModel.detectedLanguage).toBe('en');
    });

    it('handles empty strings safely', () => {
      const resultEmptyStrings: AnalysisResult = {
        ...mockAnalysisResult,
        recruiterMessage: '',
        coverLetter: '',
      };

      const uiModel = mapAlignmentResponseToUIModel(resultEmptyStrings);

      expect(uiModel.recruiterMessage).toBe('');
      expect(uiModel.coverLetter).toBe('');
    });

    it('handles missing explanation', () => {
      const resultNoExplanation: AnalysisResult = {
        ...mockAnalysisResult,
        explanation: undefined,
      };

      const uiModel = mapAlignmentResponseToUIModel(resultNoExplanation);

      // Should not crash
      expect(uiModel.fitScore).toBe(85);
    });
  });

  describe('mapWithDefaults', () => {
    it('fills missing fields with defaults', () => {
      const partial = {
        fitScore: 70,
        recruiterMessage: 'Good candidate',
      };

      const uiModel = mapWithDefaults(partial as any);

      expect(uiModel.fitScore).toBe(70);
      expect(uiModel.recruiterMessage).toBe('Good candidate');
      expect(uiModel.coverLetter).toBe('');
      expect(uiModel.decision).toBe('skip');
      expect(uiModel.hardSkills).toEqual([]);
    });

    it('merges with defaults correctly', () => {
      const custom: Partial<AnalysisResult> = {
        fitScore: 90,
        decision: 'apply_with_fixes',
        aiSignals: {
          hardSkillsDetected: ['Custom skill'],
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
      };

      const uiModel = mapWithDefaults(custom);

      expect(uiModel.fitScore).toBe(90);
      expect(uiModel.decision).toBe('apply_with_fixes');
      expect(uiModel.hardSkills).toContain('Custom skill');
      expect(uiModel.coverLetter).toBe('');
    });
  });

  describe('Edge Cases', () => {
    it('handles array with null values', () => {
      const resultWithNulls: AnalysisResult = {
        ...mockAnalysisResult,
        strengths: ['Valid', null as any, 'Another'],
      };

      const uiModel = mapAlignmentResponseToUIModel(resultWithNulls);

      // Should filter out nulls gracefully
      expect(uiModel.hardSkills).toBeDefined();
    });

    it('handles very long strings', () => {
      const longString = 'a'.repeat(10000);
      const resultLongStrings: AnalysisResult = {
        ...mockAnalysisResult,
        recruiterMessage: longString,
      };

      const uiModel = mapAlignmentResponseToUIModel(resultLongStrings);

      expect(uiModel.recruiterMessage.length).toBe(10000);
    });

    it('handles zero fit score', () => {
      const resultZeroScore: AnalysisResult = {
        ...mockAnalysisResult,
        fitScore: 0,
      };

      const uiModel = mapAlignmentResponseToUIModel(resultZeroScore);

      expect(uiModel.fitScore).toBe(0);
    });

    it('handles 100 fit score', () => {
      const resultMaxScore: AnalysisResult = {
        ...mockAnalysisResult,
        fitScore: 100,
      };

      const uiModel = mapAlignmentResponseToUIModel(resultMaxScore);

      expect(uiModel.fitScore).toBe(100);
    });

    it('handles null confidence level', () => {
      const resultNullConfidence: AnalysisResult = {
        ...mockAnalysisResult,
        preprocessedCV: mockAnalysisResult.preprocessedCV
          ? {
              ...mockAnalysisResult.preprocessedCV,
              yearsExperienceConfidence: null as any,
            }
          : undefined,
      };

      const uiModel = mapAlignmentResponseToUIModel(resultNullConfidence);

      expect(uiModel.yearsConfidence).toBe('low');
    });
  });

  describe('CRITICAL: Hard Skills Validation (Single Source of Truth)', () => {
    it('should use ONLY aiSignals.hardSkillsDetected, never response.strengths', () => {
      const resultWithSignals: AnalysisResult = {
        ...mockAnalysisResult,
        strengths: ['Ignored', 'Should not appear'],
        aiSignals: {
          hardSkillsDetected: ['React', 'TypeScript'],
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
      };

      const uiModel = mapAlignmentResponseToUIModel(resultWithSignals);

      expect(uiModel.hardSkills).toEqual(['React', 'TypeScript']);
      expect(uiModel.hardSkills).not.toContain('Ignored');
      expect(uiModel.hardSkills).not.toContain('Should not appear');
    });

    it('should NOT display "React Native" if it is not in hardSkillsDetected', () => {
      const resultWithReactOnly: AnalysisResult = {
        ...mockAnalysisResult,
        aiSignals: {
          hardSkillsDetected: ['React', 'Node.js'],
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
      };

      const uiModel = mapAlignmentResponseToUIModel(resultWithReactOnly);

      expect(uiModel.hardSkills).toContain('React');
      expect(uiModel.hardSkills).not.toContain('React Native');
    });

    it('should display "React Native" ONLY if explicitly in hardSkillsDetected', () => {
      const resultWithReactNative: AnalysisResult = {
        ...mockAnalysisResult,
        aiSignals: {
          hardSkillsDetected: ['React Native', 'JavaScript'],
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
      };

      const uiModel = mapAlignmentResponseToUIModel(resultWithReactNative);

      expect(uiModel.hardSkills).toContain('React Native');
    });

    it('should return empty array if aiSignals.hardSkillsDetected is missing or empty', () => {
      const resultNoSignals: AnalysisResult = {
        ...mockAnalysisResult,
        strengths: ['Should be ignored'],
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
      };

      const uiModel = mapAlignmentResponseToUIModel(resultNoSignals);

      expect(uiModel.hardSkills).toEqual([]);
      expect(uiModel.hardSkills).not.toContain('Should be ignored');
    });

    it('should filter out empty strings and whitespace from hardSkillsDetected', () => {
      const resultWithWhitespace: AnalysisResult = {
        ...mockAnalysisResult,
        aiSignals: {
          hardSkillsDetected: ['React', '  ', '', 'TypeScript', '   Angular   '],
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
      };

      const uiModel = mapAlignmentResponseToUIModel(resultWithWhitespace);

      expect(uiModel.hardSkills).toEqual(['React', 'TypeScript', 'Angular']);
      expect(uiModel.hardSkills.every((s) => typeof s === 'string' && s.trim().length > 0)).toBe(true);
    });

    it('should deduplicate whitespace-only entries', () => {
      const resultWithDuplicateWhitespace: AnalysisResult = {
        ...mockAnalysisResult,
        aiSignals: {
          hardSkillsDetected: ['React', 'React'],
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
      };

      const uiModel = mapAlignmentResponseToUIModel(resultWithDuplicateWhitespace);

      expect(uiModel.hardSkills).toEqual(['React', 'React']);
    });

    it('should NOT infer skills from requirement strings', () => {
      const resultWithRequirements: AnalysisResult = {
        ...mockAnalysisResult,
        aiSignals: {
          hardSkillsDetected: ['Python'],
          softSkillsEvidence: [],
          mandatoryRequirementsMet: ['React or React Native experience'],
          mandatoryRequirementsMissing: [],
          desirableRequirementsMet: [],
          desirableRequirementsMissing: [],
          seniorityMatch: 'match',
          redFlags: [],
          recruiterMessage: '',
          coverLetter: '',
        },
      };

      const uiModel = mapAlignmentResponseToUIModel(resultWithRequirements);

      expect(uiModel.hardSkills).toEqual(['Python']);
      expect(uiModel.hardSkills).not.toContain('React or React Native experience');
      expect(uiModel.hardSkills).not.toContain('React');
      expect(uiModel.hardSkills).not.toContain('React Native');
    });

    it('should validate type safety - only strings are included', () => {
      const result: AnalysisResult = {
        ...mockAnalysisResult,
        aiSignals: {
          hardSkillsDetected: ['React', null as any, 'TypeScript', undefined as any, 123 as any],
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
      };

      const uiModel = mapAlignmentResponseToUIModel(result);

      expect(uiModel.hardSkills).toEqual(['React', 'TypeScript']);
      expect(uiModel.hardSkills.every((s) => typeof s === 'string')).toBe(true);
    });
  });

  describe('CRITICAL: Soft Skills Validation (Single Source of Truth)', () => {
    it('should use ONLY aiSignals.softSkillsEvidence, never response.gaps', () => {
      const resultWithSignals: AnalysisResult = {
        ...mockAnalysisResult,
        gaps: ['Ignored', 'Should not appear'],
        aiSignals: {
          hardSkillsDetected: [],
          softSkillsEvidence: ['Leadership', 'Communication'],
          mandatoryRequirementsMet: [],
          mandatoryRequirementsMissing: [],
          desirableRequirementsMet: [],
          desirableRequirementsMissing: [],
          seniorityMatch: 'match',
          redFlags: [],
          recruiterMessage: '',
          coverLetter: '',
        },
      };

      const uiModel = mapAlignmentResponseToUIModel(resultWithSignals);

      expect(uiModel.softSkills).toEqual(['Leadership', 'Communication']);
      expect(uiModel.softSkills).not.toContain('Ignored');
      expect(uiModel.softSkills).not.toContain('Should not appear');
    });

    it('should return empty array if aiSignals.softSkillsEvidence is missing', () => {
      const resultNoSignals: AnalysisResult = {
        ...mockAnalysisResult,
        gaps: ['Should be ignored'],
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
      };

      const uiModel = mapAlignmentResponseToUIModel(resultNoSignals);

      expect(uiModel.softSkills).toEqual([]);
      expect(uiModel.softSkills).not.toContain('Should be ignored');
    });
  });

  describe('Direct validation function tests', () => {
    it('getValidatedHardSkills should return only validated strings', () => {
      const signals = {
        hardSkillsDetected: ['React', '  ', '', 'TypeScript'],
      };

      const result = __testing__.getValidatedHardSkills(signals, {});

      expect(result).toEqual(['React', 'TypeScript']);
    });

    it('getValidatedSoftSkills should return only validated strings', () => {
      const signals = {
        softSkillsEvidence: ['Leadership', '  ', '', 'Communication'],
      };

      const result = __testing__.getValidatedSoftSkills(signals);

      expect(result).toEqual(['Leadership', 'Communication']);
    });

    it('getValidatedHardSkills should handle null/undefined gracefully', () => {
      const result = __testing__.getValidatedHardSkills(null, {});

      expect(result).toEqual([]);
    });

    it('getValidatedSoftSkills should handle null/undefined gracefully', () => {
      const result = __testing__.getValidatedSoftSkills(null);

      expect(result).toEqual([]);
    });
  });
});



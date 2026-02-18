import {
  hasItems,
  safeArrayLength,
  safeString,
  safeNumber,
  isInCriticalState,
  hasContent,
  countRequirements,
  getPriorityLevel,
  getRecommendationMessage,
  formatSkillCount,
  clamp,
  formatFitScore,
} from './alignmentDefensive';
import type { AlignmentUIModel } from '../../../../types/analysis';

describe('Alignment Defensive Utilities', () => {
  describe('hasItems', () => {
    it('returns true for non-empty arrays', () => {
      expect(hasItems(['a', 'b'])).toBe(true);
      expect(hasItems([1])).toBe(true);
    });

    it('returns false for empty arrays', () => {
      expect(hasItems([])).toBe(false);
    });

    it('returns false for null/undefined', () => {
      expect(hasItems(null)).toBe(false);
      expect(hasItems(undefined)).toBe(false);
    });
  });

  describe('safeArrayLength', () => {
    it('returns correct length for valid arrays', () => {
      expect(safeArrayLength(['a', 'b', 'c'])).toBe(3);
      expect(safeArrayLength([])).toBe(0);
    });

    it('returns 0 for non-arrays', () => {
      expect(safeArrayLength(null)).toBe(0);
      expect(safeArrayLength('not array')).toBe(0);
      expect(safeArrayLength(undefined)).toBe(0);
    });
  });

  describe('safeString', () => {
    it('returns string as-is', () => {
      expect(safeString('hello')).toBe('hello');
    });

    it('returns default for non-strings', () => {
      expect(safeString(null)).toBe('');
      expect(safeString(undefined)).toBe('');
      expect(safeString(123)).toBe('');
    });

    it('accepts custom default', () => {
      expect(safeString(null, 'custom')).toBe('custom');
    });
  });

  describe('safeNumber', () => {
    it('returns number as-is', () => {
      expect(safeNumber(5)).toBe(5);
      expect(safeNumber(0)).toBe(0);
      expect(safeNumber(-10)).toBe(-10);
    });

    it('returns default for non-numbers', () => {
      expect(safeNumber(null)).toBe(0);
      expect(safeNumber('5')).toBe(0);
      expect(safeNumber(NaN)).toBe(0);
    });

    it('accepts custom default', () => {
      expect(safeNumber(null, 100)).toBe(100);
    });
  });

  describe('Edge Case: All mandatory requirements missing', () => {
    const modelCritical: AlignmentUIModel = {
      fitScore: 20,
      decision: 'skip',
      detectedLanguage: 'en',
      seniority: {
        match: 'below',
        label: 'Below',
        badgeClass: 'badge-warning',
        priority: 'warning',
        explanation: 'Below',
        detectedYears: 1,
        expectedSeniority: 'senior',
      },
      requirements: {
        mandatory: {
          met: [],
          missing: [
            { text: 'Node.js', category: 'mandatory', status: 'missing' },
            { text: 'React', category: 'mandatory', status: 'missing' },
            { text: 'AWS', category: 'mandatory', status: 'missing' },
          ],
        },
        desirable: { met: [], missing: [] },
      },
      hardSkills: [],
      softSkills: [],
      detectedDomains: [],
      redFlags: [],
      recruiterMessage: '',
      coverLetter: '',
      yearsExperience: 1,
      yearsConfidence: 'low',
      cvSuggestions: [],
      hasAnyMissingMandatory: true,
      hasRedFlags: false,
      hasDetectedDomains: false,
    };

    it('detects critical state', () => {
      expect(isInCriticalState(modelCritical)).toBe(true);
    });

    it('priority is warning with missing requirements', () => {
      expect(getPriorityLevel(modelCritical)).toBe('warning');
    });

    it('recommendation addresses experience level', () => {
      const msg = getRecommendationMessage(modelCritical);
      expect(msg).toContain('experience level');
    });
  });

  describe('Edge Case: No domains detected', () => {
    const modelNoDomains: AlignmentUIModel = {
      fitScore: 30,
      decision: 'skip',
      detectedLanguage: 'en',
      seniority: {
        match: 'match',
        label: 'Match',
        badgeClass: 'badge-success',
        priority: 'success',
        explanation: 'Match',
        detectedYears: 3,
        expectedSeniority: 'mid',
      },
      requirements: { mandatory: { met: [], missing: [] }, desirable: { met: [], missing: [] } },
      hardSkills: [],
      softSkills: [],
      detectedDomains: [],
      redFlags: [],
      recruiterMessage: 'No content',
      coverLetter: '',
      yearsExperience: null,
      yearsConfidence: 'low',
      cvSuggestions: [],
      hasAnyMissingMandatory: false,
      hasRedFlags: false,
      hasDetectedDomains: false,
    };

    it('should not crash when no domains', () => {
      expect(() => hasContent(modelNoDomains)).not.toThrow();
      expect(modelNoDomains.hasDetectedDomains).toBe(false);
    });
  });

  describe('Edge Case: Seniority below expected', () => {
    const modelBelow: AlignmentUIModel = {
      fitScore: 50,
      decision: 'skip',
      detectedLanguage: 'en',
      seniority: {
        match: 'below',
        label: 'Below',
        badgeClass: 'badge-warning',
        priority: 'warning',
        explanation: 'Your experience is below',
        detectedYears: 2,
        expectedSeniority: 'senior',
      },
      requirements: { mandatory: { met: [], missing: [] }, desirable: { met: [], missing: [] } },
      hardSkills: ['Python'],
      softSkills: [],
      detectedDomains: [],
      redFlags: [],
      recruiterMessage: 'Test',
      coverLetter: '',
      yearsExperience: 2,
      yearsConfidence: 'high',
      cvSuggestions: [],
      hasAnyMissingMandatory: false,
      hasRedFlags: false,
      hasDetectedDomains: false,
    };

    it('shows warning priority for below seniority', () => {
      expect(getPriorityLevel(modelBelow)).toBe('warning');
    });

    it('has content despite no domains', () => {
      expect(hasContent(modelBelow)).toBe(true);
    });
  });

  describe('Edge Case: Seniority above but with red flags', () => {
    const modelAboveWithFlags: AlignmentUIModel = {
      fitScore: 85,
      decision: 'apply',
      detectedLanguage: 'en',
      seniority: {
        match: 'above',
        label: 'Above',
        badgeClass: 'badge-success badge-lg',
        priority: 'success',
        explanation: 'Your experience exceeds',
        detectedYears: 10,
        expectedSeniority: 'mid',
      },
      requirements: { mandatory: { met: [], missing: [] }, desirable: { met: [], missing: [] } },
      hardSkills: ['Everything'],
      softSkills: [],
      detectedDomains: [],
      redFlags: ['Overqualified', 'salary expectations'],
      recruiterMessage: 'Excellent match',
      coverLetter: '',
      yearsExperience: 10,
      yearsConfidence: 'high',
      cvSuggestions: [],
      hasAnyMissingMandatory: false,
      hasRedFlags: true,
      hasDetectedDomains: false,
    };

    it('returns warning priority due to red flags', () => {
      expect(getPriorityLevel(modelAboveWithFlags)).toBe('warning');
    });

    it('recommendation addresses fit concerns', () => {
      const msg = getRecommendationMessage(modelAboveWithFlags);
      expect(msg).toMatch(/requirements|concerns|willingness/i);
    });
  });

  describe('Edge Case: Empty requirements arrays', () => {
    const modelEmptyReqs: AlignmentUIModel = {
      fitScore: 0,
      decision: 'skip',
      detectedLanguage: 'en',
      seniority: {
        match: 'match',
        label: 'Match',
        badgeClass: 'badge-success',
        priority: 'success',
        explanation: 'Match',
        detectedYears: null,
        expectedSeniority: 'unknown',
      },
      requirements: { mandatory: { met: [], missing: [] }, desirable: { met: [], missing: [] } },
      hardSkills: [],
      softSkills: [],
      detectedDomains: [],
      redFlags: [],
      recruiterMessage: '',
      coverLetter: '',
      yearsExperience: null,
      yearsConfidence: 'low',
      cvSuggestions: [],
      hasAnyMissingMandatory: false,
      hasRedFlags: false,
      hasDetectedDomains: false,
    };

    it('countRequirements handles empty arrays', () => {
      const count = countRequirements(modelEmptyReqs);
      expect(count.total).toBe(0);
      expect(count.met).toBe(0);
      expect(count.missing).toBe(0);
    });

    it('no content detected', () => {
      expect(hasContent(modelEmptyReqs)).toBe(false);
    });
  });

  describe('Edge Case: Extreme fit scores', () => {
    it('clamps 0 fit score correctly', () => {
      const model: AlignmentUIModel = {
        fitScore: 0,
        decision: 'skip',
        detectedLanguage: 'en',
        seniority: {
          match: 'below',
          label: 'Below',
          badgeClass: 'badge-warning',
          priority: 'warning',
          explanation: 'Below',
          detectedYears: null,
          expectedSeniority: 'senior',
        },
        requirements: { mandatory: { met: [], missing: [] }, desirable: { met: [], missing: [] } },
        hardSkills: [],
        softSkills: [],
        detectedDomains: [],
        redFlags: [],
        recruiterMessage: 'Not a fit',
        coverLetter: '',
        yearsExperience: 0,
        yearsConfidence: 'high',
        cvSuggestions: [],
        hasAnyMissingMandatory: false,
        hasRedFlags: false,
        hasDetectedDomains: false,
      };

      expect(formatFitScore(model.fitScore)).toBe('0%');
    });

    it('clamps 100 fit score correctly', () => {
      expect(clamp(100, 0, 100)).toBe(100);
      expect(formatFitScore(100)).toBe('100%');
    });

    it('handles out-of-range scores', () => {
      expect(clamp(150, 0, 100)).toBe(100);
      expect(clamp(-50, 0, 100)).toBe(0);
    });
  });

  describe('Edge Case: Very long strings', () => {
    const veryLongString = 'a'.repeat(10000);

    it('handles long recruiter message', () => {
      const result = safeString(veryLongString);
      expect(result.length).toBe(10000);
    });

    it('formatSkillCount with many skills', () => {
      const manySkills = Array(100).fill('skill');
      const result = formatSkillCount({
        hardSkills: manySkills,
        softSkills: [],
      } as any);
      expect(result).toContain('100');
    });
  });

  describe('Edge Case: Null and undefined values', () => {
    it('handles null years gracefully', () => {
      expect(safeNumber(null, 0)).toBe(0);
    });

    it('hasContent with all null optional fields', () => {
      const model: AlignmentUIModel = {
        fitScore: 0,
        decision: 'skip',
        detectedLanguage: 'en',
        seniority: {
          match: 'match',
          label: 'Match',
          badgeClass: 'badge-success',
          priority: 'success',
          explanation: 'Test',
          detectedYears: null,
          expectedSeniority: 'unknown',
        },
        requirements: { mandatory: { met: [], missing: [] }, desirable: { met: [], missing: [] } },
        hardSkills: [],
        softSkills: [],
        detectedDomains: [],
        redFlags: [],
        recruiterMessage: '',
        coverLetter: '',
        yearsExperience: null,
        yearsConfidence: 'low',
        cvSuggestions: [],
        hasAnyMissingMandatory: false,
        hasRedFlags: false,
        hasDetectedDomains: false,
      };

      expect(hasContent(model)).toBe(false);
    });
  });
});

import { describe, it, expect } from '@jest/globals';
import {
  validateCV,
  validateJobDescription,
  formatAnalysisResult,
  getDecisionText,
} from './analyzer';
import { getScoreColor, getScoreBadgeClass } from '../utils/scoreHelpers';

describe('Analyzer Domain Layer', () => {
  describe('validateCV', () => {
    it('should return valid for CV with content', () => {
      const result = validateCV('This is a valid CV with some content that exceeds the minimum 50 character limit required');
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should return invalid for empty CV', () => {
      const result = validateCV('');
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should return invalid for whitespace-only CV', () => {
      const result = validateCV('   \n  \t  ');
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should return invalid for very short CV', () => {
      const result = validateCV('Hi');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('CV too short');
    });
  });

  describe('validateJobDescription', () => {
    it('should return valid for job description with content', () => {
      const result = validateJobDescription(
        'Looking for Senior Developer with React experience and strong skills in TypeScript'
      );
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should return invalid for empty job description', () => {
      const result = validateJobDescription('');
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should return invalid for very short job description', () => {
      const result = validateJobDescription('Dev');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Job description too short');
    });
  });

  describe('getScoreColor', () => {
    it('should return green for high scores (80-100)', () => {
      expect(getScoreColor(100)).toBe('green');
      expect(getScoreColor(85)).toBe('green');
      expect(getScoreColor(80)).toBe('green');
    });

    it('should return yellow for medium-high scores (60-79)', () => {
      expect(getScoreColor(79)).toBe('yellow');
      expect(getScoreColor(60)).toBe('yellow');
    });

    it('should return orange for medium-low scores (40-59)', () => {
      expect(getScoreColor(59)).toBe('orange');
      expect(getScoreColor(50)).toBe('orange');
      expect(getScoreColor(40)).toBe('orange');
    });

    it('should return red for low scores (0-39)', () => {
      expect(getScoreColor(39)).toBe('red');
      expect(getScoreColor(20)).toBe('red');
      expect(getScoreColor(0)).toBe('red');
    });
  });

  describe('getDecisionText', () => {
    it('should return correct text for "apply" decision', () => {
      const text = getDecisionText('apply');
      expect(text).toContain('Apply');
      expect(text.toLowerCase()).toContain('job');
    });

    it('should return correct text for "apply_with_fixes" decision', () => {
      const text = getDecisionText('apply_with_fixes');
      expect(text).toContain('Apply');
      expect(text.toLowerCase()).toContain('adjust');
    });

    it('should return correct text for "skip" decision', () => {
      const text = getDecisionText('skip');
      expect(text).toContain('Skip');
    });
  });

  describe('formatAnalysisResult', () => {
    it('should add UI properties to analysis result', () => {
      const mockResult = {
        fitScore: 85,
        decision: 'apply',
        strengths: ['React', 'TypeScript'],
        gaps: [],
        cvSuggestions: [],
        recruiterMessage: 'Good fit',
        explanation: {
          positives: ['Hard skills match'],
          negatives: [],
          summary: 'Great candidate',
        },
        promptVersion: 'v1.1',
      };

      const formatted = formatAnalysisResult(mockResult);

      expect(formatted.scoreColor).toBe('green');
      expect(formatted.scoreBadgeClass).toBeTruthy();
      expect(formatted.decisionText).toBeTruthy();
      expect(formatted.decisionIcon).toBeTruthy();
      expect(formatted.fitScore).toBe(85);
      expect(formatted.decision).toBe('apply');
    });

    it('should map different scores to appropriate colors', () => {
      const highScore = formatAnalysisResult({
        fitScore: 90,
        decision: 'apply',
        strengths: [],
        gaps: [],
        cvSuggestions: [],
        recruiterMessage: '',
        explanation: { positives: [], negatives: [], summary: '' },
        promptVersion: 'v1.1',
      });

      const lowScore = formatAnalysisResult({
        fitScore: 30,
        decision: 'skip',
        strengths: [],
        gaps: [],
        cvSuggestions: [],
        recruiterMessage: '',
        explanation: { positives: [], negatives: [], summary: '' },
        promptVersion: 'v1.1',
      });

      expect(highScore.scoreColor).toBe('green');
      expect(lowScore.scoreColor).toBe('red');
    });
  });
});

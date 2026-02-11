import {
  calculateFitScore,
  generateExplanation,
  determineDecision,
} from './scoring';
import type { AISignals } from '../types/analysis';

describe('Scoring Service', () => {
  describe('calculateFitScore', () => {
    it('should return high score (90+) when all signals match perfectly', () => {
      const signals: AISignals = {
        hardSkillsDetected: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS'],
        mandatoryRequirementsMet: ['5+ years experience', 'TypeScript'],
        mandatoryRequirementsMissing: [],
        desirableRequirementsMet: ['GraphQL', 'AWS'],
        desirableRequirementsMissing: [],
        softSkillsEvidence: ['Led team', 'Mentored juniors', 'Presented at conferences'],
        seniorityMatch: 'match',
        redFlags: [],
        recruiterMessage: 'Test message',
        coverLetter: 'Test cover letter',
      };

      const score = calculateFitScore(signals);
      expect(score).toBeGreaterThan(90);
    });

    it('should return 0 when no requirements met', () => {
      const signals: AISignals = {
        hardSkillsDetected: [],
        mandatoryRequirementsMet: [],
        mandatoryRequirementsMissing: ['All requirements'],
        desirableRequirementsMet: [],
        desirableRequirementsMissing: ['All nice-to-haves'],
        softSkillsEvidence: [],
        seniorityMatch: 'below',
        redFlags: ['Job hopping'],
        recruiterMessage: 'Not a fit',
        coverLetter: 'Test cover letter',
      };

      const score = calculateFitScore(signals);
      expect(score).toBeLessThanOrEqual(10);
    });

    it('should calculate score around 55-75 for good match with minor gaps', () => {
      const signals: AISignals = {
        hardSkillsDetected: ['React', 'TypeScript', 'Node.js'],
        mandatoryRequirementsMet: ['4+ years experience'],
        mandatoryRequirementsMissing: ['Kubernetes'],
        desirableRequirementsMet: ['GraphQL'],
        desirableRequirementsMissing: ['AWS'],
        softSkillsEvidence: ['Led projects'],
        seniorityMatch: 'match',
        redFlags: [],
        recruiterMessage: 'Good fit',
        coverLetter: 'Test cover letter',
      };

      const score = calculateFitScore(signals);
      expect(score).toBeGreaterThan(55);
      expect(score).toBeLessThan(80);
    });

    it('should apply red flag penalty correctly', () => {
      const withoutFlags: AISignals = {
        hardSkillsDetected: ['React'],
        mandatoryRequirementsMet: ['Experience'],
        mandatoryRequirementsMissing: [],
        desirableRequirementsMet: [],
        desirableRequirementsMissing: [],
        softSkillsEvidence: [],
        seniorityMatch: 'match',
        redFlags: [],
        recruiterMessage: 'Test',
        coverLetter: 'Test cover letter',
      };

      const withFlags: AISignals = {
        ...withoutFlags,
        redFlags: ['Job hopping', 'Resume gaps'],
      };

      const scoreWithout = calculateFitScore(withoutFlags);
      const scoreWith = calculateFitScore(withFlags);

      expect(scoreWith).toBeLessThan(scoreWithout);
      expect(scoreWithout - scoreWith).toBeGreaterThanOrEqual(5);
    });

    it('should weight hard skills significantly in total score', () => {
      const signals: AISignals = {
        hardSkillsDetected: ['React', 'TypeScript', 'Node.js'],
        mandatoryRequirementsMet: [],
        mandatoryRequirementsMissing: [],
        desirableRequirementsMet: [],
        desirableRequirementsMissing: [],
        softSkillsEvidence: [],
        seniorityMatch: 'below',
        redFlags: [],
        recruiterMessage: 'Test',
        coverLetter: 'Test cover letter',
      };

      const score = calculateFitScore(signals);
      expect(score).toBeGreaterThanOrEqual(40);
      expect(score).toBeLessThanOrEqual(55);
    });

    it('should handle seniority mismatch correctly', () => {
      const below: AISignals = {
        hardSkillsDetected: [],
        mandatoryRequirementsMet: [],
        mandatoryRequirementsMissing: [],
        desirableRequirementsMet: [],
        desirableRequirementsMissing: [],
        softSkillsEvidence: [],
        seniorityMatch: 'below',
        redFlags: [],
        recruiterMessage: 'Test',
        coverLetter: 'Test cover letter',
      };

      const match: AISignals = { ...below, seniorityMatch: 'match' };
      const above: AISignals = { ...below, seniorityMatch: 'above' };

      const scoreBelow = calculateFitScore(below);
      const scoreMatch = calculateFitScore(match);
      const scoreAbove = calculateFitScore(above);

      expect(scoreMatch).toBeGreaterThan(scoreBelow);
      expect(scoreMatch).toBeGreaterThan(scoreAbove);
    });
  });

  describe('determineDecision', () => {
    it('should recommend "apply" for score >= 70', () => {
      expect(determineDecision(100)).toBe('apply');
      expect(determineDecision(85)).toBe('apply');
      expect(determineDecision(70)).toBe('apply');
    });

    it('should recommend "apply_with_fixes" for score 50-69', () => {
      expect(determineDecision(69)).toBe('apply_with_fixes');
      expect(determineDecision(60)).toBe('apply_with_fixes');
      expect(determineDecision(50)).toBe('apply_with_fixes');
    });

    it('should recommend "skip" for score < 50', () => {
      expect(determineDecision(49)).toBe('skip');
      expect(determineDecision(30)).toBe('skip');
      expect(determineDecision(0)).toBe('skip');
    });
  });

  describe('generateExplanation', () => {
    it('should include positive points for met requirements', () => {
      const signals: AISignals = {
        hardSkillsDetected: ['React', 'TypeScript', 'Node.js'],
        mandatoryRequirementsMet: ['5+ years'],
        mandatoryRequirementsMissing: [],
        desirableRequirementsMet: ['GraphQL'],
        desirableRequirementsMissing: [],
        softSkillsEvidence: ['Leadership'],
        seniorityMatch: 'match',
        redFlags: [],
        recruiterMessage: 'Test',
        coverLetter: 'Test cover letter',
      };

      const explanation = generateExplanation(signals, 90);

      expect(explanation.positives.length).toBeGreaterThan(0);
      expect(explanation.positives.some((p: string) => p.toLowerCase().includes('hard skills') || p.includes('skills técnicas'))).toBe(true);
      expect(explanation.positives.some((p: string) => p.includes('requisito') || p.includes('Atende'))).toBe(true);
    });

    it('should include negative points for missing requirements', () => {
      const signals: AISignals = {
        hardSkillsDetected: [],
        mandatoryRequirementsMet: [],
        mandatoryRequirementsMissing: ['Kubernetes', 'AWS'],
        desirableRequirementsMet: [],
        desirableRequirementsMissing: ['GraphQL'],
        softSkillsEvidence: [],
        seniorityMatch: 'below',
        redFlags: ['Job hopping'],
        recruiterMessage: 'Test',
        coverLetter: 'Test cover letter',
      };

      const explanation = generateExplanation(signals, 30);

      expect(explanation.negatives.length).toBeGreaterThan(0);
      expect(
        explanation.negatives.some((n: string) => n.includes('requisito') || n.includes('Falta'))
      ).toBe(true);
      expect(explanation.negatives.some((n: string) => n.includes('problema') || n.includes('identificado'))).toBe(
        true
      );
    });

    it('should generate summary matching the score', () => {
      const highScore: AISignals = {
        hardSkillsDetected: ['React', 'TypeScript'],
        mandatoryRequirementsMet: ['Experience'],
        mandatoryRequirementsMissing: [],
        desirableRequirementsMet: [],
        desirableRequirementsMissing: [],
        softSkillsEvidence: [],
        seniorityMatch: 'match',
        redFlags: [],
        recruiterMessage: 'Test',
        coverLetter: 'Test cover letter',
      };

      const lowScore: AISignals = {
        hardSkillsDetected: [],
        mandatoryRequirementsMet: [],
        mandatoryRequirementsMissing: ['All'],
        desirableRequirementsMet: [],
        desirableRequirementsMissing: [],
        softSkillsEvidence: [],
        seniorityMatch: 'below',
        redFlags: ['Issues'],
        recruiterMessage: 'Test',
        coverLetter: 'Test cover letter',
      };

      const highExplanation = generateExplanation(highScore, 85);
      const lowExplanation = generateExplanation(lowScore, 25);

      expect(highExplanation.summary).toBeTruthy();
      expect(lowExplanation.summary).toBeTruthy();
      expect(highExplanation.summary).not.toBe(lowExplanation.summary);
    });
  });
});

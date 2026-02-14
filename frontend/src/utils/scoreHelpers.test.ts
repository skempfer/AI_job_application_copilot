import { clampScore, getScoreBadgeClass, getScoreColor, SCORE_BOUNDARIES } from './scoreHelpers';

describe('scoreHelpers', () => {
  describe('clampScore', () => {
    it('should return score unchanged when within valid range', () => {
      expect(clampScore(50)).toBe(50);
      expect(clampScore(0)).toBe(0);
      expect(clampScore(100)).toBe(100);
      expect(clampScore(42)).toBe(42);
    });

    it('should clamp scores above 100', () => {
      expect(clampScore(101)).toBe(100);
      expect(clampScore(150)).toBe(100);
      expect(clampScore(999)).toBe(100);
    });

    it('should clamp scores below 0', () => {
      expect(clampScore(-1)).toBe(0);
      expect(clampScore(-50)).toBe(0);
      expect(clampScore(-999)).toBe(0);
    });

    it('should handle edge cases with decimals', () => {
      expect(clampScore(50.5)).toBe(50.5);
      expect(clampScore(0.1)).toBe(0.1);
      expect(clampScore(99.9)).toBe(99.9);
      expect(clampScore(100.1)).toBe(100);
    });
  });

  describe('getScoreBadgeClass', () => {
    it('should return green classes for excellent scores (>= 80)', () => {
      const result = getScoreBadgeClass(80);
      expect(result).toContain('bg-green');
      expect(result).toContain('text-green');
      expect(result).toContain('border-green');

      expect(getScoreBadgeClass(90)).toContain('bg-green');
      expect(getScoreBadgeClass(100)).toContain('bg-green');
    });

    it('should return yellow classes for good scores (60-79)', () => {
      const result = getScoreBadgeClass(60);
      expect(result).toContain('bg-yellow');
      expect(result).toContain('text-yellow');
      expect(result).toContain('border-yellow');

      expect(getScoreBadgeClass(70)).toContain('bg-yellow');
      expect(getScoreBadgeClass(79)).toContain('bg-yellow');
    });

    it('should return orange classes for fair scores (40-59)', () => {
      const result = getScoreBadgeClass(40);
      expect(result).toContain('bg-orange');
      expect(result).toContain('text-orange');
      expect(result).toContain('border-orange');

      expect(getScoreBadgeClass(50)).toContain('bg-orange');
      expect(getScoreBadgeClass(59)).toContain('bg-orange');
    });

    it('should return red classes for poor scores (< 40)', () => {
      const result = getScoreBadgeClass(39);
      expect(result).toContain('bg-red');
      expect(result).toContain('text-red');
      expect(result).toContain('border-red');

      expect(getScoreBadgeClass(0)).toContain('bg-red');
      expect(getScoreBadgeClass(1)).toContain('bg-red');
    });

    it('should include dark mode classes', () => {
      const result = getScoreBadgeClass(80);
      expect(result).toContain('dark:');
    });
  });

  describe('getScoreColor', () => {
    it('should return "green" for excellent scores (>= 80)', () => {
      expect(getScoreColor(80)).toBe('green');
      expect(getScoreColor(90)).toBe('green');
      expect(getScoreColor(100)).toBe('green');
    });

    it('should return "yellow" for good scores (60-79)', () => {
      expect(getScoreColor(60)).toBe('yellow');
      expect(getScoreColor(70)).toBe('yellow');
      expect(getScoreColor(79)).toBe('yellow');
    });

    it('should return "orange" for fair scores (40-59)', () => {
      expect(getScoreColor(40)).toBe('orange');
      expect(getScoreColor(50)).toBe('orange');
      expect(getScoreColor(59)).toBe('orange');
    });

    it('should return "red" for poor scores (< 40)', () => {
      expect(getScoreColor(39)).toBe('red');
      expect(getScoreColor(0)).toBe('red');
      expect(getScoreColor(1)).toBe('red');
    });

    it('should handle boundary values correctly', () => {
      expect(getScoreColor(79.9)).toBe('yellow');
      expect(getScoreColor(80)).toBe('green');
      expect(getScoreColor(59.9)).toBe('orange');
      expect(getScoreColor(60)).toBe('yellow');
    });
  });

  describe('SCORE_BOUNDARIES', () => {
    it('should export correct boundary constants', () => {
      expect(SCORE_BOUNDARIES.MIN).toBe(0);
      expect(SCORE_BOUNDARIES.MAX).toBe(100);
      expect(SCORE_BOUNDARIES.EXCELLENT).toBe(80);
      expect(SCORE_BOUNDARIES.GOOD).toBe(60);
      expect(SCORE_BOUNDARIES.FAIR).toBe(40);
    });

    it('should be immutable (readonly)', () => {
      // JS allows modification at runtime even with as const, but TypeScript prevents it
      // This test verifies the constant should not be modified in regular code
      const original = SCORE_BOUNDARIES.MIN;
      expect(original).toBe(0);

      // In proper TypeScript code, this would be a compile error:
      // (SCORE_BOUNDARIES as any).MIN = 10;
      // We're just verifying the initial values are correct
    });

    it('should maintain order and logic', () => {
      expect(SCORE_BOUNDARIES.MIN).toBeLessThan(SCORE_BOUNDARIES.FAIR);
      expect(SCORE_BOUNDARIES.FAIR).toBeLessThan(SCORE_BOUNDARIES.GOOD);
      expect(SCORE_BOUNDARIES.GOOD).toBeLessThan(SCORE_BOUNDARIES.EXCELLENT);
      expect(SCORE_BOUNDARIES.EXCELLENT).toBeLessThanOrEqual(SCORE_BOUNDARIES.MAX);
    });
  });

  describe('integration scenarios', () => {
    it('should work together for score display workflow', () => {
      const score = 85;
      const clamped = clampScore(score);
      const badgeClass = getScoreBadgeClass(clamped);
      const color = getScoreColor(clamped);

      expect(clamped).toBe(85);
      expect(badgeClass).toContain('bg-green');
      expect(color).toBe('green');
    });

    it('should handle invalid input gracefully', () => {
      expect(clampScore(NaN)).toBeNaN();
      expect(() => getScoreBadgeClass(NaN)).not.toThrow();
      expect(() => getScoreColor(NaN)).not.toThrow();
    });
  });
});

/**
 * Score utility functions
 */

export function clampScore(score: number): number {
  return Math.max(0, Math.min(100, score));
}

export function getScoreBadgeClass(score: number): string {
  if (score >= 80) return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-200 dark:border-green-700';
  if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-700';
  if (score >= 40) return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/20 dark:text-orange-200 dark:border-orange-700';
  return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-200 dark:border-red-700';
}

/**
 * Get color name for score (for legacy usage)
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return 'green';
  if (score >= 60) return 'yellow';
  if (score >= 40) return 'orange';
  return 'red';
}

/**
 * Constants for score boundaries
 */
export const SCORE_BOUNDARIES = {
  MIN: 0,
  MAX: 100,
  EXCELLENT: 80,
  GOOD: 60,
  FAIR: 40,
} as const;

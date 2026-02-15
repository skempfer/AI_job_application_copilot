/**
 * Defensive utility functions for alignment display
 *
 * These functions ensure safe access to data that might be:
 * - undefined
 * - null
 * - empty arrays
 * - malformed structures
 *
 * Used throughout alignment components to prevent crashes
 */

import type { AlignmentUIModel, DetectedDomainUIItem } from '../../../../types/analysis';

/**
 * Safely get array length with default
 */
export function safeArrayLength(arr: unknown): number {
  if (!Array.isArray(arr)) {
    return 0;
  }
  return arr.length;
}

/**
 * Safely check if array has items
 */
export function hasItems<T>(arr: T[] | null | undefined): arr is T[] {
  return Array.isArray(arr) && arr.length > 0;
}

/**
 * Safely get string with default
 */
export function safeString(value: unknown, defaultValue = ''): string {
  return typeof value === 'string' ? value : defaultValue;
}

/**
 * Safely get number with default
 */
export function safeNumber(value: unknown, defaultValue = 0): number {
  return typeof value === 'number' && !isNaN(value) ? value : defaultValue;
}

/**
 * Check if UI model is in critical state
 * (many missing mandatory requirements)
 */
export function isInCriticalState(model: AlignmentUIModel): boolean {
  return (
    model.hasAnyMissingMandatory &&
    model.requirements.mandatory.missing.length > 0
  );
}

/**
 * Check if UI model is in warning state
 * (has red flags or concerns)
 */
export function isInWarningState(model: AlignmentUIModel): boolean {
  return model.hasRedFlags || model.redFlags.length > 0;
}

/**
 * Check if UI model has any meaningful content
 */
export function hasContent(model: AlignmentUIModel): boolean {
  return (
    model.hardSkills.length > 0 ||
    model.softSkills.length > 0 ||
    model.detectedDomains.length > 0 ||
    model.yearsExperience !== null ||
    safeString(model.recruiterMessage).length > 0 ||
    safeString(model.coverLetter).length > 0
  );
}

/**
 * Count total requirements (met + missing)
 */
export function countRequirements(model: AlignmentUIModel): {
  total: number;
  met: number;
  missing: number;
} {
  const mandatory =
    safeArrayLength(model.requirements.mandatory.met) +
    safeArrayLength(model.requirements.mandatory.missing);
  const desirable =
    safeArrayLength(model.requirements.desirable.met) +
    safeArrayLength(model.requirements.desirable.missing);

  return {
    total: mandatory + desirable,
    met:
      safeArrayLength(model.requirements.mandatory.met) +
      safeArrayLength(model.requirements.desirable.met),
    missing:
      safeArrayLength(model.requirements.mandatory.missing) +
      safeArrayLength(model.requirements.desirable.missing),
  };
}

/**
 * Get priority level for styling
 * Based on seniority match, missing requirements, red flags
 */
export function getPriorityLevel(
  model: AlignmentUIModel
): 'critical' | 'warning' | 'info' | 'success' {
  // Critical: below seniority + many missing requirements
  if (model.seniority.priority === 'critical' && isInCriticalState(model)) {
    return 'critical';
  }

  // Warning: below seniority OR missing requirements OR red flags
  if (
    model.seniority.priority === 'warning' ||
    isInCriticalState(model) ||
    isInWarningState(model)
  ) {
    return 'warning';
  }

  // Info: match with minor concerns
  if (model.seniority.priority === 'success' && hasItems(model.redFlags)) {
    return 'info';
  }

  // Success: good match
  return 'success';
}

/**
 * Get recommendation message based on analysis
 * Useful for showing guidance to user
 */
export function getRecommendationMessage(model: AlignmentUIModel): string {
  const priority = getPriorityLevel(model);
  const requirements = countRequirements(model);

  switch (priority) {
    case 'critical':
      return `Missing ${requirements.missing} mandatory requirements. Consider addressing key gaps before applying.`;
    case 'warning':
      if (model.seniority.priority === 'warning') {
        return `Your experience level is below the posted seniority. Emphasize transferable skills in your application.`;
      }
      return `Missing some requirements. Highlight relevant experience and willingness to learn.`;
    case 'info':
      return `Good alignment overall. Address noted concerns in your cover letter.`;
    case 'success':
      return `Excellent match! This role aligns well with your profile.`;
    default:
      return 'Review the analysis below for detailed insights.';
  }
}

/**
 * Format skill count for display
 */
export function formatSkillCount(model: AlignmentUIModel): string {
  const total = model.hardSkills.length + model.softSkills.length;
  if (total === 0) return 'No skills detected';
  if (total === 1) return '1 skill detected';
  return `${total} skills detected`;
}

/**
 * Check if components should be hidden due to empty state
 */
export function shouldShowSection(
  hasContent: boolean,
  forceShow = false
): boolean {
  return forceShow || hasContent;
}

/**
 * Safely validate domain
 */
export function isValidDomain(
  domain: unknown
): domain is DetectedDomainUIItem {
  return (
    typeof domain === 'object' &&
    domain !== null &&
    'domain' in domain &&
    'label' in domain &&
    'badgeClass' in domain
  );
}

/**
 * Clamp number between min and max
 * Useful for fit scores
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Format fit score for display
 */
export function formatFitScore(score: number): string {
  const clamped = clamp(safeNumber(score), 0, 100);
  return `${Math.round(clamped)}%`;
}

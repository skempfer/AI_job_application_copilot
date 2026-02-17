import type { AlignmentUIModel, DetectedDomainUIItem } from '../../../../types/analysis';

export function safeArrayLength(arr: unknown): number {
  if (!Array.isArray(arr)) {
    return 0;
  }
  return arr.length;
}

export function hasItems<T>(arr: T[] | null | undefined): arr is T[] {
  return Array.isArray(arr) && arr.length > 0;
}

export function safeString(value: unknown, defaultValue = ''): string {
  return typeof value === 'string' ? value : defaultValue;
}

export function safeNumber(value: unknown, defaultValue = 0): number {
  return typeof value === 'number' && !isNaN(value) ? value : defaultValue;
}

export function isInCriticalState(model: AlignmentUIModel): boolean {
  return (
    model.hasAnyMissingMandatory &&
    model.requirements.mandatory.missing.length > 0
  );
}

export function isInWarningState(model: AlignmentUIModel): boolean {
  return model.hasRedFlags || model.redFlags.length > 0;
}

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

export function getPriorityLevel(
  model: AlignmentUIModel
): 'critical' | 'warning' | 'info' | 'success' {
  if (model.seniority.priority === 'critical' && isInCriticalState(model)) {
    return 'critical';
  }

  if (
    model.seniority.priority === 'warning' ||
    isInCriticalState(model) ||
    isInWarningState(model)
  ) {
    return 'warning';
  }

  if (model.seniority.priority === 'success' && hasItems(model.redFlags)) {
    return 'info';
  }

  return 'success';
}

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

export function formatSkillCount(model: AlignmentUIModel): string {
  const total = model.hardSkills.length + model.softSkills.length;
  if (total === 0) return 'No skills detected';
  if (total === 1) return '1 skill detected';
  return `${total} skills detected`;
}

export function shouldShowSection(
  hasContent: boolean,
  forceShow = false
): boolean {
  return forceShow || hasContent;
}

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

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function formatFitScore(score: number): string {
  const clamped = clamp(safeNumber(score), 0, 100);
  return `${Math.round(clamped)}%`;
}

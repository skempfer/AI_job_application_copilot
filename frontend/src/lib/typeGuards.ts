import type {
  AnalysisResult,
  PreprocessedCV,
  DomainExperience,
  SeniorityMatch,
} from '../types/analysis';

export function isSeniorityMatch(value: unknown): value is SeniorityMatch {
  return value === 'below' || value === 'match' || value === 'above';
}

export function isDomainExperience(value: unknown): value is DomainExperience {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const domain = value as Record<string, unknown>;
  return (
    typeof domain.frontend === 'boolean' &&
    typeof domain.backend === 'boolean' &&
    typeof domain.fullstack === 'boolean' &&
    typeof domain.qa === 'boolean' &&
    typeof domain.devops === 'boolean' &&
    typeof domain.product === 'boolean'
  );
}

export function isPreprocessedCV(value: unknown): value is PreprocessedCV {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const cv = value as Record<string, unknown>;

  return (
    (cv.yearsExperience === null || typeof cv.yearsExperience === 'number') &&
    (cv.yearsExperienceConfidence === 'high' ||
      cv.yearsExperienceConfidence === 'medium' ||
      cv.yearsExperienceConfidence === 'low') &&
    isDomainExperience(cv.domainExperience) &&
    (cv.seniority === 'junior' ||
      cv.seniority === 'mid' ||
      cv.seniority === 'senior' ||
      cv.seniority === 'unknown') &&
    Array.isArray(cv.skills) &&
    cv.skills.every((s) => typeof s === 'string')
  );
}

export function isAnalysisResult(value: unknown): value is AnalysisResult {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const result = value as Record<string, unknown>;

  return (
    typeof result.fitScore === 'number' &&
    (result.decision === 'apply' || result.decision === 'apply_with_fixes' || result.decision === 'skip') &&
    Array.isArray(result.strengths) &&
    Array.isArray(result.gaps) &&
    Array.isArray(result.cvSuggestions) &&
    typeof result.recruiterMessage === 'string' &&
    typeof result.coverLetter === 'string' &&
    (result.detectedLanguage === 'pt' || result.detectedLanguage === 'en' || result.detectedLanguage === undefined) &&
    (result.preprocessedCV === undefined || isPreprocessedCV(result.preprocessedCV))
  );
}

export function safeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item) => typeof item === 'string');
}

export function safeNumber(value: unknown): number | null {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  return null;
}

export function safeSeniorityMatch(value: unknown): SeniorityMatch {
  if (isSeniorityMatch(value)) {
    return value;
  }
  console.warn('[Type Guard] Invalid seniority match value:', value);
  return 'match';
}

export function safeDomainExperience(value: unknown): DomainExperience {
  if (isDomainExperience(value)) {
    return value;
  }

  console.warn('[Type Guard] Invalid domain experience:', value);

  return {
    frontend: false,
    backend: false,
    fullstack: false,
    qa: false,
    devops: false,
    product: false,
  };
}

export function safePreprocessedCV(value: unknown): PreprocessedCV | null {
  if (isPreprocessedCV(value)) {
    return value;
  }

  if (value === null || value === undefined) {
    return null;
  }

  console.warn('[Type Guard] Invalid preprocessed CV:', value);
  return null;
}

export function secureAnalysisResult(value: unknown): AnalysisResult {
  if (isAnalysisResult(value)) {
    return value;
  }

  if (typeof value !== 'object' || value === null) {
    throw new Error('[Type Guard] Analysis result is not an object');
  }

  const result = value as Record<string, unknown>;

  return {
    fitScore: typeof result.fitScore === 'number' ? result.fitScore : 0,
    decision: 'skip',
    strengths: safeStringArray(result.strengths),
    gaps: safeStringArray(result.gaps),
    cvSuggestions: safeStringArray(result.cvSuggestions),
    recruiterMessage: typeof result.recruiterMessage === 'string' ? result.recruiterMessage : '',
    coverLetter: typeof result.coverLetter === 'string' ? result.coverLetter : '',
    explanation: undefined,
    promptVersion: typeof result.promptVersion === 'string' ? result.promptVersion : undefined,
    detectedLanguage:
      result.detectedLanguage === 'pt' || result.detectedLanguage === 'en'
        ? result.detectedLanguage
        : 'en',
    preprocessedCV: safePreprocessedCV(result.preprocessedCV) || undefined,
  };
}

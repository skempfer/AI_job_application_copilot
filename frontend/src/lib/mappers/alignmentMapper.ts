/**
 * UI Mapping Layer
 *
 * Converts raw API response (AnalysisResult) into UI-ready model (AlignmentUIModel)
 * This centralizes all business logic for presentation, keeping components clean
 *
 * Key principle: Components consume AlignmentUIModel, NOT the raw API response
 */

import type {
  AnalysisResult,
  AlignmentUIModel,
  SeniorityUIInfo,
  RequirementsUIModel,
  RequirementUIItem,
  DetectedDomainUIItem,
  SeniorityMatch,
  DomainExperience,
  ConfidenceLevel,
} from '../../types/analysis';

/**
 * Maps seniority match to UI-ready information
 * Includes label, badge styling, priority level, and explanation
 */
function mapSeniorityMatch(
  match: SeniorityMatch,
  detectedYears: number | null,
  expectedSeniority: string
): SeniorityUIInfo {
  const seniorityLabels: Record<SeniorityMatch, string> = {
    above: 'Seniority Above Expected',
    match: 'Seniority Match',
    below: 'Seniority Below Expected',
  };

  const seniorityPriorities: Record<SeniorityMatch, 'critical' | 'warning' | 'success'> = {
    above: 'success',
    match: 'success',
    below: 'warning',
  };

  const seniorityBadgeClasses: Record<SeniorityMatch, string> = {
    above: 'badge-success badge-lg',
    match: 'badge-success',
    below: 'badge-warning',
  };

  const seniorityExplanations: Record<SeniorityMatch, string> = {
    above: 'Your experience level exceeds the role requirements',
    match: 'Your experience level aligns with the role requirements',
    below: 'Your experience level is below the role requirements',
  };

  return {
    match,
    label: seniorityLabels[match],
    badgeClass: seniorityBadgeClasses[match],
    priority: seniorityPriorities[match],
    explanation: seniorityExplanations[match],
    detectedYears,
    expectedSeniority: expectedSeniority as any,
  };
}

/**
 * Groups requirements into categories by type and status
 */
function groupRequirements(
  _hardSkills: string[],
  _softSkills: string[],
  mandatoryMet: string[],
  mandatoryMissing: string[],
  desirableMet: string[],
  desirableMissing: string[]
): RequirementsUIModel {
  // Create categorized items
  const mandatoryMetItems = mandatoryMet
    .filter((item) => item.trim().length > 0)
    .map(
      (text) =>
        ({
          text,
          category: 'mandatory',
          status: 'met',
        } as RequirementUIItem)
    );

  const mandatoryMissingItems = mandatoryMissing
    .filter((item) => item.trim().length > 0)
    .map(
      (text) =>
        ({
          text,
          category: 'mandatory',
          status: 'missing',
        } as RequirementUIItem)
    );

  const desirableMetItems = desirableMet
    .filter((item) => item.trim().length > 0)
    .map(
      (text) =>
        ({
          text,
          category: 'desirable',
          status: 'met',
        } as RequirementUIItem)
    );

  const desirableMissingItems = desirableMissing
    .filter((item) => item.trim().length > 0)
    .map(
      (text) =>
        ({
          text,
          category: 'desirable',
          status: 'missing',
        } as RequirementUIItem)
    );

  return {
    mandatory: {
      met: mandatoryMetItems,
      missing: mandatoryMissingItems,
    },
    desirable: {
      met: desirableMetItems,
      missing: desirableMissingItems,
    },
  };
}

/**
 * Converts domain experience booleans into a list of detected domains
 * Only includes domains where detection is true
 */
function mapDetectedDomains(domainExperience: DomainExperience | null): DetectedDomainUIItem[] {
  if (!domainExperience) {
    return [];
  }

  const domainLabels: Record<keyof DomainExperience, string> = {
    frontend: 'Frontend',
    backend: 'Backend',
    fullstack: 'Fullstack',
    qa: 'QA/Testing',
    devops: 'DevOps',
    product: 'Product',
  };

  const domainBadgeClasses: Record<keyof DomainExperience, string> = {
    frontend: 'badge-blue',
    backend: 'badge-purple',
    fullstack: 'badge-indigo',
    qa: 'badge-green',
    devops: 'badge-orange',
    product: 'badge-pink',
  };

  const detected: DetectedDomainUIItem[] = [];

  (Object.keys(domainExperience) as Array<keyof DomainExperience>).forEach((domain) => {
    if (domainExperience[domain] === true) {
      detected.push({
        domain,
        label: domainLabels[domain],
        badgeClass: domainBadgeClasses[domain],
      });
    }
  });

  return detected;
}

/**
 * Normalizes red flags for safe display
 * Removes empty strings and excessive whitespace
 */
function normalizeRedFlags(flags: string[]): string[] {
  return (flags || [])
    .filter((flag) => typeof flag === 'string' && flag.trim().length > 0)
    .map((flag) => flag.trim())
    .slice(0, 10); // Limit to 10 red flags for UI performance
}

/**
 * CRITICAL: Validates and extracts hard skills - SINGLE SOURCE OF TRUTH
 *
 * Must ensure:
 * - Only skills from aiSignals.hardSkillsDetected are used
 * - No inference from requirements
 * - No fallback to response.strengths
 * - In development, any mismatch is logged as a warning
 *
 * @param signals - AI signals from backend (source of truth)
 * @param response - Full analysis response (NOT used for skill extraction)
 * @returns Validated hard skills array
 */
function getValidatedHardSkills(signals: any, response: any): string[] {
  // STRICT: Only use signals.hardSkillsDetected
  const hardSkills = Array.isArray(signals?.hardSkillsDetected)
    ? signals.hardSkillsDetected
    : [];

  // Validate each skill is a non-empty string
  const validated = hardSkills
    .filter((skill: any): skill is string => typeof skill === 'string' && skill.trim().length > 0)
    .map((skill: string) => skill.trim());

  // DEVELOPMENT ONLY: Log if response.strengths exists but wasn't used
  if (process.env.NODE_ENV === 'development' && response?.strengths?.length > 0 && validated.length === 0) {
    console.warn(
      '[alignmentMapper] Development Warning: response.strengths exists but was NOT used because aiSignals.hardSkillsDetected is empty. Skills can ONLY come from hardSkillsDetected.',
      { strengths: response.strengths }
    );
  }

  // DEVELOPMENT ONLY: Warn if hardSkillsDetected seems incorrect
  if (process.env.NODE_ENV === 'development') {
    const suspiciousSkills = validated.filter((skill: string) => skill.toLowerCase().includes('react native'));
    if (suspiciousSkills.length > 0) {
      console.warn(
        '[alignmentMapper] Development Warning: Suspicious skills detected in hardSkillsDetected. Ensure these were explicitly detected by AI:',
        suspiciousSkills
      );
    }
  }

  return validated;
}

/**
 * CRITICAL: Validates and extracts soft skills - SINGLE SOURCE OF TRUTH
 *
 * Must ensure:
 * - Only skills from aiSignals.softSkillsEvidence are used
 * - No inference from requirements
 * - No fallback to response.gaps
 *
 * @param signals - AI signals from backend (source of truth)
 * @returns Validated soft skills array
 */
function getValidatedSoftSkills(signals: any): string[] {
  const softSkills = Array.isArray(signals?.softSkillsEvidence)
    ? signals.softSkillsEvidence
    : [];

  return softSkills
    .filter((skill: any): skill is string => typeof skill === 'string' && skill.trim().length > 0)
    .map((skill: string) => skill.trim());
}

/**
 * Core mapping function: AnalysisResult → AlignmentUIModel
 *
 * This is the ONLY function that depends on the API contract.
 * If backend schema changes, only this function needs updating.
 *
 * @param response - Raw API response from backend
 * @returns UI-ready model for components to consume
 */
export function mapAlignmentResponseToUIModel(response: AnalysisResult): AlignmentUIModel {
  console.log('[alignmentMapper] Starting mapping with response:', {
    hasAiSignals: Boolean(response.aiSignals),
    hasPreprocessedCV: Boolean(response.preprocessedCV),
    aiSignalsKeys: response.aiSignals ? Object.keys(response.aiSignals) : [],
  });

  // Extract preprocessed data with safe defaults
  const preprocessedCV = response.preprocessedCV;
  const yearsExperience = preprocessedCV?.yearsExperience ?? null;
  const yearsConfidence: ConfidenceLevel = preprocessedCV?.yearsExperienceConfidence ?? 'low';
  const domainExperience = preprocessedCV?.domainExperience ?? null;
  const expectedSeniority = preprocessedCV?.seniority ?? 'unknown';

  console.log('[alignmentMapper] Preprocessed CV:', {
    yearsExperience,
    yearsConfidence,
    domainExperience,
    expectedSeniority,
  });

  // Use structured AI signals if available, fallback to string parsing
  const signals = response.aiSignals;
  console.log('[alignmentMapper] Signals:', signals);
  
  // Map seniority with context from signals or fallback
  const seniorityMatch = signals?.seniorityMatch ?? (response.explanation?.summary ? 'match' : 'below');
  const seniority = mapSeniorityMatch(seniorityMatch as any, yearsExperience, expectedSeniority);

  // Group requirements using structured data
  const requirements = groupRequirements(
    signals?.hardSkillsDetected || [],
    signals?.softSkillsEvidence || [],
    signals?.mandatoryRequirementsMet || [],
    signals?.mandatoryRequirementsMissing || [],
    signals?.desirableRequirementsMet || [],
    signals?.desirableRequirementsMissing || []
  );

  console.log('[alignmentMapper] Grouped requirements:', {
    mandatoryMet: requirements.mandatory.met.length,
    mandatoryMissing: requirements.mandatory.missing.length,
    desirableMet: requirements.desirable.met.length,
    desirableMissing: requirements.desirable.missing.length,
  });

  // Map detected domains
  const detectedDomains = mapDetectedDomains(domainExperience);

  // Normalize red flags from signals
  const redFlags = normalizeRedFlags(signals?.redFlags || []);

  // Determine empty states
  const hasAnyMissingMandatory =
    (requirements.mandatory.missing?.length ?? 0) > 0;
  const hasRedFlags = redFlags.length > 0;
  const hasDetectedDomains = detectedDomains.length > 0;

  // CRITICAL: Use only validated skills from signals
  // NO fallback to response.strengths or response.gaps
  const hardSkills = getValidatedHardSkills(signals, response);
  const softSkills = getValidatedSoftSkills(signals);

  console.log('[alignmentMapper] Final skills and domains:', {
    hardSkillsCount: hardSkills.length,
    softSkillsCount: softSkills.length,
    detectedDomainsCount: detectedDomains.length,
    redFlagsCount: redFlags.length,
  });

  return {
    // Core metadata
    fitScore: response.fitScore,
    decision: response.decision,
    detectedLanguage: response.detectedLanguage ?? 'en',

    // Seniority information
    seniority,

    // Requirements
    requirements,

    // Skills - use structured data from signals
    hardSkills,
    softSkills,

    // Domain experience
    detectedDomains,

    // Red flags
    redFlags,

    // Messages
    recruiterMessage: response.recruiterMessage || '',
    coverLetter: response.coverLetter || '',

    // Preprocessed data
    yearsExperience,
    yearsConfidence,
    cvSuggestions: response.cvSuggestions || [],

    // Empty states indicators
    hasAnyMissingMandatory,
    hasRedFlags,
    hasDetectedDomains,
  };
}

/**
 * Overload for better TypeScript support
 * Allows mapping with optional defaults
 */
export function mapWithDefaults(
  response: Partial<AnalysisResult>
): AlignmentUIModel {
  const defaultResponse: AnalysisResult = {
    fitScore: 0,
    decision: 'skip',
    strengths: [],
    gaps: [],
    cvSuggestions: [],
    recruiterMessage: '',
    coverLetter: '',
    detectedLanguage: 'en',
  };

  return mapAlignmentResponseToUIModel({
    ...defaultResponse,
    ...response,
  });
}

/**
 * Export for testing: Allows test suites to validate skill extraction
 * @internal - DO NOT USE IN PRODUCTION
 */
export const __testing__ = {
  getValidatedHardSkills,
  getValidatedSoftSkills,
};

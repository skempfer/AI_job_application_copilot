/**
 * Development-only integrity check for technical skills
 *
 * This utility ensures that no skill injection or inference happens
 * through undetected requirement analysis or other sources.
 *
 * ONLY runs in development mode - zero overhead in production
 */

import type { AnalysisResult, AlignmentUIModel } from '../../types/analysis';

interface IntegrityCheckResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
}

/**
 * Validates that all displayed skills came from aiSignals.hardSkillsDetected
 *
 * Throws error in development if:
 * - A skill in UI doesn't exist in aiSignals
 * - Skills came from response.strengths fallback
 * - requirement parsing added skills implicitly
 *
 * @param uiModel - The UI model being rendered
 * @param response - The raw API response
 * @returns Validation result with any warnings/errors
 * @throws Error in development if integrity is violated
 */
export function validateSkillsIntegrity(
  uiModel: AlignmentUIModel,
  response: AnalysisResult
): IntegrityCheckResult {
  const result: IntegrityCheckResult = {
    isValid: true,
    warnings: [],
    errors: [],
  };

  // PRODUCTION: Skip validation entirely
  if (process.env.NODE_ENV !== 'development') {
    return result;
  }

  const signals = response.aiSignals;
  if (!signals) {
    // No signals available - UI should be empty of skills
    if ((uiModel.hardSkills?.length ?? 0) > 0 || (uiModel.softSkills?.length ?? 0) > 0) {
      result.isValid = false;
      result.errors.push(
        'CRITICAL: Skills detected in UI but aiSignals is missing. ' +
        'Skills must come ONLY from aiSignals.hardSkillsDetected. ' +
        'Current hardSkills: ' + JSON.stringify(uiModel.hardSkills)
      );
    }
    return result;
  }

  // HARD SKILLS VALIDATION
  const validatedHardSkills = new Set(
    (signals.hardSkillsDetected || [])
      .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
      .map((s) => s.trim())
  );

  if (uiModel.hardSkills?.length > 0) {
    for (const displayedSkill of uiModel.hardSkills) {
      if (!validatedHardSkills.has(displayedSkill)) {
        result.isValid = false;
        result.errors.push(
          `CRITICAL: Skill "${displayedSkill}" displayed in UI but NOT in aiSignals.hardSkillsDetected. ` +
          `Valid skills: ${JSON.stringify(Array.from(validatedHardSkills))}. ` +
          `This indicates skill inference or fallback to response.strengths happened unexpectedly.`
        );
      }
    }
  }

  // SOFT SKILLS VALIDATION
  const validatedSoftSkills = new Set(
    (signals.softSkillsEvidence || [])
      .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
      .map((s) => s.trim())
  );

  if (uiModel.softSkills?.length > 0) {
    for (const displayedSkill of uiModel.softSkills) {
      if (!validatedSoftSkills.has(displayedSkill)) {
        result.isValid = false;
        result.errors.push(
          `CRITICAL: Soft skill "${displayedSkill}" displayed in UI but NOT in aiSignals.softSkillsEvidence. ` +
          `Valid soft skills: ${JSON.stringify(Array.from(validatedSoftSkills))}. ` +
          `This indicates skill inference happened unexpectedly.`
        );
      }
    }
  }

  // CHECK: If response.strengths exist but weren't used
  if (
    response.strengths?.length > 0 &&
    validatedHardSkills.size > 0 &&
    JSON.stringify(response.strengths) !== JSON.stringify(Array.from(validatedHardSkills))
  ) {
    result.warnings.push(
      'NOTE: response.strengths contains values that differ from signals.hardSkillsDetected. ' +
      'This is expected - we use signals exclusively. response.strengths is ignored by design.'
    );
  }

  // CHECK: Suspicious patterns that indicate inference
  const allRequirements = [
    ...(signals.mandatoryRequirementsMet || []),
    ...(signals.mandatoryRequirementsMissing || []),
    ...(signals.desirableRequirementsMet || []),
    ...(signals.desirableRequirementsMissing || []),
  ];

  const suspiciousPatterns = [
    /react\s+or\s+react\s+native/i,
    /\.net\s+or\s+csharp/i,
    /\bor\b.*\b(and|,)/i,
  ];

  for (const requirement of allRequirements) {
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(requirement)) {
        // Check if ANY part of this requirement escaped into skills
        for (const skill of uiModel.hardSkills || []) {
          const requirementParts = requirement.split(/\s+or\s+/i).map((p) => p.trim().toLowerCase());
          if (requirementParts.some((part) => skill.toLowerCase().includes(part))) {
            result.warnings.push(
              `CAUTION: Skill "${skill}" matches part of requirement "${requirement}". ` +
              `Ensure this skill was explicitly detected by AI, not inferred from requirement text.`
            );
          }
        }
      }
    }
  }

  // THROW in development if critical errors found
  if (!result.isValid && result.errors.length > 0) {
    const errorMessages = result.errors.join('\n\n');
    throw new Error(`[SkillsIntegrityError] ${errorMessages}`);
  }

  return result;
}

/**
 * Log development warnings without throwing
 * Use this to track suspicious patterns that don't yet fail validation
 *
 * @param result - Validation result from validateSkillsIntegrity
 */
export function logIntegrityWarnings(result: IntegrityCheckResult): void {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  if (result.warnings.length > 0) {
    console.warn('[SkillsIntegrity] Development Warnings:', result.warnings);
  }

  if (result.errors.length > 0) {
    console.error('[SkillsIntegrity] Development Errors:', result.errors);
  }
}

/**
 * Type guard: Ensure response has required signals
 */
export function hasValidSignals(response: AnalysisResult): boolean {
  return Boolean(
    response.aiSignals &&
      Array.isArray(response.aiSignals.hardSkillsDetected) &&
      Array.isArray(response.aiSignals.softSkillsEvidence)
  );
}

/**
 * Optimized prompt builder
 * 
 * Receives structured, preprocessed data and builds a clear, token-efficient prompt.
 * 
 * ARCHITECTURE:
 * - System prompt (systemPrompt.ts) = Invariant rules
 * - User prompt (this module) = Task-specific data and instructions
 * 
 * RESPONSIBILITIES:
 * - Structure candidate and role data
 * - Define analysis algorithm
 * - Specify output format with examples
 * - Provide writing guidelines for text generation
 * 
 * Does NOT duplicate system-level rules (handled by SYSTEM_PROMPT).
 */

import type { ProcessedCV, ProcessedJobDescription } from "./preprocessing.js";

const PROMPT_VERSION = "v2.0-optimized";

/**
 * Language labels for prompt
 */
const LANGUAGE_LABELS = {
  pt: "Portuguese",
  en: "English",
} as const;

/**
 * Build the candidate profile section with preprocessed CV data
 */
function buildCandidateProfileSection(processedCV: ProcessedCV): string {
  return `STRUCTURED CANDIDATE PROFILE (JSON):
${JSON.stringify(
  {
    skills: processedCV.skills,
    seniority: processedCV.seniority,
    experienceBySkill: processedCV.experienceBySkill,
    companies: processedCV.companies,
    achievements: processedCV.achievements,
    yearsTotal: processedCV.yearsTotal,
  },
  null,
  2
)}`;
}

/**
 * Build the deterministic signals section
 * These values were extracted algorithmically and should NOT be recalculated
 */
function buildDeterministicSignalsSection(processedCV: ProcessedCV): string {
  return `DETERMINISTICALLY EXTRACTED SIGNALS (JSON):
${JSON.stringify(
  {
    yearsExperience: processedCV.yearsExperience,
    yearsExperienceConfidence: processedCV.yearsExperienceConfidence,
    domainExperience: processedCV.domainExperience,
  },
  null,
  2
)}`;
}

/**
 * Build the structured role section with job requirements
 */
function buildStructuredRoleSection(processedJob: ProcessedJobDescription): string {
  return `STRUCTURED ROLE (JSON):
${JSON.stringify(
  {
    mandatoryRequirements: processedJob.mandatoryRequirements,
    desirableRequirements: processedJob.desirableRequirements,
    seniorityLevel: processedJob.seniorityLevel,
    mainResponsibilities: processedJob.mainResponsibilities,
    techStack: processedJob.techStack,
  },
  null,
  2
)}`;
}

/**
 * Build the analysis algorithm section
 * Defines step-by-step how the AI should perform the analysis
 */
function buildAnalysisAlgorithmSection(): string {
  return `ANALYSIS ALGORITHM:
1. Extract years-of-experience requirement from mandatoryRequirements
2. Compare with yearsExperience from DETERMINISTICALLY EXTRACTED SIGNALS:
   - If candidate years < required → seniorityMatch = "below"
   - If aligned → seniorityMatch = "match"
   - If clearly overqualified → seniorityMatch = "above"
3. Compare candidate skills with mandatory and desirable requirements
4. Compare domainExperience with role requirements
5. Identify missing mandatory items and flag in redFlags
6. If mandatoryRequirements is empty, do NOT add missing requirements or redFlags about missing requirements
7. If yearsExperience is null, do NOT add redFlags about missing years/yearsTotal`;
}

/**
 * Build the writing rules section for text generation
 * Guidelines for recruiterMessage and coverLetter
 */
function buildWritingRulesSection(): string {
  return `WRITING RULES (for recruiterMessage and coverLetter):
- Use first person ("I")
- Natural, professional tone
- Specific examples from candidate data
- Plain text only
- Cover letter: 3-4 paragraphs, max 500 words:
  1. Context and role alignment
  2. Technical skills alignment
  3. Strategic differentiator and ownership
  4. Closing invitation`;
}

/**
 * Build the required output format section
 * Provides the exact JSON structure expected
 */
function buildOutputFormatSection(processedCV: ProcessedCV): string {
  return `REQUIRED OUTPUT FORMAT:
{
  "hardSkillsDetected": [],
  "softSkillsEvidence": [],
  "mandatoryRequirementsMet": [],
  "mandatoryRequirementsMissing": [],
  "desirableRequirementsMet": [],
  "desirableRequirementsMissing": [],
  "seniorityMatch": "match",
  "redFlags": [],
  "recruiterMessage": "",
  "coverLetter": "",
  "detectedYearsExperience": ${processedCV.yearsExperience},
  "detectedDomainExperience": ${JSON.stringify(processedCV.domainExperience, null, 2)}
}`;
}

/**
 * Build an optimized prompt using structured data
 *
 * @param processedCV - Preprocessed candidate CV with extracted signals
 * @param processedJob - Preprocessed job description with requirements
 * @param language - Target language for generated text (pt or en)
 * @returns Structured prompt for AI analysis
 */
export function buildOptimizedPrompt(
  processedCV: ProcessedCV,
  processedJob: ProcessedJobDescription,
  language: "pt" | "en"
): string {
  const sections = [
    `PROMPT VERSION: ${PROMPT_VERSION}`,
    '',
    'OBJECTIVE:',
    'Perform a structured alignment analysis between the candidate profile and the role.',
    '',
    `LANGUAGE:`,
    LANGUAGE_LABELS[language],
    '',
    buildCandidateProfileSection(processedCV),
    '',
    buildDeterministicSignalsSection(processedCV),
    '',
    buildStructuredRoleSection(processedJob),
    '',
    buildAnalysisAlgorithmSection(),
    '',
    buildWritingRulesSection(),
    '',
    buildOutputFormatSection(processedCV),
  ];

  return sections.join('\n');
}

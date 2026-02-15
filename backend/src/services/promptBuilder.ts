/**
 * Optimized prompt builder
 * Receives structured data instead of raw text
 * Goal: Reduce tokens and improve analysis quality
 */

import type { ProcessedCV, ProcessedJobDescription } from "./preprocessing.js";

const PROMPT_VERSION = "v2.0-optimized";

/**
 * Build an optimized prompt using structured data
 *
 * Input: CV and Job Description already preprocessed
 * Output: Compact, well-structured prompt
 */
export function buildOptimizedPrompt(
  processedCV: ProcessedCV,
  processedJob: ProcessedJobDescription,
  language: "pt" | "en"
): string {
  const isPt = language === "pt";

  return `PROMPT VERSION: ${PROMPT_VERSION}

OBJECTIVE:
Perform a structured alignment analysis between the candidate profile and the role.
Do NOT calculate any score.

LANGUAGE:
${isPt ? "Portuguese" : "English"}

STRUCTURED CANDIDATE PROFILE (JSON):
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
)}

DETERMINISTICALLY EXTRACTED SIGNALS (JSON):
${JSON.stringify(
  {
    yearsExperience: processedCV.yearsExperience,
    yearsExperienceConfidence: processedCV.yearsExperienceConfidence,
    domainExperience: processedCV.domainExperience,
  },
  null,
  2
)}

STRUCTURED ROLE (JSON):
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
)}

ANALYSIS ALGORITHM:
1. Extract years-of-experience requirement from mandatoryRequirements.
2. Compare with yearsExperience.
   - If candidate years < required -> seniorityMatch = "below".
   - If aligned -> seniorityMatch = "match".
   - If clearly overqualified -> seniorityMatch = "above".
3. Compare candidate skills with mandatory and desirable requirements.
4. Compare domainExperience with role requirements.
5. Identify missing mandatory items as redFlags.

WRITING RULES (for recruiterMessage and coverLetter):
- First person only ("I").
- Natural professional tone.
- No generic buzzwords.
- No fabricated metrics.
- Plain text only.
- Cover letter: max 500 words.
- 3-4 paragraphs:
  1. Context alignment.
  2. Technical alignment.
  3. Strategic differentiator + ownership.
  4. Closing invitation.

REQUIRED OUTPUT FORMAT:
Return ONLY valid JSON with this exact structure:

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
}
`;
}

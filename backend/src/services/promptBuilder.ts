/**
 * Optimized prompt builder
 * 
 * Receives FULL CV and job description texts + structured preprocessing data
 * and builds a clear, comprehensive prompt for deep analysis.
 * 
 * ARCHITECTURE:
 * - System prompt (systemPrompt.ts) = Invariant rules + anti-hallucination instructions
 * - User prompt (this module) = Full context + structured signals + analysis instructions
 * 
 * RESPONSIBILITIES:
 * - Provide FULL CV text (no truncation)
 * - Provide FULL job description text (no truncation)
 * - Provide structured preprocessing signals as reference
 * - Define analysis algorithm
 * - Specify output format with examples
 * - Provide writing guidelines for text generation
 * 
 * Does NOT duplicate system-level rules (handled by SYSTEM_PROMPT).
 */

import type { ProcessedCV, ProcessedJobDescription } from "./preprocessing.js";

const PROMPT_VERSION = "v3.0-full-context";

/**
 * Language labels for prompt
 */
const LANGUAGE_LABELS = {
  pt: "Portuguese",
  en: "English",
} as const;

/**
 * Build an optimized prompt using FULL context + structured signals
 *
 * @param fullCVText - FULL CV text (no truncation)
 * @param fullJobText - FULL job description text (no truncation)
 * @param processedCV - Preprocessed candidate CV with extracted signals
 * @param processedJob - Preprocessed job description with requirements
 * @param uiLanguage - Language for analysis fields (fitScore explanation, strengths, gaps, cvSuggestions)
 * @param jobLanguage - Language for recruiterMessage and coverLetter (defaults to uiLanguage if not provided)
 * @returns Structured prompt for AI analysis with full context
 */
export function buildOptimizedPrompt(
  fullCVText: string,
  fullJobText: string,
  processedCV: ProcessedCV,
  processedJob: ProcessedJobDescription,
  uiLanguage: "pt" | "en",
  jobLanguage?: "pt" | "en"
): string {
  const effectiveJobLanguage = jobLanguage || uiLanguage;
  const sections = [
    `PROMPT VERSION: ${PROMPT_VERSION}`,
    '',
    'OBJECTIVE:',
    'Perform deep alignment analysis between candidate and role using FULL context.',
    '',
    '=== LANGUAGE ROUTING ===',
    `UI LANGUAGE (for analysis fields): ${LANGUAGE_LABELS[uiLanguage]}`,
    `JOB LANGUAGE (for recruiterMessage and coverLetter): ${LANGUAGE_LABELS[effectiveJobLanguage]}`,
    '',
    'CRITICAL LANGUAGE RULES:',
    '- Write ALL analysis fields in UI LANGUAGE:',
    '  * fitScore explanation',
    '  * strengths',
    '  * gaps',
    '  * cvSuggestions',
    '  * explanation summary',
    '- Write recruiterMessage and coverLetter in JOB LANGUAGE',
    '- NEVER mix languages within a single field',
    '- Do NOT auto-detect language - use the specified languages above',
    '',
    '=== FULL CANDIDATE CV (COMPLETE TEXT) ===',
    fullCVText,
    '',
    '=== FULL JOB DESCRIPTION (COMPLETE TEXT) ===',
    fullJobText,
    '',
    '=== PREPROCESSED STRUCTURED SIGNALS (REFERENCE ONLY) ===',
    'These signals were extracted algorithmically. Use as reference, NOT as definitive truth.',
    'Always validate against the full CV text above.',
    '',
    'Detected Skills:',
    JSON.stringify(processedCV.skills, null, 2),
    '',
    'Detected Seniority Level:',
    processedCV.seniority,
    '',
    'Approximate TOTAL Years of Professional Tech Experience:',
    processedCV.yearsExperience !== null ? String(processedCV.yearsExperience) : 'null (insufficient data)',
    `Confidence: ${processedCV.yearsExperienceConfidence}`,
    '',
    'Domain Experience Flags:',
    JSON.stringify(processedCV.domainExperience, null, 2),
    '',
    'Companies Mentioned:',
    JSON.stringify(processedCV.companies, null, 2),
    '',
    'Key Achievements:',
    JSON.stringify(processedCV.achievements, null, 2),
    '',
    'Job Requirements (Extracted):',
    JSON.stringify({
      mandatory: processedJob.mandatoryRequirements,
      desirable: processedJob.desirableRequirements,
      techStack: processedJob.techStack,
      seniority: processedJob.seniorityLevel,
    }, null, 2),
    '',
    '=== ANALYSIS INSTRUCTIONS ===',
    '',
    '1. YEARS OF EXPERIENCE:',
    '   - Use the TOTAL years from preprocessed signals as a REFERENCE ONLY',
    '   - Independently estimate experience depth PER TECHNOLOGY from CV timeline',
    '   - Look for date ranges, project timelines, employment history',
    '   - State UNCERTAINTY when specific technology duration cannot be inferred',
    '   - NEVER assume years per tech unless explicitly supported by CV evidence',
    '',
    '2. SKILLS MATCHING:',
    '   - Match candidate skills against job requirements using FULL CV text',
    '   - Look for synonyms, related technologies, transferable skills',
    '   - Distinguish between "mentioned once" vs "deep expertise" based on context',
    '   - Only list skills with CV evidence (projects, job descriptions, achievements)',
    '',
    '3. REQUIREMENTS ANALYSIS:',
    '   - Classify each requirement as met/missing based on CV evidence',
    '   - For "missing" items, verify they are truly absent (not synonym/equivalent)',
    '   - If job requirements are empty, do NOT fabricate missing requirements',
    '',
    '4. RED FLAGS:',
    '   - Only flag REAL inconsistencies visible in the CV',
    '   - Do NOT flag "missing data" if preprocessed signals show null/low confidence',
    '   - Do NOT recalculate preprocessed signals',
    '',
    '5. SENIORITY ASSESSMENT:',
    '   - Compare job seniority requirement with candidate level',
    '   - Consider: years of experience, role titles, leadership indicators',
    '   - Output: "above", "match", or "below"',
    '',
    '6. TEXT GENERATION (recruiterMessage and coverLetter):',
    '   - Use first person ("I")',
    '   - Professional, natural tone',
    '   - Cite specific examples from CV',
    '   - Cover letter: 3-4 paragraphs, max 500 words',
    '',
    '=== CRITICAL ANTI-HALLUCINATION RULES ===',
    '',
    '- ONLY use information explicitly present in the CV text',
    '- NEVER invent experience, certifications, projects, or skills',
    '- NEVER assume specific years per technology without timeline evidence',
    '- State "insufficient data" or express uncertainty when evidence is weak',
    '- Validate all claims against CV before including them',
    '',
    '=== REQUIRED OUTPUT FORMAT (JSON ONLY) ===',
    '{',
    '  "hardSkillsDetected": ["skill1", "skill2"],',
    '  "softSkillsEvidence": ["evidence1"],',
    '  "mandatoryRequirementsMet": ["req1"],',
    '  "mandatoryRequirementsMissing": ["req2"],',
    '  "desirableRequirementsMet": ["req3"],',
    '  "desirableRequirementsMissing": ["req4"],',
    '  "seniorityMatch": "match",',
    '  "redFlags": ["flag1"],',
    '  "recruiterMessage": "...",',
    '  "coverLetter": "...",',
    `  "detectedYearsExperience": ${processedCV.yearsExperience},`,
    `  "detectedDomainExperience": ${JSON.stringify(processedCV.domainExperience)}`,
    '}',
  ];

  return sections.join('\n');
}

/**
 * Calculate approximate token count for monitoring
 * Uses rough heuristic: 1 token ≈ 4 characters
 */
export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

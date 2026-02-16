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
  uiLanguage: "pt" | "en",
  jobLanguage?: "pt" | "en"
): string {
  const isPt = uiLanguage === "pt";
  const effectiveJobLanguage = jobLanguage || uiLanguage;
  const isJobPt = effectiveJobLanguage === "pt";

  const cvSummary = formatCVSummary(processedCV, isPt);

  const jobSummary = formatJobSummary(processedJob, isPt);

  return `You are an experienced senior tech recruiter. Analyze the candidate's structured profile against the structured role.

**PROMPT VERSION:** ${PROMPT_VERSION}

**YOUR TASK:** Extract structured signals (do NOT calculate score).

**LANGUAGE ROUTING:**
- UI LANGUAGE (for analysis fields): ${isPt ? "Portuguese" : "English"}
- JOB LANGUAGE (for recruiterMessage and coverLetter): ${isJobPt ? "Portuguese" : "English"}

**CRITICAL LANGUAGE RULES:**
- Write ALL analysis fields in UI LANGUAGE:
  * fitScore explanation
  * strengths
  * gaps
  * cvSuggestions
  * explanation summary
- Write recruiterMessage and coverLetter in JOB LANGUAGE
- NEVER mix languages within a single field
- Do NOT auto-detect language - use the specified languages above

**STRUCTURED CANDIDATE PROFILE:**
${cvSummary}

**STRUCTURED ROLE:**
${jobSummary}

**SIGNALS TO EXTRACT:**

1. **hardSkillsDetected**: Hard skills from the profile that are RELEVANT to the role
2. **softSkillsEvidence**: Evidence of soft skills (leadership, communication, ownership, etc.)
3. **mandatoryRequirementsMet**: Mandatory requirements the candidate MEETS
4. **mandatoryRequirementsMissing**: Mandatory requirements the candidate DOES NOT MEET
5. **desirableRequirementsMet**: Desired requirements the candidate HAS
6. **desirableRequirementsMissing**: Desired requirements the candidate DOES NOT HAVE
7. **seniorityMatch**: "above" (overqualified), "match" (ideal), or "below" (underqualified)
8. **redFlags**: Critical issues (e.g., missing minimum experience, missing mandatory skill, too junior/senior)
9. **recruiterMessage**: Short LinkedIn-style outreach message sent after submitting the application
10. **coverLetter**: Formal cover letter (3-5 paragraphs, 400-500 words)

**CRITERIA:**

🎯 STRUCTURED ANALYSIS

The analysis must be based ONLY on the structured data provided:
- Candidate skills
- Estimated seniority
- Key achievements
- Role responsibilities
- Mandatory vs desirable requirements

📌 LANGUAGE AND TONE

1️⃣ Perspective
- Always write in FIRST PERSON in recruiterMessage and coverLetter
- Never use third person
- Never refer to "the candidate"

2️⃣ Greeting and Closing
- Cover letter only: start with a natural professional greeting ("Hello," / "Hi [Name],")
- Cover letter only: end with a clear invitation to talk + simple farewell

3️⃣ Natural Language
- No empty cliches ("dynamic environment", "cutting-edge technology")
- No generic buzzwords
- Prioritize concrete, intentional language
- Tone of someone experienced, not trying to impress

🛡️ ANTI-HALLUCINATION SAFETY (CRITICAL):

⛔ ABSOLUTELY FORBIDDEN:
- Invent skills, technologies, or experiences not listed in the profile
- Fabricate metrics, percentages, or undocumented results
- Mention companies or projects not listed in achievements
- Infer years of experience beyond what is estimated
- Infer scale (e.g., "millions of users") unless explicitly stated
- Invent responsibilities, metrics, or impact not documented
- Assume technology proficiency without evidence
- Reuse phrases from the job description
- Paraphrase company marketing language
- Restate the company mission

✅ GOLDEN RULE:
"If it is not in the structured data provided, DO NOT MENTION IT."

**RECRUITER MESSAGE RULES (MANDATORY):**

Purpose:
- Short LinkedIn-style outreach message sent AFTER submitting the application
- Not a CV summary, not a cover letter, not a job description paraphrase

Structure (max 3 sentences):
1) Context: mention the application was submitted
2) One concise relevant signal (experience, domain, or alignment)
3) Simple, neutral call-to-action (e.g., happy to connect)

Constraints:
- Maximum ~300 characters
- No enthusiasm cliches (avoid: "excited", "thrilled", "delighted")
- No generic self-descriptions (avoid: "I'm a senior full-stack engineer with 5+ years...")
- Do not restate years of experience unless directly relevant
- Do not repeat job description phrases
- Do not mention company mission statements
- No exaggeration, no invented details
- Tone: concise, professional, natural, direct, calm, confident, conversational
- Must follow JOB LANGUAGE
- Never mix languages

**WRITING CONSTRAINTS (coverLetter):**

⛔ FORBIDDEN CLICHÉ PHRASES:
- "I am excited to apply"
- "I am thrilled"
- "I am confident that"
- "I look forward to discussing"
- "would be a great fit"
- Emotional exaggeration
- Generic buzzwords
- Flattery

✅ WRITING GUIDELINES:
- Focus strictly on candidate evidence from profile
- Keep tone concise, professional, and human
- No excessive enthusiasm
- Be specific and fact-based
- Sound like a real professional, not AI-generated

**PRE-WRITING CHECKLIST:**
1. Is every mentioned skill in hardSkillsDetected?
2. Is every mentioned achievement in the list?
3. Am I fabricating metrics or percentages?
4. Is the tone honest and realistic?
5. Did I avoid all forbidden cliché phrases?
6. Am I using job language for recruiterMessage and coverLetter?
7. Did I avoid copying job description phrases?

**REQUIRED COVER LETTER STRUCTURE (3-5 paragraphs, 400-500 words):**

📍 Paragraph 1 — Strategic Opening:
- Natural professional greeting
- Direct reference to the main challenge/responsibility of the role
- Quick connection to relevant skills from the profile
- Demonstrate understanding of the context

📍 Paragraphs 2-3 — Technical Alignment:
- Connect mandatory hard skills to real experience
- Demonstrate concrete impact through achievements
- If gaps exist: ACKNOWLEDGE WITH MATURITY
- Focus on learning capacity and rapid adaptation
- Mention relevant architectures, stacks, or projects

📍 Paragraph 3-4 — Strategic Differentiator:
- How YOU SOLVE the company's specific problem
- Talk about ownership and personal responsibility
- Effective collaboration and product vision
- Iterative mindset and continuous improvement
- Soft skills as differentiators (if relevant)

📍 Final Paragraph — Closing:
- Reinforce genuine interest
- Clear invitation to talk
- Simple farewell

MANDATORY CRITERIA:
✓ First person ("I"), NEVER third person
✓ Written in the specified message language
✓ Differentiate mandatory vs desirable requirements
✓ Be SPECIFIC — never vague
✓ No meta-commentary
✓ Maximum 500 words
✓ Plain text only, no markdown
✓ Forbidden generic phrases such as: "interested in", "profile fits", "dynamic environment"
✓ Confident, strategic, specific tone
✓ Sound manually written by an experienced professional

**RESPONSE FORMAT:**
Return ONLY valid JSON (no markdown, no extra explanations):

{
  "hardSkillsDetected": ["skill1", "skill2", ...],
  "softSkillsEvidence": ["evidence1", "evidence2", ...],
  "mandatoryRequirementsMet": ["req1", "req2", ...],
  "mandatoryRequirementsMissing": ["req1", "req2", ...],
  "desirableRequirementsMet": ["req1", "req2", ...],
  "desirableRequirementsMissing": ["req1", "req2", ...],
  "seniorityMatch": "match"|"above"|"below",
  "redFlags": ["flag1", "flag2", ...],
  "recruiterMessage": "plain text message",
  "coverLetter": "plain text cover letter, 3-5 paragraphs"
}`;
}

/**
 * Format structured CV for the prompt (compact and readable)
 */
function formatCVSummary(cv: ProcessedCV, isPt: boolean): string {
  const header = isPt ? "PROFILE SUMMARY:" : "PROFILE SUMMARY:";
  const seniorityLabel = isPt ? "Seniority" : "Seniority";
  const yearsLabel = isPt ? "Years of experience" : "Years of experience";
  const skillsLabel = isPt ? "Technical skills" : "Technical skills";
  const companiesLabel = isPt ? "Companies" : "Companies";
  const achievementsLabel = isPt ? "Key achievements" : "Key achievements";
  const experienceLabel = isPt ? "Experience by skill" : "Experience by skill";

  const experienceStr =
    Object.entries(cv.experienceBySkill).length > 0
      ? Object.entries(cv.experienceBySkill)
          .map(([skill, years]) => `  - ${skill}: ${years}Y`)
          .join("\n")
      : "  (Not detailed)";

  const companiesStr = cv.companies.length > 0 ? cv.companies.map((c) => `  - ${c}`).join("\n") : "  (None extracted)";

  const achievementsStr =
    cv.achievements.length > 0 ? cv.achievements.map((a) => `  - ${a}`).join("\n") : "  (None extracted)";

  return `${header}
${seniorityLabel}: ${cv.seniority}
${yearsLabel}: ${cv.yearsTotal}

${skillsLabel}:
${cv.skills.map((s) => `  - ${s}`).join("\n")}

${companiesLabel}:
${companiesStr}

${experienceLabel}:
${experienceStr}

${achievementsLabel}:
${achievementsStr}`;
}

/**
 * Format structured Job Description for the prompt
 */
function formatJobSummary(job: ProcessedJobDescription, isPt: boolean): string {
  const header = isPt ? "JOB SUMMARY:" : "JOB SUMMARY:";
  const seniorityLabel = isPt ? "Seniority level" : "Seniority level";
  const techStackLabel = isPt ? "Mentioned tech stack" : "Mentioned tech stack";
  const responsibilitiesLabel = isPt ? "Main responsibilities" : "Main responsibilities";
  const mandatoryLabel = isPt ? "MANDATORY requirements" : "MANDATORY requirements";
  const desirableLabel = isPt ? "DESIRABLE requirements" : "DESIRABLE requirements";

  const mandatoryStr = job.mandatoryRequirements
    .map((r) => `  - ${r}`)
    .join("\n");

  const desirableStr =
    job.desirableRequirements.length > 0
      ? job.desirableRequirements.map((r) => `  - ${r}`).join("\n")
      : "  (None extracted)";

  const responsibilitiesStr = job.mainResponsibilities
    .map((r) => `  - ${r}`)
    .join("\n");

  const techStackStr =
    job.techStack.length > 0
      ? job.techStack.map((t) => `  - ${t}`).join("\n")
      : "  (None mentioned)";

  return `${header}
${seniorityLabel}: ${job.seniorityLevel}

${techStackLabel}:
${techStackStr}

${mandatoryLabel}:
${mandatoryStr}

${desirableLabel}:
${desirableStr}

${responsibilitiesLabel}:
${responsibilitiesStr}`;
}

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

  const cvSummary = formatCVSummary(processedCV, isPt);

  const jobSummary = formatJobSummary(processedJob, isPt);

  return `You are an experienced senior tech recruiter. Analyze the candidate's structured profile against the structured role.

**PROMPT VERSION:** ${PROMPT_VERSION}

**YOUR TASK:** Extract structured signals (do NOT calculate score).

**STRUCTURED CANDIDATE PROFILE:**
${cvSummary}

✅ **IMPORTANT - USE THIS DATA:**
- Years of experience (DETECTED): ${processedCV.yearsExperience} years (confidence: ${processedCV.yearsExperienceConfidence})
- Detected domains: ${Object.entries(processedCV.domainExperience).filter(([_, v]) => v).map(([k]) => k).join(", ")}
- Seniority level (DETECTED): ${processedCV.seniority}

**STRUCTURED ROLE:**
${jobSummary}

**🔍 EXPERIENCE VALIDATION (CRITICAL):**
⚠️ The candidate has ${processedCV.yearsExperience} years of experience.
⚠️ Check MANDATORY requirements above for any years-of-experience requirement (e.g., "5+ years", "3 years minimum").
⚠️ Compare: Does candidate's ${processedCV.yearsExperience}Y meet the role's experience requirement?
⚠️ This comparison MUST influence seniorityMatch and redFlags.

**🔍 DOMAIN EXPERTISE VALIDATION (CRITICAL):**
⚠️ Detected domains in candidate profile: ${Object.entries(processedCV.domainExperience).filter(([_, v]) => v).map(([k]) => k).join(", ") || "none"}
⚠️ Check MANDATORY requirements for required domains/skills/tech stack.
⚠️ Check DESIRABLE requirements for bonus domains/skills.
⚠️ Compare: Which detected domains align with role requirements?
⚠️ Missing domain expertise = potential red flag for mandatory requirements.

**🔍 SKILLS VALIDATION (CRITICAL):**
⚠️ Candidate technical skills: ${processedCV.skills.slice(0, 10).join(", ")}${processedCV.skills.length > 10 ? "..." : ""}
⚠️ Compare with MANDATORY requirements (extract tech/tools mentioned).
⚠️ Compare with DESIRABLE requirements (extract bonus tech/tools).
⚠️ Skills match = MANDATORY requirements met. Skills mismatch = MANDATORY requirements missing.

**MESSAGE LANGUAGE:** ${isPt ? "Portuguese" : "English"}
Write recruiterMessage and coverLetter in the language above.

**SIGNALS TO EXTRACT:**

1. **hardSkillsDetected**: Hard skills from the profile that are RELEVANT to the role
2. **softSkillsEvidence**: Evidence of soft skills (leadership, communication, ownership, etc.)
3. **mandatoryRequirementsMet**: Mandatory requirements the candidate MEETS
4. **mandatoryRequirementsMissing**: Mandatory requirements the candidate DOES NOT MEET
5. **desirableRequirementsMet**: Desired requirements the candidate HAS
6. **desirableRequirementsMissing**: Desired requirements the candidate DOES NOT HAVE
7. **seniorityMatch**: "above" (overqualified), "match" (ideal), or "below" (underqualified)
   ⚠️ MUST consider: Candidate has ${processedCV.yearsExperience}Y, Role level is ${processedJob.seniorityLevel}
   ⚠️ Extract years requirement from MANDATORY requirements (e.g., "5+ years", "3-5 years")
   ⚠️ If candidate years < required years → "below"
   ⚠️ If candidate years >= required years AND seniority matches → "match"  
   ⚠️ If candidate years >> required years AND highly overqualified → "above"
8. **redFlags**: Critical issues (e.g., missing minimum experience, missing mandatory skill, too junior/senior)
9. **recruiterMessage**: Personalized strategic message (4-6 sentences) to send to a recruiter
10. **coverLetter**: Formal cover letter (3-5 paragraphs, 400-500 words)
11. **detectedYearsExperience**: CONFIRM the detected years of experience (${processedCV.yearsExperience} years). This is ALREADY EXTRACTED - DO NOT OVERRIDE unless there's clear evidence it's wrong.
12. **detectedDomainExperience**: CONFIRM the detected domain expertise. Return the confirmed domains (frontend, backend, fullstack, qa, devops, product)

**HOW TO USE THE VALIDATION DATA:**

🔗 **For mandatoryRequirementsMet:**
- Check if candidate has the required TECH: Do candidate skills match mandatory tech/tools listed?
- Check if candidate has the required DOMAIN: Do detected domains match role domain?
- Check if candidate has required EXPERIENCE: Is ${processedCV.yearsExperience}Y >= the role's years requirement?
- Only list requirements the candidate EXPLICITLY MEETS based on detected data.

🔗 **For mandatoryRequirementsMissing:**
- List TECH the candidate clearly does NOT have from the mandatory list.
- List DOMAINS the candidate clearly does NOT have from the mandatory list.
- List if ${processedCV.yearsExperience}Y < the role's years requirement (e.g., "5+ years experience required, only ${processedCV.yearsExperience} detected").
- Be specific: "Missing: React expertise" not "Missing: some skills".

🔗 **For desirableRequirementsMet:**
- Check bonus TECH: Do candidate skills include any desirable technologies?
- Check bonus DOMAINS: Do detected domains include any desirable specializations?
- Only list desirable items the candidate HAS.

🔗 **For desirableRequirementsMissing:**
- List TECH bonuses the candidate doesn't have.
- List DOMAIN bonuses the candidate doesn't have.

**CRITERIA:**

🎯 STRUCTURED ANALYSIS

The analysis must be based ONLY on the structured data provided:
- Candidate skills
- Estimated seniority
- Key achievements
- Role responsibilities
- Mandatory vs desirable requirements
- ✏️ **YEARS OF EXPERIENCE (${processedCV.yearsExperience} years) - ALREADY EXTRACTED AND VERIFIED**
- ✏️ **DOMAIN EXPERTISE (${Object.entries(processedCV.domainExperience).filter(([_, v]) => v).map(([k]) => k).join(", ")}) - ALREADY DETECTED**

**CRITICAL FOR THESE FIELDS:**
The years of experience (${processedCV.yearsExperience}) and domain expertise have been DETERMINISTICALLY extracted using specialized algorithms.
Your job is to CONFIRM these values or FLAG if they appear incorrect.
DO NOT CALCULATE OR INVENT NEW VALUES - use the provided detectedYearsExperience and detectedDomainExperience.

📌 LANGUAGE AND TONE

1️⃣ Perspective
- Always write in FIRST PERSON in recruiterMessage and coverLetter
- Never use third person
- Never refer to "the candidate"

2️⃣ Greeting and Closing
- Start with a natural professional greeting ("Hello," / "Hi [Name],")
- End with a clear invitation to talk + simple farewell

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

✅ GOLDEN RULE:
"If it is not in the structured data provided, DO NOT MENTION IT."

**PRE-WRITING CHECKLIST:**
1. Is every mentioned skill in hardSkillsDetected?
2. Is every mentioned achievement in the list?
3. Am I fabricating metrics or percentages?
4. Is the tone honest and realistic?

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
  "coverLetter": "plain text cover letter, 3-5 paragraphs",
  "detectedYearsExperience": ${processedCV.yearsExperience},
  "detectedDomainExperience": {
    "frontend": ${processedCV.domainExperience.frontend},
    "backend": ${processedCV.domainExperience.backend},
    "fullstack": ${processedCV.domainExperience.fullstack},
    "qa": ${processedCV.domainExperience.qa},
    "devops": ${processedCV.domainExperience.devops},
    "product": ${processedCV.domainExperience.product}
  }
}
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

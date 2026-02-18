import { z } from 'zod';

const DomainExperienceSchema = z.object({
  frontend: z.boolean(),
  backend: z.boolean(),
  fullstack: z.boolean(),
  qa: z.boolean(),
  devops: z.boolean(),
  product: z.boolean(),
});

export const AISignalsSchema = z.object({
  hardSkillsDetected: z.array(z.string()).describe('Technical skills identified in CV'),
  softSkillsEvidence: z.array(z.string()).describe('Soft skills and non-technical strengths'),
  mandatoryRequirementsMet: z.array(z.string()).describe('Mandatory requirements satisfied by candidate'),
  mandatoryRequirementsMissing: z.array(z.string()).describe('Mandatory requirements NOT met by candidate'),
  desirableRequirementsMet: z.array(z.string()).describe('Desirable/nice-to-have requirements met'),
  desirableRequirementsMissing: z.array(z.string()).describe('Desirable/nice-to-have requirements NOT met'),
  seniorityMatch: z.enum(['above', 'match', 'below']).describe('Seniority level alignment'),
  redFlags: z.array(z.string()).describe('Concerns, inconsistencies, or gaps that should be addressed'),
  recruiterMessage: z.string().min(1).describe('Message to send to recruiter about fit'),
  coverLetter: z.string().min(1).describe('Generated cover letter draft'),

  detectedYearsExperience: z.number().nullable().optional().describe('Extracted years of experience'),
  detectedDomainExperience: DomainExperienceSchema.nullable().optional().describe('Detected domain areas'),
});

export type AISignalsValidated = z.infer<typeof AISignalsSchema>;

export class AIResponseValidationError extends Error {
  public readonly violations: z.ZodIssue[];
  public readonly receivedData: unknown;

  constructor(violations: z.ZodIssue[], receivedData: unknown) {
    const message = violations.map((v) => `${v.path.join('.')}: ${v.message}`).join('; ');
    super(`AI response validation failed: ${message}`);
    this.name = 'AIResponseValidationError';
    this.violations = violations;
    this.receivedData = receivedData;
  }
}

export function validateAIResponse(data: unknown): AISignalsValidated {
  try {
    return AISignalsSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AIResponseValidationError(error.issues, data);
    }
    throw error;
  }
}

export function validateAIResponseSafe(data: unknown):
  | { isValid: true; data: AISignalsValidated }
  | { isValid: false; error: AIResponseValidationError } {
  try {
    const validated = validateAIResponse(data);
    return { isValid: true, data: validated };
  } catch (error) {
    if (error instanceof AIResponseValidationError) {
      return { isValid: false, error };
    }
    throw error;
  }
}

export function getAISignalsSchemaDocumentation(): string {
  return `AI RESPONSE SCHEMA:

REQUIRED FIELDS:
- hardSkillsDetected: string[] (array of technical skills)
- softSkillsEvidence: string[] (array of soft skills and strengths)
- mandatoryRequirementsMet: string[] (requirements satisfied)
- mandatoryRequirementsMissing: string[] (requirements NOT met)
- desirableRequirementsMet: string[] (nice-to-haves satisfied)
- desirableRequirementsMissing: string[] (nice-to-haves NOT met)
- seniorityMatch: "above" | "match" | "below" (seniority alignment)
- redFlags: string[] (concerns and inconsistencies)
- recruiterMessage: string (non-empty message to recruiter)
- coverLetter: string (non-empty cover letter draft)

OPTIONAL FIELDS:
- detectedYearsExperience: number | null (extracted years of experience)
- detectedDomainExperience: object (domain area detection)
  - frontend: boolean
  - backend: boolean
  - fullstack: boolean
  - qa: boolean
  - devops: boolean
  - product: boolean`;
}

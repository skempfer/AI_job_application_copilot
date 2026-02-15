import OpenAI from "openai";
import type { AnalysisResult, AIServiceConfig, AISignals } from "../types/analysis.js";
import { calculateFitScore, generateExplanation, determineDecision } from "./scoring.js";
import { preprocessCV, preprocessJobDescription } from "./preprocessing.js";
import { buildOptimizedPrompt } from "./promptBuilder.js";
import { getErrorMessage } from "../i18n/index.js";

const SYSTEM_PROMPT = `Return ONLY valid JSON. No markdown. No extra text.
Use only the structured input provided.
Do NOT fabricate data or infer details not present.
Do NOT recalculate deterministic signals; if inconsistent, flag in redFlags.`;

export class AIService {
  private client: OpenAI;
  private model: string;

  constructor(config: AIServiceConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.apiUrl,
    });
    this.model = config.model;
  }

  async analyzeJobFit(cv: string, jobDescription: string, language: "pt" | "en" = "en"): Promise<AnalysisResult> {
    const processedCV = await preprocessCV(cv);

    const processedJob = await preprocessJobDescription(jobDescription);

    const prompt = await buildOptimizedPrompt(processedCV, processedJob, language);

    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error(getErrorMessage('aiEmptyResponse', language));
      }

      const cleanJson = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const signals = JSON.parse(cleanJson) as AISignals;

      this.validateSignals(signals, language);

      const fitScore = calculateFitScore(signals);
      
      const explanation = generateExplanation(signals, fitScore);
      
      const decision = determineDecision(fitScore);

      console.log("\n🔍 [aiService.analyzeJobFit] Preprocessing summary:");
      console.log({
        yearsExperience: processedCV.yearsExperience,
        yearsExperienceConfidence: processedCV.yearsExperienceConfidence,
        domainExperience: processedCV.domainExperience,
        seniority: processedCV.seniority,
        skillsCount: processedCV.skills.length,
      });

      const result: AnalysisResult = {
        fitScore,
        decision,
        strengths: [
          ...signals.hardSkillsDetected.map(s => `Hard skill: ${s}`),
          ...signals.mandatoryRequirementsMet.map(r => `Requirement met: ${r}`),
          ...signals.desirableRequirementsMet.map(d => `Bonus qualification: ${d}`),
        ],
        gaps: [
          ...signals.mandatoryRequirementsMissing.map(r => `Missing requirement: ${r}`),
          ...signals.desirableRequirementsMissing.map(d => `Missing bonus qualification: ${d}`),
          ...signals.redFlags,
        ],
        cvSuggestions: this.generateCVSuggestions(signals),
        recruiterMessage: signals.recruiterMessage,
        coverLetter: signals.coverLetter,
        explanation,
        promptVersion: "v2.0-optimized",
        detectedLanguage: language,
        preprocessedCV: {
          yearsExperience: processedCV.yearsExperience,
          yearsExperienceConfidence: processedCV.yearsExperienceConfidence,
          domainExperience: processedCV.domainExperience,
          seniority: processedCV.seniority,
          skills: processedCV.skills,
        },
      };

      return result;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(getErrorMessage('aiParsingFailed', language, { details: error.message }));
      }
      throw error;
    }
  }

  /**
   * Generate CV improvement suggestions based on signals
   */
  private generateCVSuggestions(signals: AISignals): string[] {
    const suggestions: string[] = [];

    if (signals.mandatoryRequirementsMissing.length > 0) {
      suggestions.push(
        `Highlight experience related to: ${signals.mandatoryRequirementsMissing.slice(0, 2).join(', ')}`
      );
    }

    if (signals.hardSkillsDetected.length < 3) {
      suggestions.push('Add more detail about your technical skills');
    }

    if (signals.seniorityMatch === 'below') {
      suggestions.push('Emphasize complex projects and technical leadership to demonstrate seniority');
    }

    if (signals.desirableRequirementsMissing.length > 0 && signals.desirableRequirementsMet.length > 0) {
      suggestions.push('Highlight your bonus qualifications near the top of the CV');
    }

    if (suggestions.length === 0) {
      suggestions.push('Your CV is well aligned. Just review formatting and clarity.');
    }

    return suggestions;
  }

  /**
  * Validate signals extracted by the AI
   */
  private validateSignals(signals: any, language: "pt" | "en" = "en"): asserts signals is AISignals {
    const required = [
      "hardSkillsDetected",
      "mandatoryRequirementsMet",
      "mandatoryRequirementsMissing",
      "desirableRequirementsMet",
      "desirableRequirementsMissing",
      "softSkillsEvidence",
      "seniorityMatch",
      "redFlags",
      "recruiterMessage",
      "coverLetter"
    ];
    
    const missing = required.filter((field) => !(field in signals));

    if (missing.length > 0) {
      throw new Error(getErrorMessage('aiInvalidResponse', language, { fields: missing.join(", ") }));
    }

    const arrayFields = [
      "hardSkillsDetected",
      "mandatoryRequirementsMet",
      "mandatoryRequirementsMissing",
      "desirableRequirementsMet",
      "desirableRequirementsMissing",
      "softSkillsEvidence",
      "redFlags"
    ];

    for (const field of arrayFields) {
      if (!Array.isArray(signals[field])) {
        throw new Error(getErrorMessage('aiInvalidArrayField', language, { field }));
      }
    }

    if (!["below", "match", "above"].includes(signals.seniorityMatch)) {
      throw new Error(getErrorMessage('aiInvalidSeniority', language));
    }

    if (typeof signals.recruiterMessage !== "string" || signals.recruiterMessage.length === 0) {
      throw new Error(getErrorMessage('aiInvalidRecruiterMessage', language));
    }

    if (typeof signals.coverLetter !== "string" || signals.coverLetter.length === 0) {
      throw new Error(getErrorMessage('aiInvalidCoverLetter', language));
    }
  }
}

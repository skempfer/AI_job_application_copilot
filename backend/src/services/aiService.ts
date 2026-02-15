import OpenAI from "openai";
import type { AnalysisResult, AIServiceConfig, AISignals } from "../types/analysis.js";
import { calculateFitScore, generateExplanation, determineDecision } from "./scoring.js";
import { preprocessCV, preprocessJobDescription } from "./preprocessing.js";
import { buildOptimizedPrompt } from "./promptBuilder.js";
import { SYSTEM_PROMPT } from "./systemPrompt.js";
import { validateAIResponse, AIResponseValidationError } from "./aiResponseSchema.js";
import { createAIServiceLogger, generateCorrelationId } from "./aiLogger.js";
import { getErrorMessage } from "../i18n/index.js";

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
    // Create correlation ID for tracing this request
    const correlationId = generateCorrelationId();
    const logger = createAIServiceLogger("analyzeJobFit", correlationId);

    logger.startTiming("full_analysis");
    logger.info("Starting job fit analysis", {
      language,
      cvLength: cv.length,
      jobDescriptionLength: jobDescription.length,
    });

    try {
      // Preprocessing phase
      logger.startTiming("preprocessing");
      const processedCV = await preprocessCV(cv);
      const processedJob = await preprocessJobDescription(jobDescription);
      const preprocessingDuration = logger.endTiming("preprocessing");

      logger.info("Preprocessing completed", {
        duration: `${preprocessingDuration.toFixed(2)}ms`,
        skillsCount: processedCV.skills.length,
        yearsExperience: processedCV.yearsExperience,
        mandatoryReqs: processedJob.mandatoryRequirements.length,
      });

      const prompt = await buildOptimizedPrompt(processedCV, processedJob, language);

      // API Request phase
      logger.startTiming("api_request");
      logger.logAPIRequest("openai", this.model, {
        promptLength: prompt.length,
      });

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
        temperature: 0.2,
        max_tokens: 1500,
      });

      const apiDuration = logger.endTiming("api_request");
      logger.debug("API response received", {
        duration: `${apiDuration.toFixed(2)}ms`,
        tokensUsed: completion.usage?.total_tokens,
        finishReason: completion.choices[0]?.finish_reason,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error(getErrorMessage('aiEmptyResponse', language));
      }

      // Parsing phase
      logger.startTiming("json_parsing");
      const cleanJson = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsedData = JSON.parse(cleanJson);
      const parsingDuration = logger.endTiming("json_parsing");

      logger.debug("JSON parsing completed", {
        duration: `${parsingDuration.toFixed(2)}ms`,
        jsonLength: cleanJson.length,
      });

      // Validation phase
      logger.startTiming("validation");
      const signals = validateAIResponse(parsedData);
      const validationDuration = logger.endTiming("validation");

      logger.logValidation(true, {
        duration: `${validationDuration.toFixed(2)}ms`,
        hardSkills: signals.hardSkillsDetected.length,
        missingRequirements: signals.mandatoryRequirementsMissing.length,
        redFlags: signals.redFlags.length,
      });

      // Scoring phase
      logger.startTiming("scoring");
      const fitScore = calculateFitScore(signals);
      const explanation = generateExplanation(signals, fitScore);
      const decision = determineDecision(fitScore);
      const scoringDuration = logger.endTiming("scoring");

      logger.debug("Scoring completed", {
        duration: `${scoringDuration.toFixed(2)}ms`,
        fitScore,
        decision,
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

      const totalDuration = logger.endTiming("full_analysis");
      logger.logCompletion("analyzeJobFit", {
        success: true,
        itemsProcessed: 1,
        provider: "openai",
        duration: totalDuration,
      });

      return result;
    } catch (error) {
      logger.error("Analysis failed", error as Error, {
        correlationId,
      });

      if (error instanceof SyntaxError) {
        throw new Error(getErrorMessage('aiParsingFailed', language, { details: error.message }));
      }

      if (error instanceof AIResponseValidationError) {
        logger.warn("Validation violations", {
          violationCount: error.violations.length,
          violations: error.violations.map(v => ({ path: v.path, type: v.code })),
        });

        // Map specific violation patterns to user-friendly messages
        const specificErrorKey = this.mapViolationToErrorKey(error.violations);
        throw new Error(getErrorMessage(specificErrorKey as any, language));
      }

      throw error;
    }
  }

  /**
   * Map specific validation violations to user-friendly error messages
   * Provides more specific guidance based on what field failed validation
   */
  private mapViolationToErrorKey(violations: Array<{ path: (string | number)[]; code: string; message: string }>): string {
    if (violations.length === 0) {
      return 'aiInvalidResponse';
    }

    const firstViolation = violations[0];
    const fieldPath = firstViolation.path[0]?.toString() || '';

    // Map specific field violations to error messages
    if (fieldPath.includes('recruiterMessage')) {
      return 'aiMessageRequired';
    }
    if (fieldPath.includes('coverLetter')) {
      return 'aiCoverLetterRequired';
    }
    if (fieldPath.includes('seniorityMatch')) {
      return 'aiSeniorityInvalid';
    }
    if (fieldPath.includes('hardSkillsDetected') || 
        fieldPath.includes('mandatoryRequirementsMet') ||
        fieldPath.includes('softSkillsEvidence')) {
      return 'aiInvalidArrayField';
    }

    // If multiple violations, likely incomplete response
    if (violations.length > 3) {
      return 'aiResponseIncomplete';
    }

    // Generic invalid response
    return 'aiInvalidResponse';
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
}

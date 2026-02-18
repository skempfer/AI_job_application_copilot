import type { AnalysisResult, AIServiceConfig, AISignals } from "../types/analysis.js";
import { calculateFitScore, generateExplanation, determineDecision } from "./scoring.js";
import { preprocessCV, preprocessJobDescription } from "./preprocessing.js";
import { buildOptimizedPrompt, estimateTokenCount } from "./promptBuilder.js";
import { SYSTEM_PROMPT } from "./systemPrompt.js";
import { validateAIResponse, AIResponseValidationError } from "./aiResponseSchema.js";
import { createAIServiceLogger, generateCorrelationId } from "./aiLogger.js";
import { GroqProvider } from "./providers/index.js";
import { AIProviderError } from "./providers/providerErrors.js";
import { AI_PROVIDER } from "./providers/types.js";
import { getCachedAnalysis, cacheAnalysis } from "./cacheService.js";
import { validateModelConfig, getDefaultModel } from "../config/modelConfig.js";

const AMBIGUOUS_TOKENS = new Set(["go"]);
const STOPWORDS = new Set([
  "experience",
  "experiencia",
  "exp",
  "years",
  "year",
  "anos",
  "with",
  "and",
  "em",
  "de",
  "na",
  "no",
  "para",
  "com",
  "knowledge",
]);

function normalizeToken(token: string): string {
  return token.toLowerCase().replace(/[()\[\],.;:]/g, "").trim();
}

function hasCvEvidence(item: string, cvText: string, cvSkills: string[]): boolean {
  const normalizedItem = item.toLowerCase();
  const cvLower = cvText.toLowerCase();
  const normalizedSkills = cvSkills.map((skill) => skill.toLowerCase());

  if (normalizedSkills.includes(normalizedItem)) return true;

  const tokens = normalizedItem.match(/[a-z0-9+#.]+/g) ?? [];
  const meaningfulTokens = tokens
    .map(normalizeToken)
    .filter((token) => token.length >= 3 || /[#.+]/.test(token))
    .filter((token) => token && !STOPWORDS.has(token) && !AMBIGUOUS_TOKENS.has(token));

  if (meaningfulTokens.length > 0) {
    return meaningfulTokens.every((token) => cvLower.includes(token));
  }

  return false;
}

function sanitizeSignals(
  signals: AISignals,
  cvText: string,
  cvSkills: string[],
  yearsExperience: number | null,
  mandatoryRequirementsCount: number
): AISignals {
  const filterByCv = (items: string[]) => items.filter((item) => hasCvEvidence(item, cvText, cvSkills));
  const redFlagPatterns = {
    yearsMissing: /insufficient data.*years|years-of-experience|yearsofexperience/i,
    requirementsMissing: /no mandatory requirements|no specific requirements extracted|missing requirements/i,
  };

  const sanitizedRedFlags = signals.redFlags.filter((flag) => {
    if (mandatoryRequirementsCount === 0 && redFlagPatterns.requirementsMissing.test(flag)) {
      return false;
    }

    if (yearsExperience !== null && redFlagPatterns.yearsMissing.test(flag)) {
      return false;
    }

    return true;
  });

  return {
    ...signals,
    hardSkillsDetected: filterByCv(signals.hardSkillsDetected),
    mandatoryRequirementsMet: filterByCv(signals.mandatoryRequirementsMet),
    desirableRequirementsMet: filterByCv(signals.desirableRequirementsMet),
    redFlags: sanitizedRedFlags,
  };
}

export class AIService {
  private provider: GroqProvider;
  private model: string;

  constructor(_config: AIServiceConfig) {
    const model = validateModelConfig();

    this.provider = new GroqProvider({
      apiKey: process.env.GROQ_API_KEY || "",
      baseURL: process.env.GROQ_API_URL || "https://api.groq.com/openai/v1",
      model: getDefaultModel(),
    });

    this.model = model;
  }

  async analyzeJobFit(
    cv: string,
    jobDescription: string,
    uiLanguage: "pt" | "en" = "en",
    jobLanguage?: "pt" | "en"
  ): Promise<AnalysisResult> {
    const correlationId = generateCorrelationId();
    const logger = createAIServiceLogger("analyzeJobFit", correlationId);

    logger.startTiming("full_analysis");
    logger.info("Starting job fit analysis", {
      uiLanguage,
      jobLanguage: jobLanguage || uiLanguage,
      cvLength: cv.length,
      jobDescriptionLength: jobDescription.length,
    });

    let userPrompt = "";

    try {
      const cachedResult = getCachedAnalysis(cv, jobDescription, "v3.0-full-context");
      if (cachedResult) {
        logger.info("Cache hit detected", {
          cachedAt: new Date(cachedResult.cachedAt).toISOString(),
        });
        const totalDuration = logger.endTiming("full_analysis");
        logger.logCompletion("analyzeJobFit", {
          success: true,
          itemsProcessed: 1,
          provider: AI_PROVIDER.GROQ,
          responseTimeMs: totalDuration,
          schemaValidationSuccess: true,
          duration: totalDuration,
        });
        return cachedResult;
      }

      logger.startTiming("preprocessing");
      const processedCV = preprocessCV(cv);
      const processedJob = preprocessJobDescription(jobDescription);
      const preprocessingDuration = logger.endTiming("preprocessing");

      logger.info("Preprocessing completed", {
        duration: `${preprocessingDuration.toFixed(2)}ms`,
        skillsCount: processedCV.skills.length,
        yearsExperience: processedCV.yearsExperience,
        mandatoryReqs: processedJob.mandatoryRequirements.length,
      });

      const prompt = buildOptimizedPrompt(cv, jobDescription, processedCV, processedJob, uiLanguage, jobLanguage);
      userPrompt = prompt;

      const systemTokens = estimateTokenCount(SYSTEM_PROMPT);
      const userTokens = estimateTokenCount(prompt);
      const totalInputTokens = systemTokens + userTokens;

      logger.info("Token usage estimation", {
        systemPromptTokens: systemTokens,
        userPromptTokens: userTokens,
        totalInputTokens,
        cvTextLength: cv.length,
        jobTextLength: jobDescription.length,
      });

      if (totalInputTokens > 25000) {
        logger.warn("High token usage detected", {
          totalInputTokens,
          threshold: 25000,
          message: "Approaching model token limit - consider optimizing input",
        });
      }

      logger.startTiming("api_request");

      logger.logAPIRequest(AI_PROVIDER.GROQ, this.model, {
        promptLength: prompt.length,
        estimatedInputTokens: totalInputTokens,
      });

      const content = await this.provider.generate([
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: prompt,
        },
      ]);

      const apiDuration = logger.endTiming("api_request");

      logger.info("Provider response received", {
        providerUsed: AI_PROVIDER.GROQ,
        responseTimeMs: apiDuration,
        duration: `${apiDuration.toFixed(2)}ms`,
      });

      logger.startTiming("json_parsing");
      const cleanJson = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

      try {
        var parsedData = JSON.parse(cleanJson);
      } catch (parseError) {
        logger.error("JSON parsing failed - provider returned malformed response", parseError as Error, {
          responsePreview: cleanJson.substring(0, 200),
        });
        throw parseError;
      }

      const parsingDuration = logger.endTiming("json_parsing");

      logger.debug("JSON parsing completed", {
        duration: `${parsingDuration.toFixed(2)}ms`,
        jsonLength: cleanJson.length,
      });

      logger.startTiming("validation");
      const signals = validateAIResponse(parsedData);
      const sanitizedSignals = sanitizeSignals(
        signals,
        cv,
        processedCV.skills,
        processedCV.yearsExperience,
        processedJob.mandatoryRequirements.length
      );
      const validationDuration = logger.endTiming("validation");

      logger.logValidation(true, {
        schemaValidationSuccess: true,
        providerUsed: AI_PROVIDER.GROQ,
        duration: `${validationDuration.toFixed(2)}ms`,
        hardSkills: sanitizedSignals.hardSkillsDetected.length,
        missingRequirements: sanitizedSignals.mandatoryRequirementsMissing.length,
        redFlags: sanitizedSignals.redFlags.length,
      });

      logger.startTiming("scoring");
      const fitScore = calculateFitScore(sanitizedSignals);
      const explanation = generateExplanation(sanitizedSignals, fitScore);
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
          ...sanitizedSignals.hardSkillsDetected.map(s => `Hard skill: ${s}`),
          ...sanitizedSignals.mandatoryRequirementsMet.map(r => `Requirement met: ${r}`),
          ...sanitizedSignals.desirableRequirementsMet.map(d => `Bonus qualification: ${d}`),
        ],
        gaps: [
          ...sanitizedSignals.mandatoryRequirementsMissing.map(r => `Missing requirement: ${r}`),
          ...sanitizedSignals.desirableRequirementsMissing.map(d => `Missing bonus qualification: ${d}`),
          ...sanitizedSignals.redFlags,
        ],
        cvSuggestions: this.generateCVSuggestions(sanitizedSignals),
        recruiterMessage: sanitizedSignals.recruiterMessage,
        coverLetter: sanitizedSignals.coverLetter,
        explanation,
        promptVersion: "v3.0-full-context",
        detectedLanguage: uiLanguage,
        preprocessedCV: {
          yearsExperience: processedCV.yearsExperience,
          yearsExperienceConfidence: processedCV.yearsExperienceConfidence,
          domainExperience: processedCV.domainExperience,
          seniority: processedCV.seniority,
          skills: processedCV.skills,
        },
        aiSignals: {
          hardSkillsDetected: sanitizedSignals.hardSkillsDetected,
          softSkillsEvidence: sanitizedSignals.softSkillsEvidence,
          mandatoryRequirementsMet: sanitizedSignals.mandatoryRequirementsMet,
          mandatoryRequirementsMissing: sanitizedSignals.mandatoryRequirementsMissing,
          desirableRequirementsMet: sanitizedSignals.desirableRequirementsMet,
          desirableRequirementsMissing: sanitizedSignals.desirableRequirementsMissing,
          seniorityMatch: sanitizedSignals.seniorityMatch,
          redFlags: sanitizedSignals.redFlags,
        },
      };

      cacheAnalysis(cv, jobDescription, result, this.model, "v3.0-full-context");

      const totalDuration = logger.endTiming("full_analysis");
      logger.logCompletion("analyzeJobFit", {
        success: true,
        itemsProcessed: 1,
        provider: AI_PROVIDER.GROQ,
        responseTimeMs: apiDuration,
        schemaValidationSuccess: true,
        duration: totalDuration,
      });

      return result;
    } catch (error) {
      logger.error("Analysis failed", error as Error, {
        correlationId,
      });

      if (error instanceof AIProviderError) {
        if (userPrompt) {
          error.prompt = {
            system: SYSTEM_PROMPT,
            user: userPrompt,
          };
        }
        throw error;
      }

      if (error instanceof SyntaxError) {
        logger.error("Provider returned invalid JSON", error, {
          errorType: "json_parse_error",
          schemaValidationSuccess: false,
          message: "Response was not valid JSON - rejecting malformed response",
        });
        throw new Error(`AI parsing failed: ${error.message}`);
      }

      if (error instanceof AIResponseValidationError) {
        logger.error("Provider returned response that failed schema validation", error, {
          errorType: "schema_validation_error",
          schemaValidationSuccess: false,
          violationCount: error.violations.length,
          violations: error.violations.map(v => ({ path: v.path, type: v.code })),
          message: "Response schema validation failed - rejecting malformed response",
        });

        throw new Error(`AI validation failed: response did not match expected schema`);
      }

      throw error;
    }
  }

  // private mapViolationToErrorKey(violations: Array<{ path: (string | number)[]; code: string; message: string }>): string {
  //   if (violations.length === 0) {
  //     return 'aiInvalidResponse';
  //   }

  //   const firstViolation = violations[0];
  //   const fieldPath = firstViolation.path[0]?.toString() || '';

  //   if (fieldPath.includes('recruiterMessage')) {
  //     return 'aiMessageRequired';
  //   }
  //   if (fieldPath.includes('coverLetter')) {
  //     return 'aiCoverLetterRequired';
  //   }
  //   if (fieldPath.includes('seniorityMatch')) {
  //     return 'aiSeniorityInvalid';
  //   }
  //   if (fieldPath.includes('hardSkillsDetected') || 
  //       fieldPath.includes('mandatoryRequirementsMet') ||
  //       fieldPath.includes('softSkillsEvidence')) {
  //     return 'aiInvalidArrayField';
  //   }

  //   if (violations.length > 3) {
  //     return 'aiResponseIncomplete';
  //   }

  //   return 'aiInvalidResponse';
  // }

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

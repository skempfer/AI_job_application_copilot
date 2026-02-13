import OpenAI from "openai";
import type { AnalysisResult, AIServiceConfig, AISignals } from "../types/analysis.js";
import { calculateFitScore, generateExplanation, determineDecision } from "./scoring.js";
import { preprocessCV, preprocessJobDescription } from "./preprocessing.js";
import { buildOptimizedPrompt } from "./promptBuilder.js";

/**
 * Prompt version
 * (Now defined in promptBuilder.ts as PROMPT_VERSION = "v2.0-optimized")
 */

/**
 * AI service using Groq (OpenAI-compatible API)
 * Groq provides free access to Llama models with ultra-fast speed
 *
 * HYBRID ARCHITECTURE:
 * - AI: extracts signals and classifies requirements
 * - Code: calculates the final score deterministically
 */
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

  /**
   * Analyze candidate fit using structured preprocessing
   *
   * NEW FLOW (v2.0):
   * 1. Preprocess CV (remove personal data, normalize, extract structure)
   * 2. Preprocess Job Description (remove marketing, extract requirements)
   * 3. Build optimized prompt with structured data
   * 4. Send to AI (far fewer tokens)
   * 5. Extract signals and compute score
   */
  async analyzeJobFit(cv: string, jobDescription: string, language: "pt" | "en" = "en"): Promise<AnalysisResult> {
    const processedCV = preprocessCV(cv);

    const processedJob = preprocessJobDescription(jobDescription);

    const prompt = buildOptimizedPrompt(processedCV, processedJob, language);

    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are an assistant that returns ONLY valid JSON, with no markdown or extra text.",
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
        throw new Error("AI returned an empty response");
      }

      const cleanJson = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const signals = JSON.parse(cleanJson) as AISignals;

      this.validateSignals(signals);

      const fitScore = calculateFitScore(signals);
      
      const explanation = generateExplanation(signals, fitScore);
      
      const decision = determineDecision(fitScore);

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
      };

      return result;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Failed to parse AI response: ${error.message}`);
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
  private validateSignals(signals: any): asserts signals is AISignals {
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
      throw new Error(`Invalid AI response. Missing fields: ${missing.join(", ")}`);
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
        throw new Error(`${field} must be an array`);
      }
    }

    if (!["below", "match", "above"].includes(signals.seniorityMatch)) {
      throw new Error("seniorityMatch must be 'below', 'match', or 'above'");
    }

    if (typeof signals.recruiterMessage !== "string" || signals.recruiterMessage.length === 0) {
      throw new Error("recruiterMessage must be a non-empty string");
    }

    if (typeof signals.coverLetter !== "string" || signals.coverLetter.length === 0) {
      throw new Error("coverLetter must be a non-empty string");
    }
  }
}

import OpenAI from "openai";
import { AI_FAILURE_REASON } from "../../types/analysis.js";
import type { AIProviderFailureReason } from "../../types/analysis.js";
import { AIProviderError } from "./providerErrors.js";
import type { AIProvider, ChatMessage } from "./types.js";
import { AI_PROVIDER } from "./types.js";

/**
 * Configuration for the Groq provider
 */
export interface GroqProviderConfig {
  apiKey: string;
  baseURL: string;
  model: string;
}

/**
 * Groq AI provider implementation
 * Uses OpenAI SDK with Groq's compatible API endpoint
 * 
 * Responsibilities:
 * - Make API request to Groq
 * - Return raw text response
 * - Propagate errors without swallowing
 * 
 * NOT responsible for:
 * - JSON parsing
 * - Schema validation
 * - Business logic
 * - Error handling beyond propagation
 */
export class GroqProvider implements AIProvider {
  private client: OpenAI;
  private model: string;

  constructor(config: GroqProviderConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
    });
    this.model = config.model;
  }

  /**
   * Generate a response from Groq
   * @param messages - Array of chat messages
   * @returns Raw text response
   * @throws Error if API call fails or response is empty
   */
  async generate(messages: ChatMessage[]): Promise<string> {
    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: 0.2,
        max_tokens: 1500,
      });

      const content = completion.choices[0]?.message?.content;

      if (!content) {
        throw new Error("Groq provider returned empty response");
      }

      return content;
    } catch (error) {
      const reason = this.classifyFailure(error);
      if (reason) {
        const status = this.getStatusCode(error);
        throw new AIProviderError({
          provider: AI_PROVIDER.GROQ,
          reason,
          message: "Groq provider request failed",
          status,
          cause: error,
        });
      }

      throw error;
    }
  }

  /**
   * Get the provider name for logging
   * @returns Provider identifier
   */
  getProviderName(): "groq" {
    return AI_PROVIDER.GROQ;
  }

  private classifyFailure(error: unknown): AIProviderFailureReason | null {
    const status = this.getStatusCode(error);
    const code = this.getErrorCode(error);
    const message = this.getErrorMessage(error).toLowerCase();

    if (status === 429 || code === "rate_limit_exceeded" || message.includes("rate limit")) {
      return AI_FAILURE_REASON.RateLimit;
    }

    if (code === "insufficient_quota" || message.includes("quota")) {
      return AI_FAILURE_REASON.QuotaExceeded;
    }

    if (status === 408 || status === 504 || code === "ETIMEDOUT" || message.includes("timeout")) {
      return AI_FAILURE_REASON.Timeout;
    }

    if (status === 502 || status === 503 || message.includes("unavailable") || message.includes("overloaded")) {
      return AI_FAILURE_REASON.ProviderUnavailable;
    }

    return null;
  }

  private getStatusCode(error: unknown): number | undefined {
    return typeof (error as { status?: number })?.status === "number"
      ? (error as { status?: number }).status
      : undefined;
  }

  private getErrorCode(error: unknown): string | undefined {
    return typeof (error as { code?: string })?.code === "string"
      ? (error as { code?: string }).code
      : undefined;
  }

  private getErrorMessage(error: unknown): string {
    const message = (error as { message?: string })?.message;
    return typeof message === "string" ? message : "";
  }
}

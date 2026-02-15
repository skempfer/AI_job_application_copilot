import type { AIProvider, ChatMessage, ProviderResponse } from "./types.js";

/**
 * AI Orchestrator with fallback support
 * 
 * Orchestrates requests between a primary and fallback provider.
 * Falls back ONLY on rate limit errors (HTTP 429).
 * 
 * Responsibilities:
 * - Try primary provider first
 * - Detect rate limit errors (429)
 * - Fall back to secondary provider on rate limits
 * - Rethrow all other errors
 * - Log fallback events
 * - Track provider usage metadata
 * 
 * NOT responsible for:
 * - JSON parsing
 * - Schema validation
 * - Business logic
 * - Infinite retries
 */
export class AIOrchestrator implements AIProvider {
  constructor(
    private primary: AIProvider,
    private fallback: AIProvider
  ) {}

  /**
   * Generate a response, with automatic fallback on rate limits
   * Returns metadata about which provider was used
   * @param messages - Array of chat messages
   * @returns Provider response with metadata
   * @throws Error if both providers fail or non-rate-limit error occurs
   */
  async generateWithMetadata(messages: ChatMessage[]): Promise<ProviderResponse> {
    try {
      // Try primary provider first
      const content = await this.primary.generate(messages);
      return {
        content,
        providerUsed: this.primary.getProviderName(),
        fallbackTriggered: false,
      };
    } catch (error) {
      // Only fall back on rate limit errors
      if (this.isRateLimit(error)) {
        console.warn("⚠️  Primary provider hit rate limit, falling back to secondary provider");
        
        // Try fallback provider
        const content = await this.fallback.generate(messages);
        return {
          content,
          providerUsed: this.fallback.getProviderName(),
          fallbackTriggered: true,
        };
      }
      
      // For all other errors, rethrow immediately
      throw error;
    }
  }

  /**
   * Generate a response (legacy interface for AIProvider compatibility)
   * @param messages - Array of chat messages
   * @returns Raw text response from primary or fallback provider
   * @throws Error if both providers fail or non-rate-limit error occurs
   */
  async generate(messages: ChatMessage[]): Promise<string> {
    const response = await this.generateWithMetadata(messages);
    return response.content;
  }

  /**
   * Get the provider name (returns primary provider name)
   * @returns Provider identifier
   */
  getProviderName(): "groq" | "deepseek" {
    return this.primary.getProviderName();
  }

  /**
   * Detect if an error is a rate limit error (HTTP 429)
   * @param error - The error to check
   * @returns true if the error is a rate limit error
   */
  private isRateLimit(error: any): boolean {
    // Check for HTTP 429 status code
    // OpenAI SDK and compatible SDKs throw errors with status property
    if (error?.status === 429) {
      return true;
    }

    // Also check for common rate limit error codes in error messages
    if (error?.code === "rate_limit_exceeded") {
      return true;
    }

    // Check error message for rate limit indicators
    const errorMessage = error?.message?.toLowerCase() || "";
    if (errorMessage.includes("rate limit") || errorMessage.includes("429")) {
      return true;
    }

    return false;
  }
}

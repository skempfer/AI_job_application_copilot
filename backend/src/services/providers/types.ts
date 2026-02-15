/**
 * Provider abstraction types
 * These types define the contract for AI provider implementations
 */

export const AI_PROVIDER = {
  GROQ: "groq",
} as const;

export type AIProviderName = (typeof AI_PROVIDER)[keyof typeof AI_PROVIDER];

/**
 * Represents a single message in a chat conversation
 * Follows OpenAI's message format
 */
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Interface for AI provider implementations
 * All providers must implement this interface to ensure consistent behavior
 */
export interface AIProvider {
  /**
   * Generate a response from the AI provider
   * @param messages - Array of chat messages (system, user, etc.)
   * @returns Raw text response from the provider
   * @throws Error if the request fails
   */
  generate(messages: ChatMessage[]): Promise<string>;
  
  /**
   * Get the provider name for logging
   */
  getProviderName(): AIProviderName;
}

import OpenAI from "openai";
import type { AIProvider, ChatMessage } from "./types.js";

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
    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages: messages.map(m => ({
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
  }

  /**
   * Get the provider name for logging
   * @returns Provider identifier
   */
  getProviderName(): "groq" | "deepseek" {
    return "groq";
  }
}

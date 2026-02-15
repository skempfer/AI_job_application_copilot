import OpenAI from "openai";
import type { AIProvider, ChatMessage } from "./types.js";

/**
 * Configuration for the DeepSeek provider
 */
export interface DeepSeekProviderConfig {
  apiKey: string;
  baseURL?: string;
  model?: string;
}

/**
 * DeepSeek AI provider implementation
 * Uses OpenAI SDK with DeepSeek's compatible API endpoint
 * 
 * Responsibilities:
 * - Make API request to DeepSeek
 * - Return raw text response
 * - Propagate errors without swallowing
 * 
 * NOT responsible for:
 * - JSON parsing
 * - Schema validation
 * - Business logic
 * - Error handling beyond propagation
 */
export class DeepSeekProvider implements AIProvider {
  private client: OpenAI;
  private model: string;

  constructor(config: DeepSeekProviderConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL || "https://api.deepseek.com",
    });
    this.model = config.model || "deepseek-chat";
  }

  /**
   * Generate a response from DeepSeek
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
      throw new Error("DeepSeek provider returned empty response");
    }

    return content;
  }

  /**
   * Get the provider name for logging
   * @returns Provider identifier
   */
  getProviderName(): "groq" | "deepseek" {
    return "deepseek";
  }
}

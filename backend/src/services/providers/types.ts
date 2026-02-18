export const AI_PROVIDER = {
  GROQ: "groq",
} as const;

export type AIProviderName = (typeof AI_PROVIDER)[keyof typeof AI_PROVIDER];

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIProvider {
  generate(messages: ChatMessage[]): Promise<string>;
  getProviderName(): AIProviderName;
}

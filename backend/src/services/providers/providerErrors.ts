import type { AIProviderFailureReason } from "../../types/analysis.js";
import type { AIProviderName } from "./types.js";

export class AIProviderError extends Error {
  readonly provider: AIProviderName;
  readonly reason: AIProviderFailureReason;
  readonly status?: number;
  prompt?: { system: string; user: string };

  constructor(options: {
    provider: AIProviderName;
    reason: AIProviderFailureReason;
    message: string;
    status?: number;
    prompt?: { system: string; user: string };
    cause?: unknown;
  }) {
    super(options.message);
    this.provider = options.provider;
    this.reason = options.reason;
    this.status = options.status;
    this.prompt = options.prompt;

    if (options.cause) {
      (this as { cause?: unknown }).cause = options.cause;
    }
  }
}

export function isAIProviderError(error: unknown): error is AIProviderError {
  return error instanceof AIProviderError;
}

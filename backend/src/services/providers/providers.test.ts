import { GroqProvider } from "./GroqProvider.js";
import { AIProviderError } from "./providerErrors.js";
import { AI_FAILURE_REASON } from "../../types/analysis.js";
import type { ChatMessage } from "./types.js";

jest.mock("openai");

const testMessages: ChatMessage[] = [
  { role: "system", content: "You are a helpful assistant" },
  { role: "user", content: "Analyze this CV" },
];

describe("GroqProvider", () => {
  let OpenAI: any;

  beforeEach(() => {
    jest.clearAllMocks();
    OpenAI = require("openai").default;
  });

  it("should return content on successful response", async () => {
    const mockClient = {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: JSON.stringify({ test: "response" }),
                },
              },
            ],
          }),
        },
      },
    };

    OpenAI.mockImplementation(() => mockClient);

    const provider = new GroqProvider({
      apiKey: "test-key",
      baseURL: "https://api.groq.com/openai/v1",
      model: "llama-3.3-70b-versatile",
    });

    const result = await provider.generate(testMessages);
    expect(result).toBe(JSON.stringify({ test: "response" }));
    expect(mockClient.chat.completions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
        max_tokens: 1500,
      })
    );
  });

  it("should throw error on empty response", async () => {
    const mockClient = {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: null,
                },
              },
            ],
          }),
        },
      },
    };

    OpenAI.mockImplementation(() => mockClient);

    const provider = new GroqProvider({
      apiKey: "test-key",
      baseURL: "https://api.groq.com/openai/v1",
      model: "llama-3.3-70b-versatile",
    });

    await expect(provider.generate(testMessages)).rejects.toThrow(
      "Groq provider returned empty response"
    );
  });

  it("should return provider name", () => {
    const mockClient = {};
    OpenAI.mockImplementation(() => mockClient);

    const provider = new GroqProvider({
      apiKey: "test-key",
      baseURL: "https://api.groq.com/openai/v1",
      model: "llama-3.3-70b-versatile",
    });

    expect(provider.getProviderName()).toBe("groq");
  });

  it("should use correct configuration", async () => {
    const mockClient = {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{ message: { content: "test" } }],
          }),
        },
      },
    };

    OpenAI.mockImplementation((config: any) => {
      expect(config.apiKey).toBe("test-key");
      expect(config.baseURL).toBe("https://api.groq.com/openai/v1");
      return mockClient;
    });

    new GroqProvider({
      apiKey: "test-key",
      baseURL: "https://api.groq.com/openai/v1",
      model: "llama-3.3-70b-versatile",
    });
  });

  it("should classify rate limit errors", async () => {
    const error: any = new Error("Rate limit exceeded");
    error.status = 429;

    const mockClient = {
      chat: {
        completions: {
          create: jest.fn().mockRejectedValue(error),
        },
      },
    };

    OpenAI.mockImplementation(() => mockClient);

    const provider = new GroqProvider({
      apiKey: "test-key",
      baseURL: "https://api.groq.com/openai/v1",
      model: "llama-3.3-70b-versatile",
    });

    await expect(provider.generate(testMessages)).rejects.toMatchObject({
      reason: AI_FAILURE_REASON.RateLimit,
    });
  });

  it("should classify quota errors", async () => {
    const error: any = new Error("insufficient_quota");
    error.code = "insufficient_quota";

    const mockClient = {
      chat: {
        completions: {
          create: jest.fn().mockRejectedValue(error),
        },
      },
    };

    OpenAI.mockImplementation(() => mockClient);

    const provider = new GroqProvider({
      apiKey: "test-key",
      baseURL: "https://api.groq.com/openai/v1",
      model: "llama-3.3-70b-versatile",
    });

    await expect(provider.generate(testMessages)).rejects.toBeInstanceOf(
      AIProviderError
    );

    await expect(provider.generate(testMessages)).rejects.toMatchObject({
      reason: AI_FAILURE_REASON.QuotaExceeded,
    });
  });
});

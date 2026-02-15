import { GroqProvider } from "./GroqProvider.js";
import { DeepSeekProvider } from "./DeepSeekProvider.js";
import { AIOrchestrator } from "./AIOrchestrator.js";
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
});

describe("DeepSeekProvider", () => {
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

    const provider = new DeepSeekProvider({
      apiKey: "test-key",
      baseURL: "https://api.deepseek.com",
      model: "deepseek-chat",
    });

    const result = await provider.generate(testMessages);
    expect(result).toBe(JSON.stringify({ test: "response" }));
    expect(mockClient.chat.completions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "deepseek-chat",
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

    const provider = new DeepSeekProvider({
      apiKey: "test-key",
    });

    await expect(provider.generate(testMessages)).rejects.toThrow(
      "DeepSeek provider returned empty response"
    );
  });

  it("should return provider name", () => {
    const mockClient = {};
    OpenAI.mockImplementation(() => mockClient);

    const provider = new DeepSeekProvider({
      apiKey: "test-key",
    });

    expect(provider.getProviderName()).toBe("deepseek");
  });

  it("should use default configuration", async () => {
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
      expect(config.baseURL).toBe("https://api.deepseek.com");
      return mockClient;
    });

    new DeepSeekProvider({
      apiKey: "test-key",
    });
  });
});

describe("Provider validation integration", () => {
  it("should handle malformed JSON from primary provider", async () => {
    const mockPrimary = {
      generate: jest.fn().mockResolvedValue("not valid json {"),
      getProviderName: () => "groq" as const,
    };
    const mockFallback = {
      generate: jest.fn().mockResolvedValue('{"valid": "json"}'),
      getProviderName: () => "deepseek" as const,
    };

    const orchestrator = new AIOrchestrator(mockPrimary, mockFallback);
    const result = await orchestrator.generate(testMessages);

    // Should get malformed JSON from primary (fallback not triggered for non-429 errors)
    expect(result).toBe("not valid json {");
    // Validation would fail in AIService, not in orchestrator
  });

  it("should handle empty response from fallback provider", async () => {
    const mockPrimary = {
      generate: jest.fn().mockRejectedValue({ status: 429, message: "Rate limit" }),
      getProviderName: () => "groq" as const,
    };
    const mockFallback = {
      generate: jest.fn().mockResolvedValue(""),
      getProviderName: () => "deepseek" as const,
    };

    const orchestrator = new AIOrchestrator(mockPrimary, mockFallback);
    const result = await orchestrator.generateWithMetadata(testMessages);

    expect(result.content).toBe("");
    expect(result.fallbackTriggered).toBe(true);
    expect(result.providerUsed).toBe("deepseek");
    // Empty response would be caught by provider's internal check or validation layer
  });
});

import { AIOrchestrator } from "./AIOrchestrator.js";
import type { AIProvider, ChatMessage } from "./types.js";

class MockProvider implements AIProvider {
  constructor(
    private name: "groq" | "deepseek",
    private behavior: "success" | "rate-limit" | "other-error" | "empty-response"
  ) {}

  async generate(_messages: ChatMessage[]): Promise<string> {
    if (this.behavior === "success") {
      return JSON.stringify({
        hardSkillsDetected: ["TypeScript", "React"],
        softSkillsEvidence: ["Team collaboration"],
        mandatoryRequirementsMet: ["3+ years experience"],
        mandatoryRequirementsMissing: [],
        desirableRequirementsMet: ["Docker experience"],
        desirableRequirementsMissing: [],
        seniorityMatch: "match",
        redFlags: [],
        recruiterMessage: "Great fit for the position",
        coverLetter: "Dear hiring manager...",
      });
    }

    if (this.behavior === "rate-limit") {
      const error: any = new Error("Rate limit exceeded");
      error.status = 429;
      throw error;
    }

    if (this.behavior === "other-error") {
      const error: any = new Error("Internal server error");
      error.status = 500;
      throw error;
    }

    if (this.behavior === "empty-response") {
      return "";
    }

    throw new Error("Unknown behavior");
  }

  getProviderName(): "groq" | "deepseek" {
    return this.name;
  }
}

describe("AIOrchestrator", () => {
  const testMessages: ChatMessage[] = [
    { role: "system", content: "You are a helpful assistant" },
    { role: "user", content: "Analyze this CV" },
  ];

  describe("Primary provider success", () => {
    it("should return response from primary provider", async () => {
      const primary = new MockProvider("groq", "success");
      const fallback = new MockProvider("deepseek", "success");
      const orchestrator = new AIOrchestrator(primary, fallback);

      const result = await orchestrator.generate(testMessages);

      expect(result).toBeTruthy();
      expect(JSON.parse(result)).toHaveProperty("hardSkillsDetected");
    });

    it("should not trigger fallback on success", async () => {
      const primary = new MockProvider("groq", "success");
      const fallback = new MockProvider("deepseek", "success");
      const orchestrator = new AIOrchestrator(primary, fallback);

      const result = await orchestrator.generateWithMetadata(testMessages);

      expect(result.providerUsed).toBe("groq");
      expect(result.fallbackTriggered).toBe(false);
    });
  });

  describe("Rate limit fallback", () => {
    it("should fallback to secondary provider on 429 error", async () => {
      const primary = new MockProvider("groq", "rate-limit");
      const fallback = new MockProvider("deepseek", "success");
      const orchestrator = new AIOrchestrator(primary, fallback);

      const result = await orchestrator.generate(testMessages);

      expect(result).toBeTruthy();
      expect(JSON.parse(result)).toHaveProperty("hardSkillsDetected");
    });

    it("should set fallbackTriggered=true on rate limit", async () => {
      const primary = new MockProvider("groq", "rate-limit");
      const fallback = new MockProvider("deepseek", "success");
      const orchestrator = new AIOrchestrator(primary, fallback);

      const result = await orchestrator.generateWithMetadata(testMessages);

      expect(result.providerUsed).toBe("deepseek");
      expect(result.fallbackTriggered).toBe(true);
    });

    it("should detect rate limit by status code", async () => {
      const primary = new MockProvider("groq", "rate-limit");
      const fallback = new MockProvider("deepseek", "success");
      const orchestrator = new AIOrchestrator(primary, fallback);

      // Should not throw - fallback should succeed
      await expect(orchestrator.generate(testMessages)).resolves.toBeTruthy();
    });
  });

  describe("Non-rate-limit error handling", () => {
    it("should rethrow non-429 errors immediately", async () => {
      const primary = new MockProvider("groq", "other-error");
      const fallback = new MockProvider("deepseek", "success");
      const orchestrator = new AIOrchestrator(primary, fallback);

      await expect(orchestrator.generate(testMessages)).rejects.toThrow("Internal server error");
    });

    it("should NOT trigger fallback on non-429 errors", async () => {
      const primary = new MockProvider("groq", "other-error");
      const fallbackSpy = jest.fn();
      const fallback = new MockProvider("deepseek", "success");
      // Override generate to spy on calls
      fallback.generate = fallbackSpy;

      const orchestrator = new AIOrchestrator(primary, fallback);

      await expect(orchestrator.generate(testMessages)).rejects.toThrow();
      expect(fallbackSpy).not.toHaveBeenCalled();
    });
  });

  describe("No infinite fallback loop", () => {
    it("should not retry if fallback also fails", async () => {
      const primary = new MockProvider("groq", "rate-limit");
      const fallback = new MockProvider("deepseek", "other-error");
      const orchestrator = new AIOrchestrator(primary, fallback);

      // Fallback fails with non-429 error - should throw
      await expect(orchestrator.generate(testMessages)).rejects.toThrow("Internal server error");
    });

    it("should not retry if fallback also hits rate limit", async () => {
      const primary = new MockProvider("groq", "rate-limit");
      const fallback = new MockProvider("deepseek", "rate-limit");
      const orchestrator = new AIOrchestrator(primary, fallback);

      // Both fail with 429 - should throw the fallback's error
      await expect(orchestrator.generate(testMessages)).rejects.toThrow("Rate limit exceeded");
    });

    it("should only attempt fallback once", async () => {
      const primary = new MockProvider("groq", "rate-limit");
      let callCount = 0;
      const fallback = new MockProvider("deepseek", "rate-limit");
      fallback.generate = async () => {
        callCount++;
        const error: any = new Error("Rate limit exceeded");
        error.status = 429;
        throw error;
      };

      const orchestrator = new AIOrchestrator(primary, fallback);

      await expect(orchestrator.generate(testMessages)).rejects.toThrow();
      expect(callCount).toBe(1); // Fallback called exactly once, no retry
    });
  });

  describe("Provider name tracking", () => {
    it("should return primary provider name", () => {
      const primary = new MockProvider("groq", "success");
      const fallback = new MockProvider("deepseek", "success");
      const orchestrator = new AIOrchestrator(primary, fallback);

      expect(orchestrator.getProviderName()).toBe("groq");
    });
  });

  describe("Rate limit detection", () => {
    it("should detect rate limit by error code", async () => {
      const primary: AIProvider = {
        async generate() {
          const error: any = new Error("Rate limit");
          error.code = "rate_limit_exceeded";
          throw error;
        },
        getProviderName: () => "groq",
      };
      const fallback = new MockProvider("deepseek", "success");
      const orchestrator = new AIOrchestrator(primary, fallback);

      const result = await orchestrator.generateWithMetadata(testMessages);
      expect(result.fallbackTriggered).toBe(true);
    });

    it("should detect rate limit by message content", async () => {
      const primary: AIProvider = {
        async generate() {
          throw new Error("429: rate limit exceeded for this endpoint");
        },
        getProviderName: () => "groq",
      };
      const fallback = new MockProvider("deepseek", "success");
      const orchestrator = new AIOrchestrator(primary, fallback);

      const result = await orchestrator.generateWithMetadata(testMessages);
      expect(result.fallbackTriggered).toBe(true);
    });
  });
});

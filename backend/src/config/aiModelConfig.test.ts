import {
  getDefaultModel,
  getModelConfig,
  isModelSupported,
  getAvailableModels,
  getEconomicModel,
  validateModelConfig,
  SUPPORTED_MODELS,
} from "./aiModelConfig.js";

describe("aiModelConfig", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.AI_MODEL_DEFAULT;
  });

  describe("SUPPORTED_MODELS", () => {
    it("should define economic model", () => {
      expect(SUPPORTED_MODELS.LLAMA_3_3_70B).toBeDefined();
    });

    it("should have required model properties", () => {
      const model = SUPPORTED_MODELS.LLAMA_3_3_70B;
      expect(model.name).toBeDefined();
      expect(model.provider).toBe("groq");
      expect(model.type).toBe("economic");
      expect(model.description).toBeDefined();
    });
  });

  describe("getDefaultModel", () => {
    it("should return economic model when env var not set", () => {
      const model = getDefaultModel();
      expect(model).toBe(SUPPORTED_MODELS.LLAMA_3_3_70B.name);
    });

    it("should return environment variable value when set", () => {
      process.env.AI_MODEL_DEFAULT = "custom-model";
      const model = getDefaultModel();
      expect(model).toBe("custom-model");
    });
  });

  describe("getModelConfig", () => {
    it("should return config for valid model", () => {
      const config = getModelConfig(SUPPORTED_MODELS.LLAMA_3_3_70B.name);
      expect(config).not.toBeNull();
      expect(config?.name).toBe(SUPPORTED_MODELS.LLAMA_3_3_70B.name);
    });

    it("should return null for unsupported model", () => {
      const config = getModelConfig("unsupported-model");
      expect(config).toBeNull();
    });

    it("should return all model properties", () => {
      const config = getModelConfig(SUPPORTED_MODELS.LLAMA_3_3_70B.name);
      expect(config?.description).toBeDefined();
      expect(config?.inputCostPer1kTokens).toBeDefined();
      expect(config?.outputCostPer1kTokens).toBeDefined();
    });
  });

  describe("isModelSupported", () => {
    it("should return true for supported models", () => {
      const supported = isModelSupported(SUPPORTED_MODELS.LLAMA_3_3_70B.name);
      expect(supported).toBe(true);
    });

    it("should return false for unsupported models", () => {
      const supported = isModelSupported("unsupported-model");
      expect(supported).toBe(false);
    });
  });

  describe("getAvailableModels", () => {
    it("should return array of model names", () => {
      const models = getAvailableModels();
      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThan(0);
    });

    it("should include economic model", () => {
      const models = getAvailableModels();
      expect(models).toContain(SUPPORTED_MODELS.LLAMA_3_3_70B.name);
    });
  });

  describe("getEconomicModel", () => {
    it("should return the most cost-efficient model", () => {
      const model = getEconomicModel();
      expect(model).toBe(SUPPORTED_MODELS.LLAMA_3_3_70B.name);
    });
  });

  describe("validateModelConfig", () => {
    it("should return economic model when env var not set", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      const model = validateModelConfig();

      expect(model).toBe(getEconomicModel());
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("not set")
      );

      consoleSpy.mockRestore();
    });

    it("should use environment variable when valid", () => {
      process.env.AI_MODEL_DEFAULT = SUPPORTED_MODELS.LLAMA_3_3_70B.name;
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      const model = validateModelConfig();

      expect(model).toBe(SUPPORTED_MODELS.LLAMA_3_3_70B.name);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Using configured")
      );

      consoleSpy.mockRestore();
    });

    it("should fallback to economic model when env var is unsupported", () => {
      process.env.AI_MODEL_DEFAULT = "unsupported-model";
      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();

      const model = validateModelConfig();

      expect(model).toBe(getEconomicModel());
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("not supported")
      );

      consoleWarnSpy.mockRestore();
    });

    it("should log warnings for invalid configs", () => {
      process.env.AI_MODEL_DEFAULT = "invalid-model";
      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();

      validateModelConfig();

      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });
  });

  describe("Model characteristics", () => {
    it("should have realistic cost values", () => {
      const model = SUPPORTED_MODELS.LLAMA_3_3_70B;
      expect(model.inputCostPer1kTokens).toBeGreaterThan(0);
      expect(model.outputCostPer1kTokens).toBeGreaterThan(0);
      expect(model.inputCostPer1kTokens).toBeLessThan(1);
      expect(model.outputCostPer1kTokens).toBeLessThan(1);
    });

    it("should mark economic model with correct type", () => {
      const model = SUPPORTED_MODELS.LLAMA_3_3_70B;
      expect(model.type).toBe("economic");
    });
  });
});

/**
 * AI Model Configuration
 * 
 * Centralized configuration for AI model selection
 * Default is set to the most cost-efficient model
 */

/**
 * List of supported models with their characteristics
 */
export const SUPPORTED_MODELS = {
  // Economic model - lowest cost
  LLAMA_3_3_70B: {
    name: "llama-3.3-70b-versatile",
    provider: "groq",
    type: "economic",
    description: "Cost-efficient 70B parameter model for job analysis",
    inputCostPer1kTokens: 0.05, // Approximate cost
    outputCostPer1kTokens: 0.08, // Approximate cost
  },
  // Other models for future use
  LLAMA_3_1_405B: {
    name: "llama-3.1-405b-reasoning",
    provider: "groq",
    type: "premium",
    description: "High-performance 405B model for complex analysis",
    inputCostPer1kTokens: 0.27, // Approximate cost
    outputCostPer1kTokens: 0.36, // Approximate cost
  },
} as const;

/**
 * Get the default economic model
 * @returns Default model name
 */
export function getDefaultModel(): string {
  return process.env.AI_MODEL_DEFAULT || SUPPORTED_MODELS.LLAMA_3_3_70B.name;
}

/**
 * Get model configuration
 * @param modelName - Model name
 * @returns Model configuration or null if not found
 */
export function getModelConfig(
  modelName: string
): (typeof SUPPORTED_MODELS)[keyof typeof SUPPORTED_MODELS] | null {
  for (const [_, config] of Object.entries(SUPPORTED_MODELS)) {
    if (config.name === modelName) {
      return config;
    }
  }
  return null;
}

/**
 * Validate that a model name is supported
 * @param modelName - Model name to validate
 * @returns True if model is supported
 */
export function isModelSupported(modelName: string): boolean {
  return getModelConfig(modelName) !== null;
}

/**
 * Get all available models
 * @returns Array of model names
 */
export function getAvailableModels(): string[] {
  return Object.values(SUPPORTED_MODELS).map((config) => config.name);
}

/**
 * Get economic model
 * @returns Economic model name
 */
export function getEconomicModel(): string {
  return SUPPORTED_MODELS.LLAMA_3_3_70B.name;
}

/**
 * Validate AI_MODEL_DEFAULT environment variable
 * @returns Valid model name or default
 */
export function validateModelConfig(): string {
  const configuredModel = process.env.AI_MODEL_DEFAULT;

  if (!configuredModel) {
    console.log("ℹ️  AI_MODEL_DEFAULT not set, using economic model");
    return getEconomicModel();
  }

  if (!isModelSupported(configuredModel)) {
    console.warn(
      `⚠️  AI_MODEL_DEFAULT '${configuredModel}' is not supported, falling back to economic model`
    );
    return getEconomicModel();
  }

  console.log(`✅ Using configured AI model: ${configuredModel}`);
  return configuredModel;
}

/**
 * System Prompt for AI Job Fit Analysis
 * 
 * This module contains the system-level instructions for the AI model.
 * These instructions are INVARIANT and apply to all analysis requests.
 * 
 * RESPONSIBILITIES:
 * - Define output format constraints (JSON-only, no markdown)
 * - Establish data handling principles (no hallucination, no fabrication)
 * - Set validation requirements
 * 
 * DO NOT include task-specific logic here.
 * Task-specific instructions belong in the user prompt (promptBuilder.ts).
 * 
 * ARCHITECTURE RATIONALE:
 * Separating system instructions from user prompts:
 * 1. Improves maintainability - change system behavior in one place
 * 2. Reduces token usage - system prompt is sent once, cached by provider
 * 3. Enhances clarity - clear separation of concerns
 * 4. Enables future multi-provider support - only system prompt needs adaptation
 */

/**
 * System-level instructions for the AI model.
 * 
 * These rules apply to ALL requests and define:
 * - How the AI should format its output
 * - How the AI should handle data
 * - What the AI should NOT do (hallucination prevention)
 * 
 * @constant
 */
export const SYSTEM_PROMPT = `You are a specialized job fit analysis assistant.

OUTPUT FORMAT RULES:
- Return ONLY valid JSON
- No markdown code blocks
- No explanatory text outside the JSON structure
- No additional commentary

DATA HANDLING PRINCIPLES:
- Use ONLY the structured input provided in the user prompt
- Do NOT fabricate data or infer details not explicitly present
- Do NOT make assumptions beyond what is stated
- Do NOT recalculate deterministic signals (yearsExperience, domainExperience)
- If deterministic signals appear inconsistent with your analysis, flag them in redFlags instead of recalculating

VALIDATION:
- If you cannot complete the task due to insufficient data, include the issue in redFlags
- All array fields must be present (can be empty arrays)
- All string fields must be present (can be empty strings if no data available)`;

/**
 * Future extension point for provider-specific system prompts.
 * 
 * Different AI providers may require slightly different system prompt formats.
 * This function allows customization while maintaining core principles.
 * 
 * @param _provider - The AI provider name (currently only 'openai' supported)
 * @returns The system prompt optimized for the specified provider
 */
export function getSystemPrompt(_provider: 'openai' = 'openai'): string {
  // Currently all providers use the same prompt
  // In the future, this could return provider-specific variations
  return SYSTEM_PROMPT;
}

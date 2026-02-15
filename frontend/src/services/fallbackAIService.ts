import type {
  AIProviderFallbackResponse,
  AnalysisResult,
  AIProviderFailureReason,
} from "../types/analysis";

/**
 * Firebase Vertex AI Fallback Service
 *
 * Handles cases where the primary backend AI provider (Groq) fails.
 * Uses Firebase Vertex AI's generative model to provide fallback analysis.
 *
 * Error Handling Strategy:
 * - If Groq fails: backend returns HTTP 200 with AIProviderFallbackResponse
 * - This service receives the fallback response with original prompts
 * - Calls Firebase generative model with the same prompts
 * - Returns analysis in same format as backend (AnalysisResult)
 * - If Firebase also fails: returns degraded response with user-facing explanation
 */

/**
 * Call Firebase Vertex AI generative model
 * with prompts from failed backend request
 */
export async function callFirebaseVertexAI(
  fallbackResponse: AIProviderFallbackResponse
): Promise<AnalysisResult | null> {
  // Firebase Vertex AI implementation would go here
  // This uses the backend's preserved prompts to generate fallback analysis

  if (!fallbackResponse.prompt?.user || !fallbackResponse.prompt?.system) {
    console.warn(
      "[FallbackAI] Missing prompts for Firebase fallback - cannot proceed"
    );
    return null;
  }

  // For now, return null to indicate Firebase not configured
  // In full implementation:
  // 1. Initialize TextServiceClient with GoogleAuth
  // 2. Call generateText with messages containing system + user prompts
  // 3. Parse response with parseFirebaseResponse()
  // 4. Return AnalysisResult or null on failure

  console.warn(
    "[FallbackAI] Firebase Vertex AI not yet configured - returning null"
  );
  return null;
}

/**
 * Create a degraded response when both primary and fallback providers fail
 * Returns a safe default that allows the user to proceed with manual review
 */
export function createDegradedResponse(
  failureReason: AIProviderFailureReason
): AnalysisResult {
  const degradedMessages: Record<AIProviderFailureReason, string> = {
    rate_limit:
      "The AI service is temporarily overloaded. Please try again in a few moments.",
    quota_exceeded:
      "The AI service has reached its usage limit. Please try again later.",
    provider_unavailable:
      "The AI service is currently unavailable. Please try again in a few moments.",
    timeout:
      "The AI service took too long to respond. Please try again with a shorter CV.",
  };

  return {
    fitScore: 0.5, // Neutral score - requires manual review
    decision: "apply" as const, // Optimistic default - let user decide
    recruiterMessage:
      "Due to temporary service issues, we were unable to fully analyze this role. " +
      degradedMessages[failureReason] +
      " We recommend manual review of the job description and your CV.",
    coverLetter:
      "Dear Hiring Manager,\n\n" +
      "Thank you for considering my application for this position. " +
      "I am very interested in this opportunity and would appreciate the chance to discuss how my background and skills align with your needs.\n\n" +
      "Best regards",
    strengths: [],
    gaps: [],
    cvSuggestions: [],
    explanation: {
      positives: [
        "You applied quickly - showing strong interest",
        "Your submission was received and is under review",
      ],
      negatives: [
        "Automated analysis unavailable - manual review recommended",
      ],
      summary:
        "Due to temporary AI service unavailability, we recommend manually reviewing the job description and considering your fit based on your experience. " +
        "Our automated analysis will be available for your next application.",
    },
  };
}

/**
 * Handle a fallback response from the backend
 *
 * This is called when the primary backend AI provider (Groq) fails.
 * The backend has already created a structured fallback response with:
 * - Failure reason (RateLimit, QuotaExceeded, ProviderUnavailable, Timeout)
 * - Original system + user prompts (to reuse for fallback)
 * - Indication this is a fallback scenario
 *
 * This service attempts to call Firebase Vertex AI with the same prompts.
 * If that also fails, returns a safe degraded response.
 */
export async function handleProviderFallback(
  fallbackResponse: AIProviderFallbackResponse
): Promise<AnalysisResult> {
  console.log(
    "[FallbackAI] Handling provider fallback - reason:",
    fallbackResponse.reason
  );

  // Attempt Firebase fallback
  const firebaseResult = await callFirebaseVertexAI(fallbackResponse);
  if (firebaseResult) {
    console.log("[FallbackAI] Firebase Vertex AI response successful");
    return firebaseResult;
  }

  // Both providers failed - return degraded response
  console.warn(
    "[FallbackAI] Firebase Vertex AI also failed - returning degraded response"
  );
  return createDegradedResponse(fallbackResponse.reason);
}

import { generateWithFirebaseAI, createDegradedResponse } from './ai/firebaseAiService';
import type {
  AIProviderFallbackResponse,
  AnalysisResult,
} from '../types/analysis';

/**
 * Frontend Fallback Service
 *
 * Orchestrates AI fallback when Groq provider fails:
 * 1. Attempts Firebase Vertex AI Gemini with preserved prompts
 * 2. Returns degraded response if Firebase also fails
 *
 * This service is isolated from UI logic.
 */

/**
 * Handle a fallback response from backend
 *
 * When Groq fails, backend returns a structured fallback response with:
 * - Failure reason (RateLimit, QuotaExceeded, ProviderUnavailable, Timeout)
 * - Original system + user prompts for Firebase to use
 *
 * This attempts Firebase Vertex AI first, then returns safe degraded response.
 */
export async function handleProviderFallback(
  fallbackResponse: AIProviderFallbackResponse
): Promise<AnalysisResult> {
  console.log(
    '[FallbackAI] Handling provider fallback - reason:',
    fallbackResponse.reason
  );

  // Validate prompts exist
  if (!fallbackResponse.prompt?.user || !fallbackResponse.prompt?.system) {
    console.warn(
      '[FallbackAI] Missing prompts for Firebase fallback - returning degraded response'
    );
    return createDegradedResponse(fallbackResponse.reason);
  }

  // Attempt Firebase Vertex AI fallback
  const firebaseResult = await generateWithFirebaseAI(fallbackResponse.prompt);
  
  if (firebaseResult) {
    console.log('[FallbackAI] Firebase Vertex AI response successful');
    return firebaseResult;
  }

  // Both providers failed - return degraded response
  console.warn(
    '[FallbackAI] Firebase Vertex AI also failed - returning degraded response'
  );
  return createDegradedResponse(fallbackResponse.reason);
}

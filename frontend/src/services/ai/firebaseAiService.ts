import type { AnalysisResult, AIProviderFailureReason } from '../../types/analysis';

/**
 * Firebase Vertex AI Service
 *
 * Handles AI generation using Firebase Vertex AI Gemini model as a fallback provider.
 * Provides normalized output format independent of underlying SDK changes.
 *
 * Error Handling:
 * - Timeouts (>30s)
 * - Network failures
 * - Invalid response structure
 * - Empty candidates
 *
 * Never returns raw SDK response to UI.
 */

export interface StructuredPrompt {
  system: string;
  user: string;
}

/**
 * Generate analysis using Firebase Vertex AI Gemini model
 *
 * @param prompt - Structured prompt with system and user content
 * @returns Normalized AnalysisResult or null if generation fails
 */
export async function generateWithFirebaseAI(
  prompt: StructuredPrompt
): Promise<AnalysisResult | null> {
  const startTime = performance.now();
  const TIMEOUT_MS = 30000; // 30 second timeout

  console.log('[FirebaseAI] 🚀 Starting generation', {
    systemPromptLength: prompt?.system?.length || 0,
    userPromptLength: prompt?.user?.length || 0,
    timeout: TIMEOUT_MS
  });

  try {
    // Validate prompt structure
    if (!prompt?.system || !prompt?.user) {
      console.warn('[FirebaseAI] ❌ Invalid prompt structure provided', {
        hasSystem: !!prompt?.system,
        hasUser: !!prompt?.user
      });
      return null;
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      console.log('[FirebaseAI] 📦 Loading Firebase AI SDK...');
      // Initialize Firebase AI using dynamic import with string template
      // This prevents Vite from trying to resolve the module at build time
      // @ts-ignore - Firebase AI types
      const firebaseAIModule = 'firebase/ai/vertex';
      const { getAI, VertexAIBackend } = await import(/* @vite-ignore */ firebaseAIModule);
      
      if (!getAI || !VertexAIBackend) {
        console.warn('[FirebaseAI] ⚠️ Vertex AI not available in SDK');
        return null;
      }

      console.log('[FirebaseAI] ✅ Firebase AI SDK loaded successfully');

      // Get AI instance
      console.log('[FirebaseAI] 🔧 Initializing Vertex AI backend...');
      // @ts-ignore
      const ai = getAI({
        backend: new VertexAIBackend(),
      });

      console.log('[FirebaseAI] 📡 Calling Gemini model (gemini-1.5-flash)...');
      // Call Gemini model
      // @ts-ignore
      const response = await ai.generateText({
        model: 'gemini-1.5-flash',
        messages: [
          {
            role: 'system',
            content: prompt.system,
          },
          {
            role: 'user',
            content: prompt.user,
          },
        ],
      });

      clearTimeout(timeoutId);

      console.log('[FirebaseAI] 📥 Received response from Gemini', {
        hasResponse: !!response,
        responseType: typeof response
      });

      // Validate response structure
      if (!response || typeof response !== 'object') {
        console.warn('[FirebaseAI] ⚠️ Invalid response structure', { response });
        return null;
      }

      // Extract text from response
      // @ts-ignore
      const text = response.text || response.content?.[0]?.text;
      console.log('[FirebaseAI] 📝 Extracting text from response', {
        hasText: !!text,
        textLength: text?.length || 0,
        textPreview: text?.substring(0, 100)
      });
      
      if (!text || typeof text !== 'string') {
        console.warn('[FirebaseAI] ⚠️ No text content in response', { response });
        return null;
      }

      // Parse and normalize response
      console.log('[FirebaseAI] 🔍 Parsing response text...');
      const result = parseFirebaseResponse(text);
      const duration = performance.now() - startTime;

      if (result) {
        console.log(
          `[FirebaseAI] ✅ Generation successful (${duration.toFixed(0)}ms)`,
          {
            fitScore: result.fitScore,
            decision: result.decision,
            hasStrengths: result.strengths?.length > 0,
            hasGaps: result.gaps?.length > 0
          }
        );
        return result;
      }

      console.warn('[FirebaseAI] ⚠️ Failed to parse response');
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    const duration = performance.now() - startTime;

    if (error instanceof Error) {
      // Check for timeout
      if (error.name === 'AbortError' || error.message === 'Aborted') {
        console.warn(
          `[FirebaseAI] ⏱️ Generation timeout (>${TIMEOUT_MS}ms after ${duration.toFixed(0)}ms)`,
          { promptLength: prompt.system.length + prompt.user.length }
        );
        return null;
      }

      // Check for network errors
      if (
        error.message.includes('network') ||
        error.message.includes('fetch')
      ) {
        console.warn('[FirebaseAI] 🌐 Network error:', error.message);
        return null;
      }

      // Other errors
      console.error(
        `[FirebaseAI] ❌ Generation failed (${duration.toFixed(0)}ms):`,
        {
          errorName: error.name,
          errorMessage: error.message,
          errorStack: error.stack?.split('\n').slice(0, 3)
        }
      );
      return null;
    }

    // Unknown error type
    console.error('[FirebaseAI] ❌ Unknown error during generation:', error);
    return null;
  }
}

/**
 * Parse Firebase AI response text into structured AnalysisResult
 */
function parseFirebaseResponse(text: string): AnalysisResult | null {
  console.log('[FirebaseAI] 🔍 parseFirebaseResponse called', {
    textLength: text?.length || 0,
    textType: typeof text,
    textPreview: text?.substring(0, 150)
  });

  try {
    // Attempt to extract JSON from response text
    // Firebase responses may include markdown wrapping
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('[FirebaseAI] ⚠️ No JSON found in response', {
        textPreview: text.substring(0, 200)
      });
      return null;
    }

    console.log('[FirebaseAI] 📋 JSON extracted from response', {
      jsonLength: jsonMatch[0].length,
      jsonPreview: jsonMatch[0].substring(0, 150)
    });

    const parsed = JSON.parse(jsonMatch[0]);

    console.log('[FirebaseAI] ✅ JSON parsed successfully', {
      parsedType: typeof parsed,
      keys: typeof parsed === 'object' ? Object.keys(parsed) : [],
      hasContentFields: !!(parsed.fitScore && parsed.decision)
    });

    // Validate response structure matches AnalysisResult
    if (
      typeof parsed.fitScore !== 'number' ||
      !['apply', 'apply_with_fixes', 'skip'].includes(parsed.decision) ||
      typeof parsed.recruiterMessage !== 'string' ||
      typeof parsed.coverLetter !== 'string'
    ) {
      console.warn('[FirebaseAI] ⚠️ Response missing or invalid required fields', {
        hasFitScore: typeof parsed.fitScore === 'number',
        hasDecision: ['apply', 'apply_with_fixes', 'skip'].includes(parsed.decision),
        hasRecruiterMessage: typeof parsed.recruiterMessage === 'string',
        hasCoverLetter: typeof parsed.coverLetter === 'string'
      });
      return null;
    }

    console.log('[FirebaseAI] ✅ Response validation passed, returning normalized result');

    return {
      fitScore: parsed.fitScore,
      decision: parsed.decision,
      recruiterMessage: parsed.recruiterMessage,
      coverLetter: parsed.coverLetter,
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      gaps: Array.isArray(parsed.gaps) ? parsed.gaps : [],
      cvSuggestions: Array.isArray(parsed.cvSuggestions)
        ? parsed.cvSuggestions
        : [],
      explanation: {
        positives: Array.isArray(parsed.explanation?.positives)
          ? parsed.explanation.positives
          : [],
        negatives: Array.isArray(parsed.explanation?.negatives)
          ? parsed.explanation.negatives
          : [],
        summary: parsed.explanation?.summary || '',
      },
    };
  } catch (error) {
    console.error('[FirebaseAI] ❌ Failed to parse response:', {
      error: error instanceof Error ? error.message : error,
      errorType: error instanceof Error ? error.name : typeof error,
      textPreview: text?.substring(0, 200)
    });
    return null;
  }
}

/**
 * Verify Firebase AI availability
 * Returns true if Firebase AI is ready to use
 */
export async function isFirebaseAIAvailable(): Promise<boolean> {
  console.log('[FirebaseAI] 🔍 Checking Firebase AI availability...');
  try {
    // Check if Firebase AI module can be loaded using dynamic import
    // String template prevents Vite from resolving at build time
    // @ts-ignore
    const firebaseAIModule = 'firebase/ai';
    const { getAI } = await import(/* @vite-ignore */ firebaseAIModule);
    const available = !!getAI;
    console.log(`[FirebaseAI] ${available ? '✅' : '❌'} Firebase AI available:`, available);
    return available;
  } catch (error) {
    console.warn('[FirebaseAI] ⚠️ Firebase AI availability check failed:', error);
    return false;
  }
}

/**
 * Create a degraded response when Firebase AI also fails
 * Returns safe default allowing user to proceed
 */
export function createDegradedResponse(
  failureReason: AIProviderFailureReason
): AnalysisResult {
  console.log('[FirebaseAI] 🔄 Creating degraded response', { reason: failureReason });
  
  const degradedMessages: Record<AIProviderFailureReason, string> = {
    rate_limit:
      'The AI service is temporarily overloaded. Please try again in a few moments.',
    quota_exceeded:
      'The AI service has reached its usage limit. Please try again later.',
    provider_unavailable:
      'The AI service is currently unavailable. Please try again in a few moments.',
    timeout:
      'The AI service took too long to respond. Please try again with a shorter CV.',
  };

  const response: AnalysisResult = {
    fitScore: 0.5,
    decision: 'apply' as const,
    recruiterMessage:
      'Due to temporary service issues, we were unable to fully analyze this role. ' +
      degradedMessages[failureReason] +
      ' We recommend manual review of the job description and your CV.',
    coverLetter:
      'Dear Hiring Manager,\n\n' +
      'Thank you for considering my application for this position. ' +
      'I am very interested in this opportunity and would appreciate the chance to discuss how my background and skills align with your needs.\n\n' +
      'Best regards',
    strengths: [],
    gaps: [],
    cvSuggestions: [],
    explanation: {
      positives: [
        'You applied quickly - showing strong interest',
        'Your submission was received and is under review',
      ],
      negatives: [
        'Automated analysis unavailable - manual review recommended',
      ],
      summary:
        'Due to temporary AI service unavailability, we recommend manually reviewing the job description and considering your fit based on your experience. Our automated analysis will be available for your next application.',
    },
  };

  console.log('[FirebaseAI] ✅ Degraded response created', {
    fitScore: response.fitScore,
    decision: response.decision,
    reason: failureReason
  });

  return response;
}

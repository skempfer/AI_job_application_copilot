# AI Provider Architecture v3.0 - Frontend Fallback with Firebase

## Overview

The AI inference layer v3.0 implements a **two-tier fallback strategy** that separates provider resilience concerns:

- **Primary Provider (Backend)**: Groq LLM (llama-3.3-70b-versatile)
- **Fallback Trigger**: Groq failure classification (rate limit, quota, unavailable, timeout)
- **Fallback Provider (Frontend)**: Firebase Vertex AI's generative model
- **Fallback Signal**: HTTP 200 with structured `AIProviderFallbackResponse` containing original prompts

This architecture leverages Firebase's availability while keeping the backend simple and focused on the primary provider.

## Architecture Diagram

```
Frontend (React)                          Backend (Node.js)
    │                                           │
    │  CV + Job Description                    │
    ├──────────────────POST /api/analyze──────>│
    │                                           │
    │                                  ┌────────▼──────────────┐
    │                                  │  GroqProvider         │
    │                                  │  - Call Groq LLM      │
    │                                  │  - Classify Errors:   │
    │                                  │    • RateLimit (429)  │
    │                                  │    • QuotaExceeded    │
    │                                  │    • ProviderUnavail  │
    │                                  │    • Timeout (408/504)│
    │                                  └────────┬─────────────┘
    │                                           │
    │                       ┌───────────────────┴──────────────────┐
    │                       │ Success                              │ Failure
    │                       ▼                                      ▼
    │            ┌──────────────────────┐        ┌─────────────────────────┐
    │            │ AnalysisResult       │        │ AIProviderError         │
    │            │ - fitScore, decision │        │ - reason (classified)   │
    │            │ - recruiterMessage   │        │ - prompt (system+user)  │
    │            │ - coverLetter        │        │ - status code           │
    │            └──────────┬───────────┘        └──────────┬──────────────┘
    │                       │                               │
    │  ┌──────HTTP 200──────┤                               │
    │  │  AnalysisResult    │                               │
    │  │                    │       HTTP 200 ─────────────>│
    │  │                    │       AIProviderFallbackResp  │
    │  │                    │       ├─ success: false       │
    │  │                    │       ├─ fallback: 'firebase' │
    │  │                    │       ├─ reason: string       │
    │  │                    │       ├─ message: string      │
    │  │                    │       └─ prompt: {            │
    │  │                    │           system: string,     │
    │  └────────────────────┴──────────  user: string       │
    │                                     }                 │
    │                       Client-side handling:           │
    │  ┌────────┬───────────────────────────────────────────┤
    │  ▼        ▼                                            │
    ▼ Success  Fallback Detected              (ignored)
  ┌────────────────────────┐
  │ Use normal result      │
  └────────────────────────┘
         │
  ┌──────▼─────────────────────────────┐
  │ callFirebaseVertexAI()              │
  │ - Use preserved prompt              │
  │ - Call Firebase generative model    │
  │ - Return AnalysisResult or null     │
  └──────┬───────────────────────────────┘
         │
    ┌────┴─────────────┐
    │ Success or Fail   │
    ▼                   ▼
  ┌─────────┐      ┌──────────────────┐
  │Firebase │      │ Return degraded  │
  │response │      │ response (fit=0.5)│
  └─────────┘      └──────────────────┘
         │                    │
         └────────┬───────────┘
                  ▼
           ┌─────────────────┐
           │ AnalysisResult  │
           │ (to UI)         │
           └─────────────────┘
```

## Error Classification (Backend)

The Groq provider classifies failures into four categories, allowing intelligent frontend fallback:

```typescript
export const AI_FAILURE_REASON = {
  RateLimit:          "rate_limit"         // HTTP 429
  QuotaExceeded:      "quota_exceeded"     // Error code: insufficient_quota
  ProviderUnavailable: "provider_unavailable" // HTTP 502/503
  Timeout:            "timeout"            // HTTP 408/504
}
```

**Implications**:
- **RateLimit**: Temporary spike, both providers might be affected → degraded response
- **QuotaExceeded**: Usage limit reached → degraded response with guidance to retry later
- **ProviderUnavailable**: Service down → degraded response or fallback if Firebase available
- **Timeout**: Request took too long → degraded response or retry with shorter input

## Fallback Response Format

When the backend Groq provider fails, it returns HTTP 200 (not an error status) with:

```typescript
interface AIProviderFallbackResponse {
  success: false;                    // Indicates fallback mode
  fallback: "firebase";              // Which fallback to attempt
  reason: AIProviderFailureReason;   // Why Groq failed
  message: string;                   // Human-readable error
  prompt: {
    system: string;                  // Original system prompt
    user: string;                    // Original user prompt
  }
}
```

**Design Rationale**:
- HTTP 200 allows frontend to distinguish from actual API failures (4xx/5xx)
- Original prompts enable frontend to call Firebase with exact same context
- Failure reason guides frontend error handling and user messaging
- Frontend can detect this with type guard: `response.success === false && response.fallback === 'firebase'`

## Frontend Fallback Handling

### 1. API Client Detection

File: `frontend/src/domain/apiClient.ts`

```typescript
// Type guard to detect fallback response
function isAIProviderFallbackResponse(data: unknown): data is AIProviderFallbackResponse {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    obj.success === false &&
    obj.fallback === 'firebase' &&
    obj.reason &&
    obj.message &&
    obj.prompt &&
    typeof (obj.prompt as Record<string, unknown>).system === 'string' &&
    typeof (obj.prompt as Record<string, unknown>).user === 'string'
  );
}

// In analyzeJobFit()
const response = await fetch(`${API_BASE_URL}/api/analyze`, {...});
const responseData = await response.json();

if (isAIProviderFallbackResponse(responseData)) {
  // Detected fallback from backend
  const fallbackResult = await handleProviderFallback(responseData);
  return { ...fallbackResult, detectedLanguage };
}

// Normal success path
return { ...responseData, detectedLanguage };
```

### 2. Fallback Service Implementation

File: `frontend/src/services/fallbackAIService.ts`

```typescript
export async function handleProviderFallback(
  fallbackResponse: AIProviderFallbackResponse
): Promise<AnalysisResult> {
  // Attempt Firebase Vertex AI with preserved prompts
  const firebaseResult = await callFirebaseVertexAI(fallbackResponse);
  
  if (firebaseResult) {
    return firebaseResult;
  }
  
  // Firebase also failed - return safe degraded response
  return createDegradedResponse(fallbackResponse.reason);
}
```

**Three Outcomes**:
1. **Firebase Success**: Return full analysis from Firebase Vertex AI
2. **Firebase Failure**: Return degraded response (fitScore=0.5, decision='apply')
3. **Missing Prompts**: Log warning, return degraded response

### 3. Degraded Response Strategy

When both providers fail, return a safe default that:

- Sets `fitScore` to 0.5 (neutral, requires manual review)
- Sets `decision` to 'apply' (optimistic default)
- Explains the system issue to the recruiter
- Suggests manual review of job description
- Provides a generic but professional cover letter template
- Acknowledges the failure in the explanation

**Benefits**:
- User can proceed without blocking on provider failures
- Transparent about automation unavailability
- Preserves user intent (they want to apply)
- Encourages manual due diligence

## Type System

Added to `frontend/src/types/analysis.ts`:

```typescript
// Error classification
export const AI_FAILURE_REASON = {
  RateLimit: "rate_limit",
  QuotaExceeded: "quota_exceeded",
  ProviderUnavailable: "provider_unavailable",
  Timeout: "timeout",
} as const;

export type AIProviderFailureReason = typeof AI_FAILURE_REASON[keyof typeof AI_FAILURE_REASON];

// Fallback provider identifier
export const AI_FALLBACK_PROVIDER = {
  Firebase: "firebase",
} as const;

export type AIFallbackProvider = typeof AI_FALLBACK_PROVIDER[keyof typeof AI_FALLBACK_PROVIDER];

// Structured fallback response from backend
export interface AIProviderFallbackResponse {
  success: false;
  fallback: AIFallbackProvider;
  reason: AIProviderFailureReason;
  message: string;
  prompt: {
    system: string;
    user: string;
  };
}
```

## Backend Changes

### 1. Provider Error Classification

File: `backend/src/services/providers/providerErrors.ts` (new)

```typescript
export class AIProviderError extends Error {
  constructor(public data: {
    provider: AIProviderName;
    reason: AIProviderFailureReason;
    message: string;
    status?: number;
    prompt?: { system: string; user: string };
    cause?: unknown;
  }) {
    super(data.message);
  }
}
```

### 2. GroqProvider Error Handling

File: `backend/src/services/providers/GroqProvider.ts`

Methods added:
- `classifyFailure(error)` → `AIProviderFailureReason | null`
- `getStatusCode(error)` → `number`
- `getErrorCode(error)` → `string | null`

Behavior:
- Wraps `generate()` in try-catch
- Classifies failures by HTTP status and error codes
- Throws structured `AIProviderError` for classified failures
- Rethrows unclassifiable errors as-is

### 3. AIService Prompt Attachment

File: `backend/src/services/aiService.ts`

Before rethrowing errors:
```typescript
try {
  return await this.provider.generate(messages);
} catch (error) {
  if (error instanceof AIProviderError) {
    // Attach prompt context for frontend fallback
    error.data.prompt = {
      system: messages.find(m => m.role === 'system')?.content || '',
      user: messages.find(m => m.role === 'user')?.content || '',
    };
  }
  throw error;
}
```

### 4. Route Fallback Response

File: `backend/src/routes/analyze.ts`

```typescript
try {
  const result = await aiService.analyzeJobFit(cv, jobDescription, language);
  res.status(200).json(result);
} catch (error) {
  if (error instanceof AIProviderError && error.data.prompt) {
    // Return fallback signal instead of error
    const fallbackResponse: AIProviderFallbackResponse = {
      success: false,
      fallback: AI_FALLBACK_PROVIDER.Firebase,
      reason: error.data.reason,
      message: "Primary AI provider unavailable",
      prompt: error.data.prompt,
    };
    res.status(200).json(fallbackResponse);
    return;
  }
  
  // Other errors - standard error handling
  const status = (error as any).status || 500;
  res.status(status).json({ error: error.message });
}
```

## Migration from v2.1

### Removed Components
- `AIOrchestrator` class (multi-provider orchestration)
- `DeepSeekProvider` implementation
- Fallback configuration fields in `AIServiceConfig`
- Backend fallback logic entirely

### New Components
- `AIProviderError` class for structured error information
- Error classification in `GroqProvider`
- Fallback response type and handling in routes
- Firebase app initialization helper

### Configuration Changes

Removed environment variables:
```
DEEPSEEK_API_KEY        # No longer needed
DEEPSEEK_API_URL        # No longer needed  
DEEPSEEK_MODEL          # No longer needed
```

Required environment variables (unchanged):
```
GROQ_API_KEY           # Primary provider
GROQ_API_URL           # Primary provider
GROQ_MODEL             # Primary provider (llama-3.3-70b-versatile)
```

New for frontend (not yet required):
```
VITE_FIREBASE_API_KEY     # For fallback AI
VITE_FIREBASE_PROJECT_ID  # For fallback AI
# ... other Firebase config
```

## Benefits of v3.0 Architecture

1. **Simplified Backend**: Single provider focus, no orchestration complexity
2. **Firebase Leverage**: Uses existing Firebase investment for fallback
3. **Better Observability**: Structured error classification guides debugging
4. **Graceful Degradation**: Both providers fail → safe default response
5. **Prompt Preservation**: Frontend can retry with exact same context
6. **Type Safety**: Fallback responses are distinct HTTP 200 responses
7. **Clear Separation**: Provider resilience (backend) vs provider availability (frontend)

## Testing Strategy

### Backend Tests
- Error classification tests (429 → RateLimit, etc.)
- Fallback response structure validation
- Prompt preservation through error chain

### Frontend Tests
- Type guard validation (detecting fallback responses)
- Fallback service response parsing
- Degraded response generation for each failure reason
- API client fallback detection and fallback service invocation

## Future Enhancements

1. **Firebase Vertex AI Implementation**: Complete `callFirebaseVertexAI()` with actual generative model call
2. **Firestore Caching**: Cache analysis results using job description hash for faster degraded responses
3. **Provider Metrics**: Track failure rates and provider performance in analytics
4. **Retry Logic**: Implement exponential backoff for timeout failures
5. **User Notification**: Show "AI service degraded" banner when fallback used
6. **Fallback Persistence**: Store fallback responses for offline availability

## See Also
- [AI-INFERENCE-ARCHITECTURE.md](./AI-INFERENCE-ARCHITECTURE.md) - Prompt design and scoring logic
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System overview and data flow

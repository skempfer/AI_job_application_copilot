# AI Provider Orchestration with Fallback

## Overview

The AI service now uses a **provider abstraction layer** with automatic fallback support. This allows seamless switching between AI providers (Groq, DeepSeek) with rate limit resilience.

**Primary Provider**: Groq (llama-3.3-70b-versatile)  
**Fallback Provider**: DeepSeek (deepseek-chat)  
**Trigger**: Rate limit errors (HTTP 429) only

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      AIService                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │            AIOrchestrator                          │    │
│  │  ┌──────────────┐         ┌──────────────┐        │    │
│  │  │ Primary:     │  429?   │ Fallback:    │        │    │
│  │  │ GroqProvider │───────>│DeepSeekProvider│       │    │
│  │  └──────────────┘         └──────────────┘        │    │
│  │                                                     │    │
│  │  Other errors → Immediate rethrow                  │    │
│  └────────────────────────────────────────────────────┘    │
│                         │                                   │
│                         ▼                                   │
│              Raw JSON Response                              │
│                         │                                   │
│              ┌──────────┴──────────┐                        │
│              ▼                     ▼                        │
│        JSON.parse()          Empty check                    │
│              │                     │                        │
│              ▼                     ▼                        │
│        Zod Validation        Error logging                  │
│              │                                               │
│              ▼                                               │
│        AnalysisResult                                       │
└─────────────────────────────────────────────────────────────┘
```

## Provider Abstraction

### Interface Definition

All providers implement the `AIProvider` interface:

```typescript
interface AIProvider {
  generate(messages: ChatMessage[]): Promise<string>;
  getProviderName(): "groq" | "deepseek";
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}
```

### Design Principles

1. **Single Responsibility**: Providers only handle API communication
2. **No Business Logic**: Providers don't validate or parse responses
3. **Error Propagation**: Providers throw errors, don't swallow them
4. **Stateless**: Each request is independent
5. **OpenAI-Compatible**: Uses OpenAI SDK with different base URLs

## Orchestrator Behavior

### Fallback Logic

```typescript
class AIOrchestrator {
  async generate(messages: ChatMessage[]): Promise<string> {
    try {
      return await this.primary.generate(messages);
    } catch (error) {
      if (this.isRateLimit(error)) {
        // Fallback ONLY on rate limits
        return await this.fallback.generate(messages);
      }
      throw error; // All other errors rethrown
    }
  }
}
```

### Rate Limit Detection

The orchestrator detects rate limits using multiple methods:

1. **HTTP Status**: `error.status === 429`
2. **Error Code**: `error.code === "rate_limit_exceeded"`
3. **Message Pattern**: `error.message.includes("rate limit")`

### No Infinite Loops

- **Single fallback attempt**: If fallback also fails, error is thrown
- **No retry logic**: Prevents cascading failures
- **Clear error propagation**: Errors maintain original context

## Validation Safety

### Both Providers Validated Equally

```typescript
// Response from ANY provider goes through:
1. JSON.parse() → throws SyntaxError if malformed
2. validateAIResponse(data) → throws ValidationError if invalid schema
```

### Rejection Criteria

**Malformed JSON**:
```json
{invalid json
```
→ `SyntaxError` → Logged and rejected

**Invalid Schema**:
```json
{
  "hardSkillsDetected": "not an array",  // Wrong type
  "recruiterMessage": ""                 // Empty string
}
```
→ `AIResponseValidationError` → Logged with violations → Rejected

**Missing Fields**:
```json
{
  "hardSkillsDetected": ["React"]
  // Missing required fields
}
```
→ `AIResponseValidationError` → Logged with violations → Rejected

## Structured Logging

### Logged Metadata

Every request logs:

```typescript
{
  providerUsed: "groq" | "deepseek",
  fallbackTriggered: boolean,
  responseTimeMs: number,
  schemaValidationSuccess: boolean
}
```

### Log Examples

**Successful Primary**:
```
Provider response received: {
  providerUsed: "groq",
  fallbackTriggered: false,
  responseTimeMs: 1234.56
}

Schema validation: {
  schemaValidationSuccess: true,
  providerUsed: "groq"
}
```

**Rate Limit Fallback**:
```
⚠️ Primary provider hit rate limit, falling back to secondary provider

Provider response received: {
  providerUsed: "deepseek",
  fallbackTriggered: true,
  responseTimeMs: 2345.67
}

Schema validation: {
  schemaValidationSuccess: true,
  providerUsed: "deepseek"
}
```

**Validation Failure**:
```
Provider returned response that failed schema validation: {
  errorType: "schema_validation_error",
  schemaValidationSuccess: false,
  violationCount: 2,
  violations: [
    { path: ["recruiterMessage"], type: "invalid_type" }
  ]
}
```

### Privacy & Security

**Never Logged**:
- API keys
- Full CV content
- Full job description content
- User personal data

**Always Logged**:
- Request timing
- Provider used
- Validation success/failure
- Error types and counts
- Response metadata only

## Configuration

### Environment Variables

**Primary Provider (Groq)**:
```bash
GROQ_API_KEY=your-groq-api-key           # Required
GROQ_API_URL=https://api.groq.com/openai/v1  # Optional
GROQ_MODEL=llama-3.3-70b-versatile       # Optional
```

**Fallback Provider (DeepSeek)**:
```bash
DEEPSEEK_API_KEY=your-deepseek-api-key   # Optional
DEEPSEEK_API_URL=https://api.deepseek.com # Optional
DEEPSEEK_MODEL=deepseek-chat             # Optional
```

**Behavior**:
- If `DEEPSEEK_API_KEY` is set → Orchestrator with fallback enabled
- If `DEEPSEEK_API_KEY` is not set → Primary provider only (no fallback)

### Startup Logging

```
🚀 Viora Backend running on http://localhost:3001
⚡ Primary provider: Groq (llama-3.3-70b-versatile)
🔄 Fallback provider: DeepSeek (deepseek-chat)
```

Or without fallback:
```
🚀 Viora Backend running on http://localhost:3001
⚡ Primary provider: Groq (llama-3.3-70b-versatile)
⚠️  No fallback provider configured (set DEEPSEEK_API_KEY to enable)
```

## Adding New Providers

### Step 1: Create Provider Class

```typescript
// services/providers/NewProvider.ts
import OpenAI from "openai";
import type { AIProvider, ChatMessage } from "./types.js";

export interface NewProviderConfig {
  apiKey: string;
  baseURL?: string;
  model?: string;
}

export class NewProvider implements AIProvider {
  private client: OpenAI;
  private model: string;

  constructor(config: NewProviderConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL || "https://api.newprovider.com",
    });
    this.model = config.model || "default-model";
  }

  async generate(messages: ChatMessage[]): Promise<string> {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      temperature: 0.2,  // Keep aligned with other providers
      max_tokens: 1500,  // Keep aligned with other providers
    });

    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("Provider returned empty response");
    }

    return content;
  }

  getProviderName(): "groq" | "deepseek" {
    return "groq"; // Add new provider name to type definition
  }
}
```

### Step 2: Update Type Definitions

```typescript
// services/providers/types.ts
export interface AIProvider {
  generate(messages: ChatMessage[]): Promise<string>;
  getProviderName(): "groq" | "deepseek" | "newprovider"; // Add here
}
```

### Step 3: Export Provider

```typescript
// services/providers/index.ts
export { NewProvider, NewProviderConfig } from "./NewProvider.js";
```

### Step 4: Configure in AIService

```typescript
// services/aiService.ts
const primaryProvider = new NewProvider({
  apiKey: config.apiKey,
  baseURL: config.apiUrl,
  model: config.model,
});
```

### Step 5: Add Tests

```typescript
// services/providers/NewProvider.test.ts
describe("NewProvider", () => {
  it("should return content on successful response", async () => {
    // Mock and test
  });

  it("should throw error on empty response", async () => {
    // Test error handling
  });
});
```

## Testing

### Unit Tests

**Provider Tests** (`providers.test.ts`):
- ✅ Successful API calls
- ✅ Empty response handling
- ✅ Configuration validation

**Orchestrator Tests** (`AIOrchestrator.test.ts`):
- ✅ Primary provider success
- ✅ Rate limit fallback
- ✅ Non-429 error rethrow
- ✅ No infinite fallback loop
- ✅ Rate limit detection

**Integration Tests** (`aiService.test.ts`):
- ✅ End-to-end validation
- ✅ Logging verification
- ✅ No regressions

### Test Coverage

```
Test Suites: 14 passed
Tests:       328 passed (23 provider tests added)
```

## Performance Characteristics

### Response Times

**Groq (Primary)**:
- Average: ~1-2 seconds
- 95th percentile: ~3 seconds

**DeepSeek (Fallback)**:
- Average: ~2-3 seconds
- 95th percentile: ~5 seconds

### Fallback Overhead

- Detection: <1ms
- Logging: <1ms
- Total overhead: Negligible

### Rate Limit Handling

- **No backoff delay**: Immediate fallback
- **No retries**: Single attempt per provider
- **Fast failure**: Errors propagate immediately

## Error Messages

### User-Facing Errors

**JSON Parsing Failed**:
> "AI returned malformed response. Please try again."

**Validation Failed**:
> "AI response is incomplete or invalid. Please try again."

**Rate Limit (Both Providers)**:
> "Service is experiencing high demand. Please try again in a moment."

**Other Errors**:
> Original error message passed through

### Internal Logs

All errors include:
- Correlation ID for tracing
- Provider used
- Error type classification
- Validation violations (if applicable)
- Response preview (for debugging)

## Success Criteria

✅ **Fallback only triggers on 429**: Other errors don't waste API calls  
✅ **JSON schema validation unchanged**: Same strict validation for both  
✅ **No change in API response structure**: Frontend unaffected  
✅ **Tests passing**: 328 tests, 100% pass rate  
✅ **Documentation updated**: This document reflects actual implementation  
✅ **No regression in behavior**: All existing functionality preserved  

## Future Enhancements

### Potential Improvements

1. **Configurable Retry Logic**: Add optional exponential backoff
2. **Circuit Breaker**: Temporarily disable failing providers
3. **Load Balancing**: Distribute requests across multiple providers
4. **Cost Optimization**: Route to cheapest available provider
5. **Response Caching**: Cache identical requests
6. **A/B Testing**: Compare provider quality metrics

### Provider Candidates

- **Anthropic Claude**: High quality, good JSON support
- **Google Gemini**: Fast, cost-effective
- **Meta Llama (self-hosted)**: Privacy, no API costs
- **Mistral AI**: European option, GDPR-compliant

## References

- [GroqProvider.ts](../backend/src/services/providers/GroqProvider.ts)
- [DeepSeekProvider.ts](../backend/src/services/providers/DeepSeekProvider.ts)
- [AIOrchestrator.ts](../backend/src/services/providers/AIOrchestrator.ts)
- [AIService.ts](../backend/src/services/aiService.ts)
- [Provider Tests](../backend/src/services/providers/)

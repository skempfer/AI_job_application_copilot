# AI Service Error Handling & Recovery

## Overview

The AI inference layer implements comprehensive error handling with three key principles:

1. **Fail Fast** - Detect invalid responses immediately
2. **Fail Loud** - Log detailed error context for debugging
3. **Fail Safe** - Return meaningful user messages

## Error Hierarchy

```
Error
├── AIResponseValidationError (extends Error)
│   └── Schema validation failures
├── SyntaxError
│   └── JSON parsing failures
├── Network/API Errors
│   ├── Timeout
│   ├── Rate limit
│   └── Service unavailable
└── Logic Errors
    ├── Invalid input
    └── Type mismatches
```

## Error Types & Handling

### 1. Schema Validation Errors

**What**: Response doesn't match expected AISignals schema

**When it happens**: AI returns:
- Missing required fields
- Wrong data types
- Invalid enum values (e.g., seniorityMatch = "maybe")

**Example**:
```typescript
{
  "hardSkillsDetected": [],
  // MISSING: mandatoryRequirementsMet
  // WRONG TYPE: seniorityMatch = 123 (should be string)
}
```

**Code**:
```typescript
try {
  const signals = validateAIResponse(apiResponse);
} catch (error) {
  if (error instanceof AIResponseValidationError) {
    // Access violation details
    error.violations.forEach(violation => {
      console.log(`Field: ${violation.path.join('.')}`);
      console.log(`Error: ${violation.message}`);
      console.log(`Expected: ${violation.code}`);
    });

    logger.warn('Schema validation failed', {
      violations: error.violations.map(v => ({
        path: v.path.join('.'),
        message: v.message,
      })),
      fieldCount: error.violations.length,
    });
  }
}
```

**Example Violation Details**:
```json
{
  "path": ["seniorityMatch"],
  "message": "Invalid enum value. Expected 'above' | 'match' | 'below'",
  "code": "invalid_enum_value",
  "options": ["above", "match", "below"],
  "receivedString": "maybe"
}
```

**User Message**:
```
"Unable to process job fit analysis. Please try again."
(Internal error logged for debugging)
```

### 2. JSON Parse Errors

**What**: Response is not valid JSON

**When it happens**: AI returns:
- Malformed JSON
- Missing quotes
- Trailing commas
- Comments in JSON

**Example**:
```
{
  "hardSkillsDetected": ["Python", "AWS",],  // Trailing comma
  "mandatoryRequirementsMet": ["5+ years"], // Missing closing quote
}
```

**Code**:
```typescript
try {
  const cleanedJson = extractJSONFromMarkdown(response);
  const parsed = JSON.parse(cleanedJson);
} catch (error) {
  if (error instanceof SyntaxError) {
    logger.warn('JSON parse error', {
      error: error.message,
      position: error.message.match(/at position (\d+)/)?.[1],
      responseLength: response.length,
      sampleContent: response.substring(0, 200),
    });

    throw new Error(getErrorMessage('aiParsingFailed', language));
  }
}
```

**Logging Example**:
```
[WARN] services/aiService.ts
JSON parse error
Message: Unexpected token } in JSON at position 42
Position: 42
Response length: 1250
Sample: {"hardSkillsDetected": ["Python", "AWS",]}
```

**Recovery Strategy**: None - this should trigger AI model adjustment

### 3. API/Network Errors

**What**: Communication failure with AI provider

**When it happens**:
- Network timeout
- Rate limit exceeded (429)
- Quota exceeded
- Service unavailable (500, 503)

**Code**:
```typescript
logger.logAPIRequest('openai', 'gpt-3.5-turbo');

try {
  const response = await openai.chat.completions.create({
    messages: [...],
    timeout: 30_000,
  });
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes('429')) {
      logger.warn('Rate limit hit', {
        provider: 'openai',
        recommendation: 'implement backoff',
      });
      throw new Error(getErrorMessage('serviceTemporarilyUnavailable', language));
    }

    if (error.message.includes('timeout')) {
      logger.error('API timeout', {
        provider: 'openai',
        timeout: 30_000,
      });
      throw new Error(getErrorMessage('aiServiceTimeout', language));
    }

    logger.error('API error', {
      provider: 'openai',
      statusCode: error.statusCode,
      message: error.message,
    });
    throw error;
  }
}
```

**Logging Example**:
```
[ERROR] services/aiService.ts
API error
Provider: openai
Status Code: 503
Message: Service Unavailable

Correlation ID: 1699564234567-abc123def456
```

**Recovery Strategy**: Retry with exponential backoff (optional, client-side)

### 4. Input Validation Errors

**What**: CV or job description doesn't meet requirements

**When it happens**:
- Missing CV text
- Missing job description
- Text too short (< 50 chars)
- Text too long (> 50KB)

**Code**:
```typescript
function validateAnalysisInputs(cv: string, jobDescription: string): void {
  if (!cv?.trim()) {
    throw new Error(getErrorMessage('cvRequired', language));
  }

  if (!jobDescription?.trim()) {
    throw new Error(getErrorMessage('jobDescriptionRequired', language));
  }

  if (cv.length < 50) {
    logger.warn('CV too short', { length: cv.length });
    throw new Error(
      getErrorMessage('inputTooShort', language, { min: 50 })
    );
  }

  if (cv.length > 50_000 || jobDescription.length > 50_000) {
    logger.warn('Input too large', {
      cvLength: cv.length,
      jobLength: jobDescription.length,
    });
    throw new Error(
      getErrorMessage('inputTooLarge', language, { max: 50_000 })
    );
  }
}
```

**User Message** (Validated Immediately):
```
"Please enter a CV with at least 50 characters."
```

**No Logging to Error Log** - This is expected validation

## Complete Error Flow

### End-to-End Example: Validation Error

```typescript
async function analyzeJobFit(cv: string, jobDescription: string): Promise<AnalysisResult> {
  const logger = createAIServiceLogger('analyzeJobFit');
  const correlationId = logger.startTiming('full_analysis');

  try {
    // INPUT VALIDATION (Phase 0)
    logger.info('Validating inputs', { cvLength: cv.length, jobLength: jobDescription.length });
    validateAnalysisInputs(cv, jobDescription);

    // PREPROCESSING (Phase 1)
    logger.startTiming('preprocessing');
    const { skills, yearsExperience, domain } = preprocessCV(cv);
    logger.endTiming('preprocessing', { skillsCount: skills.length });

    // PROMPT CONSTRUCTION
    const systemPrompt = getSystemPrompt();
    const userPrompt = buildOptimizedPrompt({ cv, jobDescription });

    // API REQUEST (Phase 2)
    logger.logAPIRequest('openai', 'gpt-3.5-turbo');
    const response = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    // JSON PARSING (Phase 3)
    logger.startTiming('json_parse');
    const jsonStr = extractJSONFromMarkdown(response.choices[0].message.content);
    const parsedData = JSON.parse(jsonStr);
    logger.endTiming('json_parse', { length: jsonStr.length });

    // SCHEMA VALIDATION (Phase 4) - THIS IS WHERE ERRORS HAPPEN
    logger.startTiming('validation');
    let signals: AISignals;

    try {
      signals = validateAIResponse(parsedData);
      logger.endTiming('validation', { success: true });
    } catch (error) {
      if (error instanceof AIResponseValidationError) {
        logger.endTiming('validation', { success: false });
        logger.warn('Validation failed', {
          correlationId,
          violations: error.violations.map(v => ({
            path: v.path.join('.'),
            message: v.message,
          })),
          attemptedData: sanitizeForLogging(parsedData),
        });

        // Throw user-friendly error
        throw new Error(getErrorMessage('aiInvalidResponse', language));
      }
      throw error; // Re-throw unexpected errors
    }

    // SCORING (Phase 5)
    logger.startTiming('scoring');
    const fitScore = calculateFitScore(signals);
    logger.endTiming('scoring', { fitScore });

    // SUCCESS (Phase 6)
    logger.logCompletion('analyzeJobFit', {
      success: true,
      duration: logger.endTiming('full_analysis'),
    });

    return {
      fitScore,
      decision: determineDecision(fitScore),
      explanation: generateExplanation(signals, fitScore),
    };

  } catch (error) {
    // ERROR HANDLING & LOGGING
    logger.endTiming('full_analysis', { success: false });

    if (error instanceof Error) {
      logger.error('analyzeJobFit', {
        message: error.message,
        correlationId,
        phase: getCurrentPhase(), // Debugging helper
      });

      // User-friendly message (check i18n)
      if (error.message.includes('aiInvalidResponse')) {
        throw new Error(getErrorMessage('aiInvalidResponse', language));
      }
    }

    throw error;
  }
}
```

### Logging Output for Validation Error

```
[INFO] services/aiService.ts - Validating inputs
CV Length: 1250
Job Description Length: 890
Correlation ID: 1699564234567-abc123def456

[INFO] services/aiService.ts - Preprocessing complete
Skills Count: 8
Years Experience: 10
Domain Experience: { frontend: true, backend: true }
Duration: 12ms

[INFO] services/aiService.ts - API request
Provider: openai
Model: gpt-3.5-turbo
Prompt Length: 2150
Temperature: 0.2
Max Tokens: 1500

[INFO] services/aiService.ts - JSON parse complete
Duration: 3ms
Content Length: 876

[WARN] services/aiService.ts - Validation failed
Violations: [
  {
    "path": "hardSkillsDetected",
    "message": "Expected array, received string"
  }
]
Duration: 2ms
Correlation ID: 1699564234567-abc123def456
```

## Error Messages (i18n)

### Portuguese (pt)

```typescript
{
  'invalidInput': 'Entrada inválida',
  'cvRequired': 'Por favor, insira um CV',
  'jobDescriptionRequired': 'Por favor, insira uma descrição de trabalho',
  'inputTooShort': 'O texto deve ter pelo menos {min} caracteres',
  'inputTooLarge': 'O texto não pode exceder {max} caracteres',
  'aiParsingFailed': 'Erro ao processar resposta do AI. Tente novamente.',
  'aiInvalidResponse': 'Resposta do AI não é válida. Tente novamente.',
  'serviceTemporarilyUnavailable': 'Serviço temporariamente indisponível. Tente novamente em alguns segundos.',
  'aiServiceTimeout': 'O serviço de AI demorou muito. Tente novamente.',
  'unexpectedError': 'Erro inesperado. Por favor, tente novamente.',
}
```

### English (en)

```typescript
{
  'invalidInput': 'Invalid input',
  'cvRequired': 'Please enter a CV',
  'jobDescriptionRequired': 'Please enter a job description',
  'inputTooShort': 'Text must be at least {min} characters',
  'inputTooLarge': 'Text cannot exceed {max} characters',
  'aiParsingFailed': 'Failed to parse AI response. Please try again.',
  'aiInvalidResponse': 'AI response is invalid. Please try again.',
  'serviceTemporarilyUnavailable': 'Service temporarily unavailable. Try again in a few seconds.',
  'aiServiceTimeout': 'AI service took too long. Please try again.',
  'unexpectedError': 'Unexpected error. Please try again.',
}
```

## Debugging with Correlation IDs

Every request gets a unique correlation ID:

```typescript
const correlationId = generateCorrelationId(); // "1699564234567-abc123"
const logger = createAIServiceLogger('analyzeJobFit', correlationId);
```

**Trace a specific request through all logs**:

```bash
# In log aggregation system (CloudWatch, Splunk, etc.)
grep -i "1699564234567-abc123" logs/

# Output:
2023-11-10T12:10:34.567Z [INFO] Analyzing job fit (1699564234567-abc123)
2023-11-10T12:10:34.580Z [INFO] Preprocessing (1699564234567-abc123)
2023-11-10T12:10:34.593Z [INFO] API request (1699564234567-abc123)
2023-11-10T12:10:35.234Z [INFO] JSON parsed (1699564234567-abc123)
2023-11-10T12:10:35.240Z [WARN] Validation failed (1699564234567-abc123)
2023-11-10T12:10:35.241Z [ERROR] Analysis failed (1699564234567-abc123)
```

## Testing Error Scenarios

### Unit Test: Schema Validation Error

```typescript
describe('aiService - Error Handling', () => {
  it('should throw AIResponseValidationError on invalid schema', async () => {
    const invalidResponse = {
      hardSkillsDetected: 'not an array' // Wrong type
    };

    jest.spyOn(openai.chat.completions, 'create').mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(invalidResponse) } }],
    } as any);

    await expect(
      aiService.analyzeJobFit(validCV, validJobDescription)
    ).rejects.toThrow(AIResponseValidationError);
  });

  it('should log validation violations with details', async () => {
    const invalidResponse = { hardSkillsDetected: 123 };

    jest.spyOn(openai.chat.completions, 'create').mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(invalidResponse) } }],
    } as any);

    try {
      await aiService.analyzeJobFit(validCV, validJobDescription);
    } catch (error) {
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Validation failed',
        expect.objectContaining({
          violations: expect.arrayContaining([
            expect.objectContaining({
              path: ['hardSkillsDetected'],
              message: expect.any(String),
            }),
          ]),
        })
      );
    }
  });
});
```

### Integration Test: API Error

```typescript
it('should handle 429 rate limit error', async () => {
  const error = new Error('429: Too Many Requests');
  (error as any).statusCode = 429;

  jest.spyOn(openai.chat.completions, 'create').mockRejectedValue(error);

  await expect(
    aiService.analyzeJobFit(validCV, validJobDescription)
  ).rejects.toThrow(/serviceTemporarilyUnavailable/);

  expect(mockLogger.warn).toHaveBeenCalledWith(
    'Rate limit hit',
    expect.any(Object)
  );
});
```

## Recovery Strategies

### Strategy 1: Retry with Backoff

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  backoffMs = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;

      // Only retry on transient errors (429, 503, timeout)
      if (!isTransientError(error)) throw error;

      logger.info(`Retrying attempt ${attempt}/${maxAttempts}`, {
        backoffMs: backoffMs * Math.pow(2, attempt - 1),
      });

      await delay(backoffMs * Math.pow(2, attempt - 1));
    }
  }
}
```

### Strategy 2: Circuit Breaker

```typescript
class CircuitBreaker {
  private failureCount = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private readonly threshold = 5;
  private readonly timeout = 60_000; // 1 minute

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    this.state = 'closed';
  }

  private onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.threshold) {
      this.state = 'open';
      this.lastFailureTime = Date.now();
      logger.warn('Circuit breaker opened', { failureCount: this.failureCount });
    }
  }
}
```

## Monitoring & Alerting

### Metrics to Track

```typescript
interface AIServiceMetrics {
  totalRequests: number;
  successfulRequests: number;
  validationErrors: number;
  parseErrors: number;
  apiErrors: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
}
```

### Alert Conditions

```typescript
if (metrics.validationErrors / metrics.totalRequests > 0.05) {
  alert('Validation error rate > 5%');
}

if (metrics.averageResponseTime > 5000) {
  alert('Average response time > 5 seconds');
}

if (metrics.apiErrors / metrics.totalRequests > 0.1) {
  alert('API error rate > 10%');
}
```

## Summary

1. **Validate immediately** - Catch errors at the earliest point
2. **Log comprehensively** - Include correlation IDs, phase, metrics
3. **Fail safely** - Return user-friendly messages
4. **Make testable** - Use dependency injection, mock external services
5. **Monitor continuously** - Track error rates and latency

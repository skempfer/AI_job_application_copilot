# Extending AI Service with New Providers

## Overview

The AI inference layer has been designed with provider extensibility in mind. While currently using OpenAI, the architecture supports adding new AI providers (Anthropic, Groq, etc.) with minimal changes.

## Current Architecture

**Current Provider**: OpenAI
- **Model**: gpt-4 or gpt-3.5-turbo
- **Temperature**: 0.2 (low randomness)
- **Max tokens**: 1500

**Key Modules**:
1. `systemPrompt.ts` - Provider-agnostic system prompt logic
2. `promptBuilder.ts` - System + user prompt construction
3. `aiResponseSchema.ts` - Response validation schema
4. `aiLogger.ts` - Structured logging (provider-agnostic)
5. `aiService.ts` - OpenAI-specific orchestration

## Step-by-Step: Adding a New Provider

### Step 1: Plan Provider-Specific System Prompt (If Needed)

**Current**: System prompt is provider-agnostic
```typescript
export const SYSTEM_PROMPT = `You are a specialized job fit analysis assistant.

OUTPUT FORMAT RULES:
- Return ONLY valid JSON
...`;
```

**If provider needs different format**, create a provider-specific variant:

```typescript
// systemPrompt.ts
export const SYSTEM_PROMPT = `...`; // OpenAI version

export const CLAUDE_SYSTEM_PROMPT = `...`; // Anthropic version

export function getSystemPrompt(provider: 'openai' | 'anthropic' = 'openai'): string {
  switch (provider) {
    case 'anthropic':
      return CLAUDE_SYSTEM_PROMPT;
    default:
      return SYSTEM_PROMPT;
  }
}
```

### Step 2: Create Configuration Types

Add provider configuration to your config layer:

```typescript
// types/config.ts
export interface AIProviderConfig {
  provider: 'openai' | 'anthropic' | 'groq';
  apiKey: string;
  baseUrl?: string;
  model: string;
  temperature: number;
  maxTokens: number;
  timeout?: number;
}

export const AI_CONFIG = {
  openai: {
    provider: 'openai' as const,
    apiKey: process.env.OPENAI_API_KEY!,
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    temperature: 0.2,
    maxTokens: 1500,
  },
  anthropic: {
    provider: 'anthropic' as const,
    apiKey: process.env.ANTHROPIC_API_KEY!,
    baseUrl: 'https://api.anthropic.com',
    model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
    temperature: 0.2,
    maxTokens: 1500,
  },
};
```

### Step 3: Create Provider Adapter

Create a new file for each provider:

```typescript
// services/providers/anthropicService.ts
import Anthropic from '@anthropic-ai/sdk';
import { AISignals } from '../../types/analysis';
import { validateAIResponse, AIResponseValidationError } from './aiResponseSchema';
import { AILogger } from './aiLogger';

export class AnthropicService {
  private client: Anthropic;
  private theme: 'openai' | 'anthropic';
  private logger: AILogger;

  constructor(apiKey: string, logger: AILogger) {
    this.client = new Anthropic({ apiKey });
    this.theme = 'anthropic';
    this.logger = logger;
  }

  async getSignals(
    systemPrompt: string,
    userPrompt: string
  ): Promise<AISignals> {
    this.logger.logAPIRequest('anthropic', 'claude-3-sonnet-20240229');

    try {
      const response = await this.client.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1500,
        temperature: 0.2,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Expected text response from Anthropic');
      }

      const extractedJson = this.extractJSON(content.text);
      const signals = validateAIResponse(extractedJson);

      this.logger.logCompletion('analyzeJobFit', {
        success: true,
        provider: 'anthropic',
        tokensUsed: response.usage.output_tokens,
      });

      return signals;
    } catch (error) {
      if (error instanceof AIResponseValidationError) {
        throw error;
      }
      this.logger.error('anthropic_api_error', error);
      throw error;
    }
  }

  private extractJSON(response: string): any {
    // Same as OpenAI extraction - JSON may be in markdown block
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    return JSON.parse(response);
  }
}
```

```typescript
// services/providers/groqService.ts
import Groq from 'groq-sdk';
import { AISignals } from '../../types/analysis';

export class GroqService {
  private client: Groq;
  private logger: AILogger;

  constructor(apiKey: string, logger: AILogger) {
    this.client = new Groq({ apiKey });
    this.logger = logger;
  }

  async getSignals(
    systemPrompt: string,
    userPrompt: string
  ): Promise<AISignals> {
    this.logger.logAPIRequest('groq', 'llama-3.3-70b-versatile');

    try {
      const response = await this.client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 1500,
      });

      const extractedJson = this.extractJSON(
        response.choices[0].message.content || ''
      );
      const signals = validateAIResponse(extractedJson);

      this.logger.logCompletion('analyzeJobFit', {
        success: true,
        provider: 'groq',
      });

      return signals;
    } catch (error) {
      this.logger.error('groq_api_error', error);
      throw error;
    }
  }

  private extractJSON(response: string): any {
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    return JSON.parse(response);
  }
}
```

### Step 4: Create Provider Factory

```typescript
// services/providerFactory.ts
import { AILogger } from './aiLogger';
import { AISignals } from '../types/analysis';

export interface AIProvider {
  getSignals(systemPrompt: string, userPrompt: string): Promise<AISignals>;
}

export class AIProviderFactory {
  static create(provider: string, apiKey: string, logger: AILogger): AIProvider {
    switch (provider) {
      case 'anthropic':
        return new AnthropicService(apiKey, logger);
      case 'groq':
        return new GroqService(apiKey, logger);
      case 'openai':
      default:
        return new OpenAIService(apiKey, logger);
    }
  }
}
```

### Step 5: Update aiService.ts

Refactor to use provider abstraction:

```typescript
// services/aiService.ts
import { AIProviderFactory } from './providerFactory';
import { getSystemPrompt } from './systemPrompt';
import { buildOptimizedPrompt } from './promptBuilder';
import { createAIServiceLogger } from './aiLogger';

export class AIService {
  private provider: AIProvider;
  private logger: AILogger;

  constructor(providerName: string = 'openai') {
    const apiKey = this.getApiKey(providerName);
    this.logger = createAIServiceLogger('aiService');
    this.provider = AIProviderFactory.create(providerName, apiKey, this.logger);
  }

  async analyzeJobFit(
    cv: string,
    jobDescription: string,
    language: 'pt' | 'en' = 'pt'
  ): Promise<AnalysisResult> {
    const correlationId = this.logger.startTiming('full_analysis');

    try {
      // Preprocessing
      const preprocessed = this.preprocessInputs(cv, jobDescription);

      // Prompt construction
      const systemPrompt = getSystemPrompt();
      const userPrompt = buildOptimizedPrompt(
        preprocessed.cv,
        preprocessed.jobDescription,
        language
      );

      // Get signals from provider
      const signals = await this.provider.getSignals(systemPrompt, userPrompt);

      // Score calculation
      const fitScore = calculateFitScore(signals);
      const explanation = generateExplanation(signals, fitScore, language);
      const decision = determineDecision(fitScore);

      this.logger.logCompletion('analyzeJobFit', { success: true });

      return {
        fitScore,
        decision,
        strengths: [...],
        gaps: [...],
        recruiterMessage: signals.recruiterMessage,
        explanation,
      };
    } catch (error) {
      this.logger.error('analyzeJobFit', error);
      throw error;
    }
  }

  private getApiKey(provider: string): string {
    const keys: Record<string, string | undefined> = {
      openai: process.env.OPENAI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY,
      groq: process.env.GROQ_API_KEY,
    };

    const apiKey = keys[provider];
    if (!apiKey) {
      throw new Error(`API key not found for provider: ${provider}`);
    }
    return apiKey;
  }

  private preprocessInputs(cv: string, jobDescription: string) {
    // Existing preprocessing logic
  }
}
```

### Step 6: Update Environment Configuration

```bash
# .env.example
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GROQ_API_KEY=gsk_...

# .env
OPENAI_API_KEY=sk-...
AI_PROVIDER=openai  # or 'anthropic', 'groq'
```

### Step 7: Update Express Routes

```typescript
// routes/analyze.ts
export const analyzeRoute = async (req, res) => {
  try {
    // Get provider from env or request
    const provider = process.env.AI_PROVIDER || 'openai';
    const aiService = new AIService(provider);

    const { cv, jobDescription } = req.body;
    const result = await aiService.analyzeJobFit(cv, jobDescription);

    res.json(result);
  } catch (error) {
    // Error handling
  }
};
```

### Step 8: Add Provider-Specific Tests

```typescript
// services/providers/anthropicService.test.ts
describe('AnthropicService', () => {
  let service: AnthropicService;
  let mockLogger: jest.Mocked<AILogger>;

  beforeEach(() => {
    mockLogger = createMockLogger();
    service = new AnthropicService('test-key', mockLogger);
  });

  it('should extract signals from Anthropic response', async () => {
    const mockResponse = {
      content: [{ type: 'text', text: '{"hardSkillsDetected": [...]}' }],
      usage: { output_tokens: 250 },
    };

    jest.spyOn(service['client'].messages, 'create').mockResolvedValue(
      mockResponse as any
    );

    const signals = await service.getSignals(systemPrompt, userPrompt);

    expect(signals.hardSkillsDetected).toBeDefined();
    expect(mockLogger.logAPIRequest).toHaveBeenCalledWith('anthropic', expect.any(String));
  });

  it('should validate response schema', async () => {
    const invalidResponse = { content: [{ type: 'text', text: '{}' }] };

    jest.spyOn(service['client'].messages, 'create').mockResolvedValue(
      invalidResponse as any
    );

    await expect(
      service.getSignals(systemPrompt, userPrompt)
    ).rejects.toThrow(AIResponseValidationError);
  });
});
```

### Step 9: Update Integration Tests

```typescript
// routes/analyze.test.ts
describe('POST /api/analyze', () => {
  it('should work with different AI providers', async () => {
    // Test with OpenAI
    process.env.AI_PROVIDER = 'openai';
    let response = await request(app).post('/api/analyze').send(testData);
    expect(response.status).toBe(200);

    // Test with Anthropic
    process.env.AI_PROVIDER = 'anthropic';
    response = await request(app).post('/api/analyze').send(testData);
    expect(response.status).toBe(200);

    // Test with Groq
    process.env.AI_PROVIDER = 'groq';
    response = await request(app).post('/api/analyze').send(testData);
    expect(response.status).toBe(200);
  });
});
```

## Design Principles for Provider Support

### 1. Unified Response Schema

All providers return the same `AISignals` interface:

```typescript
interface AISignals {
  hardSkillsDetected: string[];
  mandatoryRequirementsMet: string[];
  // ... etc
}
```

This ensures the rest of the system doesn't know which provider is used.

### 2. Provider Abstraction

The `AIProvider` interface defines the contract:

```typescript
interface AIProvider {
  getSignals(systemPrompt: string, userPrompt: string): Promise<AISignals>;
}
```

### 3. Consistent Error Handling

All providers throw the same error types:

```typescript
throw new AIResponseValidationError(violations);
```

### 4. Logger Integration

Providers use the same logger interface:

```typescript
logger.logAPIRequest(provider, model);
logger.logCompletion(operation, metrics);
```

## Comparison: Provider Models

| Feature | OpenAI | Anthropic | Groq |
|---------|--------|-----------|------|
| **Model** | gpt-3.5-turbo / gpt-4 | Claude 3 | Llama 3.3 |
| **API Speed** | ~2-5s | ~2-5s | ~1-2s |
| **Cost** | Paid | Paid | Free tier |
| **Temperature Range** | 0-2 | 0-1 | 0-2 |
| **Max Tokens** | Up to 4k-128k | Up to 100k | Up to 8k |
| **System Prompt** | Yes | Yes | Yes |
| **JSON Mode** | Yes (gpt-4) | No | No |

## Migration Path

If you want to switch primary providers:

1. **Add new provider** using steps above
2. **Run tests** with new provider in parallel
3. **Update environment** to use new provider
4. **Keep old provider** as fallback (optional)
5. **Monitor logs** for any differences
6. **Remove old provider** after validation

## Monitoring & Debugging

Use structured logs to compare providers:

```typescript
// Check API response times
logger.info('API request timing', { provider, duration: 2500 });

// Check validation errors by provider
logger.warn('Validation failed', { provider, violations: [...] });

// Check token usage
logger.info('API response', { provider, tokensUsed: 250 });
```

## Rate Limiting by Provider

Different providers may have different rate limits:

```typescript
const rateLimits = {
  openai: 20,     // requests per minute
  anthropic: 50,
  groq: 100,      // usually higher for free tier
};
```

Configure via environment or config:

```typescript
export function createRateLimiter(provider: string): RateLimiter {
  const limit = rateLimits[provider];
  return new RateLimiter(limit, '1m');
}
```

## Key Takeaway

The refactored AI service is built with extensibility in mind:

1. **System/User prompt separation** - Makes it easy to adapt for different providers
2. **Schema validation** - Ensures consistent output regardless of provider
3. **Structured logging** - Enables comparing provider performance
4. **Factory pattern** - Makes provider swapping simple

To add a new provider, you need ~200 lines of code for the adapter, plus tests.

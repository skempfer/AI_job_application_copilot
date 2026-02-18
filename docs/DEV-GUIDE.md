# Development Guide

⚠️ **Note**: The AI inference layer was refactored in v2.0. See [AI-INFERENCE-ARCHITECTURE.md](AI-INFERENCE-ARCHITECTURE.md) for details on the new architecture with system prompts, schema validation, and structured logging.

## Quick Links to AI Service Documentation

- **Complete AI Architecture**: [AI-INFERENCE-ARCHITECTURE.md](AI-INFERENCE-ARCHITECTURE.md)
- **Schema Validation**: [SCHEMA-VALIDATION.md](SCHEMA-VALIDATION.md)
- **Error Handling**: [ERROR-HANDLING.md](ERROR-HANDLING.md)
- **Adding New Providers**: [EXTENDING-AI-PROVIDERS.md](EXTENDING-AI-PROVIDERS.md)

## Project Initialization

### 1. Backend

```bash
cd backend
npm install
```

Create the `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```
OPENAI_API_KEY=sk_your-key-here
OPENAI_MODEL=gpt-3.5-turbo
# or for better quality:
OPENAI_MODEL=gpt-4
```

Or to use a different AI provider, see [EXTENDING-AI-PROVIDERS.md](EXTENDING-AI-PROVIDERS.md).

Start the server:

```bash
npm run dev
```

Backend will be at `http://localhost:3001`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will be at `http://localhost:5173`

## Code Structure

### Backend

```
backend/
├── src/
│   ├── server.ts              # Entry point, Express setup
│   ├── routes/
│   │   └── analyze.ts         # POST /api/analyze
│   ├── services/
│   │   ├── aiService.ts       # AI orchestration + hybrid scoring
│   │   ├── systemPrompt.ts    # AI system rules (invariant)
│   │   ├── promptBuilder.ts   # Task-specific prompt construction
│   │   ├── aiResponseSchema.ts # Zod schema validation
│   │   ├── aiLogger.ts        # Structured logging
│   │   ├── scoring.ts         # Fit score calculation
│   │   ├── preprocessing.ts   # CV/job text normalization
│   │   └── gapAnalyzer.ts     # Gap analysis
│   └── types/
│       └── analysis.ts        # TypeScript types & interfaces
```

**Request flow**:
1. Client POST to `/api/analyze` with `{ cv, jobDescription, language }`
2. `analyze.ts` validates inputs
3. `aiService.ts` orchestrates:
   - Preprocessing (signal extraction)
   - Prompt construction (system + user)
   - OpenAI API call
   - JSON parsing
   - Schema validation (Zod)
   - Score calculation (deterministic)
   - Result formatting
4. Validation errors and API errors are logged with correlation IDs
5. JSON response is returned to client

### Frontend

```
frontend/
├── src/
│   ├── components/         # React components (UI only)
│   │   ├── CVInput.tsx
│   │   ├── JobInput.tsx
│   │   ├── AnalyzeButton.tsx
│   │   ├── ResultsDisplay.tsx
│   │   ├── ErrorDisplay.tsx
│   │   └── Header.tsx
│   ├── domain/             # Pure logic (JavaScript)
│   │   ├── analyzer.js     # Validation, formatting, helpers
│   │   └── apiClient.js    # HTTP client
│   ├── types/
│   │   └── analysis.ts     # TypeScript interfaces
│   ├── App.tsx             # Main component, orchestrates flow
│   ├── main.tsx            # React entry point
│   └── index.css           # Tailwind + custom styles
```

## Adding Features

### Example: Add new field to analysis

#### 1. Update type (Backend)

```typescript
// backend/src/types/analysis.ts
export interface AnalysisResult {
  fitScore: number;
  decision: Decision;
  strengths: string[];
  gaps: string[];
  cvSuggestions: string[];
  recruiterMessage: string;
  salaryFit?: string; // ← NEW
}
```

#### 2. Update prompt

```typescript
// backend/src/services/aiService.ts
private buildPrompt(cv: string, jobDescription: string): string {
  return `...
  
  {
    "fitScore": number,
    ...
    "salaryFit": "below|match|above" // ← NEW
  }`;
}
```

#### 3. Update validation

```typescript
// backend/src/services/aiService.ts
private validateResult(result: any): asserts result is AnalysisResult {
  const required = [..., "salaryFit"]; // ← NEW
  // ...
}
```

#### 4. Update type (Frontend)

```typescript
// frontend/src/types/analysis.ts
export interface AnalysisResult {
  // ...
  salaryFit?: string; // ← NEW
}
```

#### 5. Render in component

```tsx
// frontend/src/components/ResultsDisplay.tsx
{result.salaryFit && (
  <div className="card">
    <h3>Salary Expectation</h3>
    <p>{result.salaryFit}</p>
  </div>
)}
```

## Understanding the AI Service (v2.0)

### Key Modules

#### `systemPrompt.ts`
- **What**: Invariant AI behavior rules (output format, anti-hallucination)
- **Why**: Separate system rules from task-specific data
- **How to use**: 
  ```typescript
  import { getSystemPrompt } from './services/systemPrompt';
  const systemPrompt = getSystemPrompt();
  ```
- **When to change**: Only if AI behavior fundamentally changes (rare)

#### `promptBuilder.ts`
- **What**: Structures task-specific data into 6 modular sections
- **Why**: Clearer prompts, easier to debug, reduced redundancy
- **How to use**: 
  ```typescript
  import { buildOptimizedPrompt } from './services/promptBuilder';
  const userPrompt = buildOptimizedPrompt(cv, jobDescription, language);
  ```
- **When to change**: When analysis requirements change

#### `aiResponseSchema.ts`
- **What**: Zod schema that defines and validates AISignals
- **Why**: Ensure responses match expected structure at runtime
- **How to use**: 
  ```typescript
  import { validateAIResponse } from './services/aiResponseSchema';
  const signals = validateAIResponse(jsonData);
  ```
- **When to change**: When AISignals interface changes

#### `aiLogger.ts`
- **What**: Structured logging with correlation IDs and timing
- **Why**: Observable, debuggable request tracing
- **How to use**: 
  ```typescript
  import { createAIServiceLogger } from './services/aiLogger';
  const logger = createAIServiceLogger('analyzeJobFit', correlationId);
  logger.logAPIRequest('openai', 'gpt-3.5-turbo');
  ```
- **When to change**: When adding new metrics or log types

### Making Changes

**Scenario 1: AI returns unexpected field**
1. Update `AISignalsSchema` in `aiResponseSchema.ts`
2. Update `AISignals` interface in `analysis.ts`
3. Update system/user prompt if needed
4. Run tests: `npm test`

**Scenario 2: Change prompt structure**
1. Edit helpers in `promptBuilder.ts`
2. Update tests in `promptBuilder.test.ts`
3. Verify no breaking changes: all 162 tests should pass
4. Deploy with confidence (schema validation catches bad responses)

**Scenario 3: Switch to different AI provider (e.g., Anthropic)**
1. Follow [EXTENDING-AI-PROVIDERS.md](EXTENDING-AI-PROVIDERS.md)
2. Create new service adapter in `services/providers/`
3. Update `aiService.ts` to use provider factory
4. Tests validate provider behavior (schema is provider-agnostic)

### Debugging

**Check correlation ID in logs**:
```bash
grep -r "1699564234567-abc123" logs/
```

**See full request/response cycle**:
```typescript
// Look in backend logs for logs with same correlation ID
[INFO] Validating inputs
[INFO] Preprocessing
[INFO] API request 
[INFO] JSON parsed
[WARN] Validation failed  ← Check this if errors occur
[ERROR] Analysis failed
```

**Test schema validation manually**:
```typescript
import { validateAIResponseSafe } from './services/aiResponseSchema';

const result = validateAIResponseSafe(jsonData);
if (result.isValid) {
  console.log('Valid:', result.data);
} else {
  console.log('Invalid:', result.error?.violations);
}
```

## Testing

### Running Tests

```bash
# All tests
npm test

# Specific test file
npm test aiService.test.ts

# Coverage report
npm test -- --coverage
```

### Test Coverage

- **60+ tests** for output contract validation
- **20+ tests** for system prompt invariants
- **11+ tests** for prompt builder structure
- **33+ tests** for schema validation
- **38+ tests** for structured logging
- **Total: 162 tests, all passing** ✓

Use these tests as reference for implementing new features.

### Backend (example with Jest)

```typescript
import { AIService } from '../services/aiService';

describe('AIService', () => {
  it('should return fitScore between 0 and 100', async () => {
    const service = new AIService(config);
    const result = await service.analyzeJobFit(mockCV, mockJob);
    expect(result.fitScore).toBeGreaterThanOrEqual(0);
    expect(result.fitScore).toBeLessThanOrEqual(100);
  });
});
```

### Frontend (example with React Testing Library)

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { CVInput } from './CVInput';

test('updates value when user types', () => {
  const handleChange = jest.fn();
  render(<CVInput value="" onChange={handleChange} />);
  
  const textarea = screen.getByLabelText('Your CV');
  fireEvent.change(textarea, { target: { value: 'My CV' } });
  
  expect(handleChange).toHaveBeenCalledWith('My CV');
});
```

## Deployment

### Frontend (Vercel)

```bash
cd frontend
npm run build
# Deploy dist/ folder
```

Environment variable in Vercel:
```
VITE_API_URL=https://your-backend.railway.app
```

### Backend (Railway/Render)

1. Connect Git repository
2. Set build command: `cd backend && npm install && npm run build`
3. Start command: `node dist/server.js`
4. Add env var: `OPENAI_API_KEY` (get at https://platform.openai.com/api-keys)
5. (Optional) Set `OPENAI_MODEL` to `gpt-4` for higher quality (costs more)

## Troubleshooting

### Error: "AI returned empty response"
- Verify `OPENAI_API_KEY` is correct and has API credits
- Check OpenAI account status at https://platform.openai.com
- See [ERROR-HANDLING.md](ERROR-HANDLING.md) for detailed error flow

### Error: "Unable to process job fit analysis"
- Schema validation failed (AI didn't return expected fields)
- Check backend logs for `[WARN] Validation failed`
- Look for correlation ID to trace full request
- See [SCHEMA-VALIDATION.md](SCHEMA-VALIDATION.md) for details

### Error: "AI response is invalid"
- JSON parsing or validation error
- Check `[WARN] JSON parse error` or `[WARN] Validation failed` in logs
- See [ERROR-HANDLING.md](ERROR-HANDLING.md) for recovery strategies

### Frontend can't connect to backend
- Verify `VITE_API_URL` in `.env` is correct
- CORS: backend should allow frontend origin
- Check Network tab in DevTools
- See backend logs for errors

### Analysis takes too long (>5 seconds)
- OpenAI API slow: check their status https://status.openai.com/
- Network latency: measure with timing logs
- Consider implementing timeout on frontend
- Check structured logs for timing breakdown by phase

## Best Practices

### Commits

```
feat: add salary analysis
fix: fix empty CV validation
docs: update README with deployment instructions
refactor: extract formatting logic to domain layer
```

### Code Review Checklist

- [ ] TypeScript typing is correct?
- [ ] Input validation implemented?
- [ ] React components are pure (no logic)?
- [ ] Business logic in domain layer?
- [ ] Error handling adequate?
- [ ] Comments only where necessary?
- [ ] Descriptive variable names?

### Performance

- Avoid unnecessary re-renders (React.memo if needed)
- Debounce on inputs if adding real-time validation
- Lazy load large components
- Compress large payloads (gzip in Express)

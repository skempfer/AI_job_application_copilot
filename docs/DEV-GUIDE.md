# Development Guide

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

Edit `.env` and add your Groq API key (free at https://console.groq.com/keys):

```
GROQ_API_KEY=gsk_your-key-here
GROQ_API_URL=https://api.groq.com/openai/v1
GROQ_MODEL=llama-3.3-70b-versatile
```

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
│   ├── server.ts           # Entry point, Express setup
│   ├── routes/
│   │   └── analyze.ts      # POST /api/analyze
│   ├── services/
│   │   └── aiService.ts    # Groq integration + prompt engineering
│   └── types/
│       └── analysis.ts     # TypeScript types
```

**Request flow**:
1. Client POST to `/api/analyze` with `{ cv, jobDescription }`
2. `analyze.ts` validates inputs
3. `aiService.ts` builds prompt and calls Groq API
4. JSON response is validated and returned

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

## Testing

### Backend (example with Jest - not included)

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
4. Add env var: `GROQ_API_KEY` (generate at https://console.groq.com/keys)

## Troubleshooting

### Error: "AI returned empty response"
- Verify `GROQ_API_KEY` is correct
- Check if model is available (generate new key at https://console.groq.com)

### Error: "Invalid AI response"
- AI returned text instead of JSON
- Increasing temperature may generate more creative but less structured responses
- Check backend logs to see raw response

### Frontend can't connect to backend
- Verify `VITE_API_URL` in `.env` is correct
- CORS: backend should allow frontend origin
- Check Network tab in DevTools

### Analysis takes too long
- Groq is very fast (1-2s)
- If slower, check network latency
- Implement timeout on frontend

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

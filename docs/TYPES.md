# TypeScript Types Reference

## Backend Types

### `backend/src/types/analysis.ts`

```typescript
/**
 * Final decision about application
 */
export type Decision = "apply" | "apply_with_fixes" | "skip";

/**
 * Request body sent by frontend
 */
export interface AnalysisRequest {
  cv: string;
  jobDescription: string;
}

/**
 * Structured result returned by AI
 * This is the contract between backend and frontend
 */
export interface AnalysisResult {
  /** Compatibility score 0-100 */
  fitScore: number;
  
  /** Clear decision on whether to apply */
  decision: Decision;
  
  /** Candidate's strengths for this job */
  strengths: string[];
  
  /** Gaps/weaknesses to address */
  gaps: string[];
  
  /** Specific suggestions on how to improve CV */
  cvSuggestions: string[];
  
  /** Personalized message to send to recruiter */
  recruiterMessage: string;
}

/**
 * AI service configuration
 */
export interface AIServiceConfig {
  apiKey: string;
  apiUrl: string;
  model: string;
}
```

---

## Frontend Types

### `frontend/src/types/analysis.ts`

```typescript
/**
 * Re-export of Decision type (must match backend)
 */
export type Decision = "apply" | "apply_with_fixes" | "skip";

/**
 * Analysis result (same schema as backend)
 */
export interface AnalysisResult {
  fitScore: number;
  decision: Decision;
  strengths: string[];
  gaps: string[];
  cvSuggestions: string[];
  recruiterMessage: string;
}

/**
 * Formatted result with extra data for UI
 * Extended by domain layer
 */
export interface FormattedAnalysisResult extends AnalysisResult {
  /** Score color: 'green' | 'yellow' | 'orange' | 'red' */
  scoreColor: string;
  
  /** Tailwind classes for score badge */
  scoreBadgeClass: string;
  
  /** Localized decision text */
  decisionText: string;
  
  /** Emoji representing decision */
  decisionIcon: string;
}
```

---

## Component Props Types

### CVInput / JobInput

```typescript
interface CVInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

interface JobInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}
```

### AnalyzeButton

```typescript
interface AnalyzeButtonProps {
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
}
```

### ResultsDisplay

```typescript
interface ResultsDisplayProps {
  result: FormattedAnalysisResult;
}
```

### ErrorDisplay

```typescript
interface ErrorDisplayProps {
  message: string;
  onDismiss: () => void;
}
```

---

## Domain Layer (JavaScript + JSDoc)

Since domain layer is pure JavaScript, it doesn't have compiled types.
But it can have JSDoc for autocomplete:

```javascript
/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid
 * @property {string|null} error
 */

/**
 * Validates if CV has minimum content
 * @param {string} cv
 * @returns {ValidationResult}
 */
export function validateCV(cv) {
  // ...
}

/**
 * @typedef {'apply' | 'apply_with_fixes' | 'skip'} Decision
 */

/**
 * Maps decision to display text
 * @param {Decision} decision
 * @returns {string}
 */
export function getDecisionText(decision) {
  // ...
}
```

---

## Vite Environment Variables

### `frontend/src/vite-env.d.ts`

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

This allows:
```typescript
const apiUrl = import.meta.env.VITE_API_URL; // ✅ Typed
```

---

## Type Guards & Assertions

### Backend - AI response validation

```typescript
/**
 * Type assertion that guarantees result is AnalysisResult
 * Throws error if validation fails
 */
private validateResult(result: any): asserts result is AnalysisResult {
  const required = [
    "fitScore", 
    "decision", 
    "strengths", 
    "gaps", 
    "cvSuggestions", 
    "recruiterMessage"
  ];
  
  const missing = required.filter((field) => !(field in result));

  if (missing.length > 0) {
    throw new Error(`Missing fields: ${missing.join(", ")}`);
  }

  if (
    typeof result.fitScore !== "number" || 
    result.fitScore < 0 || 
    result.fitScore > 100
  ) {
    throw new Error("fitScore must be between 0 and 100");
  }

  if (!["apply", "apply_with_fixes", "skip"].includes(result.decision)) {
    throw new Error("Invalid decision");
  }
}
```

Usage:
```typescript
const data = JSON.parse(response);
this.validateResult(data); // assertion
// Now TypeScript knows data is AnalysisResult
return data;
```

---

## Shared Types Strategy (for Production)

In a real project, you would have shared types:

```
shared/
├── types/
│   └── analysis.ts    # Shared types
```

Both frontend and backend would import from here:

```typescript
// Avoids duplication and ensures synchronization
import type { AnalysisResult, Decision } from '@shared/types/analysis';
```

But for this portfolio project, we duplicate intentionally
to show independence between frontend and backend.

---

## Useful Utility Types

If expanding the project, consider using these:

```typescript
// Partial result (for loading states)
type PartialAnalysis = Partial<AnalysisResult>;

// Only required fields
type RequiredAnalysis = Required<AnalysisResult>;

// Omit recruiter message
type AnalysisWithoutMessage = Omit<AnalysisResult, 'recruiterMessage'>;

// Extract only score and decision
type AnalysisSummary = Pick<AnalysisResult, 'fitScore' | 'decision'>;

// Make all arrays readonly
type ReadonlyAnalysis = {
  readonly [K in keyof AnalysisResult]: 
    AnalysisResult[K] extends Array<infer U> 
      ? ReadonlyArray<U> 
      : AnalysisResult[K];
};
```

---

## Type Safety in Practice

### ❌ Without Types

```javascript
function analyze(data) {
  // Is it data.cv? data.CV? data.resume? 🤷
  return data.cv + data.job; // ❌ Runtime error if wrong fields
}
```

### ✅ With Types

```typescript
function analyze(data: AnalysisRequest): Promise<AnalysisResult> {
  // ✅ Autocomplete shows data.cv and data.jobDescription
  // ✅ Compile error if you try to access non-existent field
  return aiService.analyze(data.cv, data.jobDescription);
}
```

---

## Evolving Types

When adding a new field:

1. Update `AnalysisResult` in backend
2. Update prompt for AI to return the field
3. Update validation in `validateResult()`
4. Update `AnalysisResult` in frontend
5. TypeScript will show errors where new field isn't being used

This ensures you don't forget to update any part of the system.

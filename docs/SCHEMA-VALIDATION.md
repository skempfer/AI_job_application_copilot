# AI Response Schema & Type System

## Overview

The AI response validation system uses **Zod** for runtime schema validation. This ensures:

- ✅ Type safety at compile time (TypeScript)
- ✅ Validation at runtime (Zod schema)
- ✅ Clear error messages when validation fails
- ✅ Single source of truth for AISignals contract

## Type Definitions

### AISignals Interface

```typescript
interface AISignals {
  // Array fields (required, can be empty)
  hardSkillsDetected: string[];
  mandatoryRequirementsMet: string[];
  mandatoryRequirementsMissing: string[];
  desirableRequirementsMet: string[];
  desirableRequirementsMissing: string[];
  softSkillsEvidence: string[];
  
  // Enum field (required)
  seniorityMatch: 'above' | 'match' | 'below';
  
  // Array field (required, can be empty)
  redFlags: string[];
  
  // String fields (required, non-empty)
  recruiterMessage: string;
  coverLetter: string;

  // Optional fields (inferred by AI but not required)
  detectedYearsExperience?: number | null;
  detectedDomainExperience?: {
    frontend?: boolean;
    backend?: boolean;
    fullstack?: boolean;
    qa?: boolean;
    devops?: boolean;
    product?: boolean;
  } | null;
}
```

### Zod Schema Definition

```typescript
// aiResponseSchema.ts
import { z } from 'zod';

export const AISignalsSchema = z.object({
  // Required array fields
  hardSkillsDetected: z.array(z.string()).min(0),
  mandatoryRequirementsMet: z.array(z.string()).min(0),
  mandatoryRequirementsMissing: z.array(z.string()).min(0),
  desirableRequirementsMet: z.array(z.string()).min(0),
  desirableRequirementsMissing: z.array(z.string()).min(0),
  softSkillsEvidence: z.array(z.string()).min(0),
  
  // Required enum field
  seniorityMatch: z.enum(['above', 'match', 'below']),
  
  // Required array field
  redFlags: z.array(z.string()).min(0),
  
  // Required non-empty strings
  recruiterMessage: z.string().min(1),
  coverLetter: z.string().min(1),

  // Optional fields
  detectedYearsExperience: z.number().int().optional().nullable(),
  detectedDomainExperience: z.object({
    frontend: z.boolean().optional(),
    backend: z.boolean().optional(),
    fullstack: z.boolean().optional(),
    qa: z.boolean().optional(),
    devops: z.boolean().optional(),
    product: z.boolean().optional(),
  }).optional().nullable(),
});

export type AISignals = z.infer<typeof AISignalsSchema>;
```

## Validation Functions

### 1. Throwing Validation

```typescript
export function validateAIResponse(data: unknown): AISignals {
  try {
    return AISignalsSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AIResponseValidationError(error.issues);
    }
    throw error;
  }
}
```

**Usage**:
```typescript
try {
  const signals = validateAIResponse(jsonData);
  console.log('Validation successful:', signals);
} catch (error) {
  if (error instanceof AIResponseValidationError) {
    console.log('Validation errors:', error.violations);
  }
}
```

### 2. Safe Validation

```typescript
export function validateAIResponseSafe(
  data: unknown
): { isValid: boolean; data?: AISignals; error?: AIResponseValidationError } {
  try {
    const signals = AISignalsSchema.parse(data);
    return { isValid: true, data: signals };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        error: new AIResponseValidationError(error.issues),
      };
    }
    throw error;
  }
}
```

**Usage**:
```typescript
const result = validateAIResponseSafe(jsonData);

if (result.isValid) {
  console.log('Valid:', result.data);
} else {
  console.log('Invalid:', result.error?.violations);
}
```

## Error Details

### AIResponseValidationError

```typescript
export class AIResponseValidationError extends Error {
  violations: ValidationViolation[];

  constructor(issues: z.ZodIssue[]) {
    super(`AI Response Validation Error: ${issues.length} violations`);
    this.name = 'AIResponseValidationError';
    this.violations = formatZodIssues(issues);
  }
}

interface ValidationViolation {
  path: (string | number)[];
  message: string;
  code: z.ZodIssueCode;
}
```

### Example Violation

```json
{
  "path": ["seniorityMatch"],
  "message": "Invalid enum value. Expected 'above' | 'match' | 'below'",
  "code": "invalid_enum_value",
  "options": ["above", "match", "below"],
  "receivedString": "maybe"
}
```

## Detailed Validation Rules

### Required Array Fields

```typescript
// ✅ VALID
hardSkillsDetected: ['Python', 'AWS']
hardSkillsDetected: []                      // Empty is OK

// ❌ INVALID
hardSkillsDetected: null                    // Null not allowed
hardSkillsDetected: 'Python'                // String, not array
hardSkillsDetected: undefined               // Missing is not allowed
```

### Enum Field

```typescript
// ✅ VALID
seniorityMatch: 'above'
seniorityMatch: 'match'
seniorityMatch: 'below'

// ❌ INVALID
seniorityMatch: 'ABOVE'                     // Case sensitive
seniorityMatch: 'maybe'                     // Not in enum
seniorityMatch: null                        // Null not allowed
seniorityMatch: undefined                   // Missing is not allowed
```

### Required Non-Empty Strings

```typescript
// ✅ VALID
recruiterMessage: 'Strong candidate'
coverLetter: 'I am interested in this role'

// ❌ INVALID
recruiterMessage: ''                        // Empty string not allowed
recruiterMessage: null                      // Null not allowed
recruiterMessage: undefined                 // Missing is not allowed
coverLetter: '   '                          // Whitespace-only not allowed (depends on trim)
```

### Optional Fields

```typescript
// ✅ VALID
detectedYearsExperience: 5
detectedYearsExperience: null               // Explicit null is OK
// (missing is also OK - not included in object)

// ✅ VALID Domain Experience
detectedDomainExperience: {
  frontend: true,
  backend: false
}
detectedDomainExperience: null              // Explicit null is OK

// ❌ INVALID
detectedYearsExperience: 'five'             // Not a number
detectedYearsExperience: 5.5               // Not an integer
detectedDomainExperience: {
  frontend: 'yes'                           // Not a boolean
}
```

## Testing

### Unit Tests: Valid Responses

```typescript
describe('AIResponseSchema - Valid Signals', () => {
  it('should validate complete and valid signals', () => {
    const validSignals = {
      hardSkillsDetected: ['Python', 'AWS', 'Docker'],
      mandatoryRequirementsMet: ['5+ years backend'],
      mandatoryRequirementsMissing: [],
      desirableRequirementsMet: ['PostgreSQL', 'GraphQL'],
      desirableRequirementsMissing: ['Kubernetes'],
      softSkillsEvidence: ['Led team of 5'],
      seniorityMatch: 'match',
      redFlags: [],
      recruiterMessage: 'Strong backend engineer',
      coverLetter: 'I am interested in this role',
      detectedYearsExperience: 8,
      detectedDomainExperience: {
        frontend: false,
        backend: true,
        fullstack: false,
      },
    };

    const result = validateAIResponseSafe(validSignals);
    expect(result.isValid).toBe(true);
    expect(result.data).toEqual(validSignals);
  });

  it('should accept empty arrays', () => {
    const signals = {
      hardSkillsDetected: [],
      mandatoryRequirementsMet: [],
      mandatoryRequirementsMissing: [],
      desirableRequirementsMet: [],
      desirableRequirementsMissing: [],
      softSkillsEvidence: [],
      seniorityMatch: 'match',
      redFlags: [],
      recruiterMessage: 'Candidate data insufficient',
      coverLetter: 'Unable to generate cover letter',
    };

    const result = validateAIResponseSafe(signals);
    expect(result.isValid).toBe(true);
  });

  it('should accept null for optional fields', () => {
    const signals = {
      hardSkillsDetected: ['Python'],
      mandatoryRequirementsMet: ['5+ years'],
      mandatoryRequirementsMissing: [],
      desirableRequirementsMet: [],
      desirableRequirementsMissing: [],
      softSkillsEvidence: [],
      seniorityMatch: 'match',
      redFlags: [],
      recruiterMessage: 'Good candidate',
      coverLetter: 'Draft cover letter',
      detectedYearsExperience: null,
      detectedDomainExperience: null,
    };

    const result = validateAIResponseSafe(signals);
    expect(result.isValid).toBe(true);
  });
});
```

### Unit Tests: Invalid Responses

```typescript
describe('AIResponseSchema - Invalid Signals', () => {
  it('should reject missing required fields', () => {
    const missingField = {
      hardSkillsDetected: ['Python'],
      mandatoryRequirementsMet: [],
      // Missing: mandatoryRequirementsMissing
      desirableRequirementsMet: [],
      desirableRequirementsMissing: [],
      softSkillsEvidence: [],
      seniorityMatch: 'match',
      redFlags: [],
      recruiterMessage: 'Good',
      coverLetter: 'Draft',
    };

    const result = validateAIResponseSafe(missingField);
    expect(result.isValid).toBe(false);
    expect(result.error?.violations).toContainEqual(
      expect.objectContaining({
        path: ['mandatoryRequirementsMissing'],
        code: 'invalid_type',
      })
    );
  });

  it('should reject wrong array type', () => {
    const wrongType = {
      hardSkillsDetected: 'not an array',
      mandatoryRequirementsMet: [],
      mandatoryRequirementsMissing: [],
      desirableRequirementsMet: [],
      desirableRequirementsMissing: [],
      softSkillsEvidence: [],
      seniorityMatch: 'match',
      redFlags: [],
      recruiterMessage: 'Good',
      coverLetter: 'Draft',
    };

    const result = validateAIResponseSafe(wrongType);
    expect(result.isValid).toBe(false);
    expect(result.error?.violations[0].code).toBe('invalid_type');
  });

  it('should reject invalid enum value', () => {
    const invalidEnum = {
      hardSkillsDetected: ['Python'],
      mandatoryRequirementsMet: [],
      mandatoryRequirementsMissing: [],
      desirableRequirementsMet: [],
      desirableRequirementsMissing: [],
      softSkillsEvidence: [],
      seniorityMatch: 'maybe', // Invalid!
      redFlags: [],
      recruiterMessage: 'Good',
      coverLetter: 'Draft',
    };

    const result = validateAIResponseSafe(invalidEnum);
    expect(result.isValid).toBe(false);
    expect(result.error?.violations[0]).toEqual(
      expect.objectContaining({
        path: ['seniorityMatch'],
        code: 'invalid_enum_value',
      })
    );
  });

  it('should reject empty required strings', () => {
    const emptyString = {
      hardSkillsDetected: ['Python'],
      mandatoryRequirementsMet: [],
      mandatoryRequirementsMissing: [],
      desirableRequirementsMet: [],
      desirableRequirementsMissing: [],
      softSkillsEvidence: [],
      seniorityMatch: 'match',
      redFlags: [],
      recruiterMessage: '',           // Empty!
      coverLetter: 'Draft',
    };

    const result = validateAIResponseSafe(emptyString);
    expect(result.isValid).toBe(false);
    expect(result.error?.violations[0]).toEqual(
      expect.objectContaining({
        path: ['recruiterMessage'],
        message: expect.stringContaining('at least 1 character'),
      })
    );
  });

  it('should reject invalid number for years', () => {
    const invalidNumber = {
      hardSkillsDetected: ['Python'],
      mandatoryRequirementsMet: [],
      mandatoryRequirementsMissing: [],
      desirableRequirementsMet: [],
      desirableRequirementsMissing: [],
      softSkillsEvidence: [],
      seniorityMatch: 'match',
      redFlags: [],
      recruiterMessage: 'Good',
      coverLetter: 'Draft',
      detectedYearsExperience: 5.5,  // Not an integer!
    };

    const result = validateAIResponseSafe(invalidNumber);
    expect(result.isValid).toBe(false);
    expect(result.error?.violations[0].path).toContain('detectedYearsExperience');
  });

  it('should report multiple violations at once', () => {
    const multipleErrors = {
      hardSkillsDetected: 'not array',
      mandatoryRequirementsMet: [],
      mandatoryRequirementsMissing: [],
      desirableRequirementsMet: [],
      desirableRequirementsMissing: [],
      softSkillsEvidence: [],
      seniorityMatch: 'invalid',      // Wrong!
      redFlags: [],
      recruiterMessage: '',           // Empty!
      coverLetter: '',                // Empty!
    };

    const result = validateAIResponseSafe(multipleErrors);
    expect(result.isValid).toBe(false);
    expect(result.error?.violations.length).toBeGreaterThanOrEqual(3);
  });
});
```

### Integration Tests: Full Flow

```typescript
describe('aiService - Schema Validation Integration', () => {
  it('should validate AI response before returning result', async () => {
    const mockResponse = {
      hardSkillsDetected: ['Python', 'AWS'],
      mandatoryRequirementsMet: ['5+ years'],
      mandatoryRequirementsMissing: [],
      desirableRequirementsMet: [],
      desirableRequirementsMissing: [],
      softSkillsEvidence: ['Led team'],
      seniorityMatch: 'match',
      redFlags: [],
      recruiterMessage: 'Good fit',
      coverLetter: 'Interested in role',
    };

    jest.spyOn(openai.chat.completions, 'create').mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(mockResponse) } }],
    } as any);

    const result = await aiService.analyzeJobFit(validCV, validJobDescription);

    expect(result).toBeDefined();
    expect(result.fitScore).toBeGreaterThanOrEqual(0);
  });

  it('should propagate validation error on invalid AI response', async () => {
    const invalidResponse = {
      hardSkillsDetected: ['Python'],
      mandatoryRequirementsMet: [],
      mandatoryRequirementsMissing: [],
      desirableRequirementsMet: [],
      desirableRequirementsMissing: [],
      softSkillsEvidence: [],
      seniorityMatch: invalid enum value', // Invalid!
      redFlags: [],
      recruiterMessage: 'Good',
      coverLetter: 'Draft',
    };

    jest.spyOn(openai.chat.completions, 'create').mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(invalidResponse) } }],
    } as any);

    await expect(
      aiService.analyzeJobFit(validCV, validJobDescription)
    ).rejects.toThrow(AIResponseValidationError);
  });
});
```

## Migration from Manual Validation

### Before (Without Zod)

```typescript
function validateSignals(data: any): AISignals {
  if (!Array.isArray(data.hardSkillsDetected)) {
    throw new Error('hardSkillsDetected must be an array');
  }
  if (!Array.isArray(data.mandatoryRequirementsMet)) {
    throw new Error('mandatoryRequirementsMet must be an array');
  }
  // ... 8 more manual checks
  if (!['above', 'match', 'below'].includes(data.seniorityMatch)) {
    throw new Error('seniorityMatch must be above, match, or below');
  }
  if (!data.recruiterMessage || typeof data.recruiterMessage !== 'string') {
    throw new Error('recruiterMessage must be a non-empty string');
  }
  // ... more manual checks
  return data as AISignals;
}
```

**Problems**:
- ❌ Verbose and error-prone
- ❌ Hard to maintain
- ❌ Error messages not standardized
- ❌ No type inference

### After (With Zod)

```typescript
import { z } from 'zod';
import { AISignalsSchema, validateAIResponse } from './aiResponseSchema';

const signals = validateAIResponse(data);
// Done! + errors are detailed + types are inferred
```

**Benefits**:
- ✅ 1 line of code
- ✅ Comprehensive validation
- ✅ Standardized error messages
- ✅ Full type inference
- ✅ Easy to extend

## Performance Characteristics

### Validation Speed

```typescript
const start = performance.now();
const signals = validateAIResponse(data);
const duration = performance.now() - start;

// Typical: 1-3ms for valid data
// Worst case: 5-10ms for deeply invalid data with many violations
```

### Memory Usage

```typescript
// Schema object: ~2KB (lightweight)
// Validation error: ~1KB per field violation
// Total per request: < 50KB
```

## Best Practices

### 1. Validate Early

```typescript
// ✅ GOOD: Validate immediately after parsing
const parsed = JSON.parse(response);
const signals = validateAIResponse(parsed); // Fail fast

// ❌ BAD: Use data without validating
const signals = parsed as AISignals; // Type lie!
```

### 2. Use Safe Validation for Non-Critical Paths

```typescript
// ✅ For user-facing API
const result = validateAIResponseSafe(data);
if (result.isValid) {
  return result.data;
}

// ✅ For logging/monitoring
const result = validateAIResponseSafe(auditLog);
if (!result.isValid) {
  logValidationError(result.error);
}
```

### 3. Include Correlation IDs in Error Logs

```typescript
try {
  const signals = validateAIResponse(data);
} catch (error) {
  if (error instanceof AIResponseValidationError) {
    logger.warn('Validation failed', {
      correlationId,
      violations: error.violations,
      responseLength: JSON.stringify(data).length,
    });
  }
}
```

### 4. Create Test Fixtures

```typescript
// test/fixtures/aiSignals.ts
export const validAISignals: AISignals = {
  hardSkillsDetected: ['Python', 'AWS'],
  mandatoryRequirementsMet: ['5+ years'],
  mandatoryRequirementsMissing: [],
  desirableRequirementsMet: [],
  desirableRequirementsMissing: [],
  softSkillsEvidence: [],
  seniorityMatch: 'match',
  redFlags: [],
  recruiterMessage: 'Good fit',
  coverLetter: 'Interested',
};

// Usage in tests
it('should score valid signals', () => {
  const score = calculateFitScore(validAISignals);
  expect(score).toBeGreaterThan(0);
});
```

## Debugging

### Print Schema Documentation

```typescript
function printAISignalsSchema(): void {
  console.log(getAISignalsSchemaDocumentation());
}

// Output:
/*
AISignalsSchema
├── hardSkillsDetected (string[])
├── mandatoryRequirementsMet (string[])
├── mandatoryRequirementsMissing (string[])
├── desirableRequirementsMet (string[])
├── desirableRequirementsMissing (string[])
├── softSkillsEvidence (string[])
├── seniorityMatch ('above' | 'match' | 'below')
├── redFlags (string[])
├── recruiterMessage (string, min 1 char)
├── coverLetter (string, min 1 char)
├── detectedYearsExperience (number | null, optional)
└── detectedDomainExperience (object | null, optional)
*/
```

### Compare Against Schema

```typescript
function debugValidation(data: any): void {
  const result = validateAIResponseSafe(data);
  
  if (!result.isValid) {
    console.log('Validation failures:');
    result.error?.violations.forEach(v => {
      console.log(`  ${v.path.join('.')}: ${v.message}`);
      console.log(`    Expected type: ${v.code}`);
      console.log(`    Got: ${typeof data[v.path[0]]}`);
    });
  }
}
```

## Summary

The Zod-based schema validation system provides:

1. **Type Safety** - Compile-time + runtime validation
2. **Error Details** - Precise violation information
3. **Maintainability** - Single source of truth
4. **Testability** - Easy to mock and verify
5. **Extensibility** - Simple to add new fields

All AI responses are validated before use, ensuring data integrity throughout the system.

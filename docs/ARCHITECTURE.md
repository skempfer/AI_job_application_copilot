# System Architecture

## ⚠️ Recent Update: AI Inference Architecture Refactor (v2.0)

The AI inference layer has been refactored for improved maintainability, reliability, and clarity. The following improvements were made:

- **System vs User Prompt Separation**: Invariant AI rules are separated from task-specific instructions
- **Schema Validation**: All AI responses validated against Zod schema at runtime  
- **Structured Logging**: Comprehensive observability with correlation IDs and performance metrics
- **Modular Prompt Builder**: Clear separation of concerns in prompt construction

**See [AI-INFERENCE-ARCHITECTURE.md](AI-INFERENCE-ARCHITECTURE.md) for complete details on the refactored AI inference layer.**

This document describes the overall system architecture. For implementation details of the AI service, prompt builder, validation, and logging, refer to the dedicated AI inference architecture guide.

---

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         USER                                │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Components (UI only)                                 │  │
│  │  - CVInput / JobInput                                 │  │
│  │  - AnalyzeButton                                      │  │
│  │  - ResultsDisplay                                     │  │
│  └──────────────┬───────────────────────────────────────┘  │
│                 │                                            │
│  ┌──────────────▼───────────────────────────────────────┐  │
│  │  Domain Layer (Pure JavaScript)                       │  │
│  │  - validateInputs()                                   │  │
│  │  - formatAnalysisResult()                             │  │
│  │  - getScoreColor()                                    │  │
│  └──────────────┬───────────────────────────────────────┘  │
│                 │                                            │
│  ┌──────────────▼───────────────────────────────────────┐  │
│  │  API Client (Pure JavaScript)                         │  │
│  │  - analyzeJobFit()                                    │  │
│  │  - fetch() HTTP calls                                 │  │
│  └──────────────┬───────────────────────────────────────┘  │
└─────────────────┼────────────────────────────────────────────┘
                  │ HTTP POST /api/analyze
                  │ { cv, jobDescription }
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Node.js)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Express Server                                       │  │
│  │  - CORS enabled                                       │  │
│  │  - JSON body parser                                   │  │
│  └──────────────┬───────────────────────────────────────┘  │
│                 │                                            │
│  ┌──────────────▼───────────────────────────────────────┐  │
│  │  Route: POST /api/analyze                             │  │
│  │  - Input validation                                   │  │
│  │  - Error handling                                     │  │
│  └──────────────┬───────────────────────────────────────┘  │
│                 │                                            │
│  ┌──────────────▼───────────────────────────────────────┐  │
│  │  AIService (Hybrid Scoring with Modular Prompts)     │  │
│  │  - System Prompt (invariant rules)                    │  │
│  │  - buildOptimizedPrompt() (modular sections)          │  │
│  │  - Schema Validation (Zod)                            │  │
│  │  - Structured Logging (timing, correlation IDs)       │  │
│  │  - analyzeJobFit() orchestrates:                      │  │
│  │    1. Preprocess CV & Job Description                 │  │
│  │    2. Get AISignals from OpenAI                       │  │
│  │    3. Validate response against schema                │  │
│  │    4. calculateFitScore(signals) [deterministic]      │  │
│  │    5. generateExplanation(signals, score)             │  │
│  │    6. determineDecision(score)                        │  │
│  │  - Error handling with detailed logging               │  │
│  └──────────────┬───────────────────────────────────────┘  │
│                 │                                            │
│  ┌──────────────▼───────────────────────────────────────┐  │
│  │  Scoring Service (Pure TypeScript Logic)             │  │
│  │  - calculateFitScore(signals) → number               │  │
│  │  - generateExplanation(signals, score)               │  │
│  │  - determineDecision(score)                          │  │
│  │  Weights: hardSkills 35%, mandatory 30%,             │  │
│  │           seniority 15%, desirable 10%,              │  │
│  │           softSkills 5%, redFlags -5%                │  │
│  └──────────────┬───────────────────────────────────────┘  │
└─────────────────┼────────────────────────────────────────────┘
                  │ API Call
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                      OpenAI Chat API                          │
│  - Model: gpt-4 or gpt-3.5-turbo                              │
│  - Temperature: 0.2 (low randomness, consistency)             │
│  - Max tokens: 1500                                           │
│  - Structured JSON output (AISignals)                         │
│  - Prompt Version: v2.0-optimized                             │
└───────────────────────────┬─────────────────────────────────┘
                            │ JSON Response (AISignals)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  {                                                           │
│    "hardSkillsDetected": ["Python", "AWS", "Docker"],        │
│    "mandatoryRequirementsMet": ["5+ years backend"],         │
│    "mandatoryRequirementsMissing": ["Kubernetes"],           │
│    "desirableRequirementsMet": ["PostgreSQL"],               │
│    "desirableRequirementsMissing": ["GraphQL"],              │
│    "softSkillsEvidence": ["Led team of 5 developers"],       │
│    "seniorityMatch": "match",                                │
│    "redFlags": [],                                           │
│    "recruiterMessage": "Hello, I'm writing to exp...", │
│    "coverLetter": "I am excited about this role...",         │
│    "detectedYearsExperience": 8,                             │
│    "detectedDomainExperience": {                             │
│      "backend": true,                                        │
│      "fullstack": false,                                     │
│      "frontend": false,                                      │
│      "qa": false,                                            │
│      "devops": false,                                        │
│      "product": false                                        │
│    }                                                         │
│  }                                                           │
└───────────────────────────┬─────────────────────────────────┘
                            │ Backend processes signals:
                            │ - Uses detectedYearsExperience for seniority checks
                            │ - Uses detectedDomainExperience (roles) for role fit
                            │ fitScore = calculateFitScore(signals)
                            │ explanation = generateExplanation(signals, score)
                            │ decision = determineDecision(score)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Final AnalysisResult                                        │
│  {                                                           │
│    "fitScore": 85,           // Calculated deterministically │
│    "decision": "apply",       // Based on score thresholds   │
│    "strengths": [...],        // Derived from signals        │
│    "gaps": [...],             // Derived from signals        │
│    "cvSuggestions": [...],    // Generated from gaps         │
│    "recruiterMessage": "...", // From AI (signal)            │
│    "coverLetter": "...",      // From AI (signal)            │
│    "explanation": {           // Transparent scoring         │
│      "positives": [...],                                     │
│      "negatives": [...],                                     │
│      "summary": "..."                                        │
│    },                                                        │
│    "promptVersion": "v2.0-optimized", // For evolution tracking│
│    "preprocessedCV": {        // Preprocessed deterministic data
│      "yearsExperience": 8,    // From deterministic extraction
│      "domainExperience": {    // Roles detected from CV
│        "backend": true,                                      │
│        "frontend": false,                                    │
│        "fullstack": false,                                   │
│        "qa": false,                                          │
│        "devops": false,                                      │
│        "product": false                                      │
│      },                                                      │
│      "skills": [...]          // Extracted technical skills  │
│    }                                                         │
│  }                                                           │
└───────────────────────────┬─────────────────────────────────┘
                            │ Returns to Frontend
                            ▼
                  [ResultsDisplay renders + ExplanationDisplay]
```

---

## Hybrid Scoring Architecture 🎯

### Why Hybrid?

**Problem**: Letting the AI calculate the score directly results in:
- ❌ Inconsistency between calls
- ❌ Impossible to debug or audit
- ❌ Difficult to adjust weights without retraining

**Solution**: Separation of concerns
- ✅ **AI extracts signals** (classification, matching)
- ✅ **Code calculates score** (deterministic, testable)
- ✅ **Explainability built-in** (transparent to user)

### Hybrid Scoring Flow

```
1️⃣ buildOptimizedPrompt() → System + User Prompt (v2.0)
   - System Prompt: Invariant rules (output format, anti-hallucination)
   - User Prompt: Task data in modular sections
   
2️⃣ OpenAI Chat API → AISignals (JSON)
   Classifies and extracts structured information
   Temperature: 0.2 (consistent results)
   
3️⃣ validateAIResponse() → Schema Validation (Zod)
   Validates response against strict schema
   Throws with detailed violation information if invalid
   
4️⃣ calculateFitScore(signals) → number
   Deterministic algorithm with fixed weights:
   - Hard skills: 35%
   - Mandatory requirements: 30%
   - Seniority match: 15%
   - Desirable requirements: 10%
   - Soft skills: 5%
   - Red flags: -5% penalty
   
5️⃣ generateExplanation(signals, score)
   Explains EACH component of the score:
   - Positives: "Hard skills: +28/35 points"
   - Negatives: "Missing 1 mandatory requirement: -10 points"
   - Summary: human-readable overview
   
6️⃣ determineDecision(score)
   Clear thresholds:
   - score >= 75: "apply"
   - score >= 50: "apply_with_fixes"
   - score < 50: "skip"
   
7️⃣ Structured Logging throughout
   Correlation ID for request tracing
   Timing for each phase
   Performance metrics for monitoring
```

### Benefits

1. **Testability**: Scoring logic is a pure function
2. **Auditability**: Score is always explainable
3. **Evolvability**: Adjust weights without retraining AI
4. **Consistency**: Same input → same score
5. **Debugability**: Logs show each component

---

## Detailed Data Flow

### 1. User Enters Inputs

```
User Action → CVInput.onChange(text)
           → JobInput.onChange(text)
           → App.tsx updates state (cv, jobDescription)
```

### 2. User Clicks "Analyze"

```
AnalyzeButton.onClick()
  ↓
App.handleAnalyze()
  ↓
validateInputs(cv, jobDescription)  [domain/analyzer.js]
  ↓ (if valid)
analyzeJobFit(cv, jobDescription)   [domain/apiClient.js]
  ↓
fetch('POST /api/analyze', body)
```

### 3. Backend Processes Request

```
Express receives POST /api/analyze
  ↓
routes/analyze.ts
  ↓
Input validation (size, type)
  ↓
aiService.analyzeJobFit(cv, jobDescription)
  ↓
buildPrompt(cv, jobDescription)
  ↓
Groq API call
  ↓
validateResult(jsonResponse)
  ↓
Returns structured JSON
```

### 4. Frontend Renders Result

```
App.tsx receives response
  ↓
formatAnalysisResult(result)  [domain/analyzer.js]
  ↓
setResult(formattedResult)
  ↓
ResultsDisplay renders cards:
  - Score badge
  - Decision
  - Strengths
  - Gaps
  - CV Suggestions
  - Recruiter Message
```

---

## Preprocessed Data Layer 🔍

The system uses **deterministic preprocessing** alongside AI signals to ensure consistency and improve accuracy.

### Years of Experience Detection

```typescript
detectedYearsExperience: number | null
```

**How it works**:
- Extracts from CV using regex patterns (e.g., "5 years", "2015-2024")
- Deterministic (same CV always yields same result)
- Used by scoring algorithm for seniority validation
- Can be overridden by AI signals if more accurate

**Example**:
```
CV contains: "Senior Developer with 8 years of experience"
Detected: detectedYearsExperience: 8
Score Impact: Compared against job requirement ("5+ years")
```

### Domain Experience Detection (Roles)

```typescript
detectedDomainExperience: {
  frontend?: boolean;
  backend?: boolean;
  fullstack?: boolean;
  qa?: boolean;
  devops?: boolean;
  product?: boolean;
} | null
```

**How it works**:
- Analyzes CV for role-specific keywords and patterns
- Deterministic pattern matching (not AI)
- Boolean flags: `true` if credible evidence found, `false` otherwise
- Used to validate if candidate has experience in required domain

**Role Indicators**:
- **Frontend**: React, Vue, Angular, CSS, HTML, TypeScript, Webpack, Jest
- **Backend**: Node.js, Python, Java, Express, Django, APIs, Databases
- **Fullstack**: Both frontend AND backend indicators present
- **QA**: Testing, Selenium, Jest, Cypress, Test Automation, QA
- **DevOps**: Docker, Kubernetes, CI/CD, Jenkins, AWS, Infrastructure
- **Product**: Product management, features, roadmap, stakeholders, users

**Example Output**:
```json
{
  "frontend": false,
  "backend": true,
  "fullstack": false,
  "qa": false,
  "devops": true,
  "product": false
}
```

### Preprocessed CV Data in Response

The `preprocessedCV` field in `AnalysisResult` includes:

```typescript
preprocessedCV: {
  yearsExperience: number;           // Extracted years (deterministic)
  yearsExperienceConfidence: number; // How confident (0-100)
  domainExperience: {...};           // Roles detected (boolean flags)
  seniority: string;                 // Calculated: "junior" | "mid" | "senior"
  skills: string[];                  // Extracted technical skills
}
```

### Why Dual Layer (AI + Deterministic)?

**Problem with AI alone**:
- May hallucinate or misinterpret
- Inconsistent across requests
- Can't audit the decision

**Problem with deterministic alone**:
- Limited to keyword matching
- Misses context and creative expressions
- Rigid and inflexible

**Solution (Hybrid)**:
- ✅ Deterministic preprocessing validates basic facts (years, keywords)
- ✅ AI adds context and nuanced interpretation
- ✅ Both layers complement each other
- ✅ Results are consistent AND contextual

---

## Separation of Concerns

### Frontend

#### Components (React + TypeScript)
**Responsibility**: UI rendering and events
- Typed props
- No business logic
- Delegates actions only

#### Domain Layer (Pure JavaScript)
**Responsibility**: Business logic
- Validation
- Formatting
- Calculations
- HTTP client

**Why pure JavaScript?**
- Testable without React
- Reusable in Node.js
- Zero framework coupling

### Backend

#### Routes
**Responsibility**: HTTP validation and error handling
- Validates request body
- Returns appropriate status codes
- Handles service-layer errors

#### Services
**Responsibility**: Backend business logic
- Prompt engineering
- External API integration
- Response validation

---

## Architectural Decisions

### Why not put AI directly in frontend?

❌ **Problems**:
- Expose API key to client (INSECURE)
- CORS issues with Groq
- Difficult to add rate limiting
- No audit log on server

✅ **Solution**:
- Backend orchestrates calls
- API key secure on server
- Easy to add caching/rate limiting
- Server-side audit trail

### Why domain layer in pure JavaScript?

❌ **Alternative**: Logic inside components
- Hard to test
- Couples logic to React
- Code duplication

✅ **Advantages**:
- Testable in isolation
- Reusable (Node, browser, CLI)
- Clear separation of concerns

### Why TypeScript in frontend/backend but JS in domain?

- **TS in frontend**: Strong React ↔ Domain contracts
- **TS in backend**: Type safety in HTTP ↔ AI
- **JS in domain**: Portability and proof of concept

In production, domain would also be TS with `.d.ts` files.

---

## Technologies & Justifications

| Technology | Alternative | Why Chosen |
|-----------|-------------|-----------|
| **React** | Vue, Svelte | Most widely used, rich ecosystem |
| **TypeScript** | JavaScript | Type safety reduces bugs |
| **Tailwind** | CSS-in-JS | Utility-first, no runtime overhead |
| **Vite** | CRA, Webpack | Extremely fast, excellent DX |
| **Express** | Fastify, Hono | Simplicity, widespread adoption |
| **Groq** | OpenAI, Anthropic | Exceptional speed, free |

---

## Future Improvements

### Short Term
- [ ] Add tests (Jest + RTL)
- [ ] Loading skeleton during analysis
- [ ] Toast notifications for errors
- [ ] localStorage for history

### Medium Term
- [ ] Cache responses (Redis)
- [ ] Rate limiting (express-rate-limit)
- [ ] Multiple AI providers
- [ ] Export results as PDF

### Long Term
- [ ] User authentication
- [ ] Dashboard with analytics
- [ ] Compare multiple job postings
- [ ] AI trained on real hiring data

# System Architecture

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
│  │  AIService (Hybrid Scoring Architecture)             │  │
│  │  - buildPrompt() → extract signals (not score)       │  │
│  │  - analyzeJobFit() → orchestrates:                   │  │
│  │    1. Get AISignals from Groq                        │  │
│  │    2. calculateFitScore(signals) [deterministic]     │  │
│  │    3. generateExplanation(signals, score)            │  │
│  │    4. determineDecision(score)                       │  │
│  │  - validateSignals()                                 │  │
│  │  - generateCVSuggestions()                           │  │
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
│                      Groq API                                │
│  - Model: llama-3.3-70b-versatile                             │
│  - Free, ultra-fast (1-2s)                                    │
│  - Structured JSON output (AISignals)                         │
│  - Prompt Version: v1.1                                       │
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
│    "recruiterMessage": "..."                                 │
│  }                                                           │
└───────────────────────────┬─────────────────────────────────┘
                            │ Backend processes signals:
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
│    "recruiterMessage": "...", // From AI                     │
│    "explanation": {           // Transparent scoring         │
│      "positives": [...],                                     │
│      "negatives": [...],                                     │
│      "summary": "..."                                        │
│    },                                                        │
│    "promptVersion": "v1.1"    // For evolution tracking      │
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
1️⃣ buildPrompt() → Prompt v1.1
   "Extract these signals: hardSkills, mandatory requirements,
    seniority match, red flags..."
   
2️⃣ Groq API → AISignals (JSON)
   Classifies and extracts structured information
   
3️⃣ calculateFitScore(signals) → number
   Deterministic algorithm with fixed weights:
   - Hard skills: 35%
   - Mandatory requirements: 30%
   - Seniority match: 15%
   - Desirable requirements: 10%
   - Soft skills: 5%
   - Red flags: -5% penalty
   
4️⃣ generateExplanation(signals, score)
   Explains EACH component of the score:
   - Positives: "Hard skills: +28/35 points"
   - Negatives: "Missing 1 mandatory requirement: -10 points"
   - Summary: human-readable overview
   
5️⃣ determineDecision(score)
   Clear thresholds:
   - score >= 75: "apply"
   - score >= 50: "apply_with_fixes"
   - score < 50: "skip"
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

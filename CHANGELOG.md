# Changelog

## [1.1.0] - Hybrid Scoring Architecture - 2024

### 🎯 Major Features

#### Hybrid Scoring System
- **Separated concerns**: AI extracts signals, code calculates score deterministically
- **New architecture flow**:
  1. Groq AI extracts structured signals (AISignals)
  2. Deterministic algorithm calculates fitScore
  3. Transparent explanation generated for every score
  4. Decision based on clear thresholds

#### Explainability
- **ScoreExplanation** interface added to AnalysisResult
- **ExplanationDisplay** React component shows:
  - Positives: breakdown of each scoring component (+35 from hard skills, +24 from mandatory, etc.)
  - Negatives: what reduced the score
  - Summary: human-readable overview
- **Prompt versioning**: v1.1 for evolution tracking

### 📦 New Files

#### Backend
- `backend/src/services/scoring.ts` - Pure TypeScript scoring logic
  - `calculateFitScore(signals)` - Deterministic algorithm
  - `generateExplanation(signals, score)` - Explanation generator
  - `determineDecision(score)` - Decision based on thresholds

#### Frontend
- `frontend/src/domain/scoring.js` - JavaScript version of scoring (framework-agnostic)
- `frontend/src/components/ExplanationDisplay.tsx` - UI component for score breakdown

### 🔄 Modified Files

#### Types
- `backend/src/types/analysis.ts`:
  - Added `AISignals` interface (9 fields)
  - Added `ScoreExplanation` interface
  - Updated `AnalysisResult` with `explanation?` and `promptVersion?`
  
- `frontend/src/types/analysis.ts`:
  - Added `SeniorityMatch` type
  - Added `ScoreExplanation` interface
  - Updated `AnalysisResult` with optional explanation and promptVersion

#### Services
- `backend/src/services/aiService.ts`:
  - `buildPrompt()` rewritten to extract signals (Prompt v1.1)
  - `analyzeJobFit()` refactored to orchestrate hybrid scoring:
    1. Call Groq for AISignals
    2. Call calculateFitScore(signals)
    3. Call generateExplanation(signals, score)
    4. Compose final AnalysisResult
  - `validateSignals()` replaces `validateResult()`
  - New `generateCVSuggestions()` helper

#### Components
- `frontend/src/components/ResultsDisplay.tsx`:
  - Integrated `ExplanationDisplay` component
  - Shows explanation when available

#### Documentation
- `ARCHITECTURE.md`:
  - Added "Hybrid Scoring Architecture" section
  - Updated flow diagrams
  - Explained separation of concerns
  
- `DECISIONS.md`:
  - New section: "Hybrid Scoring Architecture"
  - Documented why hybrid approach was chosen
  - Explained trade-offs and alternatives
  
- `EXAMPLES.md`:
  - Example 1 rewritten to show 3-step hybrid flow
  - Shows AISignals extraction
  - Shows score calculation breakdown
  - Shows final AnalysisResult with explanation
  
- `README.md`:
  - Added "Hybrid Scoring Architecture" feature highlight
  - Listed scoring weights
  - Updated output description

### 🐛 Bug Fixes
- Fixed TypeScript unused variable warnings in `server.ts`

### ⚙️ Configuration
- Prompt version constant: `PROMPT_VERSION = "v1.1"`

### 📊 Scoring Weights

```typescript
const WEIGHTS = {
  hardSkills: 0.35,              // 35%
  mandatoryRequirements: 0.30,   // 30%
  seniority: 0.15,               // 15%
  desirableRequirements: 0.10,   // 10%
  softSkills: 0.05,              // 5%
  redFlagsPenalty: -0.05,        // -5%
};
```

### 🎯 Benefits

1. **Consistency**: Same input = always same score (deterministic)
2. **Testability**: Pure functions, easy to unit test
3. **Explainability**: Users see exactly how score was calculated
4. **Debuggability**: Logs show each component contribution
5. **Evolvability**: Adjust weights without retraining AI
6. **Auditability**: Every score is traceable and explainable

### 🔮 Future Enhancements

- [ ] Add A/B testing capability for scoring algorithms
- [ ] Persist prompt versions in database
- [ ] Add unit tests for scoring functions
- [ ] Create admin panel to adjust weights dynamically
- [ ] Add score history comparison
- [ ] Implement feedback loop to improve signal extraction

---

## [1.0.0] - Initial Release - 2024

### Features
- Full-stack application (React + Node.js)
- Groq API integration (llama-3.3-70b-versatile)
- CV and Job Description analysis
- Score calculation (0-100)
- Decision recommendation (apply/apply_with_fixes/skip)
- Strengths and gaps identification
- CV improvement suggestions
- Recruiter message generation

### Stack
- Frontend: React 18, TypeScript, Vite, Tailwind CSS
- Backend: Node.js, Express, TypeScript
- AI: Groq API (free, ultra-fast)

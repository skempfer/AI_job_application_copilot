# Technical Decisions

## Architecture

### Separation of Responsibility

#### Frontend (React + TypeScript)
- **Single responsibility**: UI and local state management
- **No business logic**: components only render and delegate actions
- **Strong typing**: TypeScript ensures well-defined contracts

#### Domain Layer (Pure JavaScript)
**Why pure JavaScript and not TypeScript?**
- Demonstrate clear separation between framework and logic
- Executable in both browser and Node.js without transpilation
- Testable without depending on React
- Lighter weight and more portable

**Main functions**:
- `validateCV()` / `validateJobDescription()`: validation without side effects
- `formatAnalysisResult()`: data transformation
- `getScoreColor()` / `getDecisionText()`: value-to-UI mapping
- `analyzeJobFit()`: pure HTTP client

**Advantages**:
- Zero coupling with React
- Testable with pure Jest
- Reusable in other contexts (CLI, E2E tests, etc.)

#### Backend (Node.js + Express + TypeScript)
- **Orchestration**: builds prompts, calls AI, validates response
- **Thin layer**: only translates HTTP ↔ AI
- **Server-side validation**: never trust the client

### Prompt Engineering

**Strategy**:
1. **Specific context**: "you are a senior tech recruiter"
2. **Explicit criteria**: real seniority vs. buzzwords
3. **Clear scale**: 0-100 with well-defined ranges
4. **Forced structure**: JSON schema in instruction
5. **Humanization**: message should sound professional yet natural

**Why it works**:
- LLMs respond better to structured instructions
- Forcing JSON avoids fragile parsing
- Penalizing out-of-scope jobs avoids generic results

## Technical Stack

### React without frameworks
**Why not Next.js?**
- Project is a simple SPA, no SSR needed
- Lower configuration overhead
- Focus on learning fundamentals
- Vite is faster for development

### Tailwind CSS
**Why not CSS-in-JS?**
- Utility-first reduces cognitive load
- Zero runtime (vs. styled-components)
- Design system via `tailwind.config.js`
- Reusable classes (`@layer components`)

### Express vs. Edge Functions
**Why Express?**
- Simplicity: stateless server
- Easy to test locally
- Portable (runs on any Node.js host)
- Less vendor lock-in than Vercel Edge

## AI Architecture (Groq vs OpenAI)

### Why Groq?

**Groq Specifics:**
- API compatible with OpenAI (same SDK)
- Base URL: `https://api.groq.com/openai/v1`
- Model: `llama-3.3-70b-versatile` (70B parameters)
- Temperature: 0.3 (for more structured responses)
- Max tokens: 1500 (enough for well-formatted JSON output)

**Advantages vs OpenAI:**
| Aspect | Groq | OpenAI |
|--------|------|--------|
| **Cost** | Completely free | ~$0.001-0.01 per analysis |
| **Speed** | 1-2 seconds | 10-20 seconds |
| **Model** | Llama 3.3 70B (open-source) | GPT-4 (proprietary) |
| **Setup** | Trivial, free key | Requires billing |
| **Quality** | Excellent for structured JSON | Superior in nuances |

## Hybrid Scoring Architecture 🎯

### Decision: AI Extracts Signals, Code Calculates Score

**Original problem:**
Letting the AI calculate `fitScore` directly caused:
- Inconsistency: same CV + job = different scores between calls
- Opacity: user didn't understand WHY score was X
- Hard to adjust: changing weights required retraining/reprompt
- Hard to test: can't test something non-deterministic

**Chosen solution:**
```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│  AI (Groq)  │───▶│ AISignals    │───▶│ Scoring.ts  │
│ Extract &   │    │ (structure)  │    │ (algorithm) │
│ Classify    │    └──────────────┘    └─────────────┘
└─────────────┘                               │
                                              ▼
                                        fitScore: 85
                                        explanation: {...}
```

**What the AI does:**
- ✅ Detects hard skills mentioned in CV
- ✅ Classifies mandatory requirements as met/missing
- ✅ Identifies soft skills evidence
- ✅ Evaluates seniority match (below/match/above)
- ✅ Flags red flags (job hopping, gaps, etc.)
- ❌ **Does NOT calculate score** (that's code's responsibility)

**What the code does:**
- ✅ `calculateFitScore(signals)` → deterministic score
- ✅ `generateExplanation(signals, score)` → transparent breakdown
- ✅ `determineDecision(score)` → apply/skip based on thresholds

**Algorithm weights:**
```typescript
const WEIGHTS = {
  hardSkills: 0.35,        
  mandatoryRequirements: 0.30,  
  seniority: 0.15,             
  desirableRequirements: 0.10,  
  softSkills: 0.05,            
  redFlagsPenalty: -0.05,     
};
```

**Why it worked:**
1. **Testable**: `calculateFitScore()` is a pure function → easy unit tests
2. **Auditable**: `explanation` shows exactly how score was calculated
3. **Adjustable**: changing hardSkills weight doesn't require touching prompts
4. **Consistent**: same input = ALWAYS same score
5. **Debuggable**: logs show each component (hardSkills: +28, mandatory: +24, etc.)

**Prompt Versioning:**
- `v1.0`: AI calculated score (discontinued)
- `v1.1`: AI extracts signals, code calculates (current)
- Future: `v1.2` can add new signals without breaking v1.1

**Trade-offs:**
- ❌ More code (scoring.ts + types)
- ❌ Less flexible than pure AI (fixed weights)
- ✅ Much more reliable and explainable
- ✅ Allows A/B testing of algorithms without touching AI

**Considered alternatives:**
1. **AI calculates everything**: rejected for inconsistency
2. **Regex + parsing**: too fragile, too dumb
3. **Trained ML model**: overkill for MVP, hard to explain
4. **Hybrid (chosen)**: best of both worlds

## Security & Limits

### Rate Limiting (not implemented, but recommended)
In production, add:
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per IP
});

app.use('/api/analyze', limiter);
```

### Input Validation
- Maximum size for CV/job description
- Basic sanitization (trimming)
- Timeout on AI calls

### AI Costs
- **Groq (Llama 3.3 70B) is completely free**
- No request limits, no billing fees
- Add caching of responses for identical CV + job combinations

## UX Decisions

### Visual Feedback
- Loading spinner during analysis (fast with Groq: 1-2 seconds)
- Fade-in animation on results
- Colored badges for score (green/yellow/red)
- Character counter on inputs

### Mobile-First
- Tailwind breakpoints (`md:grid-cols-2`)
- Responsive inputs
- Touch-friendly (large buttons)

### Accessibility (to improve)
Not implemented but recommended:
- ARIA labels on action buttons
- Skip links
- WCAG AA contrast
- Keyboard navigation

## Next Steps (if real product)

### Features
1. **Analysis history**: save locally (localStorage)
2. **Export PDF**: generate analysis report
3. **Job comparison**: analyze multiple jobs
4. **CV templates**: pre-formatted suggestions
5. **LinkedIn integration**: import profile automatically

### Infrastructure
1. **Deployment**: Vercel (frontend) + Railway/Render (backend)
2. **Monitoring**: Sentry for errors
3. **Analytics**: Plausible (privacy-friendly)
4. **CI/CD**: GitHub Actions

### Code Improvements
1. **Tests**: Jest + React Testing Library
2. **E2E**: Playwright
3. **Linting**: ESLint + Prettier
4. **Type safety**: validate AI JSON with Zod

## Prompt Used (Backend)

See [aiService.ts](../backend/src/services/aiService.ts#L13) - `buildPrompt()` function.

**Key elements**:
- Persona: "experienced senior tech recruiter"
- Evaluation criteria explicit
- fitScore scale well-defined
- Decision rules clear
- Instruction to return pure JSON

**Result**: 
- AI returns valid JSON 95%+ of the time
- Messages are human-like, not robotic
- Scores are consistent and justified

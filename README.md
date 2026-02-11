# Viora — Clarity for Smarter Career Decisions

## Overview

Applying for jobs is not a volume game — it's a **decision-making problem**.

Most tools either spam applications or blindly optimize keywords, which leads to poor results, wasted time, and sometimes account restrictions.  
**Viora** takes a different approach.

This project helps candidates decide whether they should apply to a job and how to improve their application, using AI as a **decision support system** — not as an automation bot.

> **No auto-apply. No scraping. No ToS violations.**  
> **Just better decisions.**

---

## Problem Statement

Job seekers face three recurring issues:

- **Applying to too many low-fit roles** → wasted time and effort
- **Not knowing why a role is or isn't a good match** → poor decision-making
- **Spending excessive time tailoring resumes with little feedback** → inefficient workflow

Blind automation solves none of these problems.

---

## Solution

**Viora** acts as a pre-application intelligence layer.

Given:
- A candidate CV
- A job description

The system:

- ✅ Analyzes skill alignment
- ✅ Identifies strengths and gaps
- ✅ Calculates a fit score (0-100)
- ✅ Recommends whether to apply
- ✅ Suggests targeted CV improvements
- ✅ Generates a short, human recruiter message

**The final decision always stays with the user.**

---

## Key Principles

- 🎯 **Decision support, not automation**
- 🔍 **Explainability over black-box AI**
- ⚖️ **Ethical usage aligned with platform ToS**
- 🔌 **Provider-agnostic AI architecture**
- 💰 **Low cost, fast iteration**

---

## How It Works

1. User pastes CV and job description
2. AI extracts structured signals (skills, requirements, gaps)
3. Deterministic logic calculates the final fit score
4. The system returns a clear, explainable recommendation

> **AI provides signals.**  
> **Code makes the decision.**

---

## Example Output

```json
{
  "fitScore": 78,
  "decision": "apply_with_fixes",
  "strengths": [
    "Advanced React",
    "API integration experience"
  ],
  "gaps": [
    "Elixir experience"
  ],
  "cvSuggestions": [
    "Highlight leadership responsibilities",
    "Quantify business impact of features"
  ],
  "recruiterMessage": "Hi! I really liked the product focus of this role. My experience with React and APIs aligns well with the team's needs.",
  "explanation": {
    "positives": [
      "Strong frontend background",
      "Relevant marketplace experience"
    ],
    "negatives": [
      "Missing one required backend technology"
    ],
    "summary": "Good overall match with minor gaps that can be addressed in the CV."
  },
  "promptVersion": "v1.1"
}
```

---

## Tech Stack

### Frontend
- React
- TypeScript
- Tailwind CSS

> The UI supports runtime language and theme switching without external i18n or theming libraries.

### Backend
- Node.js
- TypeScript
- Lightweight API layer

### AI Layer
- **Provider-based architecture** (easily switch providers)
- **Current provider:** Groq
- **Mock provider** available for local development and testing

---

## Architecture Highlights

### 🔌 AI Provider Pattern
Easily switch between Groq, OpenAI, or mock implementations via environment variables.

### 🎯 Deterministic Scoring
AI extracts signals; scoring logic lives in code for **consistency and transparency**.

### 📌 Prompt Versioning
Each analysis is tagged with a prompt version to track evolution and behavior changes.

### 💡 Cost-Aware Design
Token limits, low temperature, and fallback modes are built-in.

---

## Why This Project Exists

This project was built as a response to **real-world job searching frustration**.

It intentionally avoids:
- ❌ Auto-apply bots
- ❌ Mass application strategies
- ❌ Scraping or platform abuse

Instead, it focuses on **clarity, intent, and leverage** applying less, but better.

---

## Roadmap (Intentional and Minimal)

- [ ] Improve scoring weights based on role seniority
- [ ] Export CV suggestions in markdown
- [ ] Add basic persistence for analysis history
- [ ] Optional provider fallback

**No feature bloat. No dark patterns.**

---

## � Documentation

All project documentation is in the [`/docs`](./docs) folder.

### Quick Links

| Document | Purpose |
|----------|---------|
| [Quick Start](./docs/QUICK-START.md) | Setup and running the project |
| [Architecture](./docs/ARCHITECTURE.md) | System design and data flow |
| [Technical Decisions](./docs/DECISIONS.md) | Why we made key choices |
| [Development Guide](./docs/DEV-GUIDE.md) | Development workflow and practices |
| [Git Workflow](./docs/GIT-WORKFLOW.md) | Contributing and branch strategy |
| [Commit Standards](./docs/COMMIT-GUIDE.md) | Conventional Commits format |
| [TypeScript Types](./docs/TYPES.md) | Type definitions and contracts |
| [Examples](./docs/EXAMPLES.md) | Real-world usage examples |
| [Contributing](./docs/CONTRIBUTING.md) | How to contribute |

---

## 🔗 Git Workflow & Commit Standards

This project uses **Husky** with **Commitlint** to enforce [Conventional Commits](https://www.conventionalcommits.org/) for all commits.

### Quick Example

```bash
# ✅ Valid commits
git commit -m "feat(backend): add hybrid scoring algorithm"
git commit -m "fix(frontend): resolve infinite loop"
git commit -m "docs: update README"

# ❌ Invalid commits (will be rejected)
git commit -m "updated scoring"
git commit -m "fe: added feature"
```

### Commit Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code formatting (no logic changes)
- **refactor**: Code restructuring
- **perf**: Performance improvements
- **test**: Test additions/updates
- **build**: Dependency updates
- **ci**: CI/CD changes
- **chore**: Maintenance tasks

👉 **[See full commit guidelines](./docs/COMMIT-GUIDE.md)**

### Setup

Husky is automatically installed via `npm install`. No additional setup needed.

To test the validation:
```bash
bash test-husky.sh
```

### Want to Contribute?

👉 **[Read CONTRIBUTING.md](./docs/CONTRIBUTING.md)** for the full development process.

---

## Disclaimer

⚠️ **This tool does not guarantee interviews or job offers.**

It is designed to improve decision-making and application quality — nothing more, nothing less.

---

## Author

Built by a software engineer exploring ethical, explainable, and practical applications of AI in real workflows.
# 🚀 Viora — Intelligent Career Decision Engine

## Clarity Before Application. Strategy Before Action.

Applying for jobs is not a volume game.  
It is a **signal optimization problem**.

Most tools optimize for quantity:
- More applications  
- More keywords  
- More automation  

That strategy burns time and credibility.

**Viora optimizes for quality.**

It helps professionals decide:
- Should I apply?
- What’s missing?
- What should I fix first?
- Is this strategically aligned?

> ❌ No auto-apply  
> ❌ No scraping  
> ❌ No platform abuse  
> ✅ Just better decisions  

---

## 📌 Overview

Viora is a decision-support system that helps candidates evaluate job fit before applying.

Instead of automating submissions, it focuses on clarity, alignment, and strategic improvement.

**AI extracts structured signals.**  
**Code makes deterministic decisions.**

---

## 🧠 The Core Problem

Modern job search friction looks like this:

- High application volume, low response rate  
- Poor understanding of actual fit  
- Resume tailoring done blindly  
- No structured feedback loop  

Automation increases noise.  
Noise reduces signal.  
Reduced signal lowers outcomes.

---

## 🔄 The Strategic Shift

Viora reframes the problem:

From:
> "How many jobs can I apply to?"

To:
> "Which applications deserve my energy?"

It acts as an intelligence layer between the candidate and the **Apply** button.

---

## ⚙️ What The System Does

Given:
- A CV  
- A job description  

Viora:

- ✅ Extracts structured signals  
- ✅ Identifies strengths and gaps  
- ✅ Calculates a deterministic fit score (0–100)  
- ✅ Recommends `apply` / `apply_with_fixes` / `skip`  
- ✅ Suggests targeted CV improvements  
- ✅ Generates a personalized and humanized recruiter message  
- ✅ Generates a tailored cover letter aligned with the role  
- ✅ Explains the reasoning behind the decision  

The final decision always stays with the user.

This is not generic AI text generation.

The system uses structured signals from the job description and CV to produce context-aware, role-aligned communication.

---
## ✍️ Strategic Application Support

Beyond scoring, Viora helps candidates improve how they communicate.

### Personalized Recruiter Message
A short, humanized message aligned with:
- The role focus
- The company context
- The candidate’s strongest signals

Designed to sound intentional — not automated.

### Tailored Cover Letter
A structured, role-aligned cover letter that:
- Emphasizes relevant strengths
- Transparently addresses skill gaps when necessary
- Avoids generic filler language
- Aligns tone with the job level

The goal is not to generate volume.
It is to increase signal clarity and intentional positioning.

---

## 📊 Example Response

```json
{
  "fitScore": 78,
  "decision": "apply",
  "strengths": [
    "Hard skill: nodejs",
    "Hard skill: typescript",
    "Hard skill: aws",
    "Requirement met: REST APIs",
    "Requirement met: automated testing",
    "Bonus qualification: docker"
  ],
  "gaps": [
    "Missing requirement: kubernetes",
    "Missing bonus qualification: graphql",
    "Missing bonus qualification: observability"
  ],
  "cvSuggestions": [
    "Highlight experience related to: kubernetes, observability",
    "Add more detail about your technical skills"
  ],
  "recruiterMessage": "The candidate has a solid Node.js and TypeScript background with real API and cloud experience. Recommend moving forward to a technical interview focused on scalability and architecture.",
  "coverLetter": "Dear Hiring Manager,\n\nI am writing to express my interest in the Software Engineer role. I have over five years of experience building scalable APIs with Node.js and TypeScript, and I have worked extensively with AWS, testing frameworks, and modern development practices. I enjoy collaborating with cross-functional teams and delivering reliable, well-architected solutions.\n\nIn previous roles, I led initiatives to improve performance, strengthen testing coverage, and streamline deployment pipelines. I am eager to bring this experience to your team and continue growing in areas like Kubernetes and observability.\n\nThank you for your time and consideration. I would welcome the opportunity to discuss how I can contribute to your organization.\n\nSincerely,\n[Your Name]",
  "explanation": "The candidate meets most mandatory requirements and has relevant backend experience. Missing Kubernetes and observability slightly reduce the score but do not block progression.",
  "promptVersion": "v2.0-optimized",
  "detectedLanguage": "en"
}
```

## 🏗 Architectural Philosophy

### 🎯 Deterministic Scoring
AI extracts information.  
Scoring logic lives in code.  
Consistency over randomness.

### 🔌 Provider Abstraction
AI providers are swappable via environment configuration.

**Current provider:**  
- Groq  

**Local development:**  
- Mock provider  

This enables cost control and fast experimentation.

### 🏷 Prompt Versioning
Each analysis includes a prompt version for traceability and controlled iteration.

### 💰 Cost-Aware Design
- Token limits  
- Low temperature  
- Structured output enforcement  
- Fallback modes  

No runaway billing. No unpredictable behavior.

---

## 👥 Who This Is For

Viora is designed for professionals who value strategy over volume.

### 🎯 Mid-Level & Senior Engineers
Applying to selective roles and optimizing application quality.

### 🌍 International Candidates
Developers targeting global markets who need clarity before complex application processes.

### 🔄 Career Transition Professionals
Individuals pivoting roles or industries who need structured insight into skill gaps.

### 📈 High-Signal Applicants
Candidates who prefer fewer, stronger applications over mass submission.

---

## 🚫 Non-Goals

Viora intentionally does not support:

- ❌ Mass auto-apply systems  
- ❌ Resume keyword stuffing  
- ❌ Job platform scraping  
- ❌ Circumventing platform rules  
- ❌ Automation that violates Terms of Service  

Ethical alignment is a core constraint, not an afterthought.

---

## 🧩 Tech Stack

### Frontend
- React  
- TypeScript  
- Tailwind CSS  
- Runtime language and theme switching  

### Backend
- Node.js  
- TypeScript  
- Lightweight API layer  

### Infrastructure
- Firebase Hosting  
- Firebase Functions  
- Firebase Analytics  
- Realtime Database  

### AI Layer
- Provider-based architecture  
- Structured output contracts  

---

## 🛠 Development Standards

- Conventional Commits (Husky + Commitlint)  
- Strict TypeScript typing  
- Clear separation between AI extraction and scoring logic  
- Documented architectural decisions  
- Deterministic decision pipeline  

---

## 🗺 Roadmap

- Adaptive scoring based on seniority level  
- Basic analysis history persistence  
- Markdown export for CV improvements  
- Optional multi-provider fallback  
- Lightweight analytics dashboard  

No feature bloat.  
No dark patterns.

---

## 📚 Documentation

All documentation is located in the `/docs` folder.

Key documents include:

- Quick Start  
- Architecture  
- Technical Decisions  
- Development Guide  
- Git Workflow  
- Commit Standards  
- Type Definitions  
- Examples  
- Contributing  

---

## ⚠ Disclaimer

This tool does not guarantee interviews or job offers.

It improves decision clarity and application quality.  
Outcomes depend on execution.

---

## 👩‍💻 Author

Built by a software engineer exploring ethical, explainable, and practical applications of AI in real workflows.

# Usage Examples

## Example 1: Highly Compatible Job (Hybrid Scoring Breakdown)

### Input - CV

```
Senior Frontend Engineer | 5 years of experience

EXPERIENCE:
- Acme Corp (2021-present): Frontend Tech Lead
  * Migration from monolith to micro-frontends (React + TypeScript)
  * Design system implementation with Tailwind CSS
  * Mentored 3 junior developers
  * Stack: React, TypeScript, Next.js, GraphQL

- StartupXYZ (2019-2021): Frontend Developer
  * Analytics dashboard development (React + D3.js)
  * REST and WebSocket API integration
  * Stack: React, Redux, JavaScript

SKILLS:
React, TypeScript, Next.js, Tailwind CSS, GraphQL, REST APIs, 
Git, Jest, React Testing Library, CI/CD, Agile/Scrum

EDUCATION:
Computer Science - Federal University (2018)
```

### Input - Job Description

```
Frontend Engineer - Senior Level

We are looking for an experienced Frontend Engineer to lead 
development of our SaaS platform.

RESPONSIBILITIES:
- Develop complex features in React + TypeScript
- Ensure code quality through automated testing
- Participate in code reviews and mentor junior developers
- Collaborate with design and backend on API definitions

REQUIREMENTS:
- 4+ years of React experience
- TypeScript required
- Tailwind CSS experience
- Testing knowledge (Jest/Testing Library)
- Intermediate English

NICE TO HAVE:
- Next.js
- GraphQL
- Micro-frontends experience
```

### Step 1: AI Extracts Signals (AISignals)

```json
{
  "hardSkillsDetected": ["React", "TypeScript", "Next.js", "Tailwind CSS", "GraphQL", "Jest", "React Testing Library"],
  "mandatoryRequirementsMet": [
    "4+ years React experience (has 5 years)",
    "TypeScript required",
    "Tailwind CSS experience",
    "Testing knowledge (Jest/Testing Library)"
  ],
  "mandatoryRequirementsMissing": [
    "Intermediate English (not mentioned in CV)"
  ],
  "desirableRequirementsMet": [
    "Next.js",
    "GraphQL",
    "Micro-frontends experience"
  ],
  "desirableRequirementsMissing": [],
  "softSkillsEvidence": [
    "Mentored 3 junior developers",
    "Technical leadership in migration",
    "Code review participation implied"
  ],
  "seniorityMatch": "match",
  "redFlags": [],
  "recruiterMessage": "Hi! I have 5 years of React and TypeScript experience, including technical leadership in micro-frontends migration and building design systems with Tailwind. I believe my profile aligns well with this role's challenges, especially for mentoring the team and ensuring code quality."
}
```

### Step 2: Code Calculates Score

```typescript
// calculateFitScore(signals) execution:
const hardSkillsScore = (7 / 7) * 35 = 35  // 100% match
const mandatoryScore = (4 / 5) * 30 = 24   // 80% match (1 missing)
const seniorityScore = 15                   // perfect match
const desirableScore = (3 / 3) * 10 = 10   // 100% match
const softSkillsScore = (3 / 3) * 5 = 5    // solid evidence
const redFlagsPenalty = 0                   // no flags

fitScore = 35 + 24 + 15 + 10 + 5 - 0 = 89
```

### Step 3: Final Output (AnalysisResult)

```json
{
  "fitScore": 89,
  "decision": "apply",
  "strengths": [
    "Hard skill: React",
    "Hard skill: TypeScript",
    "Hard skill: Next.js",
    "Requirement met: 4+ years React experience",
    "Requirement met: TypeScript required",
    "Nice-to-have: GraphQL",
    "Nice-to-have: Micro-frontends experience"
  ],
  "gaps": [
    "Requirement missing: Intermediate English (not mentioned in CV)"
  ],
  "cvSuggestions": [
    "Highlight experiences related to: Intermediate English",
    "Feature your differentiators at the top of your CV"
  ],
  "recruiterMessage": "Hi! I have 5 years of experience in React and TypeScript...",
  "explanation": {
    "positives": [
      "Hard Skills: +35/35 points (100% match: React, TypeScript, Next.js, Tailwind, GraphQL, Jest)",
      "Mandatory Requirements: +24/30 points (4/5 requirements met)",
      "Seniority Match: +15/15 points (senior profile matching)",
      "Desirable Requirements: +10/10 points (all 3 nice-to-haves present)",
      "Soft Skills: +5/5 points (leadership and mentorship evidence)"
    ],
    "negatives": [
      "Missing 1 mandatory requirement: Intermediate English (-6 points)",
      "No red flags identified"
    ],
    "summary": "Candidate with excellent technical alignment. Possesses all hard skills and differentiators. Only gap is lack of mention about English proficiency, which can easily be added to CV."
  },
  "promptVersion": "v1.1"
}
```

### UI Display (ExplanationDisplay Component)

```
┌─────────────────────────────────────────────────────────────┐
│ 🎯 How we calculated your score              v1.1           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ 💡 Candidate with excellent technical alignment. Possesses  │
│    all hard skills and differentiators. Only gap is lack    │
│    of mention about English proficiency, which can easily   │
│    be added to CV.                                          │
│                                                              │
│ ┌─────────────────────┐  ┌──────────────────────┐          │
│ │ ✓ Strengths         │  │ ⚠ Areas to Improve   │          │
│ ├─────────────────────┤  ├──────────────────────┤          │
│ │ + Hard Skills: +35/ │  │ - Missing 1 mandatory│          │
│ │   35 points (100%   │  │   requirement: Eng   │          │
│ │   match)            │  │   (-6 points)        │          │
│ │                     │  └──────────────────────┘          │
│ │ + Mandatory: +24/30 │                                     │
│ │   (4/5 requirements)│                                     │
│ │                     │                                     │
│ │ + Seniority: +15/15 │                                     │
│ │   (senior match)    │                                     │
│ │                     │                                     │
│ │ + Desirable: +10/10 │                                     │
│ │   (all present)     │                                     │
│ │                     │                                     │
│ │ + Soft Skills: +5/5 │                                     │
│ │   (leadership)      │                                     │
│ └─────────────────────┘                                     │
│                                                              │
│ 💡 Hybrid scoring: AI extracts signals from your CV, and    │
│    our algorithm calculates the score deterministically     │
│    and transparently.                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Example 2: Job with Significant Gaps

### Input - CV

```
Full Stack Developer | 2 years of experience

EXPERIENCE:
- Tech Solutions (2022-present): Full Stack Developer
  * Web application development with Node.js and React
  * REST API creation
  * AWS deployment (EC2, S3)
  * Stack: JavaScript, Node.js, Express, React, MongoDB

SKILLS:
JavaScript, Node.js, React, Express, MongoDB, MySQL, AWS, Git, Docker

EDUCATION:
Systems Analysis and Development - Fatec (2021)
```

### Input - Job Description

```
Senior Full Stack Engineer

Position to develop and architect scalable solutions.

REQUIREMENTS:
- 5+ years of development experience
- TypeScript expertise
- Microservices architecture experience
- Proficiency in automated testing (TDD)
- Deep AWS knowledge

RESPONSIBILITIES:
- Architect solutions for millions of users
- Technically lead complex projects
- Define code standards and best practices
```

### Expected Output

```json
{
  "fitScore": 45,
  "decision": "skip",
  "strengths": [
    "Node.js and React knowledge aligned with stack",
    "AWS experience shows cloud interest"
  ],
  "gaps": [
    "Job requires 5+ years, you have only 2 years - significant seniority gap",
    "TypeScript not mentioned, but is essential requirement",
    "Missing microservices and scalable architecture experience",
    "Automated testing absent from CV",
    "Position is for Senior/Tech Lead, but your profile is Mid-level"
  ],
  "cvSuggestions": [
    "Focus on Mid or Mid-to-Senior positions, not Senior roles",
    "Add personal projects with TypeScript to demonstrate knowledge",
    "If you have testing experience, highlight it in your CV",
    "Grow another 2-3 years before applying for Senior positions"
  ],
  "recruiterMessage": "N/A - Recommended not to apply. Large gaps in seniority and technical skills."
}
```

---

## Example 3: Job Requiring Adjustments

### Input - CV

```
Data Analyst | 3 years of experience

EXPERIENCE:
- Analytics Co (2021-present): Data Analyst
  * Data analysis with Python (Pandas, NumPy)
  * Dashboard creation in Tableau
  * SQL for data extraction
  * Reports for stakeholders

SKILLS:
Python, SQL, Tableau, Excel, Pandas, NumPy, Jupyter

EDUCATION:
Statistics - USP (2020)
```

### Input - Job Description

```
Data Scientist - Machine Learning

Position to develop ML models in production.

REQUIREMENTS:
- Advanced Python
- ML experience (scikit-learn, TensorFlow or PyTorch)
- SQL and databases
- Statistics and probability

NICE TO HAVE:
- Model deployment (REST API, Docker)
- Cloud (AWS/GCP)
- Spark for big data
```

### Expected Output

```json
{
  "fitScore": 58,
  "decision": "apply_with_fixes",
  "strengths": [
    "Strong foundation in Python and SQL, essential requirements",
    "Statistics education highly relevant for ML",
    "3 years of experience working with data"
  ],
  "gaps": [
    "Missing explicit ML experience (scikit-learn, TensorFlow)",
    "No mention of model deployment or APIs",
    "Absence of cloud experience (AWS/GCP)"
  ],
  "cvSuggestions": [
    "If you've used ML in personal/academic projects, HIGHLIGHT it at the top",
    "Add 'Projects' section with example of deployed ML model",
    "Mention any ML course/certification (Coursera, fast.ai, etc.)",
    "Reframe 'Data Analyst' to 'Data Analyst with ML focus' if applicable",
    "If you lack ML experience, consider building projects before applying"
  ],
  "recruiterMessage": "Hi! I hold a degree in Statistics from USP with 3 years of data analysis experience using Python and SQL. I have strong interest in transitioning to Data Science and am studying ML independently. I'd like to understand the role's challenges better and share relevant projects."
}
```

---

## How to Use These Examples

### Test Locally

1. Start backend and frontend
2. Paste one of the example CVs in the first field
3. Paste the Job Description in the second field
4. Click "Analyze Job Fit"

### Adjust the Prompt

If results aren't satisfactory, edit the prompt at:
- Backend: `backend/src/services/aiService.ts` → `buildPrompt()` method

### Validate Response

Backend automatically validates:
- `fitScore` between 0-100
- `decision` in ["apply", "apply_with_fixes", "skip"]
- All required fields present

If AI returns invalid JSON, error displays on frontend.

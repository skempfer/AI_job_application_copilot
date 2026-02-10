# Contributing to Viora

Thank you for considering contributing to this project! 🙏

This document provides guidelines for contributing code, reporting bugs, and suggesting features.

---

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Process](#development-process)
4. [Commit Standards](#commit-standards)
5. [Pull Request Process](#pull-request-process)
6. [Reporting Bugs](#reporting-bugs)
7. [Suggesting Features](#suggesting-features)

---

## Code of Conduct

This project adheres to ethical principles:
- **Respect**: Treat all contributors with respect
- **Transparency**: Be honest and clear in communications
- **Integrity**: Follow ToS of job platforms and AI providers
- **Inclusivity**: Welcome diverse perspectives and experiences

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Basic TypeScript/React knowledge

### Setup Local Environment

```bash
# Clone the repository
git clone https://github.com/skempfer/AI_job_application_copilot?tab=readme-ov-file
cd AI_job_application_copilot

# Install dependencies
npm install

# Husky hooks will be installed automatically

# Start development
# Backend
cd backend && npm run dev

# Frontend (in another terminal)
cd frontend && npm run dev
```

---

## Development Process

### 1. Create a Feature Branch

```bash
git checkout -b feat/feature-name
```

**Branch naming convention:**
- `feat/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code refactoring

### 2. Make Your Changes

- Keep commits atomic and logical
- Follow the [Commit Standards](#commit-standards)
- Update tests if applicable
- Ensure code passes linting

### 3. Test Locally

```bash
# Backend
cd backend
npm run build
npm run test  # if tests exist

# Frontend
cd frontend
npm run build
npm run test  # if tests exist
```

### 4. Push and Create PR

```bash
git push origin feat/feature-name
```

Then create a Pull Request on GitHub.

---

## Commit Standards

### Required Format

All commits follow **Conventional Commits**:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Examples

**Feature with scope:**
```
feat(backend): implement signal extraction from CV

Extract hard skills, requirements, and seniority match from CV text using Groq API.
Returns structured AISignals for deterministic scoring.

Closes #45
```

**Bug fix:**
```
fix(frontend): resolve memory leak in ExplanationDisplay

Component was not cleaning up event listeners on unmount, causing multiple 
re-renders on state updates.

Fixes #78
```

**Documentation:**
```
docs: add contribution guidelines

Clarify development process and commit standards for contributors.
```

### Type List

| Type | Purpose |
|------|---------|
| feat | New feature |
| fix | Bug fix |
| docs | Documentation |
| style | Formatting only |
| refactor | Code restructure |
| perf | Performance improvement |
| test | Tests |
| build | Dependencies |
| ci | CI/CD |
| chore | Maintenance |

### Important Rules

1. **Subject**: Imperative mood, no period, max 72 chars
   - ✅ `add error handling for empty CV`
   - ❌ `added error handling` or `adds handling error for empty CV when user provides no input`

2. **Scope**: Lowercase, optional but recommended
   - ✅ `feat(backend): ...`
   - ❌ `feat(Backend): ...`

3. **Body**: Explain _why_, not _what_
   - ✅ `Improves UX by showing scoring breakdown`
   - ❌ `Updated ExplanationDisplay component`

4. **Footer**: Reference issues
   - `Closes #123` - auto-closes issue on PR merge
   - `Fixes #456` - alternative syntax
   - `Breaking change:` - for major changes

### Husky Validation

Your commits are automatically validated. Invalid commits are rejected:

```bash
$ git commit -m "updated scoring"

✖   type may not be empty [type-enum]
✖   subject may not be empty [subject-empty]

husky - commit-msg hook exited with code 1
```

---

## Pull Request Process

### Before Submitting

1. **Update from main**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Verify tests pass**
   ```bash
   npm run build
   npm run test
   ```

3. **Check commit history** - all commits must be valid
   ```bash
   npm run lint:commits
   ```

### PR Template

```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentation

## Related Issue
Closes #123

## Changes Made
- Change 1
- Change 2

## Testing
How to test the changes:
1. Step 1
2. Step 2

## Screenshots (if applicable)
Before/after UI changes.
```

### Review Process

- Aim for 1-2 reviewers
- Address feedback commits separately (don't rewrite history)
- Final commit message should follow Conventional Commits

---

## Reporting Bugs

### Bug Report Template

**Title**: `[BUG] Concise description`

**Description**:
```markdown
## Describe the Bug
Clear, concise description of what happened.

## Expected Behavior
What should have happened.

## Steps to Reproduce
1. Navigate to...
2. Click on...
3. Observe...

## Actual Behavior
What actually happened.

## Environment
- OS: Windows 11
- Node: 18.x
- Browser: Chrome 120

## Additional Context
Screenshots, logs, etc.
```

---

## Suggesting Features

### Feature Request Template

**Title**: `[FEATURE] Concise description`

**Description**:
```markdown
## Problem
The problem this solves or need it addresses.

## Proposed Solution
How you'd like to see this implemented.

## Alternatives Considered
Other approaches you've thought about.

## Additional Context
Related issues, screenshots, examples.
```

---

## Code Style Guidelines

### TypeScript

```typescript
// ✅ Good
export interface AISignals {
  hardSkillsDetected: string[];
  mandatoryRequirementsMet: string[];
}

// Be explicit with types
const fitScore: number = calculateFitScore(signals);

// Use meaningful variable names
const hardSkillsWeight = 0.35;
```

### React Components

```typescript
// ✅ Good component structure
interface ExplanationDisplayProps {
  explanation: ScoreExplanation;
  promptVersion?: string;
}

export const ExplanationDisplay: React.FC<ExplanationDisplayProps> = ({
  explanation,
  promptVersion,
}) => {
  // Implementation
};

// Avoid prop drilling - use contexts when appropriate
// Keep components pure (no side effects)
```

### Comments

```typescript
// ✅ Good - explains WHY
// Score weighted toward hard skills due to technical role requirements
const features = signals.hardSkillsDetected;

// ❌ Bad - explains WHAT (obvious from code)
// Loop through hard skills
for (const skill of hardSkillsDetected) {
```

---

## Questions?

- Check [Commit Standards](./COMMIT-GUIDE.md) for commit guidelines
- Review [Architecture](./ARCHITECTURE.md) for system design
- Read [Technical Decisions](./DECISIONS.md) for design rationale
- Check [Development Guide](./DEV-GUIDE.md) for setup and coding
- Check existing issues and discussions

---

## License

By contributing, you agree that your contributions will be licensed under the project's license.

---

**Thank you for helping make Viora better! 🚀**

# Git Workflow & Contributing

## Development Workflow

```
Main Repository
│
├─ main branch (production-ready)
│  └─ tag: v1.1.0, v1.2.0, etc.
│
└─ feature branches
   ├─ feat/hybrid-scoring
   ├─ fix/memory-leak
   ├─ docs/readme-update
   └─ refactor/scoring-logic
```

## Typical Contribution Flow

```
1. Create Feature Branch
   ↓
   git checkout -b feat/new-feature
   
2. Make Changes
   ↓
   Edit files, test locally
   
   backend/
   ├─ src/services/newFeature.ts  ← Modified
   └─ package.json
   
   frontend/
   └─ src/components/NewComponent.tsx  ← New file
   
3. Commit Changes
   ↓
   git add .
   git commit -m "feat(frontend): add NewComponent"
   
   💡 Husky validates the commit message
   
4. Push to Remote
   ↓
   git push origin feat/new-feature
   
5. Create Pull Request
   ↓
   GitHub → Create PR
   
6. Code Review
   ↓
   Reviewers provide feedback
   
7. Merge to Main
   ↓
   git merge feat/new-feature
   
   Automatically generates:
   ✓ Changelog entry
   ✓ Semantic version bump
   ✓ Release tag
```

---

## Commit Message Pattern

```
Format:  <type>(<scope>): <subject>
         
         <body>
         
         <footer>

Example:

feat(backend): implement signal extraction from CV

Extract key information from candidate CV:
- Hard skills detection
- Requirement matching
- Seniority assessment
- Red flag identification

Returns structured AISignals for deterministic scoring.

Closes #42
```

---

## Branch Naming Convention

```
Format: <type>/<short-description>

Examples:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
feat/hybrid-scoring        ← New feature
feat/explain-score         
feat/prompt-versioning     

fix/memory-leak            ← Bug fix
fix/null-pointer           
fix/infinite-loop          

docs/readme-update         ← Documentation
docs/commit-guidelines     

refactor/scoring-logic     ← Code restructure
refactor/api-client        

perf/optimize-renderer     ← Performance
```

---

## Commit Type Meanings

```
feat     Feature
         When you add a new component, function, or capability
         
         Example: Added ExplanationDisplay component
         Commit: feat(frontend): add ExplanationDisplay component

fix      Bug Fix
         When you fix existing functionality
         
         Example: Fixed memory leak in event listeners
         Commit: fix(frontend): resolve memory leak in ExplanationDisplay

docs     Documentation
         When you update README, guides, or comments
         
         Example: Updated contribution guidelines
         Commit: docs: add CONTRIBUTING.md

style    Code Style
         When you format code (no logic changes)
         
         Example: Formatted with Prettier
         Commit: style: format aiService.ts

refactor Code Restructure
         When you reorganize code without changing behavior
         
         Example: Extracted calculateWeightedScore function
         Commit: refactor(scoring): extract helper functions

perf     Performance
         When you improve speed or efficiency
         
         Example: Memoized expensive calculations
         Commit: perf(api): optimize signal extraction

test     Tests
         When you add or update tests
         
         Example: Added unit tests for scoring
         Commit: test(backend): add scoring unit tests

build    Dependencies
         When you update packages or build config
         
         Example: Updated Groq SDK
         Commit: build: upgrade groq-sdk to v2.0

ci       CI/CD
         When you modify pipelines or workflows
         
         Example: Added GitHub Actions
         Commit: ci: add release workflow

chore    Maintenance
         When you do maintenance (no feature/fix)
         
         Example: Updated .gitignore
         Commit: chore: update dependencies
```

---

## Valid vs Invalid Commits

### ✅ VALID COMMITS

```bash
# Minimal (type + message only)
feat: add explanation display

# With scope (recommended)
feat(frontend): add explanation display

# With detailed body
feat(backend): implement signal extraction

Extract key fields from CV:
- Hard skills
- Requirements met/missing
- Seniority match

Closes #45

# Bug fix
fix(frontend): resolve infinite loop

The ExplanationDisplay was setting state inside render,
causing component to re-render infinitely.

Fixes #89

# Documentation
docs: update README with setup instructions

# Simple refactor
refactor: standardize error handling
```

### ❌ INVALID COMMITS

```bash
# No type
updated scoring logic
❌ Error: type may not be empty

# Type not lowercase
FEAT: add new feature
❌ Error: type-case must be lowercase

# Subject too long (>72 chars)
feat: add the new ExplanationDisplay component that shows breakdown of scoring
❌ Error: header too long

# Period at end
feat: add explanation.
❌ Error: subject-full-stop

# Scope not lowercase  
feat(Backend): fix types
❌ Error: scope-case must be lowercase

# Generic/vague
fix: stuff
❌ Error: subject should be specific

# Missing scope
feat(Frontend): update button
❌ Error: scope must match component (no spaces)
```

---

## Semantic Versioning

Based on commit types, versions auto-update:

```
MAJOR.MINOR.PATCH

v1.0.0 - Initial release
  ↓
v1.1.0 - New features added (feat: commits)
  ↓
v1.1.1 - Bug fixes only (fix: commits)
  ↓
v2.0.0 - Breaking changes (BREAKING CHANGE: in footer)

Example breaking change:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
feat(api): redesign scoring endpoint

BREAKING CHANGE: fitScore now calculated client-side,
not by AI. Old API endpoint deprecated.

Closes #100
```

---

## Automated CHANGELOG

Commits automatically generate CHANGELOG.md:

```
## [2.0.0] - 2024-02-15

### Features
- **api**: redesign scoring endpoint (#100)
- **frontend**: add ExplanationDisplay component (#89)
- **backend**: implement hybrid scoring (#78)

### Bug Fixes
- **frontend**: resolve memory leak (#45)
- **api**: handle null signals (#34)

### Breaking Changes
- `fitScore` now calculated client-side, not by AI
```

---

## Tools & Commands

```bash
# Clone and setup
git clone <repo>
cd AI_job_application_copilot
npm install  # Installs Husky, Commitlint

# Development
git checkout -b feat/feature-name
# ... make changes ...
git add .
git commit -m "feat(scope): message"  # Validated by Husky
git push origin feat/feature-name

# Create PR on GitHub
# Get review and approval
git merge feat/feature-name

# Check commit history
git log --oneline --decorate --graph

# Validate recent commits
npm run lint:commits

# Link to issues
Closes #123  # Auto-closes on merge
Fixes #456
```

---

## Common Git Operations

### Update Your Branch

```bash
# Before pushing, sync with main
git fetch origin
git rebase origin/main
```

### Force Update (Careful!)

```bash
# Only if you haven't pushed yet
git commit --amend -m "corrected message"
git push -f origin feat/branch-name  # Only if unpublished!
```

### Revert a Commit

```bash
git revert <commit-hash>

# This creates a NEW commit that undoes changes
# Safe for published commits
```

### Stash Uncommitted Changes

```bash
git stash              # Save changes
git stash pop          # Restore changes
```

---

## Resources

📖 [Commit Standards Guide](./COMMIT-GUIDE.md)  
🤝 [Contributing Guide](../CONTRIBUTING.md)  
⚡ [Development Guide](./DEV-GUIDE.md)  
🔗 [Conventional Commits](https://www.conventionalcommits.org/)  

---

**Happy contributing! 🚀**

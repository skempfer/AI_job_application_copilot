# Commit Standards & Guidelines

This project uses **Husky** with **Commitlint** to enforce [Conventional Commits](https://www.conventionalcommits.org/) for all commits.

## Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

## Commit Types

| Type | Purpose | Example |
|------|---------|---------|
| **feat** | New feature | `feat(backend): add hybrid scoring algorithm` |
| **fix** | Bug fix | `fix(frontend): resolve memory leak` |
| **docs** | Documentation | `docs: update README` |
| **style** | Code formatting (no logic change) | `style: format code with prettier` |
| **refactor** | Code restructuring | `refactor(scoring): extract helper functions` |
| **perf** | Performance improvement | `perf(api): optimize signal extraction` |
| **test** | Tests | `test(backend): add unit tests` |
| **build** | Dependencies/build system | `build: upgrade Groq SDK` |
| **ci** | CI/CD | `ci: add GitHub Actions workflow` |
| **chore** | Maintenance | `chore: update dependencies` |

## Rules

### ✅ What's Required

- ✅ Valid type from enum above
- ✅ Lowercase type
- ✅ Lowercase scope (if provided)
- ✅ Subject starts with lowercase
- ✅ Subject max 72 characters
- ✅ No period at end of subject

### ❌ Invalid Examples

```bash
# Missing type
updated scoring logic

# Type not lowercase
FEAT: add new feature

# Subject too long (>72 chars)
feat: add the new ExplanationDisplay component that shows breakdown of scoring

# Period at end
feat: add new feature.

# Scope not lowercase
feat(Backend): fix types
```

### ✅ Valid Examples

```bash
# Simple with scope
feat(backend): implement hybrid scoring

# With detailed body
feat(api): add rate limiting

Implements sliding window rate limiter to prevent abuse.
Default: 100 req/15min.

Closes #123

# Bug fix
fix(frontend): resolve infinite loop

The component was re-rendering on every state change.
Moved explanation generation to useEffect.

Fixes #89
```

## How It Works

1. You make a commit: `git commit -m "feat(scope): message"`
2. Husky intercepts the `commit-msg` hook
3. Commitlint validates the message against rules
4. If invalid: commit is rejected with clear feedback
5. If valid: commit is accepted

## Quick Reference

```bash
# Test commitlint locally
echo "feat(test): message" | npx commitlint

# Lint recent commits
npm run lint:commits

# Run validation tests
bash scripts/test-husky.sh
```

## Tips

- **Use scope**: `feat(backend): ...` is better than `feat: ...`
- **Be specific**: "add error handling for empty CV" not "bug fixes"
- **Explain why**: Use body to explain motivation, not implementation
- **Reference issues**: `Closes #123` auto-closes on merge
- **Use imperative mood**: "Add" not "Added", "Fix" not "Fixed"

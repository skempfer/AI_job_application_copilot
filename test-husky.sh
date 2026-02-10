#!/bin/bash

# Script para testar o Husky commit message validation (Commitlint)
# Use este script para validar suas mensagens de commit antes de fazer push

set -e

echo "🔍 Testing Husky Commitlint Configuration..."
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Array de mensagens de teste
VALID_MESSAGES=(
  "feat(backend): implement hybrid scoring algorithm"
  "fix(frontend): resolve ExplanationDisplay flickering"
  "docs: add commit guidelines documentation"
  "style: format code with prettier"
  "refactor(scoring): extract helper functions"
  "perf(api): optimize signal extraction logic"
  "test(backend): add scoring unit tests"
  "build: upgrade TypeScript to 5.x"
  "ci: add GitHub Actions workflow"
  "chore: update dependencies"
)

INVALID_MESSAGES=(
  "updated scoring"
  "fe: typo in button"
  "feat(BACKEND): add new feature"
  "feat: add the new ExplanationDisplay component that shows the breakdown of the complete scoring algorithm calculation"
  "fix: stuff"
)

echo "${YELLOW}Testing VALID commits:${NC}"
echo "=========================="
for msg in "${VALID_MESSAGES[@]}"; do
  if echo "$msg" | npx commitlint > /dev/null 2>&1; then
    echo "${GREEN}✅${NC} $msg"
  else
    echo "${RED}❌${NC} $msg"
  fi
done

echo ""
echo "${YELLOW}Testing INVALID commits (should fail):${NC}"
echo "========================================"
for msg in "${INVALID_MESSAGES[@]}"; do
  if echo "$msg" | npx commitlint > /dev/null 2>&1; then
    echo "${RED}❌ FAILED: Should have been rejected:${NC} $msg"
  else
    echo "${GREEN}✅ Correctly rejected:${NC} $msg"
  fi
done

echo ""
echo "${GREEN}✨ Husky Commitlint validation test complete!${NC}"

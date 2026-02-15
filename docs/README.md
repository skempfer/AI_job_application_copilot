# AI Job Application Copilot - Documentation Index

Welcome to the documentation for the AI Job Application Copilot project. This index will help you find the right documentation for your needs.

## 📚 Quick Navigation

### For Quick Start
- **[QUICK-START.md](QUICK-START.md)** - Get running in 5 minutes
- **[README.md](../README.md)** - Project overview

### For Development
- **[DEV-GUIDE.md](DEV-GUIDE.md)** - Setup, structure, and development workflow
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines
- **[COMMIT-GUIDE.md](COMMIT-GUIDE.md)** - Commit message standards
- **[GIT-WORKFLOW.md](GIT-WORKFLOW.md)** - Git workflow

### For Architecture Understanding

#### Main System Architecture
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Overall system architecture and data flow

#### AI Inference Layer (v2.0)
Complete documentation on the refactored AI service:

1. **[AI-INFERENCE-ARCHITECTURE.md](AI-INFERENCE-ARCHITECTURE.md)** - Core AI service architecture
   - Architecture diagram
   - Key components (System Prompt, User Prompt, Validation, Logging)
   - Request flow (9 phases)
   - Signal types and validation
   - Design principles

2. **[SCHEMA-VALIDATION.md](SCHEMA-VALIDATION.md)** - Type system and validation
   - AISignals interface definition
   - Zod schema details
   - Validation rules for each field
   - Unit test examples
   - Integration tests
   - Best practices

3. **[ERROR-HANDLING.md](ERROR-HANDLING.md)** - Error handling patterns
   - Error types and hierarchy
   - Detailed error scenarios with logging
   - Recovery strategies
   - Debugging with correlation IDs
   - Production monitoring

4. **[EXTENDING-AI-PROVIDERS.md](EXTENDING-AI-PROVIDERS.md)** - Adding new AI providers
   - Step-by-step guide for new providers
   - Anthropic and Groq examples
   - Provider factory pattern
   - Testing strategies
   - Migration path

### For Type Definitions
- **[TYPES.md](TYPES.md)** - TypeScript type definitions and interfaces

### For Decisions & Examples
- **[DECISIONS.md](DECISIONS.md)** - Architecture Decision Records (ADRs)
- **[EXAMPLES.md](EXAMPLES.md)** - Usage examples

### For Features
- **[CV-UPLOAD-FEATURE.md](CV-UPLOAD-FEATURE.md)** - CV upload feature documentation

---

## 🎯 Reading Paths by Role

### 👨‍💼 Project Manager / Tech Lead
1. [README.md](../README.md) - Project overview
2. [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
3. [DECISIONS.md](DECISIONS.md) - Key technical decisions

### 👨‍💻 Backend Developer (New to Project)
1. [QUICK-START.md](QUICK-START.md) - Get running
2. [DEV-GUIDE.md](DEV-GUIDE.md) - Development setup & structure
3. [AI-INFERENCE-ARCHITECTURE.md](AI-INFERENCE-ARCHITECTURE.md) - Main AI service
4. [SCHEMA-VALIDATION.md](SCHEMA-VALIDATION.md) - Data validation
5. Reference as needed: [ERROR-HANDLING.md](ERROR-HANDLING.md), [EXTENDING-AI-PROVIDERS.md](EXTENDING-AI-PROVIDERS.md)

### 👨‍💻 Backend Developer (Experienced)
- Jump to specific docs:
  - Fixing bugs? → [ERROR-HANDLING.md](ERROR-HANDLING.md)
  - Changing AI service? → [AI-INFERENCE-ARCHITECTURE.md](AI-INFERENCE-ARCHITECTURE.md)
  - Adding new provider? → [EXTENDING-AI-PROVIDERS.md](EXTENDING-AI-PROVIDERS.md)
  - Understanding types? → [SCHEMA-VALIDATION.md](SCHEMA-VALIDATION.md)

### 🎨 Frontend Developer
1. [QUICK-START.md](QUICK-START.md) - Get running
2. [DEV-GUIDE.md](DEV-GUIDE.md) - Project structure (frontend section)
3. [TYPES.md](TYPES.md) - Type definitions for frontend
4. [ARCHITECTURE.md](ARCHITECTURE.md) - System data flow (frontend perspective)

### 🔧 DevOps / Operations
1. [DEV-GUIDE.md](DEV-GUIDE.md) - Deployment section
2. [ERROR-HANDLING.md](ERROR-HANDLING.md) - Monitoring & alerting
3. [ARCHITECTURE.md](ARCHITECTURE.md) - System overview
4. [DECISIONS.md](DECISIONS.md) - Technology choices

### 📝 Code Reviewer
1. [COMMIT-GUIDE.md](COMMIT-GUIDE.md) - Commit standards
2. Specific to type of change:
   - AI service change? → [AI-INFERENCE-ARCHITECTURE.md](AI-INFERENCE-ARCHITECTURE.md)
   - Types/validation? → [SCHEMA-VALIDATION.md](SCHEMA-VALIDATION.md)
   - Error handling? → [ERROR-HANDLING.md](ERROR-HANDLING.md)

### 🚀 Contributing New Feature
1. [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
2. [DEV-GUIDE.md](DEV-GUIDE.md) - Code structure and setup
3. [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
4. [COMMIT-GUIDE.md](COMMIT-GUIDE.md) - Commit standards
5. Reference specific docs as needed

---

## 📖 Document Descriptions

| Document | Purpose | Audience | Length |
|----------|---------|----------|--------|
| **QUICK-START.md** | Get project running | Everyone | ~3 min read |
| **DEV-GUIDE.md** | Development workflow | Developers | ~10 min read |
| **ARCHITECTURE.md** | System design | Architects, leads | ~15 min read |
| **AI-INFERENCE-ARCHITECTURE.md** | AI service v2.0 | Backend devs | ~20 min read |
| **SCHEMA-VALIDATION.md** | Type system | Backend devs, QA | ~20 min read |
| **ERROR-HANDLING.md** | Error patterns | Backend devs, DevOps | ~25 min read |
| **EXTENDING-AI-PROVIDERS.md** | Add new providers | Backend devs | ~20 min read |
| **TYPES.md** | Type definitions | Developers | ~5 min read |
| **DECISIONS.md** | Architecture decisions | Architects, leads | ~5 min read |
| **CONTRIBUTING.md** | Contribution process | Contributors | ~5 min read |
| **COMMIT-GUIDE.md** | Commit standards | Everyone | ~3 min read |
| **GIT-WORKFLOW.md** | Git workflow | Everyone | ~5 min read |

---

## 🔄 Documentation Update Cycle

Documentation is maintained alongside code:

- **New Feature**: Update relevant `.md` file + code
- **Bug Fix**: Check if error documentation needs update
- **Refactor**: Update architecture documentation if structure changes
- **Schema Change**: Update SCHEMA-VALIDATION.md + type definitions

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on keeping docs current.

---

## 🆘 Troubleshooting

**Can't find what you're looking for?**

1. Check [DEV-GUIDE.md](DEV-GUIDE.md) Troubleshooting section
2. See [ERROR-HANDLING.md](ERROR-HANDLING.md) for error details
3. Search for keywords in doc filenames above
4. Open an issue on GitHub

**Found an error in documentation?**

1. Create an issue describing the error
2. Submit a pull request with corrections
3. See [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 📊 Phase 6 - Documentation Update

Recently completed Phase 6 documentation update:

- ✅ 4 new documentation files created (AI-INFERENCE-ARCHITECTURE.md, SCHEMA-VALIDATION.md, ERROR-HANDLING.md, EXTENDING-AI-PROVIDERS.md)
- ✅ 2 core documentation files updated (ARCHITECTURE.md, DEV-GUIDE.md)
- ✅ 162 unit tests passing across refactored AI service
- ✅ Full architectural refactor of AI inference layer

See [PHASE-6-SUMMARY.md](PHASE-6-SUMMARY.md) for complete details.

---

## 📝 Contributing to Documentation

All documentation uses **GitHub Flavored Markdown**:

```markdown
# Heading 1
## Heading 2

- Bullet points
- Use hyphens

1. Numbered lists
2. For processes

`code snippets` inline
```

For code blocks:
```typescript
// Use language identifier
const example = "code";
```

See **CONTRIBUTING.md** for full guidelines.

---

## 🎓 Learning Resources

### Understand Framework Choices
- **React** (Frontend): See references in ARCHITECTURE.md
- **Express** (Backend): See ARCHITECTURE.md data flow
- **TypeScript**: See TYPES.md and SCHEMA-VALIDATION.md
- **Zod** (Validation): See SCHEMA-VALIDATION.md deep dive
- **OpenAI** (AI): See AI-INFERENCE-ARCHITECTURE.md

### Understand Design Patterns
- **Hybrid Scoring**: See ARCHITECTURE.md "Hybrid Scoring Architecture"
- **Separation of Concerns**: See AI-INFERENCE-ARCHITECTURE.md design principles
- **Factory Pattern**: See EXTENDING-AI-PROVIDERS.md
- **Schema Validation**: See SCHEMA-VALIDATION.md

### Understand Operational Concerns
- **Logging**: See AI-INFERENCE-ARCHITECTURE.md and ERROR-HANDLING.md
- **Error Handling**: See ERROR-HANDLING.md (comprehensive)
- **Monitoring**: See ERROR-HANDLING.md "Monitoring & Alerting"
- **Debugging**: See ERROR-HANDLING.md "Debugging with Correlation IDs"

---

## 📞 Getting Help

- **Quick questions?** Check QUICK-START.md or EXAMPLES.md
- **Setup issues?** See DEV-GUIDE.md or CONTRIBUTING.md
- **Architecture questions?** See ARCHITECTURE.md or AI-INFERENCE-ARCHITECTURE.md
- **Error in production?** See ERROR-HANDLING.md
- **Need to add features?** See CONTRIBUTING.md and relevant architecture docs

---

**Last Updated**: 2024 (Phase 6 - Documentation Update)

**Next Review Date**: When making major architectural changes

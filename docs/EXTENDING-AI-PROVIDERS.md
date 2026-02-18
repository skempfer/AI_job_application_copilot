# Extending AI Service with New Providers

> **Note**: This document describes the current provider abstraction architecture (v2.0).  
> For comprehensive orchestration and fallback documentation, see [PROVIDER-ORCHESTRATION.md](./PROVIDER-ORCHESTRATION.md).

## Overview

The AI service uses a **provider abstraction layer** that makes adding new AI providers straightforward. The architecture separates provider-specific API communication from business logic, validation, and orchestration.

**Current Providers**:
- **Primary**: Groq (llama-3.3-70b-versatile)
- **Fallback**: DeepSeek (deepseek-chat)

**Architecture Benefits**:
- Clean separation of concerns
- Automatic fallback on rate limits
- Consistent validation across providers
- Easy to add new providers
- No changes to business logic required

See [PROVIDER-ORCHESTRATION.md](./PROVIDER-ORCHESTRATION.md) for complete implementation details, fallback logic, and monitoring.

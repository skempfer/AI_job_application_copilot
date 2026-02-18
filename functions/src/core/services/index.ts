export { AIService } from './aiService.js';
export { analyzeGap, GapAnalyzerError } from './gapAnalyzerService.js';
export { parseCVToStructuredData, extractTextFromPDF, CVParserError } from './cvParserService.js';
export { buildOptimizedPrompt, estimateTokenCount } from './promptBuilder.js';
export { calculateFitScore, generateExplanation, determineDecision } from './scoring.js';
export { preprocessCV, preprocessJobDescription } from './preprocessing.js';
export { validateAIResponse, validateAIResponseSafe, getAISignalsSchemaDocumentation } from './aiResponseSchema.js';
export { AIResponseValidationError } from './aiResponseSchema.js';
export { SYSTEM_PROMPT } from './systemPrompt.js';
export { createAIServiceLogger, generateCorrelationId, sanitizeForLogging } from './aiLogger.js';
export { parseJsonStrict, normalizeStringArray } from './aiJsonUtils.js';

export { generateCacheHash, getCachedAnalysis, cacheAnalysis, getCacheStats, clearCache } from './cacheService.js';

export { GroqProvider, AIProviderError } from './providers/index.js';
export type { AIProvider, ChatMessage, AIProviderName, GroqProviderConfig } from './providers/index.js';

export * from '../config/modelConfig.js';

export type { 
  AnalysisResult,
  AIServiceConfig,
  AISignals,
  Decision,
  ScoreExplanation,
  StructuredCV,
  JobRequirements,
  GapAnalysisResult,
} from '../types/analysis.js';

export type { ProcessedCV, ProcessedJobDescription } from './preprocessing.js';
export type { AILogger, LogLevel, LogContext, LogMetrics } from './aiLogger.js';
export type { AISignalsValidated } from './aiResponseSchema.js';

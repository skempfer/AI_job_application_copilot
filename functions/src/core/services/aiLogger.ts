import type { AIProviderName } from "./providers/types.js";

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  module: string;
  operation: string;
  correlationId?: string;
  metadata?: Record<string, any>;
}

export interface LogMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  itemsProcessed?: number;
  provider?: string;
  errors?: number;
  providerUsed?: AIProviderName;
  responseTimeMs?: number;
  schemaValidationSuccess?: boolean;
}

export class AILogger {
  private context: LogContext;
  private startTimes: Map<string, number> = new Map();

  constructor(context: LogContext) {
    this.context = context;
  }

  startTiming(operationName: string): void {
    this.startTimes.set(operationName, performance.now());
  }

  endTiming(operationName: string): number {
    const startTime = this.startTimes.get(operationName);
    if (!startTime) {
      this.warn('No start time found for operation', { operationName });
      return 0;
    }

    const duration = performance.now() - startTime;
    this.startTimes.delete(operationName);
    return duration;
  }

  debug(message: string, metadata?: Record<string, any>): void {
    this.log('debug', message, metadata);
  }

  info(message: string, metadata?: Record<string, any>): void {
    this.log('info', message, metadata);
  }

  warn(message: string, metadata?: Record<string, any>): void {
    this.log('warn', message, metadata);
  }

  error(message: string, error?: Error | unknown, metadata?: Record<string, any>): void {
    const errorDetails = this.formatError(error);
    this.log('error', message, { ...metadata, ...errorDetails });
  }

  logAPIRequest(provider: string, model: string, metadata?: Record<string, any>): void {
    this.info('API request', {
      provider,
      model,
      temperature: 0.2,
      maxTokens: 1500,
      ...metadata,
    });
  }

  logValidation(isValid: boolean, details?: Record<string, any>): void {
    if (isValid) {
      this.debug('Schema validation passed', details);
    } else {
      this.warn('Schema validation failed', details);
    }
  }

  logRateLimit(statusCode: number, retryAfter?: number, metadata?: Record<string, any>): void {
    this.warn('Rate limit encountered', {
      statusCode,
      retryAfter,
      ...metadata,
    });
  }

  logCompletion(operationName: string, metrics: Partial<LogMetrics>): void {
    const duration = this.endTiming(operationName);
    const level = metrics.success ? 'info' : 'warn';

    this.log(level, `${operationName} completed`, {
      success: metrics.success,
      duration: `${duration.toFixed(2)}ms`,
      itemsProcessed: metrics.itemsProcessed,
      provider: metrics.provider,
      errors: metrics.errors,
      ...metrics,
    });
  }

  private log(level: LogLevel, message: string, metadata?: Record<string, any>): void {
    const timestamp = new Date().toISOString();
    const prefix = this.createPrefix(level);
    const context = this.createContextString();

    const logEntry = {
      timestamp,
      level,
      module: this.context.module,
      operation: this.context.operation,
      correlationId: this.context.correlationId,
      message,
      ...metadata,
    };

    const output = `${prefix} [${timestamp}] ${context} ${message}`;

    switch (level) {
      case 'error':
        console.error(output, logEntry);
        break;
      case 'warn':
        console.warn(output, logEntry);
        break;
      case 'debug':
        console.debug(output, logEntry);
        break;
      default:
        console.log(output, logEntry);
    }
  }

  private createPrefix(level: LogLevel): string {
    const prefixes = {
      debug: '🔧',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
    };
    return prefixes[level];
  }

  private createContextString(): string {
    const parts = [this.context.module];
    if (this.context.operation) {
      parts.push(`${this.context.operation}`);
    }
    return `[${parts.join('.')}]`;
  }

  private formatError(error: Error | unknown): Record<string, any> {
    if (error instanceof Error) {
      return {
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack?.split('\n').slice(0, 3).join('\n'),
      };
    }

    if (typeof error === 'string') {
      return { errorMessage: error };
    }

    return { error: String(error) };
  }
}

export function createAIServiceLogger(operation: string, correlationId?: string): AILogger {
  return new AILogger({
    module: 'AIService',
    operation,
    correlationId,
  });
}

export function sanitizeForLogging(data: unknown, maxLength: number = 100): string {
  if (typeof data === 'string') {
    return `${data.substring(0, maxLength)}${data.length > maxLength ? '...' : ''}`;
  }

  if (typeof data === 'object' && data !== null) {
    const stringified = JSON.stringify(data);
    return `${stringified.substring(0, maxLength)}${stringified.length > maxLength ? '...' : ''}`;
  }

  return String(data).substring(0, maxLength);
}

export function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

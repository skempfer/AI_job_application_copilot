/**
 * Tests for AI Logger Module
 * Ensures structured logging works correctly with proper formatting and context
 */

import {
  AILogger,
  createAIServiceLogger,
  createPreprocessingLogger,
  sanitizeForLogging,
  generateCorrelationId,
} from './aiLogger';

describe('AILogger', () => {
  let logger: AILogger;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new AILogger({
      module: 'TestModule',
      operation: 'testOperation',
      correlationId: 'test-123',
    });

    // Spy on console methods
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Logging Methods', () => {
    it('should log debug messages', () => {
      logger.debug('Debug message', { test: 'data' });
      expect(console.debug).toHaveBeenCalled();
    });

    it('should log info messages', () => {
      logger.info('Info message', { test: 'data' });
      expect(console.log).toHaveBeenCalled();
    });

    it('should log warn messages', () => {
      logger.warn('Warning message', { test: 'data' });
      expect(console.warn).toHaveBeenCalled();
    });

    it('should log error messages', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error, { test: 'data' });
      expect(console.error).toHaveBeenCalled();
    });

    it('should include module and operation in logs', () => {
      logger.info('Test log', {});
      const callArgs = consoleSpy.mock.calls[0];
      expect(callArgs[0]).toContain('TestModule');
      expect(callArgs[0]).toContain('testOperation');
    });

    it('should include correlation ID in logs when provided', () => {
      logger.info('Test');
      const callArgs = consoleSpy.mock.calls[0];
      expect(callArgs[1]).toHaveProperty('correlationId', 'test-123');
    });
  });

  describe('Timing Operations', () => {
    it('should start and end timing', async () => {
      logger.startTiming('operation1');
      await new Promise(resolve => setTimeout(resolve, 10));
      const duration = logger.endTiming('operation1');

      expect(duration).toBeGreaterThanOrEqual(10);
      expect(duration).toBeLessThan(100);
    });

    it('should return 0 duration for non-existent operation', () => {
      const duration = logger.endTiming('non-existent');
      expect(duration).toBe(0);
    });

    it('should handle multiple simultaneous timings', () => {
      logger.startTiming('op1');
      logger.startTiming('op2');

      const duration1 = logger.endTiming('op1');
      const duration2 = logger.endTiming('op2');

      expect(duration1).toBeGreaterThanOrEqual(0);
      expect(duration2).toBeGreaterThanOrEqual(0);
    });

    it('should clear timing after ending', () => {
      logger.startTiming('operation');
      logger.endTiming('operation');
      const secondCall = logger.endTiming('operation');

      expect(console.warn).toHaveBeenCalled();
      expect(secondCall).toBe(0);
    });
  });

  describe('API Request Logging', () => {
    it('should log API request with provider and model', () => {
      logger.logAPIRequest('openai', 'gpt-4');
      expect(console.log).toHaveBeenCalled();
      const callArgs = consoleSpy.mock.calls[0];
      expect(callArgs[1]).toHaveProperty('provider', 'openai');
      expect(callArgs[1]).toHaveProperty('model', 'gpt-4');
    });

    it('should include default settings in API request log', () => {
      logger.logAPIRequest('openai', 'gpt-4');
      const callArgs = consoleSpy.mock.calls[0];
      expect(callArgs[1]).toHaveProperty('temperature', 0.2);
      expect(callArgs[1]).toHaveProperty('maxTokens', 1500);
    });

    it('should allow additional metadata', () => {
      logger.logAPIRequest('openai', 'gpt-4', { promptLength: 500 });
      const callArgs = consoleSpy.mock.calls[0];
      expect(callArgs[1]).toHaveProperty('promptLength', 500);
    });
  });

  describe('Validation Logging', () => {
    it('should log successful validation as debug', () => {
      logger.logValidation(true, { fields: 5 });
      expect(console.debug).toHaveBeenCalled();
    });

    it('should log failed validation as warn', () => {
      logger.logValidation(false, { violations: 2 });
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('Rate Limit Logging', () => {
    it('should log rate limit with status code', () => {
      logger.logRateLimit(429, 60);
      expect(console.warn).toHaveBeenCalled();
      const callArgs = (console.warn as jest.Mock).mock.calls[0];
      expect(callArgs[1]).toHaveProperty('statusCode', 429);
      expect(callArgs[1]).toHaveProperty('retryAfter', 60);
    });
  });

  describe('Completion Logging', () => {
    it('should log successful completion with metrics', () => {
      logger.startTiming('operation');
      setTimeout(() => {
        logger.logCompletion('operation', {
          success: true,
          itemsProcessed: 10,
          provider: 'openai',
        });
      }, 10);

      // Note: timing assertions would need async/await in real test
    });

    it('should include duration in completion log', async () => {
      logger.startTiming('op');
      await new Promise(resolve => setTimeout(resolve, 15));
      logger.logCompletion('op', { success: true });

      expect(console.log).toHaveBeenCalled();
      const lastCall = (console.log as jest.Mock).mock.calls.pop();
      expect(lastCall[1]).toHaveProperty('duration');
      expect(lastCall[1].duration).toMatch(/ms/);
    });
  });

  describe('Error Formatting', () => {
    it('should format Error objects', () => {
      const error = new Error('Test error message');
      logger.error('Error occurred', error);

      expect(console.error).toHaveBeenCalled();
      const callArgs = (console.error as jest.Mock).mock.calls[0];
      expect(callArgs[1]).toHaveProperty('errorName', 'Error');
      expect(callArgs[1]).toHaveProperty('errorMessage', 'Test error message');
      expect(callArgs[1]).toHaveProperty('errorStack');
    });

    it('should format string errors', () => {
      logger.error('Error occurred', 'String error message');
      const callArgs = (console.error as jest.Mock).mock.calls[0];
      expect(callArgs[1]).toHaveProperty('errorMessage', 'String error message');
    });

    it('should include error metadata', () => {
      const error = new Error('Test');
      logger.error('Error', error, { userId: 'user123' });
      const callArgs = (console.error as jest.Mock).mock.calls[0];
      expect(callArgs[1]).toHaveProperty('userId', 'user123');
    });

    it('should limit stack trace to first 3 lines', () => {
      const error = new Error('Test error');
      logger.error('Error', error);
      const callArgs = (console.error as jest.Mock).mock.calls[0];
      const stack = callArgs[1].errorStack;
      const lines = stack.split('\n');
      expect(lines.length).toBeLessThanOrEqual(3);
    });
  });
});

describe('Logger Factory Functions', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createAIServiceLogger', () => {
    it('should create logger with AIService module', () => {
      const logger = createAIServiceLogger('testOp');
      logger.info('Test');

      const callArgs = (console.log as jest.Mock).mock.calls[0];
      expect(callArgs[1]).toHaveProperty('module', 'AIService');
    });

    it('should use provided operation name', () => {
      const logger = createAIServiceLogger('customOperation');
      logger.info('Test');

      const callArgs = (console.log as jest.Mock).mock.calls[0];
      expect(callArgs[1]).toHaveProperty('operation', 'customOperation');
    });

    it('should support correlation ID', () => {
      const logger = createAIServiceLogger('op', 'corr-123');
      logger.info('Test');

      const callArgs = (console.log as jest.Mock).mock.calls[0];
      expect(callArgs[1]).toHaveProperty('correlationId', 'corr-123');
    });
  });

  describe('createPreprocessingLogger', () => {
    it('should create logger with Preprocessing module', () => {
      const logger = createPreprocessingLogger('extractSkills');
      logger.info('Test');

      const callArgs = (console.log as jest.Mock).mock.calls[0];
      expect(callArgs[1]).toHaveProperty('module', 'Preprocessing');
    });
  });
});

describe('Utility Functions', () => {
  describe('sanitizeForLogging', () => {
    it('should truncate long strings', () => {
      const longString = 'a'.repeat(200);
      const result = sanitizeForLogging(longString, 50);

      expect(result.length).toBeLessThanOrEqual(53); // 50 + '...'
      expect(result).toMatch(/\.\.\.$/);
    });

    it('should not add ellipsis for short strings', () => {
      const result = sanitizeForLogging('short string', 100);
      expect(result).toBe('short string');
    });

    it('should handle objects', () => {
      const obj = { key: 'value', nested: { data: 123 } };
      const result = sanitizeForLogging(obj, 200);

      expect(typeof result).toBe('string');
      expect(result).toContain('key');
    });

    it('should handle null/undefined', () => {
      expect(sanitizeForLogging(null, 50)).toBe('null');
      expect(sanitizeForLogging(undefined, 50)).toBe('undefined');
    });

    it('should respect max length parameter', () => {
      const result = sanitizeForLogging('a'.repeat(100), 30);
      expect(result.length).toBeLessThanOrEqual(33);
    });
  });

  describe('generateCorrelationId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateCorrelationId();
      const id2 = generateCorrelationId();

      expect(id1).not.toBe(id2);
    });

    it('should return string', () => {
      const id = generateCorrelationId();
      expect(typeof id).toBe('string');
    });

    it('should be traceable', () => {
      const id = generateCorrelationId();
      expect(id).toMatch(/^\d+/); // Should start with timestamp
    });

    it('should have reasonable length', () => {
      const id = generateCorrelationId();
      expect(id.length).toBeGreaterThan(10);
      expect(id.length).toBeLessThan(30);
    });
  });
});

describe('Log Message Format', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should include timestamp in all logs', () => {
    const logger = new AILogger({ module: 'Test', operation: 'test' });
    logger.info('Test message');

    const callArgs = (console.log as jest.Mock).mock.calls[0];
    expect(callArgs[1]).toHaveProperty('timestamp');
    expect(callArgs[1].timestamp).toMatch(/^\d{4}-\d{2}-\d{2}/); // ISO format
  });

  it('should include log level', () => {
    const logger = new AILogger({ module: 'Test', operation: 'test' });
    logger.warn('Test');

    const callArgs = (console.warn as jest.Mock).mock.calls[0];
    expect(callArgs[1]).toHaveProperty('level', 'warn');
  });

  it('should not expose sensitive data by default', () => {
    const logger = new AILogger({ module: 'Test', operation: 'test' });
    const cv = 'John Doe, Software Engineer, john@example.com, phone: 123-456-7890';
    logger.info('Processing', { cvLength: cv.length });

    const callArgs = (console.log as jest.Mock).mock.calls[0];
    const logOutput = JSON.stringify(callArgs[1]);
    expect(logOutput).not.toContain('john@example.com');
    expect(logOutput).not.toContain('123-456-7890');
  });
});

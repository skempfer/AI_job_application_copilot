import {
  checkRateLimit,
  resetRateLimit,
  getRemainingRequests,
  getTimeUntilReset,
  isRateLimited,
} from './rateLimiter';

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

describe('rateLimiter', () => {
  const RATE_LIMIT_KEY = 'viora_request_rate_limit';
  const MAX_REQUESTS = 4;
  const TIME_WINDOW = 15 * 60 * 1000; // 15 minutes

  beforeEach(() => {
    sessionStorageMock.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    sessionStorageMock.clear();
  });

  describe('checkRateLimit', () => {
    it('should allow requests when under limit', () => {
      for (let i = 0; i < 4; i++) {
        const result = checkRateLimit();
        expect(result.allowed).toBe(true);
        expect(result.message).toBeUndefined();
      }
    });

    it('should deny request when limit exceeded', () => {
      // Make 4 requests
      for (let i = 0; i < 4; i++) {
        checkRateLimit();
      }

      // 5th request should be denied
      const result = checkRateLimit();
      expect(result.allowed).toBe(false);
      expect(result.message).toContain('Rate limit exceeded');
      expect(result.message).toContain('15 minutes');
      expect(result.message).toContain('4 analyses');
    });

    it('should include time until reset in error message', () => {
      for (let i = 0; i < 4; i++) {
        checkRateLimit();
      }

      const result = checkRateLimit();
      expect(result.message).toMatch(/\d+ seconds/);
    });

    it('should store meta message in sessionStorage', () => {
      checkRateLimit();
      const stored = sessionStorageMock.getItem(RATE_LIMIT_KEY);
      expect(stored).toBeTruthy();

      const data = JSON.parse(stored!);
      expect(data.metaMessage).toContain('open this');
    });

    it('should handle sessionStorage errors gracefully', () => {
      const getItemSpy = jest.spyOn(sessionStorageMock, 'getItem').mockImplementation(() => {
        throw new Error('Storage unavailable');
      });

      const result = checkRateLimit();
      expect(result.allowed).toBe(true); // Should allow on error

      getItemSpy.mockRestore();
    });

    it('should filter out expired timestamps', () => {
      // Make 4 requests
      for (let i = 0; i < 4; i++) {
        checkRateLimit();
      }

      expect(checkRateLimit().allowed).toBe(false);

      // Advance time past TIME_WINDOW + 1 second
      jest.advanceTimersByTime(TIME_WINDOW + 1000);

      // All timestamps should be expired, so next request should be allowed
      const result = checkRateLimit();
      expect(result.allowed).toBe(true);
    });

    it('should calculate correct time until reset', () => {
      for (let i = 0; i < 4; i++) {
        checkRateLimit();
      }

      // Advance time by 5 minutes (300,000 ms)
      jest.advanceTimersByTime(5 * 60 * 1000);

      const result = checkRateLimit();
      expect(result.allowed).toBe(false);
      // Should have ~10 minutes left (600 seconds)
      expect(result.message).toMatch(/60[0-9] seconds|599 seconds|60\d seconds/);
    });
  });

  describe('resetRateLimit', () => {
    it('should clear rate limit data from sessionStorage', () => {
      checkRateLimit();
      checkRateLimit();

      expect(sessionStorageMock.getItem(RATE_LIMIT_KEY)).toBeTruthy();

      resetRateLimit();

      expect(sessionStorageMock.getItem(RATE_LIMIT_KEY)).toBeNull();
    });

    it('should handle errors gracefully', () => {
      const removeItemSpy = jest. spyOn(sessionStorageMock, 'removeItem').mockImplementation(() => {
        throw new Error('Storage unavailable');
      });

      expect(() => resetRateLimit()).not.toThrow();

      removeItemSpy.mockRestore();
    });

    it('should allow new requests after reset', () => {
      // Exhaust limit
      for (let i = 0; i < 4; i++) {
        checkRateLimit();
      }
      expect(checkRateLimit().allowed).toBe(false);

      // Reset
      resetRateLimit();

      // Should allow new request
      expect(checkRateLimit().allowed).toBe(true);
    });
  });

  describe('getRemainingRequests', () => {
    it('should return MAX_REQUESTS when no data stored', () => {
      expect(getRemainingRequests()).toBe(4);
    });

    it('should decrease count after each request', () => {
      expect(getRemainingRequests()).toBe(4);

      checkRateLimit();
      expect(getRemainingRequests()).toBe(3);

      checkRateLimit();
      expect(getRemainingRequests()).toBe(2);

      checkRateLimit();
      expect(getRemainingRequests()).toBe(1);

      checkRateLimit();
      expect(getRemainingRequests()).toBe(0);
    });

    it('should return 0 when limit exhausted', () => {
      for (let i = 0; i < 4; i++) {
        checkRateLimit();
      }

      expect(getRemainingRequests()).toBe(0);
    });

    it('should reset count after TIME_WINDOW expires', () => {
      for (let i = 0; i < 4; i++) {
        checkRateLimit();
      }

      expect(getRemainingRequests()).toBe(0);

      jest.advanceTimersByTime(TIME_WINDOW + 1000);

      expect(getRemainingRequests()).toBe(4);
    });

    it('should partially reset count for partially expired timestamps', () => {
      checkRateLimit();
      const firstTime = Date.now();

      checkRateLimit();
      checkRateLimit();

      // Advance time by 5 minutes
      jest.advanceTimersByTime(5 * 60 * 1000);

      checkRateLimit();

      // After 5 minutes, first 3 timestamps are older but still within 15 minute window
      // (they expire after 15 min total, so we're at 5 min, they have 10 min left)
      // We have 1 new timestamp at 5 min
      // Total: 4 timestamps all within the 15 min window = 0 remaining
      expect(getRemainingRequests()).toBe(0);
    });

    it('should handle errors gracefully', () => {
      const getItemSpy = jest.spyOn(sessionStorageMock, 'getItem').mockImplementation(() => {
        throw new Error('Storage unavailable');
      });

      const result = getRemainingRequests();
      expect(result).toBe(4); // Default to MAX_REQUESTS

      getItemSpy.mockRestore();
    });
  });

  describe('getTimeUntilReset', () => {
    it('should return 0 when no data stored', () => {
      expect(getTimeUntilReset()).toBe(0);
    });

    it('should return 0 when under limit', () => {
      checkRateLimit();
      checkRateLimit();

      expect(getTimeUntilReset()).toBe(0);
    });

    it('should return time remaining when limit exceeded', () => {
      for (let i = 0; i < 4; i++) {
        checkRateLimit();
      }

      const timeUntilReset = getTimeUntilReset();
      expect(timeUntilReset).toBeGreaterThan(0);
      expect(timeUntilReset).toBeLessThanOrEqual(TIME_WINDOW / 1000);
    });

    it('should decrease as time advances', () => {
      for (let i = 0; i < 4; i++) {
        checkRateLimit();
      }

      const time1 = getTimeUntilReset();

      jest.advanceTimersByTime(60000); // 1 minute

      const time2 = getTimeUntilReset();

      expect(time2).toBeLessThan(time1);
    });

    it('should return 0 after TIME_WINDOW expires', () => {
      for (let i = 0; i < 4; i++) {
        checkRateLimit();
      }

      expect(getTimeUntilReset()).toBeGreaterThan(0);

      jest.advanceTimersByTime(TIME_WINDOW + 1000);

      expect(getTimeUntilReset()).toBe(0);
    });

    it('should handle errors gracefully', () => {
      const getItemSpy = jest.spyOn(sessionStorageMock, 'getItem').mockImplementation(() => {
        throw new Error('Storage unavailable');
      });

      const result = getTimeUntilReset();
      expect(result).toBe(0); // Default to 0

      getItemSpy.mockRestore();
    });
  });

  describe('isRateLimited', () => {
    it('should return false initially', () => {
      expect(isRateLimited()).toBe(false);
    });

    it('should return false when under limit', () => {
      checkRateLimit();
      checkRateLimit();

      expect(isRateLimited()).toBe(false);
    });

    it('should return true when limit exceeded', () => {
      for (let i = 0; i < 4; i++) {
        checkRateLimit();
      }

      expect(isRateLimited()).toBe(true);
    });

    it('should return false after reset', () => {
      for (let i = 0; i < 4; i++) {
        checkRateLimit();
      }

      expect(isRateLimited()).toBe(true);

      resetRateLimit();

      expect(isRateLimited()).toBe(false);
    });

    it('should return false after TIME_WINDOW expires', () => {
      for (let i = 0; i < 4; i++) {
        checkRateLimit();
      }

      expect(isRateLimited()).toBe(true);

      jest.advanceTimersByTime(TIME_WINDOW + 1000);

      expect(isRateLimited()).toBe(false);
    });

    it('should handle errors gracefully', () => {
      const getItemSpy = jest.spyOn(sessionStorageMock, 'getItem').mockImplementation(() => {
        throw new Error('Storage unavailable');
      });

      const result = isRateLimited();
      expect(result).toBe(false); // Default to false (not limited)

      getItemSpy.mockRestore();
    });
  });

  describe('rate limit workflow', () => {
    it('should handle complete user workflow', () => {
      // User makes 4 analyses
      expect(getRemainingRequests()).toBe(4);
      expect(checkRateLimit().allowed).toBe(true);
      expect(getRemainingRequests()).toBe(3);

      expect(checkRateLimit().allowed).toBe(true);
      expect(getRemainingRequests()).toBe(2);

      expect(checkRateLimit().allowed).toBe(true);
      expect(getRemainingRequests()).toBe(1);

      expect(checkRateLimit().allowed).toBe(true);
      expect(getRemainingRequests()).toBe(0);

      // 5th attempt fails
      expect(isRateLimited()).toBe(true);
      const result = checkRateLimit();
      expect(result.allowed).toBe(false);
      expect(result.message).toContain('Rate limit exceeded');

      // User waits for window to expire
      jest.advanceTimersByTime(TIME_WINDOW + 1000);

      // Can try again
      expect(isRateLimited()).toBe(false);
      expect(checkRateLimit().allowed).toBe(true);
    });
  });
});

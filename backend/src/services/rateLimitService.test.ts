import {
  checkRateLimit,
  incrementUsage,
  getUsageStats,
  clearRateLimitData,
} from "./rateLimitService.js";

describe("rateLimitService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearRateLimitData();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("checkRateLimit", () => {
    it("should allow first requests", () => {
      const result = checkRateLimit("192.168.1.1");
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);
    });

    it("should allow up to 2 requests per day", () => {
      const ip = "192.168.1.2";

      // First request
      let result = checkRateLimit(ip);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);

      // Second request
      result = checkRateLimit(ip);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);
    });

    it("should deny requests after limit exceeded", () => {
      const ip = "192.168.1.3";

      // Use up both requests
      incrementUsage(ip);
      incrementUsage(ip);

      // Third request should be denied
      const result = checkRateLimit(ip);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it("should reset after 24 hours", () => {
      const ip = "192.168.1.4";
      const now = Date.now();

      // First request
      incrementUsage(ip);
      incrementUsage(ip);
let result = checkRateLimit(ip);
      expect(result.allowed).toBe(false);

      // Advance 24 hours
      jest.setSystemTime(now + 24 * 60 * 60 * 1000 + 1000);

      // Should be allowed again
      result = checkRateLimit(ip);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);
    });

    it("should return reset time", () => {
      const ip = "192.168.1.5";
      const now = Date.now();

      jest.setSystemTime(now);
      const result = checkRateLimit(ip);

      const expectedResetTime = new Date(now + 24 * 60 * 60 * 1000);
      expect(result.resetTime.getTime()).toBe(expectedResetTime.getTime());
    });
  });

  describe("incrementUsage", () => {
    it("should increment usage counter", () => {
      const ip = "192.168.1.6";

      incrementUsage(ip);
      let stats = getUsageStats(ip);
      expect(stats.count).toBe(1);

      incrementUsage(ip);
      stats = getUsageStats(ip);
      expect(stats.count).toBe(2);
    });

    it("should reset counter on new 24h window", () => {
      const ip = "192.168.1.7";
      const now = Date.now();

      jest.setSystemTime(now);
      incrementUsage(ip);

      jest.setSystemTime(now + 24 * 60 * 60 * 1000 + 1000);
      incrementUsage(ip);

      const stats = getUsageStats(ip);
      expect(stats.count).toBe(1);
    });
  });

  describe("getUsageStats", () => {
    it("should return correct stats", () => {
      const ip = "192.168.1.8";

      incrementUsage(ip);
      const stats = getUsageStats(ip);

      expect(stats.count).toBe(1);
      expect(stats.remaining).toBe(1);
      expect(stats.windowStartTime).toBeInstanceOf(Date);
      expect(stats.windowEndTime).toBeInstanceOf(Date);
    });

    it("should return default stats for unknown IP", () => {
      const stats = getUsageStats("999.999.999.999");

      expect(stats.count).toBe(0);
      expect(stats.remaining).toBe(2);
    });
  });

  describe("clearRateLimitData", () => {
    it("should clear all rate limit data", () => {
      incrementUsage("192.168.1.9");
      let stats = getUsageStats("192.168.1.9");
      expect(stats.count).toBe(1);

      clearRateLimitData();

      stats = getUsageStats("192.168.1.9");
      expect(stats.count).toBe(0);
    });
  });

  describe("multiple IPs", () => {
    it("should track limits separately for each IP", () => {
      const ip1 = "192.168.1.10";
      const ip2 = "192.168.1.11";

      incrementUsage(ip1);
      incrementUsage(ip1);

      incrementUsage(ip2);

      const stats1 = getUsageStats(ip1);
      const stats2 = getUsageStats(ip2);

      expect(stats1.count).toBe(2);
      expect(stats2.count).toBe(1);

      const result1 = checkRateLimit(ip1);
      const result2 = checkRateLimit(ip2);

      expect(result1.allowed).toBe(false);
      expect(result2.allowed).toBe(true);
    });
  });
});

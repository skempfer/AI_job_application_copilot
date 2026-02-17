import {
  generateCacheHash,
  getCachedAnalysis,
  cacheAnalysis,
  getCacheStats,
  clearCache,
  getCacheEntry,
} from "./cacheService.js";
import type { AnalysisResult } from "../types/analysis.js";

describe("cacheService", () => {
  const mockAnalysisResult: AnalysisResult = {
    fitScore: 85,
    decision: "apply",
    strengths: ["Skill 1", "Skill 2"],
    gaps: ["Gap 1"],
    cvSuggestions: ["Suggestion 1"],
    recruiterMessage: "Great fit!",
    coverLetter: "Sample letter",
    explanation: {
      positives: ["Match 1"],
      negatives: ["No match"],
      summary: "Good fit",
    },
    promptVersion: "v3.0-full-context",
    detectedLanguage: "en",
  };

  beforeEach(() => {
    clearCache();
  });

  describe("generateCacheHash", () => {
    it("should generate consistent hash for same inputs", () => {
      const cv = "Sample CV content";
      const job = "Sample job description";

      const hash1 = generateCacheHash(cv, job);
      const hash2 = generateCacheHash(cv, job);

      expect(hash1).toBe(hash2);
    });

    it("should generate different hashes for different inputs", () => {
      const hash1 = generateCacheHash("CV1", "Job1");
      const hash2 = generateCacheHash("CV2", "Job2");

      expect(hash1).not.toBe(hash2);
    });

    it("should normalize whitespace", () => {
      const cv1 = "Sample  CV  content";
      const cv2 = "Sample CV content";
      const job = "Job description";

      const hash1 = generateCacheHash(cv1, job);
      const hash2 = generateCacheHash(cv2, job);

      expect(hash1).toBe(hash2);
    });

    it("should use prompt version in hash", () => {
      const cv = "Test CV";
      const job = "Test job";

      const hash1 = generateCacheHash(cv, job, "v1.0");
      const hash2 = generateCacheHash(cv, job, "v2.0");

      expect(hash1).not.toBe(hash2);
    });

    it("should return 64-character SHA256 hex string", () => {
      const hash = generateCacheHash("test", "test");
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe("cacheAnalysis and getCachedAnalysis", () => {
    it("should cache and retrieve analysis result", () => {
      const cv = "Test CV";
      const job = "Test job";

      cacheAnalysis(cv, job, mockAnalysisResult, "llama-3.3-70b-versatile");

      const cached = getCachedAnalysis(cv, job);
      expect(cached).not.toBeNull();
      expect(cached?.fitScore).toBe(85);
      expect(cached?.decision).toBe("apply");
    });

    it("should return null for uncached entries", () => {
      const cached = getCachedAnalysis("NonExistent", "Job");
      expect(cached).toBeNull();
    });

    it("should mark cached results with cacheHit flag", () => {
      const cv = "Test CV";
      const job = "Test job";

      cacheAnalysis(cv, job, mockAnalysisResult, "llama-3.3-70b-versatile");

      const cached = getCachedAnalysis(cv, job);
      expect(cached?.cacheHit).toBe(true);
    });

    it("should include cached timestamp", () => {
      const cv = "Test CV";
      const job = "Test job";

      cacheAnalysis(cv, job, mockAnalysisResult, "llama-3.3-70b-versatile");

      const cached = getCachedAnalysis(cv, job);
      expect(cached?.cachedAt).toBeDefined();
      expect(typeof cached?.cachedAt).toBe("number");
      expect(cached?.cachedAt).toBeLessThanOrEqual(Date.now());
    });

    it("should handle different prompt versions", () => {
      const cv = "Test CV";
      const job = "Test job";

      cacheAnalysis(cv, job, mockAnalysisResult, "llama-3.3-70b-versatile", "v1.0");
      const cached1 = getCachedAnalysis(cv, job, "v1.0");

      // Advance time slightly
      jest.useFakeTimers();
      jest.advanceTimersByTime(100);

      cacheAnalysis(cv, job, mockAnalysisResult, "llama-3.3-70b-versatile", "v2.0");
      const cached2 = getCachedAnalysis(cv, job, "v2.0");

      jest.useRealTimers();

      expect(cached1).not.toBeNull();
      expect(cached2).not.toBeNull();
      expect(cached1?.cachedAt).not.toBe(cached2?.cachedAt);
    });
  });

  describe("getCacheStats", () => {
    it("should return initial stats", () => {
      const stats = getCacheStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.hitRate).toBe(0);
      expect(stats.size).toBe(0);
    });

    it("should track cache hits", () => {
      const cv = "Test CV";
      const job = "Test job";

      cacheAnalysis(cv, job, mockAnalysisResult, "llama-3.3-70b-versatile");
      getCachedAnalysis(cv, job);
      getCachedAnalysis(cv, job);

      const stats = getCacheStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(0);
      expect(stats.hitRate).toBe(100);
    });

    it("should track cache misses", () => {
      getCachedAnalysis("NonExistent1", "Job");
      getCachedAnalysis("NonExistent2", "Job");

      const stats = getCacheStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(2);
      expect(stats.hitRate).toBe(0);
    });

    it("should calculate correct hit rate", () => {
      const cv = "Test CV";
      const job = "Test job";

      cacheAnalysis(cv, job, mockAnalysisResult, "llama-3.3-70b-versatile");

      getCachedAnalysis(cv, job); // hit
      getCachedAnalysis(cv, job); // hit
      getCachedAnalysis("NonExistent", "Job"); // miss

      const stats = getCacheStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBeCloseTo(66.67, 1);
    });

    it("should report cache size", () => {
      cacheAnalysis("CV1", "Job1", mockAnalysisResult, "llama-3.3-70b-versatile");
      cacheAnalysis("CV2", "Job2", mockAnalysisResult, "llama-3.3-70b-versatile");

      const stats = getCacheStats();
      expect(stats.size).toBe(2);
    });
  });

  describe("clearCache", () => {
    it("should clear all cached entries", () => {
      cacheAnalysis("CV1", "Job1", mockAnalysisResult, "llama-3.3-70b-versatile");
      cacheAnalysis("CV2", "Job2", mockAnalysisResult, "llama-3.3-70b-versatile");

      clearCache();

      const cached1 = getCachedAnalysis("CV1", "Job1");
      const cached2 = getCachedAnalysis("CV2", "Job2");

      expect(cached1).toBeNull();
      expect(cached2).toBeNull();
    });

    it("should reset statistics", () => {
      cacheAnalysis("CV1", "Job1", mockAnalysisResult, "llama-3.3-70b-versatile");
      getCachedAnalysis("CV1", "Job1");

      clearCache();

      const stats = getCacheStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.size).toBe(0);
    });
  });

  describe("getCacheEntry", () => {
    it("should return cache entry details", () => {
      const cv = "Test CV";
      const job = "Test job";

      cacheAnalysis(cv, job, mockAnalysisResult, "llama-3.3-70b-versatile");

      const entry = getCacheEntry(cv, job);
      expect(entry).not.toBeNull();
      expect(entry?.modelUsed).toBe("llama-3.3-70b-versatile");
      expect(entry?.result.fitScore).toBe(85);
    });

    it("should return null for uncached entries", () => {
      const entry = getCacheEntry("NonExistent", "Job");
      expect(entry).toBeNull();
    });
  });
});

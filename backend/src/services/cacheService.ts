/**
 * AI Analysis Cache Service
 * 
 * Caches analysis results based on hash of normalized CV + job description + prompt version
 * Prevents repeated AI calls for identical inputs
 */

import crypto from "crypto";
import type { AnalysisResult } from "../types/analysis.js";

interface CacheEntry {
  hash: string;
  result: AnalysisResult;
  modelUsed: string;
  timestamp: number;
}

interface CacheMap {
  [hash: string]: CacheEntry;
}

// In-memory cache storage
const analysisCache: CacheMap = {};

// Cache statistics for monitoring
let cacheHits = 0;
let cacheMisses = 0;

/**
 * Generate SHA256 hash from normalized CV, job description, and prompt version
 * Normalization removes extra whitespace and lowercases for consistency
 * @param cv - CV content
 * @param jobDescription - Job description
 * @param promptVersion - Prompt version identifier
 * @returns SHA256 hash
 */
export function generateCacheHash(
  cv: string,
  jobDescription: string,
  promptVersion: string = "v3.0-full-context"
): string {
  // Normalize inputs: trim, remove extra whitespace
  const normalizedCv = cv.trim().replace(/\s+/g, " ");
  const normalizedJob = jobDescription.trim().replace(/\s+/g, " ");

  // Combine for hashing
  const combined = `${normalizedCv}|${normalizedJob}|${promptVersion}`;

  // Generate SHA256 hash
  const hash = crypto.createHash("sha256").update(combined).digest("hex");

  return hash;
}

/**
 * Get cached analysis result if available
 * @param cv - CV content
 * @param jobDescription - Job description
 * @param promptVersion - Prompt version identifier
 * @returns Cached result or null if not found
 */
export function getCachedAnalysis(
  cv: string,
  jobDescription: string,
  promptVersion: string = "v3.0-full-context"
): (AnalysisResult & { cacheHit: true; cachedAt: number }) | null {
  const hash = generateCacheHash(cv, jobDescription, promptVersion);
  const entry = analysisCache[hash];

  if (entry) {
    cacheHits++;
    return {
      ...entry.result,
      cacheHit: true,
      cachedAt: entry.timestamp,
    };
  }

  cacheMisses++;
  return null;
}

/**
 * Store analysis result in cache
 * @param cv - CV content
 * @param jobDescription - Job description
 * @param result - Analysis result
 * @param modelUsed - AI model used for this analysis
 * @param promptVersion - Prompt version identifier
 */
export function cacheAnalysis(
  cv: string,
  jobDescription: string,
  result: AnalysisResult,
  modelUsed: string,
  promptVersion: string = "v3.0-full-context"
): string {
  const hash = generateCacheHash(cv, jobDescription, promptVersion);

  analysisCache[hash] = {
    hash,
    result,
    modelUsed,
    timestamp: Date.now(),
  };

  return hash;
}

/**
 * Get cache statistics
 * @returns Cache hit/miss statistics
 */
export function getCacheStats(): {
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
} {
  const total = cacheHits + cacheMisses;
  const hitRate = total > 0 ? (cacheHits / total) * 100 : 0;
  const size = Object.keys(analysisCache).length;

  return {
    hits: cacheHits,
    misses: cacheMisses,
    hitRate,
    size,
  };
}

/**
 * Clear all cache entries (useful for testing)
 */
export function clearCache(): void {
  for (const key in analysisCache) {
    delete analysisCache[key];
  }
  cacheHits = 0;
  cacheMisses = 0;
}

/**
 * Get cache entry for monitoring/debugging
 * @param cv - CV content
 * @param jobDescription - Job description
 * @param promptVersion - Prompt version identifier
 * @returns Cache entry or null
 */
export function getCacheEntry(
  cv: string,
  jobDescription: string,
  promptVersion: string = "v3.0-full-context"
): CacheEntry | null {
  const hash = generateCacheHash(cv, jobDescription, promptVersion);
  return analysisCache[hash] || null;
}

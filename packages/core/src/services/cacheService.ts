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

const analysisCache: CacheMap = {};

let cacheHits = 0;
let cacheMisses = 0;

export function generateCacheHash(
  cv: string,
  jobDescription: string,
  promptVersion: string = "v3.0-full-context"
): string {
  const normalizedCv = cv.trim().replace(/\s+/g, " ");
  const normalizedJob = jobDescription.trim().replace(/\s+/g, " ");

  const combined = `${normalizedCv}|${normalizedJob}|${promptVersion}`;

  const hash = crypto.createHash("sha256").update(combined).digest("hex");

  return hash;
}

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

export function clearCache(): void {
  for (const key in analysisCache) {
    delete analysisCache[key];
  }
  cacheHits = 0;
  cacheMisses = 0;
}

export function getCacheEntry(
  cv: string,
  jobDescription: string,
  promptVersion: string = "v3.0-full-context"
): CacheEntry | null {
  const hash = generateCacheHash(cv, jobDescription, promptVersion);
  return analysisCache[hash] || null;
}

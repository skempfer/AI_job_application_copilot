/**
 * IP Usage Logging Service
 * 
 * Structured logging for IP-based usage tracking
 * Logs: IP address, timestamp, endpoint, tokens consumed, cache hit/miss, model used
 */

interface UsageLogEntry {
  timestamp: string;
  ipAddress: string;
  endpoint: string;
  cacheHit: boolean;
  modelUsed: string;
  estimatedInputTokens?: number;
  responseTimeMs?: number;
  cvLength?: number;
  jobDescriptionLength?: number;
}

// In-memory log storage
const usageLogs: UsageLogEntry[] = [];

/**
 * Format usage log entry as structured JSON
 * @param ipAddress - Client IP address
 * @param endpoint - API endpoint used
 * @param cacheHit - Whether response was from cache
 * @param modelUsed - AI model used
 * @param details - Additional details (tokens, timing, etc.)
 * @returns Structured log entry
 */
function createLogEntry(
  ipAddress: string,
  endpoint: string,
  cacheHit: boolean,
  modelUsed: string,
  details?: {
    estimatedInputTokens?: number;
    responseTimeMs?: number;
    cvLength?: number;
    jobDescriptionLength?: number;
  }
): UsageLogEntry {
  return {
    timestamp: new Date().toISOString(),
    ipAddress: maskIpAddress(ipAddress),
    endpoint,
    cacheHit,
    modelUsed,
    estimatedInputTokens: details?.estimatedInputTokens,
    responseTimeMs: details?.responseTimeMs,
    cvLength: details?.cvLength,
    jobDescriptionLength: details?.jobDescriptionLength,
  };
}

/**
 * Mask IP address for privacy (keep last octet)
 * @param ipAddress - Full IP address
 * @returns Masked IP address
 */
function maskIpAddress(ipAddress: string): string {
  const parts = ipAddress.split(".");
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.***`;
  }
  // IPv6 or other format - return as is for now
  return ipAddress;
}

/**
 * Log IP usage for analysis endpoint
 * @param ipAddress - Client IP address
 * @param cacheHit - Whether response was from cache
 * @param modelUsed - AI model used
 * @param details - Additional details
 */
export function logAnalysisUsage(
  ipAddress: string,
  cacheHit: boolean,
  modelUsed: string,
  details?: {
    estimatedInputTokens?: number;
    responseTimeMs?: number;
    cvLength?: number;
    jobDescriptionLength?: number;
  }
): void {
  const entry = createLogEntry(ipAddress, "/api/analyze", cacheHit, modelUsed, details);
  usageLogs.push(entry);

  // Log to console in development
  if (process.env.NODE_ENV !== "production") {
    console.log("[Usage Log]", JSON.stringify(entry));
  }
}

/**
 * Log rate limit exceeded event
 * @param ipAddress - Client IP address
 * @param remaining - Remaining analyses
 */
export function logRateLimitExceeded(ipAddress: string, remaining: number): void {
  const entry = {
    timestamp: new Date().toISOString(),
    ipAddress: maskIpAddress(ipAddress),
    event: "rate_limit_exceeded",
    remaining,
  };

  usageLogs.push(entry as any);

  // Log to console in development
  if (process.env.NODE_ENV !== "production") {
    console.log("[Rate Limit Log]", JSON.stringify(entry));
  }
}

/**
 * Get usage logs (for monitoring)
 * @param limit - Maximum number of logs to return
 * @returns Recent usage logs
 */
export function getUsageLogs(limit: number = 100): UsageLogEntry[] {
  return usageLogs.slice(-limit);
}

/**
 * Get usage statistics
 * @returns Aggregated usage stats
 */
export function getUsageStats(): {
  totalLogs: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
  uniqueIPs: number;
  averageResponseTime: number;
} {
  const cacheHits = usageLogs.filter(
    (log) => "cacheHit" in log && log.cacheHit === true
  ).length;
  const cacheMisses = usageLogs.filter(
    (log) => "cacheHit" in log && log.cacheHit === false
  ).length;
  const total = cacheHits + cacheMisses || 1;
  const hitRate = (cacheHits / total) * 100;

  const uniqueIPs = new Set(
    usageLogs.filter((log) => "ipAddress" in log).map((log) => log.ipAddress)
  ).size;

  const responseTimes = usageLogs
    .filter((log) => "responseTimeMs" in log && log.responseTimeMs)
    .map((log) => (log as any).responseTimeMs);

  const averageResponseTime =
    responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

  return {
    totalLogs: usageLogs.length,
    cacheHits,
    cacheMisses,
    hitRate,
    uniqueIPs,
    averageResponseTime,
  };
}

/**
 * Clear all usage logs (useful for testing)
 */
export function clearUsageLogs(): void {
  usageLogs.length = 0;
}

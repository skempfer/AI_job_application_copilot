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

const usageLogs: UsageLogEntry[] = [];

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

function maskIpAddress(ipAddress: string): string {
  const parts = ipAddress.split(".");
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.***`;
  }
  return ipAddress;
}

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

  if (process.env.NODE_ENV !== "production") {
    console.log("[Usage Log]", JSON.stringify(entry));
  }
}

export function logRateLimitExceeded(ipAddress: string, remaining: number): void {
  const entry = {
    timestamp: new Date().toISOString(),
    ipAddress: maskIpAddress(ipAddress),
    event: "rate_limit_exceeded",
    remaining,
  };

  usageLogs.push(entry as any);

  if (process.env.NODE_ENV !== "production") {
    console.log("[Rate Limit Log]", JSON.stringify(entry));
  }
}

export function getUsageLogs(limit: number = 100): UsageLogEntry[] {
  return usageLogs.slice(-limit);
}

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

export function clearUsageLogs(): void {
  usageLogs.length = 0;
}

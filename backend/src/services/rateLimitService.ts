/**
 * Rate Limiting Service
 * 
 * Enforces a 2 free analyses per day per IP limit with rolling 24-hour window
 * Uses in-memory storage with database persistence option
 */

interface ClientUsage {
  count: number;
  firstRequestTimestamp: number;
}

interface ClientUsageMap {
  [ipAddress: string]: ClientUsage;
}

const DAILY_LIMIT = 2;
const ROLLING_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

// In-memory storage for rate limiting
const clientUsage: ClientUsageMap = {};

/**
 * Check if IP has exceeded daily analysis limit
 * @param clientIp - Client IP address
 * @returns Object with { allowed: boolean, remaining: number, resetTime: Date }
 */
export function checkRateLimit(clientIp: string): {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
} {
  const now = Date.now();
  const usage = clientUsage[clientIp];

  // New client or window expired
  if (!usage || now - usage.firstRequestTimestamp > ROLLING_WINDOW_MS) {
    clientUsage[clientIp] = {
      count: 0,
      firstRequestTimestamp: now,
    };
  }

  const currentUsage = clientUsage[clientIp];
  const windowStartTime = currentUsage.firstRequestTimestamp;
  const resetTime = new Date(windowStartTime + ROLLING_WINDOW_MS);

  // Check if still within rolling window
  if (now - windowStartTime <= ROLLING_WINDOW_MS) {
    const remaining = Math.max(0, DAILY_LIMIT - currentUsage.count);
    const allowed = currentUsage.count < DAILY_LIMIT;

    return {
      allowed,
      remaining,
      resetTime,
    };
  }

  // Window expired, reset
  clientUsage[clientIp] = {
    count: 0,
    firstRequestTimestamp: now,
  };

  return {
    allowed: true,
    remaining: DAILY_LIMIT,
    resetTime: new Date(now + ROLLING_WINDOW_MS),
  };
}

/**
 * Increment usage count for an IP
 * @param clientIp - Client IP address
 */
export function incrementUsage(clientIp: string): void {
  const now = Date.now();
  const usage = clientUsage[clientIp];

  // New client or window expired
  if (!usage || now - usage.firstRequestTimestamp > ROLLING_WINDOW_MS) {
    clientUsage[clientIp] = {
      count: 1,
      firstRequestTimestamp: now,
    };
  } else {
    usage.count++;
  }
}

/**
 * Get current usage stats for an IP (for logging/monitoring)
 * @param clientIp - Client IP address
 * @returns Current usage stats
 */
export function getUsageStats(clientIp: string): {
  count: number;
  remaining: number;
  windowStartTime: Date;
  windowEndTime: Date;
} {
  const usage = clientUsage[clientIp];

  if (!usage) {
    const now = new Date();
    return {
      count: 0,
      remaining: DAILY_LIMIT,
      windowStartTime: now,
      windowEndTime: new Date(now.getTime() + ROLLING_WINDOW_MS),
    };
  }

  const remaining = Math.max(0, DAILY_LIMIT - usage.count);

  return {
    count: usage.count,
    remaining,
    windowStartTime: new Date(usage.firstRequestTimestamp),
    windowEndTime: new Date(usage.firstRequestTimestamp + ROLLING_WINDOW_MS),
  };
}

/**
 * Clear all rate limit data (useful for testing)
 */
export function clearRateLimitData(): void {
  for (const key in clientUsage) {
    delete clientUsage[key];
  }
}

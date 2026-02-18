interface ClientUsage {
  count: number;
  firstRequestTimestamp: number;
}

interface ClientUsageMap {
  [ipAddress: string]: ClientUsage;
}

const DAILY_LIMIT = 2;
const ROLLING_WINDOW_MS = 24 * 60 * 60 * 1000;
const clientUsage: ClientUsageMap = {};

export function checkRateLimit(clientIp: string): {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
} {
  const now = Date.now();
  const usage = clientUsage[clientIp];

  if (!usage || now - usage.firstRequestTimestamp > ROLLING_WINDOW_MS) {
    clientUsage[clientIp] = {
      count: 0,
      firstRequestTimestamp: now,
    };
  }

  const currentUsage = clientUsage[clientIp];
  const windowStartTime = currentUsage.firstRequestTimestamp;
  const resetTime = new Date(windowStartTime + ROLLING_WINDOW_MS);

  if (now - windowStartTime <= ROLLING_WINDOW_MS) {
    const remaining = Math.max(0, DAILY_LIMIT - currentUsage.count);
    const allowed = currentUsage.count < DAILY_LIMIT;

    return {
      allowed,
      remaining,
      resetTime,
    };
  }

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

export function incrementUsage(clientIp: string): void {
  const now = Date.now();
  const usage = clientUsage[clientIp];

  if (!usage || now - usage.firstRequestTimestamp > ROLLING_WINDOW_MS) {
    clientUsage[clientIp] = {
      count: 1,
      firstRequestTimestamp: now,
    };
  } else {
    usage.count++;
  }
}

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

export function clearRateLimitData(): void {
  for (const key in clientUsage) {
    delete clientUsage[key];
  }
}

const RATE_LIMIT_KEY = 'viora_request_rate_limit';
const MAX_REQUESTS = 2;
const TIME_WINDOW = 24 * 60 * 60 * 1000;

const META_MESSAGE =
  "Hey there 👀 I knew you'd open this. Please don't delete this key just to bypass the limit. Have mercy on the free AI.";

interface RateLimitStore {
  timestamps: number[];
  metaMessage: string;
}

export function checkRateLimit(): { allowed: boolean; message?: string } {
  try {
    const now = Date.now();
    const stored = sessionStorage.getItem(RATE_LIMIT_KEY);

    let data: RateLimitStore = stored
      ? JSON.parse(stored)
      : { timestamps: [], metaMessage: META_MESSAGE };

    data.timestamps = data.timestamps.filter(
      (timestamp) => now - timestamp <= TIME_WINDOW
    );

    if (data.timestamps.length >= MAX_REQUESTS) {
      const oldestTimestamp = Math.min(...data.timestamps);
      const timeUntilReset = Math.ceil(
        (TIME_WINDOW - (now - oldestTimestamp)) / 1000
      );

      return {
        allowed: false,
        message: `Rate limit exceeded. You can analyze again in ${timeUntilReset} seconds. (${MAX_REQUESTS} analyses per 24 hours)`,
      };
    }

    data.timestamps.push(now);
    data.metaMessage = META_MESSAGE;

    sessionStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));

    return { allowed: true };
  } catch (error) {
    console.warn('Rate limiter error (allowing request):', error);
    return { allowed: true };
  }
}

export function resetRateLimit(): void {
  try {
    sessionStorage.removeItem(RATE_LIMIT_KEY);
  } catch (error) {
    console.warn('Failed to reset rate limit:', error);
  }
}

export function getRemainingRequests(): number {
  try {
    const stored = sessionStorage.getItem(RATE_LIMIT_KEY);
    if (!stored) return MAX_REQUESTS;

    const data: RateLimitStore = JSON.parse(stored);
    const now = Date.now();

    const validTimestamps = data.timestamps.filter(
      (timestamp) => now - timestamp <= TIME_WINDOW
    );

    return Math.max(0, MAX_REQUESTS - validTimestamps.length);
  } catch (error) {
    console.warn('Failed to get remaining requests:', error);
    return MAX_REQUESTS;
  }
}


export function getTimeUntilReset(): number {
  try {
    const now = Date.now();
    const stored = sessionStorage.getItem(RATE_LIMIT_KEY);
    if (!stored) return 0;

    const data: RateLimitStore = JSON.parse(stored);

    const validTimestamps = data.timestamps.filter(
      (timestamp) => now - timestamp <= TIME_WINDOW
    );

    if (validTimestamps.length < MAX_REQUESTS) return 0;

    const oldestTimestamp = Math.min(...validTimestamps);
    const timeUntilReset = Math.ceil(
      (TIME_WINDOW - (now - oldestTimestamp)) / 1000
    );

    return Math.max(0, timeUntilReset);
  } catch (error) {
    console.warn('Failed to get time until reset:', error);
    return 0;
  }
}


export function isRateLimited(): boolean {
  try {
    const now = Date.now();
    const stored = sessionStorage.getItem(RATE_LIMIT_KEY);
    if (!stored) return false;

    const data: RateLimitStore = JSON.parse(stored);
    const validTimestamps = data.timestamps.filter(
      (timestamp) => now - timestamp <= TIME_WINDOW
    );

    return validTimestamps.length >= MAX_REQUESTS;
  } catch (error) {
    console.warn('Failed to check rate limit status:', error);
    return false;
  }
}

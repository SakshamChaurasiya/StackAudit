/**
 * In-memory sliding window rate limiter.
 *
 * Tracks request timestamps per key (typically IP address).
 * Suitable for single-instance deployments (Vercel Serverless per-region).
 * For multi-region production, replace with Upstash Redis.
 */

type RateLimitStore = Map<string, number[]>;

const store: RateLimitStore = new Map();

export type RateLimitOptions = {
  /** Maximum number of requests allowed in the window. */
  maxRequests: number;
  /** Window duration in milliseconds. */
  windowMs: number;
};

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterMs: number };

// Presets for common server actions
export const AUDIT_LIMIT: RateLimitOptions = {
  maxRequests: 5,
  windowMs: 60_000, // 5 audits per minute
};

export const LEAD_LIMIT: RateLimitOptions = {
  maxRequests: 3,
  windowMs: 10 * 60_000, // 3 lead submissions per 10 minutes
};

/**
 * Checks and records a request attempt for the given key.
 *
 * @param key - Identifier for the requester, typically an IP address.
 * @param options - Rate limit configuration.
 * @returns `{ allowed: true }` or `{ allowed: false, retryAfterMs }`.
 */
export function checkRateLimit(
  key: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - options.windowMs;

  // Get existing timestamps for this key, filter to current window only
  const timestamps = (store.get(key) ?? []).filter((t) => t > windowStart);

  if (timestamps.length >= options.maxRequests) {
    // Calculate how long until the oldest request falls out of the window
    const oldestInWindow = timestamps[0];
    const retryAfterMs = oldestInWindow + options.windowMs - now;
    return { allowed: false, retryAfterMs: Math.max(retryAfterMs, 1000) };
  }

  // Record this request and save back
  timestamps.push(now);
  store.set(key, timestamps);

  // Periodic cleanup: remove keys with no recent activity (older than 2× window)
  if (Math.random() < 0.05) {
    const cleanupThreshold = now - options.windowMs * 2;
    for (const [k, ts] of store.entries()) {
      if (ts.every((t) => t < cleanupThreshold)) {
        store.delete(k);
      }
    }
  }

  return { allowed: true };
}

/**
 * Extracts the client IP from Next.js request headers.
 * Falls back to a placeholder in development (no real IP available).
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}

import { describe, it, expect, beforeEach, vi } from "vitest";
import { checkRateLimit, AUDIT_LIMIT, LEAD_LIMIT } from "@/lib/security/rate-limit";

// Each test needs a unique key to avoid cross-contamination from other tests.
let testKey: string;
beforeEach(() => {
  testKey = `test-ip-${Math.random().toString(36).slice(2)}`;
});

describe("checkRateLimit", () => {
  it("allows requests under the limit", () => {
    for (let i = 0; i < AUDIT_LIMIT.maxRequests; i++) {
      const result = checkRateLimit(testKey, AUDIT_LIMIT);
      expect(result.allowed).toBe(true);
    }
  });

  it("blocks the request that exceeds the limit", () => {
    for (let i = 0; i < AUDIT_LIMIT.maxRequests; i++) {
      checkRateLimit(testKey, AUDIT_LIMIT);
    }
    const blocked = checkRateLimit(testKey, AUDIT_LIMIT);
    expect(blocked.allowed).toBe(false);
    if (!blocked.allowed) {
      expect(blocked.retryAfterMs).toBeGreaterThan(0);
    }
  });

  it("provides a retryAfterMs value when blocked", () => {
    for (let i = 0; i < AUDIT_LIMIT.maxRequests; i++) {
      checkRateLimit(testKey, AUDIT_LIMIT);
    }
    const result = checkRateLimit(testKey, AUDIT_LIMIT);
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      // retryAfterMs should be within window duration (max) and at least 1s (min)
      expect(result.retryAfterMs).toBeGreaterThanOrEqual(1000);
      expect(result.retryAfterMs).toBeLessThanOrEqual(AUDIT_LIMIT.windowMs);
    }
  });

  it("isolates different IPs independently", () => {
    const ipA = `ip-a-${Math.random()}`;
    const ipB = `ip-b-${Math.random()}`;

    // Exhaust ipA
    for (let i = 0; i < AUDIT_LIMIT.maxRequests; i++) {
      checkRateLimit(ipA, AUDIT_LIMIT);
    }
    expect(checkRateLimit(ipA, AUDIT_LIMIT).allowed).toBe(false);

    // ipB should still be allowed
    expect(checkRateLimit(ipB, AUDIT_LIMIT).allowed).toBe(true);
  });

  it("uses LEAD_LIMIT preset correctly", () => {
    const key = `lead-${Math.random()}`;
    for (let i = 0; i < LEAD_LIMIT.maxRequests; i++) {
      const r = checkRateLimit(key, LEAD_LIMIT);
      expect(r.allowed).toBe(true);
    }
    const blocked = checkRateLimit(key, LEAD_LIMIT);
    expect(blocked.allowed).toBe(false);
  });

  it("allows requests again after window resets (simulated)", () => {
    vi.useFakeTimers();
    try {
      const windowMs = 10000;
      const windowOptions = { maxRequests: 1, windowMs };
      const key = `window-reset-${Math.random()}`;

      // Set initial time
      const startTime = 1000000000000;
      vi.setSystemTime(new Date(startTime));

      // First request — allowed
      expect(checkRateLimit(key, windowOptions).allowed).toBe(true);

      // Second request at same time — blocked
      expect(checkRateLimit(key, windowOptions).allowed).toBe(false);

      // Advance time by 11 seconds (past the 10s windowMs)
      vi.setSystemTime(new Date(startTime + 11000));

      // Third request — allowed again
      expect(checkRateLimit(key, windowOptions).allowed).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});

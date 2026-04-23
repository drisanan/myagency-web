/**
 * Tiny in-process rate limiter for sensitive endpoints.
 *
 * Scope: per-Lambda-container, per-key. This is intentionally not a global
 * rate limit -- for the throughput expected in Phase 7 (a handful of domain
 * attaches per agency per day) a container-local counter is sufficient and
 * avoids an extra DynamoDB round-trip on the hot path.
 *
 * For stronger multi-container guarantees, the same API surface can be backed
 * by a DynamoDB-conditional-update counter keyed on AGENCY#<id>/RATELIMIT#...
 * without any caller changes.
 */

type Bucket = { count: number; windowStart: number };

const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

export function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now - existing.windowStart >= windowMs) {
    const bucket: Bucket = { count: 1, windowStart: now };
    buckets.set(key, bucket);
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.windowStart + windowMs,
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: limit - existing.count,
    resetAt: existing.windowStart + windowMs,
  };
}

export function resetRateLimit(): void {
  buckets.clear();
}

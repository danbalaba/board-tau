import { Ratelimit } from "@upstash/ratelimit";
import redis from "./redis";

/**
 * API Rate Limiting Configuration
 * Uses Upstash Redis to track requests across serverless instances.
 */

// 50 requests per 1 minute (Relaxed for Demo)
export const strictLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(50, "1 m"),
  analytics: true,
  prefix: "ratelimit:strict",
});

// 2. Public Limiter: For public-facing read-heavy routes (Listings, Search, Reviews)
// 20 requests per 10 seconds
export const publicLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(20, "10 s"),
  analytics: true,
  prefix: "ratelimit:public",
});

// 3. Standard Limiter: For authenticated user/landlord transactions
// 50 requests per 10 seconds
export const standardLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(50, "10 s"),
  analytics: true,
  prefix: "ratelimit:standard",
});

// 4. Admin Limiter: Relaxed limit for administrative tasks
// 100 requests per 1 minute
export const adminLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  analytics: true,
  prefix: "ratelimit:admin",
});

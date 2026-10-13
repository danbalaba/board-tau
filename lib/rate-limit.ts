import { Ratelimit } from "@upstash/ratelimit";
import redis from "./redis";

/**
 * API Rate Limiting Configuration
 * Uses Upstash Redis to track requests across serverless instances.
 */

// 1. Strict Limiter: For sensitive Auth, Payments, and Host Application submissions
// 40 requests per 1 minute
export const strictLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(40, "1 m"),
  analytics: true,
  prefix: "ratelimit:strict",
});

// 2. AI Limiter: Dedicated generous tier for AI Chat, Spotlight Search, Suggestions, and Compare
// 60 requests per 1 minute (Allows active back-and-forth conversation, suggestion chips, and follow-ups)
export const aiLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(60, "1 m"),
  analytics: true,
  prefix: "ratelimit:ai",
});

// 3. Public Limiter: For public-facing read-heavy discovery routes (Listings browse, Map, Colleges, Room Types)
// 120 requests per 1 minute
export const publicLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(120, "1 m"),
  analytics: true,
  prefix: "ratelimit:public",
});

// 4. Standard Limiter: For authenticated user and landlord transactions (Properties, Rooms, Bookings, Messages)
// 180 requests per 1 minute
export const standardLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(180, "1 m"),
  analytics: true,
  prefix: "ratelimit:standard",
});

// 5. Admin Limiter: Generous limit for administrative operations, audit reviews, and user management
// 200 requests per 1 minute
export const adminLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(200, "1 m"),
  analytics: true,
  prefix: "ratelimit:admin",
});

// 6. Contact Form Limiter: Strict limit to prevent email spam/bots
// 3 requests per 1 minute
export const contactLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
  prefix: "ratelimit:contact",
});

// 7. KYC Verification Limiter: Protect AWS Rekognition from spam & billing attacks
// 10 requests per 1 minute per user/IP
export const kycLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "ratelimit:kyc",
});


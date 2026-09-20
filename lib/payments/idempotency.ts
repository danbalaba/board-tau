import redis from "@/lib/redis";

/**
 * Checks if a payment webhook event has already been processed to guarantee idempotency.
 * Prevents duplicate booking creation or duplicate confirmation emails if payment gateways (Stripe/PayMongo) retry delivery.
 */
export async function isWebhookEventProcessed(eventId: string): Promise<boolean> {
  if (!eventId) return false;
  try {
    const key = `webhook_event:${eventId}`;
    const exists = await redis.get(key);
    return !!exists;
  } catch (err) {
    console.warn('[Idempotency] Failed to check webhook event in Redis:', err);
    return false;
  }
}

/**
 * Marks a payment webhook event as processed with a 7-day TTL (time-to-live).
 */
export async function markWebhookEventProcessed(eventId: string): Promise<void> {
  if (!eventId) return;
  try {
    const key = `webhook_event:${eventId}`;
    // 7 days in seconds = 604800
    await redis.set(key, "processed", { ex: 604800 });
  } catch (err) {
    console.warn('[Idempotency] Failed to store webhook event in Redis:', err);
  }
}

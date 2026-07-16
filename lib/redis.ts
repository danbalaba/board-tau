import { Redis } from '@upstash/redis';

/**
 * REST-based Redis client for Upstash.
 * This is the gold standard for Next.js/Vercel as it handles
 * stateless connections via HTTP, preventing connection leaks.
 */
let redis: Redis;

try {
  // Only attempt to initialize if the env variables are present to prevent build-time crashes in CI environments
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } else {
    // Fallback/Mock client for build time or development without Redis credentials
    redis = new Redis({
      url: 'https://placeholder-redis.upstash.io',
      token: 'placeholder-token',
    });
  }
} catch (e) {
  // Fail-safe initialization
  redis = new Redis({
    url: 'https://placeholder-redis.upstash.io',
    token: 'placeholder-token',
  });
}

// Date reviver for JSON.parse to handle ISO date strings
const dateReviver = (_key: string, value: any) => {
  const isDateString = typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value);
  return isDateString ? new Date(value) : value;
};

// Cache operations helper
export const cache = {
  /**
   * Generates a stable cache key by sorting object keys
   */
  generateKey(prefix: string, params: any): string {
    if (!params) return prefix;
    const cleanParams = typeof params === 'object' ? params : { val: params };
    const sortedParams = Object.keys(cleanParams)
      .sort()
      .reduce((obj: any, key) => {
        obj[key] = cleanParams[key];
        return obj;
      }, {});

    return `${prefix}:${JSON.stringify(sortedParams)}`;
  },

  /**
   * Get cached data
   */
  async get(key: string): Promise<any | null> {
    try {
      const data = await redis.get(key);
      if (!data) return null;

      // If the data is already an object (Upstash REST does this sometimes),
      // we just return it. Otherwise, we parse it with our dateReviver.
      if (typeof data === 'object') return data;

      return typeof data === 'string' ? JSON.parse(data, dateReviver) : data;
    } catch (error) {
      console.error('Cache get error for key %s:', key, error);
      return null;
    }
  },

  /**
   * Set data in cache
   * @param ttl Time to live in seconds (default: 1 hour)
   */
  async set(key: string, data: any, ttl: number = 3600): Promise<boolean> {
    try {
      // By using JSON.stringify here, we ensure our format is consistent
      await redis.set(key, JSON.stringify(data), { ex: ttl });
      return true;
    } catch (error) {
      console.error('Cache set error for key %s:', key, error);
      return false;
    }
  },

  /**
   * Delete cached data
   */
  async del(key: string): Promise<boolean> {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error for key %s:', key, error);
      return false;
    }
  },

  /**
   * Delete multiple keys by pattern (Note: patterns are slower in REST)
   */
  async delPattern(pattern: string): Promise<boolean> {
    try {
      // Step 1: Find keys (Warning: Upstash REST 'keys' has limits)
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return true;
    } catch (error) {
      console.error('Cache delete pattern error for pattern %s:', pattern, error);
      return false;
    }
  },

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists check error for key %s:', key, error);
      return false;
    }
  },

  /**
   * Clear all cache
   */
  async flush(): Promise<boolean> {
    try {
      await redis.flushdb();
      return true;
    } catch (error) {
      console.error('Cache flush error:', error);
      return false;
    }
  },
};

export default redis;

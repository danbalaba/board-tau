import Redis from 'ioredis';

// Create Redis connection
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Handle connection events
redis.on('connect', () => {
  console.log('Connected to Redis');
});

redis.on('error', (error) => {
  console.error('Redis connection error:', error);
});

// Cache operations
export const cache = {
  /**
   * Get cached data
   * @param key Cache key
   * @returns Promise<null | any> Cached data or null
   */
  async get(key: string): Promise<any | null> {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error for key %s:', key, error);
      return null;
    }
  },

  /**
   * Set data in cache
   * @param key Cache key
   * @param data Data to cache
   * @param ttl Time to live in seconds (default: 1 hour)
   * @returns Promise<boolean> Success status
   */
  async set(key: string, data: any, ttl: number = 3600): Promise<boolean> {
    try {
      await redis.set(key, JSON.stringify(data), 'EX', ttl);
      return true;
    } catch (error) {
      console.error('Cache set error for key %s:', key, error);
      return false;
    }
  },

  /**
   * Delete cached data
   * @param key Cache key
   * @returns Promise<boolean> Success status
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
   * Check if key exists in cache
   * @param key Cache key
   * @returns Promise<boolean> Existence status
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
   * Get cache TTL (time to live)
   * @param key Cache key
   * @returns Promise<number> TTL in seconds (-1 if key doesn't exist or is persistent)
   */
  async ttl(key: string): Promise<number> {
    try {
      return await redis.ttl(key);
    } catch (error) {
      console.error('Cache TTL check error for key %s:', key, error);
      return -1;
    }
  },

  /**
   * Clear all cache (use with caution)
   * @returns Promise<boolean> Success status
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

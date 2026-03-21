# BoardTAU Caching Strategy

## Overview

This document outlines the caching strategy implemented for the BoardTAU capstone project to improve performance and scalability.

## Cache Architecture

### 1. Client-Side Caching (React Query)

#### Configuration
```typescript
// components/common/Provider.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['listings'] });
        queryClient.invalidateQueries({ queryKey: ['properties'] });
        queryClient.invalidateQueries({ queryKey: ['reservations'] });
        queryClient.invalidateQueries({ queryKey: ['analytics'] });
      },
    },
  },
});
```

#### Key Features:
- **Stale Time**: Data remains fresh for 5 minutes
- **GC Time**: Cache entries are retained for 10 minutes
- **Refetch Behavior**: Disabled on window focus, enabled on reconnect
- **Mutation Invalidation**: Automatically invalidates relevant caches on mutation success

### 2. Server-Side Caching (Redis)

#### Connection Management
```typescript
// lib/redis.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export const cache = {
  async get(key: string): Promise<any | null> {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  },

  async set(key: string, data: any, ttl: number = 3600): Promise<boolean> {
    await redis.set(key, JSON.stringify(data), 'EX', ttl);
    return true;
  },

  async del(key: string): Promise<boolean> {
    await redis.del(key);
    return true;
  },

  // Additional methods: exists, ttl, flush
};

export default redis;
```

## Cached Endpoints

### 1. Listings API (`/api/listings`)
- **Cache Key**: `listings:${JSON.stringify(queryParams)}`
- **TTL**: 10 minutes (600 seconds)
- **Cache Logic**:
  - Creates unique cache keys based on query parameters
  - Serves from cache if available
  - Fetches from database and caches on first request

### 2. Admin Analytics API (`/api/admin/analytics`)
- **Cache Key**: `admin:analytics`
- **TTL**: 30 minutes (1800 seconds)
- **Cache Logic**:
  - Caches aggregated analytics data
  - Suitable for infrequently changing data

### 3. Landlord Properties API (`/api/landlord/properties`)
- **Cache Key**: `landlord:properties` or `landlord:properties:${cursor}` (for pagination)
- **TTL**: 15 minutes (900 seconds)
- **Cache Logic**:
  - Supports cursor-based pagination
  - Invalidates cache on property creation/update/delete

## Cache Invalidation

### Property Mutations
When a property is created, updated, or deleted, the following caches are invalidated:
- `landlord:properties` - Landlord properties list
- `listings:{} - Empty query (default listings)`

### Manual Invalidation
```typescript
import { cache } from '@/lib/redis';

// Invalidate a specific cache key
await cache.del('listings:{"location":"Singapore"}');

// Invalidate all listings caches (use with caution)
// Note: This would require pattern matching support
```

## Performance Benefits

### Before Caching
- Each API request fetches fresh data from MongoDB
- High database load under traffic
- Slow response times for frequent requests

### After Caching
- Most frequent requests served from cache
- Reduced database load
- Faster response times
- Better scalability

## Environment Setup

### Local Development
1. Install Redis: https://redis.io/download/
2. Start Redis server
3. Add to `.env.local`:
   ```
   REDIS_URL=redis://localhost:6379
   ```

### Production
- Use managed Redis service (AWS Elasticache, Redis Labs, or Vercel KV)
- Configure `REDIS_URL` environment variable

## Monitoring and Debugging

### Cache Hits/Misses
Each cached endpoint logs when data is served from cache or database:
```
Serving listings from cache
Serving admin analytics from database
```

### Cache Health Check
```typescript
import { cache } from '@/lib/redis';

async function checkCacheHealth() {
  try {
    await cache.set('health:check', { timestamp: Date.now() }, 60);
    const data = await cache.get('health:check');
    return !!data;
  } catch (error) {
    return false;
  }
}
```

## Future Improvements

### 1. Advanced Caching Strategies
- **Cache Tagging**: Group related cache keys for targeted invalidation
- **Rate Limiting**: Prevent cache stampedes
- **Warm-up**: Pre-cache data for popular queries

### 2. Performance Metrics
- Track cache hit rate
- Monitor cache memory usage
- Measure response time improvements

### 3. Edge Caching
- CDN integration (Cloudflare, Vercel Edge Network)
- Static page generation with ISR
- Edge API routes with Redis

## Conclusion

The implemented caching strategy provides a significant performance boost by:
1. Caching frequently accessed data at both client and server levels
2. Reducing database load
3. Improving response times
4. Enabling horizontal scaling

This architecture is well-suited for a capstone project and demonstrates best practices in performance optimization.

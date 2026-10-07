import { edgeStoreRouter } from '@/lib/edgestore-router';

/**
 * Lazy proxy wrapper for EdgeStore backend client.
 * Prevents throwing EdgeStoreCredentialsError during Next.js build-time static evaluation
 * when EDGE_STORE_ACCESS_KEY or EDGE_STORE_SECRET_KEY environment variables are missing.
 */
export const backendClient = new Proxy({} as typeof edgeStoreRouter.client, {
  get(_target, prop) {
    const client = edgeStoreRouter.client;
    if (typeof client === 'string') {
      return client;
    }
    return (client as any)?.[prop];
  },
});

import { initEdgeStoreClient } from '@edgestore/server/core';
import { edgeStoreRouter } from '@/lib/edgestore-router';

export const backendClient = initEdgeStoreClient({
  router: edgeStoreRouter,
});

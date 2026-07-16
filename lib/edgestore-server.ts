import { initEdgeStoreClient } from '@edgestore/server/core';
import { edgeStoreRouter } from '@/lib/edgestore-router';

export const backendClient = initEdgeStoreClient({
  router: edgeStoreRouter,
  baseUrl: process.env.NEXTAUTH_URL
    ? `${process.env.NEXTAUTH_URL}/api/edgestore`
    : 'http://localhost:3000/api/edgestore',
});

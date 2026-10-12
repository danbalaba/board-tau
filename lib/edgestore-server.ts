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

/**
 * Extracts the real remote EdgeStore URL if the URL is wrapped by the local EdgeStore proxy.
 */
export function extractEdgeStoreRealUrl(url: string): string {
  if (!url) return '';
  let targetUrl = url;
  if (url.includes('/api/edgestore/proxy-file')) {
    try {
      const urlObj = url.startsWith('http')
        ? new URL(url)
        : new URL(url, process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
      const extractedUrl = urlObj.searchParams.get('url');
      if (extractedUrl) targetUrl = extractedUrl;
    } catch (err) {
      console.error('[EdgeStore] Failed to parse proxied URL:', url, err);
    }
  }
  return targetUrl;
}

/**
 * Safely delete a file from EdgeStore without throwing unhandled exceptions.
 * Uses .delete({ url }) or .deleteFile({ url }) depending on bucket client implementation,
 * and swallows errors to ensure DB operations are never aborted by file cleanup failures.
 */
export async function safeDeleteEdgeStoreFile(
  bucketName: 'publicFiles' | 'identityDocs' | 'reviewMedia' | 'cronBackups' | 'reportAudits' | string,
  rawUrl: string
): Promise<boolean> {
  try {
    const targetUrl = extractEdgeStoreRealUrl(rawUrl);
    if (!targetUrl || !targetUrl.startsWith('http')) {
      return false;
    }

    const bucket = (backendClient as any)?.[bucketName];
    if (!bucket) {
      console.warn(`[EdgeStore] Bucket "${bucketName}" not found on backendClient.`);
      return false;
    }

    if (typeof bucket.delete === 'function') {
      await bucket.delete({ url: targetUrl });
      return true;
    } else if (typeof bucket.deleteFile === 'function') {
      await bucket.deleteFile({ url: targetUrl });
      return true;
    } else {
      console.warn(`[EdgeStore] No delete method found on bucket "${bucketName}".`);
      return false;
    }
  } catch (err: any) {
    console.warn(`[EdgeStore] Non-fatal error deleting file "${rawUrl}":`, err?.message || err);
    return false;
  }
}

/**
 * Safely deletes multiple files in parallel using Promise.allSettled.
 */
export async function safeDeleteEdgeStoreFiles(
  bucketName: 'publicFiles' | 'identityDocs' | 'reviewMedia' | 'cronBackups' | 'reportAudits' | string,
  urls: (string | null | undefined)[]
): Promise<void> {
  const validUrls = Array.from(
    new Set(urls.filter((u): u is string => typeof u === 'string' && u.trim().length > 0))
  );

  if (validUrls.length === 0) return;

  await Promise.allSettled(
    validUrls.map((url) => safeDeleteEdgeStoreFile(bucketName, url))
  );
}

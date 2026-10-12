import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { createEdgeStoreSdk, type ProjectEdgeStoreSdk, type ProjectCredentials } from '@edgestore/sdk';

let cachedSdk: ProjectEdgeStoreSdk | null = null;

function getEdgeStoreSdk(): ProjectEdgeStoreSdk | null {
  if (!cachedSdk) {
    const accessKey = process.env.EDGE_STORE_ACCESS_KEY || process.env.EDGESTORE_ACCESS_KEY;
    const secretKey = process.env.EDGE_STORE_SECRET_KEY || process.env.EDGESTORE_SECRET_KEY;
    if (accessKey && secretKey) {
      cachedSdk = createEdgeStoreSdk({
        credentials: { accessKey, secretKey } as ProjectCredentials,
      });
    }
  }
  return cachedSdk;
}

/**
 * Secure Same-Origin Document Streaming Proxy
 * Solves Chrome's cross-origin / localhost iframe PDF block and EdgeStore 403 authorization locks.
 * Generates an expiring signed read URL server-side and streams the binary content back from
 * the application's own origin with 'inline' headers so it renders natively inside iframes.
 */
export async function GET(req: NextRequest) {
  try {
    const secret = process.env.NEXTAUTH_SECRET;
    const token = await getToken({
      req: req as any,
      secret,
    });

    if (!token) {
      return new NextResponse('Unauthorized: Please log in to view compliance documents.', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const rawUrl = searchParams.get('url');

    if (!rawUrl) {
      return new NextResponse('Missing "url" parameter', { status: 400 });
    }

    // Only allow HTTP/HTTPS URLs
    if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
      return new NextResponse('Invalid document URL', { status: 400 });
    }

    let fetchUrl = rawUrl;

    // If it's a private EdgeStore file in identityDocs, generate a temporary signed read URL using official SDK
    if (rawUrl.includes('identityDocs') || rawUrl.includes('esfiles.dev') || rawUrl.includes('edgestore.dev')) {
      try {
        const sdk = getEdgeStoreSdk();
        if (sdk) {
          let bucketName = 'identityDocs';
          if (rawUrl.includes('/identityDocs/')) {
            bucketName = 'identityDocs';
          } else if (rawUrl.includes('/publicFiles/')) {
            bucketName = 'publicFiles';
          }

          const res = await sdk.runtime.files.generateSignedReadUrls({
            bucket: bucketName,
            urls: [rawUrl],
            expiresIn: 3600, // 1 hour
          });

          const signedUrl = res.signedUrls?.[0]?.signedUrl;
          if (signedUrl) {
            fetchUrl = signedUrl;
            console.log('[Doc View Proxy] Signed read URL generated successfully for:', bucketName);
          } else {
            console.warn('[Doc View Proxy] No signedUrl in response:', res);
          }
        } else {
          console.warn('[Doc View Proxy] EdgeStore credentials not available for SDK initialization.');
        }
      } catch (signErr: any) {
        console.error('[Doc View Proxy] generateSignedReadUrls failed:', signErr?.message || signErr);
      }
    }

    // Fetch the document from storage
    const upstreamRes = await fetch(fetchUrl);
    if (!upstreamRes.ok) {
      console.error('[Doc View Proxy] Upstream fetch failed:', upstreamRes.status, 'Target:', fetchUrl);
      return new NextResponse(`Failed to fetch document (${upstreamRes.status}): ${upstreamRes.statusText}`, {
        status: upstreamRes.status,
      });
    }

    const contentType = upstreamRes.headers.get('content-type') || 'application/pdf';
    const fileBuffer = await upstreamRes.arrayBuffer();

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'inline',
        'Cache-Control': 'private, max-age=3600, stale-while-revalidate=86400',
        // Allow embedding within iframes on this origin
        'Content-Security-Policy': "frame-ancestors 'self'",
      },
    });
  } catch (error: any) {
    console.error('[Doc View Proxy Server Error]:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

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

const ALLOWED_DOCUMENT_HOSTS = [
  'files.edgestore.dev',
  'edgestore.dev',
  's3.ap-southeast-1.amazonaws.com',
  's3.amazonaws.com',
  'res.cloudinary.com',
  'images.unsplash.com',
] as const;

function sanitizeForLog(value: unknown): string {
  return String(value).replace(/[\r\n]/g, ' ').slice(0, 500);
}

function validateAndSanitizeUrl(inputUrl: string): { ok: true; safeUrl: string; hostname: string } | { ok: false; error: string; status: number } {
  try {
    const parsed = new URL(inputUrl);

    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return { ok: false, error: 'Only HTTP and HTTPS protocols are permitted', status: 400 };
    }

    const hostname = parsed.hostname.toLowerCase();

    // Block private, loopback, and cloud metadata addresses (SSRF prevention)
    const isPrivateOrLoopback =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '::1' ||
      hostname === '169.254.169.254' ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.local') ||
      (hostname.startsWith('172.') && (() => {
        const secondOctet = parseInt(hostname.split('.')[1] || '0', 10);
        return secondOctet >= 16 && secondOctet <= 31;
      })());

    if (isPrivateOrLoopback) {
      return { ok: false, error: 'Access to local or private network addresses is restricted', status: 403 };
    }

    // Exact host match against allowed storage hosts
    const exactMatchedHost = ALLOWED_DOCUMENT_HOSTS.find((h) => h === hostname);

    // Authorized EdgeStore & S3 subdomains match
    const isAllowedSubdomain =
      /^[a-zA-Z0-9-_.]+\.esfiles\.dev$/.test(hostname) ||
      /^[a-zA-Z0-9-_.]+\.edgestore\.dev$/.test(hostname) ||
      /^[a-zA-Z0-9-_.]+\.s3(\.[a-z0-9-]+)?\.amazonaws\.com$/.test(hostname);

    if (!exactMatchedHost && !isAllowedSubdomain) {
      return { ok: false, error: 'Target document host is not permitted', status: 403 };
    }

    const safeHost = exactMatchedHost || hostname;
    // Reconstruct URL using sanitized safeHost to break CodeQL SSRF taint flow
    const safeUrl = `${parsed.protocol}//${safeHost}${parsed.pathname}${parsed.search}`;
    return { ok: true, safeUrl, hostname: safeHost };
  } catch {
    return { ok: false, error: 'Malformed document URL', status: 400 };
  }
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

    // Validate raw URL against SSRF guardrails and host allowlist
    const validation = validateAndSanitizeUrl(rawUrl);
    if (!validation.ok) {
      return new NextResponse(validation.error, { status: validation.status });
    }

    let fetchUrl = validation.safeUrl;

    // If it's a private EdgeStore file in identityDocs, generate a temporary signed read URL using official SDK
    if (validation.hostname.includes('identityDocs') || validation.hostname.includes('esfiles.dev') || validation.hostname.includes('edgestore.dev') || rawUrl.includes('identityDocs')) {
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
            urls: [validation.safeUrl],
            expiresIn: 3600, // 1 hour
          });

          const signedUrl = res.signedUrls?.[0]?.signedUrl;
          if (signedUrl) {
            const signedValidation = validateAndSanitizeUrl(signedUrl);
            if (signedValidation.ok) {
              fetchUrl = signedValidation.safeUrl;
              console.log('[Doc View Proxy] Signed read URL generated successfully for:', sanitizeForLog(bucketName));
            } else {
              console.warn('[Doc View Proxy] Signed URL validation failed:', sanitizeForLog(signedValidation.error));
            }
          } else {
            console.warn('[Doc View Proxy] No signedUrl in response:', sanitizeForLog(JSON.stringify(res)));
          }
        } else {
          console.warn('[Doc View Proxy] EdgeStore credentials not available for SDK initialization.');
        }
      } catch (signErr: any) {
        console.error('[Doc View Proxy] generateSignedReadUrls failed:', sanitizeForLog(signErr?.message || signErr));
      }
    }

    // Final security validation before upstream network request
    const finalValidation = validateAndSanitizeUrl(fetchUrl);
    if (!finalValidation.ok) {
      return new NextResponse(finalValidation.error, { status: finalValidation.status });
    }

    // Fetch the document from storage
    const upstreamRes = await fetch(finalValidation.safeUrl);
    if (!upstreamRes.ok) {
      console.error('[Doc View Proxy] Upstream fetch failed:', upstreamRes.status, 'Target:', sanitizeForLog(finalValidation.safeUrl));
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
    console.error('[Doc View Proxy Server Error]:', sanitizeForLog(error?.message || error));
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

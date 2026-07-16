import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { decryptMessage } from '@/lib/encryption';

export async function GET(req: NextRequest) {
  try {
    // 1. Verify the requester is a Super Admin
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get the EdgeStore URL from query params
    const { searchParams } = new URL(req.url);
    const fileUrl = searchParams.get('url');

    if (!fileUrl) {
      return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    // 3. The URL stored in the DB is AES-256-GCM encrypted — decrypt it server-side
    //    The raw EdgeStore URL is never exposed to the browser at any point
    const rawUrl = decryptMessage(fileUrl);

    // 4. Validate the decrypted URL strictly belongs to EdgeStore (security check to prevent SSRF)
    let urlObj: URL;
    try {
      urlObj = new URL(rawUrl);
    } catch (e) {
      return NextResponse.json({ error: 'Malformed URL reference' }, { status: 400 });
    }

    const isSecure = urlObj.protocol === 'https:';
    if (!isSecure) {
      console.error('[BACKUP_DOWNLOAD] Decrypted URL is not secure:', rawUrl.substring(0, 50));
      return NextResponse.json({ error: 'Invalid or tampered file reference' }, { status: 400 });
    }

    // Parse path segments using a strict regex whitelist to sanitize input and break CodeQL taint path
    const match = urlObj.pathname.match(/^\/([a-zA-Z0-9\-_]+)\/([a-zA-Z0-9\-_]+)\/(?:([a-zA-Z0-9\-_]+)\/)?([a-zA-Z0-9\-_.]+)\.json$/);
    if (!match) {
      console.error('[BACKUP_DOWNLOAD] Path does not match safe pattern:', urlObj.pathname);
      return NextResponse.json({ error: 'Invalid file reference format' }, { status: 400 });
    }

    const folder1 = match[1];
    const folder2 = match[2];
    const folder3 = match[3]; // Optional sub-folder (might be undefined)
    const fileBaseName = match[4];

    // Reconstruct the path using only the whitelisted matched segments
    const safePath = folder3 
      ? `/${folder1}/${folder2}/${folder3}/${fileBaseName}.json`
      : `/${folder1}/${folder2}/${fileBaseName}.json`;

    // 5. Reconstruct the URL using strictly hardcoded string literals to prevent SSRF and clear CodeQL taint tracking
    let safeUrl = '';
    if (urlObj.hostname === 'files.edgestore.dev') {
      safeUrl = `https://files.edgestore.dev${safePath}`;
    } else if (urlObj.hostname === 'edgestore.dev') {
      safeUrl = `https://edgestore.dev${safePath}`;
    } else {
      console.error('[BACKUP_DOWNLOAD] Hostname is not a valid EdgeStore origin:', urlObj.hostname);
      return NextResponse.json({ error: 'Invalid or tampered file reference' }, { status: 400 });
    }

    const fileRes = await fetch(safeUrl);
    
    if (!fileRes.ok) {
      console.error('[BACKUP_DOWNLOAD] Fetch failed:', fileRes.status, fileRes.statusText);
      return NextResponse.json({ error: 'Failed to fetch file from storage' }, { status: 502 });
    }

    // 6. Decrypt the file content before sending it to the user
    const encryptedContent = await fileRes.text();
    const decryptedContent = decryptMessage(encryptedContent);

    // 7. Stream the decrypted file back to the browser as a download
    const downloadName = fileBaseName ? `${fileBaseName}.json` : 'backup.json';
    return new NextResponse(decryptedContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${downloadName}"`,
      },
    });
  } catch (error: any) {
    console.error('[BACKUP_DOWNLOAD_ERROR]', error);
    return NextResponse.json({ error: 'Download failed', details: error.message }, { status: 500 });
  }
}

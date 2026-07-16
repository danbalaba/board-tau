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

    // 4. Validate the decrypted URL belongs to EdgeStore (security check)
    if (!rawUrl.includes('edgestore.dev')) {
      console.error('[BACKUP_DOWNLOAD] Decrypted URL is not an EdgeStore URL:', rawUrl.substring(0, 30));
      return NextResponse.json({ error: 'Invalid or tampered file reference' }, { status: 400 });
    }

    // 5. Directly fetch the file server-to-server using the decrypted raw URL
    const fileRes = await fetch(rawUrl);
    
    if (!fileRes.ok) {
      console.error('[BACKUP_DOWNLOAD] Fetch failed:', fileRes.status, fileRes.statusText);
      return NextResponse.json({ error: 'Failed to fetch file from storage' }, { status: 502 });
    }

    // 6. Decrypt the file content before sending it to the user
    const encryptedContent = await fileRes.text();
    const decryptedContent = decryptMessage(encryptedContent);

    // 7. Stream the decrypted file back to the browser as a download
    const filename = rawUrl.split('/').pop() || 'backup.json';
    return new NextResponse(decryptedContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('[BACKUP_DOWNLOAD_ERROR]', error);
    return NextResponse.json({ error: 'Download failed', details: error.message }, { status: 500 });
  }
}

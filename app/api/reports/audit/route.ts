import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { backendClient } from '@/lib/edgestore-server';
import { encryptEntityId } from '@/lib/encryption';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { reportId, title, scope, totalItems, pdfBase64, reportType } = body;

    if (!reportId || !title) {
      return NextResponse.json({ error: 'Missing required report fields' }, { status: 400 });
    }

    let userId = (session.user as any).id;
    let userRole = (session.user as any).role || 'LANDLORD';

    if (!userId) {
      const user = await db.user.findUnique({
        where: { email: session.user.email || '' },
        select: { id: true, role: true }
      });
      userId = user?.id;
      if (user?.role) userRole = user.role;
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 });
    }

    let pdfUrl: string | null = null;
    let pdfHash: string = '';

    if (pdfBase64) {
      pdfHash = crypto.createHash('sha256').update(Buffer.from(pdfBase64, 'base64')).digest('hex');
    } else {
      pdfHash = crypto.createHash('sha256').update(`${reportId}:${title}:${totalItems}:${scope}`).digest('hex');
    }

    // Upload PDF blob to EdgeStore reportAudits bucket
    if (pdfBase64) {
      try {
        const buffer = Buffer.from(pdfBase64, 'base64');
        const blob = new Blob([buffer], { type: 'application/pdf' });

        const uploadRes = await backendClient.reportAudits.upload({
          content: {
            blob,
            extension: 'pdf',
          },
          options: {
            manualFileName: `${reportId}.pdf`,
          },
          ctx: {
            userId: userId,
            role: userRole,
          },
        });

        pdfUrl = uploadRes.url;
      } catch (uploadError) {
        console.error('[REPORT_EDGESTORE_UPLOAD_ERROR]', uploadError);
      }
    }

    const encryptedToken = encryptEntityId(reportId);

    const log = await db.adminActivityLog.create({
      data: {
        adminId: userId,
        action: 'GENERATED_SUMMARY_REPORT',
        entityType: reportType ? `Report:${reportType}` : 'SummaryReport',
        entityId: reportId,
        details: JSON.stringify({
          reportId,
          reportTitle: title,
          scope: scope || 'filtered',
          totalItems: totalItems || 0,
          pdfUrl: pdfUrl,
          pdfHash: pdfHash,
          encryptedToken: encryptedToken,
          generatedBy: session.user.name || session.user.email,
          generatedAt: new Date().toISOString()
        })
      }
    });

    return NextResponse.json({ success: true, logId: log.id, pdfUrl, pdfHash });
  } catch (error: any) {
    console.error('[REPORT_AUDIT_LOG_POST_ERROR]', error);
    return NextResponse.json({ error: 'Failed to record report audit log' }, { status: 500 });
  }
}

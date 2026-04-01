import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponseFormatter } from '@/lib/api-response';
import { PrismaErrorHandler } from '@/lib/prisma-error-handler';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        ApiResponseFormatter.error('Unauthorized', 'You must be an admin to access this resource'),
        { status: 401 }
      );
    }

    const { action, reason } = await req.json();

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        ApiResponseFormatter.error('Invalid action', 'Action must be either "approve" or "reject"'),
        { status: 400 }
      );
    }

    if (action === 'reject' && !reason) {
      return NextResponse.json(
        ApiResponseFormatter.error('Reason required', 'A reason is required for rejection'),
        { status: 400 }
      );
    }

    // Process the decision
    const status = action === 'approve' ? 'approved' : 'rejected';

    const updatedApplication = await db.hostApplication.update({
      where: { id },
      data: {
        status,
        ...(status === 'approved' ? { approvedBy: session.user.id } : { rejectedBy: session.user.id, rejectedReason: reason }),
        updatedAt: new Date(),
      },
      include: { user: true },
    });

    // If approved, update user role to HOST
    if (status === 'approved') {
      await db.user.update({
        where: { id: updatedApplication.userId },
        data: { role: 'LANDLORD' },
      });
    }

    return NextResponse.json(
      ApiResponseFormatter.success(updatedApplication, `Host application ${status} successfully`)
    );
  } catch (error) {
    const errorResponse = PrismaErrorHandler.handle(error);
    return NextResponse.json(
      ApiResponseFormatter.error(errorResponse.message, 'Failed to process host application decision', errorResponse.details),
      { status: errorResponse.status }
    );
  }
}

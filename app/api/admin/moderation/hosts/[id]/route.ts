import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponseFormatter } from '@/lib/api-response';
import { PrismaErrorHandler } from '@/lib/prisma-error-handler';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAdminAction } from '@/lib/admin';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // Check authentication
    const session = await getServerSession(authOptions);
    const role = session?.user?.role;
    if (!session || (role !== 'ADMIN' && role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        ApiResponseFormatter.error('Unauthorized', 'Admin or Super admin access required'),
        { status: 401 }
      );
    }

    const { hasPermission } = await import("@/lib/rbac");
    const permitted = await hasPermission(session.user.id, "MODERATE_HOSTS");
    if (!permitted) return NextResponse.json(
      ApiResponseFormatter.error('Forbidden', 'Missing permission MODERATE_HOSTS'),
      { status: 403 }
    );

    const { action, reason } = await req.json();

    if (!['approve', 'reject', 'archive'].includes(action)) {
      return NextResponse.json(
        ApiResponseFormatter.error('Invalid action', 'Action must be "approve", "reject", or "archive"'),
        { status: 400 }
      );
    }

    if (action === 'reject' && !reason) {
      return NextResponse.json(
        ApiResponseFormatter.error('Reason required', 'A reason is required for rejection'),
        { status: 400 }
      );
    }

    if (action === 'archive') {
      const updatedApplication = await db.hostApplication.update({
        where: { id },
        data: { isArchived: true },
        include: { user: true }
      });
      
      await logAdminAction({
        adminId: session.user.id,
        action: 'Archive Host',
        entityType: 'HostApplication',
        entityId: id,
        details: `Archived host application for user ${updatedApplication.user?.name || updatedApplication.userId}. Reason: ${reason || 'No reason provided'}`,
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
        userAgent: req.headers.get('user-agent')
      });
      
      return NextResponse.json(
        ApiResponseFormatter.success(updatedApplication, `Host application archived successfully`)
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

    // Log the admin action
    await logAdminAction({
      adminId: session.user.id,
      action: action === 'approve' ? 'Approve Host' : 'Reject Host',
      entityType: 'HostApplication',
      entityId: id,
      details: `${action === 'approve' ? 'Approved' : 'Rejected'} host application for user ${updatedApplication.user?.name || updatedApplication.userId}. Reason: ${reason || 'No reason provided'}`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: req.headers.get('user-agent')
    });

    // Add to Moderation Activity Feed
    await db.moderationLog.create({
      data: {
        adminId: session.user.id,
        action: status, // 'approved' or 'rejected'
        entityType: 'hostApplication',
        entityId: id,
        entityTitle: `Host App: ${updatedApplication.user?.name || 'User'}`,
        notes: reason || null,
      }
    });

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

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // Check authentication
    const session = await getServerSession(authOptions);
    const role = session?.user?.role;
    
    // Only SUPER_ADMIN can soft delete
    if (!session || role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        ApiResponseFormatter.error('Unauthorized', 'Super admin access required to delete'),
        { status: 401 }
      );
    }

    const { hasPermission } = await import("@/lib/rbac");
    const permitted = await hasPermission(session.user.id, "MODERATE_HOSTS");
    if (!permitted) return NextResponse.json(
      ApiResponseFormatter.error('Forbidden', 'Missing permission MODERATE_HOSTS'),
      { status: 403 }
    );

    // Soft delete by setting deletedAt
    const deletedApplication = await db.hostApplication.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      }
    });

    await logAdminAction({
      adminId: session.user.id,
      action: 'Delete Host Application',
      entityType: 'HostApplication',
      entityId: id,
      details: 'Super Admin soft-deleted host application',
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: req.headers.get('user-agent')
    });

    return NextResponse.json(
      ApiResponseFormatter.success({ id: deletedApplication.id }, 'Host application deleted successfully')
    );
  } catch (error) {
    const errorResponse = PrismaErrorHandler.handle(error);
    return NextResponse.json(
      ApiResponseFormatter.error(errorResponse.message, 'Failed to delete host application', errorResponse.details),
      { status: errorResponse.status }
    );
  }
}

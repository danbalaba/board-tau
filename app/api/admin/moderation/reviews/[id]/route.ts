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
    const permitted = await hasPermission(session.user.id, "MODERATE_REVIEWS");
    if (!permitted) return NextResponse.json(
      ApiResponseFormatter.error('Forbidden', 'Missing permission MODERATE_REVIEWS'),
      { status: 403 }
    );

    const { action, reason, banUser } = await req.json();

    if (!['approve', 'reject', 'archive'].includes(action)) {
      return NextResponse.json(
        ApiResponseFormatter.error('Invalid action', 'Action must be "approve", "reject", or "archive"'),
        { status: 400 }
      );
    }

    // Process the decision
    if (action === 'archive') {
      const updatedReview = await db.review.update({
        where: { id },
        data: { isArchived: true },
        include: { user: true }
      });
      
      await logAdminAction({
        adminId: session.user.id,
        action: 'Archive Review',
        entityType: 'Review',
        entityId: id,
        details: `Archived review. Reason: ${reason || 'No reason provided'}`,
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
        userAgent: req.headers.get('user-agent')
      });
      
      return NextResponse.json(
        ApiResponseFormatter.success(updatedReview, `Review archived successfully`)
      );
    }

    const status = action === 'approve' ? 'approved' : 'rejected';

    const updatedReview = await db.review.update({
      where: { id },
      data: {
        status,
      },
      include: { user: true }
    });

    // Handle optional 1-click ban
    if (banUser && action === 'reject' && updatedReview.userId) {
      await db.user.update({
        where: { id: updatedReview.userId },
        data: { 
          isActive: false,
          deletedAt: new Date()
        }
      });
      
      await logAdminAction({
        adminId: session.user.id,
        action: 'Suspend User',
        entityType: 'User',
        entityId: updatedReview.userId,
        details: `System Admin ${session.user.name || 'Admin'} banned user ${updatedReview.user.name || 'Anonymous'} while rejecting their review. Reason: ${reason || 'No reason provided'}`,
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
        userAgent: req.headers.get('user-agent')
      });
    }

    // Log the admin action for the review
    await logAdminAction({
      adminId: session.user.id,
      action: action === 'approve' ? 'Approve Review' : 'Reject Review',
      entityType: 'Review',
      entityId: id,
      details: `${action === 'approve' ? 'Approved' : 'Rejected'} review. Reason: ${reason || 'No reason provided'}`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: req.headers.get('user-agent')
    });

    // Add to Moderation Activity Feed
    await db.moderationLog.create({
      data: {
        adminId: session.user.id,
        action: status, // 'approved' or 'rejected'
        entityType: 'review',
        entityId: id,
        entityTitle: `Review from ${updatedReview.user?.name || 'User'}`,
        notes: reason || null,
      }
    });

    return NextResponse.json(
      ApiResponseFormatter.success(updatedReview, `Review ${status} successfully`)
    );
  } catch (error) {
    const errorResponse = PrismaErrorHandler.handle(error);
    return NextResponse.json(
      ApiResponseFormatter.error(errorResponse.message, 'Failed to process review decision', errorResponse.details),
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
    const permitted = await hasPermission(session.user.id, "MODERATE_REVIEWS");
    if (!permitted) return NextResponse.json(
      ApiResponseFormatter.error('Forbidden', 'Missing permission MODERATE_REVIEWS'),
      { status: 403 }
    );

    // Soft delete by setting deletedAt
    const deletedReview = await db.review.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      }
    });

    await logAdminAction({
      adminId: session.user.id,
      action: 'Delete Review',
      entityType: 'Review',
      entityId: id,
      details: 'Super Admin soft-deleted review',
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: req.headers.get('user-agent')
    });

    return NextResponse.json(
      ApiResponseFormatter.success({ id: deletedReview.id }, 'Review deleted successfully')
    );
  } catch (error) {
    const errorResponse = PrismaErrorHandler.handle(error);
    return NextResponse.json(
      ApiResponseFormatter.error(errorResponse.message, 'Failed to delete review', errorResponse.details),
      { status: errorResponse.status }
    );
  }
}

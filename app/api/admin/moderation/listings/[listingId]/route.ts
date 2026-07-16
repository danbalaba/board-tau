import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponseFormatter } from '@/lib/api-response';
import { PrismaErrorHandler } from '@/lib/prisma-error-handler';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAdminAction } from '@/lib/admin';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ listingId: string }> }) {
  try {
    const { listingId: id } = await params;
    console.log(`🚀 [MODERATION] Processing decision for Listing ID: ${id}`);
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
    const permitted = await hasPermission(session.user.id, "MODERATE_LISTINGS");
    if (!permitted) return NextResponse.json(
      ApiResponseFormatter.error('Forbidden', 'Missing permission MODERATE_LISTINGS'),
      { status: 403 }
    );

    const { action, reason } = await req.json();

    if (!['approve', 'reject', 'archive'].includes(action)) {
      return NextResponse.json(
        ApiResponseFormatter.error('Invalid action', 'Action must be "approve", "reject", or "archive"'),
        { status: 400 }
      );
    }

    if (action === 'archive') {
      const updatedListing = await db.listing.update({
        where: { id },
        data: { isArchived: true },
      });
      
      await logAdminAction({
        adminId: session.user.id,
        action: 'Archive Listing',
        entityType: 'Listing',
        entityId: id,
        details: `Archived listing. Reason: ${reason || 'No reason provided'}`,
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
        userAgent: req.headers.get('user-agent')
      });
      
      return NextResponse.json(
        ApiResponseFormatter.success(updatedListing, `Listing archived successfully`)
      );
    }

    // Process the decision
    const status = action === 'approve' ? 'active' : 'rejected';

    const updatedListing = await db.listing.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
        approvedAt: action === 'approve' ? new Date() : null,
        approvedBy: action === 'approve' ? session.user.id : null,
      },
    });

    // Log the admin action
    await logAdminAction({
      adminId: session.user.id,
      action: action === 'approve' ? 'Approve Listing' : 'Reject Listing',
      entityType: 'Listing',
      entityId: id,
      details: `${action === 'approve' ? 'Approved' : 'Rejected'} listing. Reason: ${reason || 'No reason provided'}`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: req.headers.get('user-agent')
    });

    // Add to Moderation Activity Feed
    await db.moderationLog.create({
      data: {
        adminId: session.user.id,
        action: status === 'active' ? 'approved' : 'rejected',
        entityType: 'listing',
        entityId: id,
        entityTitle: updatedListing.title,
        notes: reason || null,
      }
    });

    // ⚡ INVALIDATION: Clear all search and listings caches to show the new active property immediately
    const { cache } = await import('@/lib/redis');
    await Promise.all([
      cache.delPattern("search:*"),
      cache.delPattern("listings:*"),
      cache.del(`listing:id:${id}`)
    ]);

    return NextResponse.json(
      ApiResponseFormatter.success(updatedListing, `Listing ${status} successfully`)
    );
  } catch (error) {
    const errorResponse = PrismaErrorHandler.handle(error);
    return NextResponse.json(
      ApiResponseFormatter.error(errorResponse.message, 'Failed to process listing decision', errorResponse.details),
      { status: errorResponse.status }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ listingId: string }> }) {
  try {
    const { listingId: id } = await params;
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
    const permitted = await hasPermission(session.user.id, "MODERATE_LISTINGS");
    if (!permitted) return NextResponse.json(
      ApiResponseFormatter.error('Forbidden', 'Missing permission MODERATE_LISTINGS'),
      { status: 403 }
    );

    // Soft delete by setting deletedAt
    const deletedListing = await db.listing.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      }
    });

    await logAdminAction({
      adminId: session.user.id,
      action: 'Delete Listing',
      entityType: 'Listing',
      entityId: id,
      details: 'Super Admin soft-deleted listing',
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: req.headers.get('user-agent')
    });

    return NextResponse.json(
      ApiResponseFormatter.success({ id: deletedListing.id }, 'Listing deleted successfully')
    );
  } catch (error) {
    const errorResponse = PrismaErrorHandler.handle(error);
    return NextResponse.json(
      ApiResponseFormatter.error(errorResponse.message, 'Failed to delete listing', errorResponse.details),
      { status: errorResponse.status }
    );
  }
}

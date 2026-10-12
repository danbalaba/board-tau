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

    if (!['approve', 'reject', 'archive', 'unarchive'].includes(action)) {
      return NextResponse.json(
        ApiResponseFormatter.error('Invalid action', 'Action must be "approve", "reject", "archive", or "unarchive"'),
        { status: 400 }
      );
    }

    if (action === 'reject' && !reason) {
      return NextResponse.json(
        ApiResponseFormatter.error('Reason required', 'A reason is required for rejection'),
        { status: 400 }
      );
    }

    if (action === 'archive' || action === 'unarchive') {
      const isArchiving = action === 'archive';
      const updatedApplication = await db.hostApplication.update({
        where: { id },
        data: { isArchived: isArchiving },
        include: { user: true }
      });
      
      await logAdminAction({
        adminId: session.user.id,
        action: isArchiving ? 'Archive Host' : 'Unarchive Host',
        entityType: 'HostApplication',
        entityId: id,
        details: `${isArchiving ? 'Archived' : 'Unarchived'} host application for user ${updatedApplication.user?.name || updatedApplication.userId}. Reason: ${reason || 'No reason provided'}`,
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
        userAgent: req.headers.get('user-agent')
      });

      // Add to Moderation Activity Feed
      await db.moderationLog.create({
        data: {
          adminId: session.user.id,
          action: isArchiving ? 'archived' : 'unarchived',
          entityType: 'hostApplication',
          entityId: id,
          entityTitle: `Host App: ${updatedApplication.user?.name || 'User'}`,
          notes: reason || (isArchiving ? 'Archived by admin' : 'Restored by admin'),
        }
      });
      
      return NextResponse.json(
        ApiResponseFormatter.success(updatedApplication, `Host application ${isArchiving ? 'archived' : 'restored'} successfully`)
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

    // If approved, update user role to LANDLORD and mark as verified landlord
    if (status === 'approved') {
      const bInfo = typeof updatedApplication.businessInfo === 'string'
        ? (() => { try { return JSON.parse(updatedApplication.businessInfo); } catch { return {}; } })()
        : (updatedApplication.businessInfo || {}) as any;
      const cInfo = typeof updatedApplication.contactInfo === 'string'
        ? (() => { try { return JSON.parse(updatedApplication.contactInfo); } catch { return {}; } })()
        : (updatedApplication.contactInfo || {}) as any;

      await db.user.update({
        where: { id: updatedApplication.userId },
        data: {
          role: 'LANDLORD',
          isVerifiedLandlord: true,
          landlordApprovedAt: new Date(),
          ...(bInfo?.businessName ? { businessName: bInfo.businessName } : {}),
          ...(cInfo?.phoneNumber ? { phoneNumber: cInfo.phoneNumber } : {}),
        },
      });

      // Send email notification
      try {
        const { sendApplicationApprovalEmail } = await import('@/services/email/notifications');
        if (updatedApplication.user) {
          sendApplicationApprovalEmail(updatedApplication.user as any, updatedApplication as any);
        }
      } catch (err) {
        console.warn('Could not send approval email notification:', err);
      }

      // Create in-app notification for the newly approved landlord
      try {
        await db.notification.create({
          data: {
            userId: updatedApplication.userId,
            type: 'host_application',
            title: 'Host Application Approved! 🎉',
            description: 'Congratulations! Your landlord host application has been approved. You now have full access to the Landlord Dashboard and property management.',
            link: '/landlord',
          }
        });
      } catch (err) {
        console.warn('Could not create in-app notification:', err);
      }
    } else if (status === 'rejected') {
      // Send rejection email notification
      try {
        const { sendApplicationRejectionEmail } = await import('@/services/email/notifications');
        if (updatedApplication.user) {
          sendApplicationRejectionEmail(updatedApplication.user as any, updatedApplication as any, reason || 'Application requirements not met');
        }
      } catch (err) {
        console.warn('Could not send rejection email notification:', err);
      }

      // Create in-app notification
      try {
        await db.notification.create({
          data: {
            userId: updatedApplication.userId,
            type: 'host_application',
            title: 'Host Application Update',
            description: `Your host application was reviewed and could not be approved at this time: ${reason || 'Application requirements not met'}.`,
            link: '/become-a-host',
          }
        });
      } catch (err) {
        console.warn('Could not create in-app notification:', err);
      }
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

    // Add to Moderation Activity Feed
    await db.moderationLog.create({
      data: {
        adminId: session.user.id,
        action: 'deleted',
        entityType: 'hostApplication',
        entityId: id,
        entityTitle: `Host App: ${deletedApplication.userId}`,
        notes: 'Soft deleted by Super Admin',
      }
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

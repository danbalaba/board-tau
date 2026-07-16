import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAdminAction } from '@/lib/admin';
import { sendSuspensionNoticeEmail, sendBanNoticeEmail, sendReactivationEmail } from '@/services/email/notifications';
import { executeCascadeCancellation } from '@/services/cascade-cancellation';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { hasPermission } = await import("@/lib/rbac");
    const permitted = await hasPermission(session.user.id, "MANAGE_USERS");
    if (!permitted) {
      return NextResponse.json(
        { message: 'Forbidden. Missing MANAGE_USERS permission' },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    const id = resolvedParams.id;

    // Find the user to ensure they exist
    const user = await db.user.findFirst({
      where: {
        id,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Safeguard: Lockout prevention
    if ((user.role as string) === 'SUPER_ADMIN') {
      return NextResponse.json(
        { message: 'Lockout prevention: Cannot delete a Super Admin user.' },
        { status: 403 }
      );
    }

    // Delete the user
    await db.user.delete({
      where: {
        id,
      },
    });

    // Log the admin action
    await logAdminAction({
      adminId: session.user.id,
      action: 'Delete User',
      entityType: 'User',
      entityId: id,
      details: `Deleted user: ${user.name || 'Unknown'} (${user.email || 'No email'})`,
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: request.headers.get('user-agent')
    });

    return NextResponse.json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { hasPermission } = await import("@/lib/rbac");
    const permitted = await hasPermission(session.user.id, "MANAGE_USERS");
    if (!permitted) {
      return NextResponse.json(
        { message: 'Forbidden. Missing MANAGE_USERS permission' },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await request.json();

    // Find the user to ensure they exist
    const user = await db.user.findFirst({
      where: {
        id,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Map status to isActive and deletedAt
    const updateData: any = {
      name: body.name,
      email: body.email,
      role: body.role,
    };

    if (body.status === 'active') {
      updateData.isActive = true;
      updateData.isPermanentlyBanned = false;
      updateData.restrictedReason = null;
      updateData.deletedAt = null;
      
      // Wipe strike history when unsuspending/unbanning
      await db.userStrike.deleteMany({
        where: { userId: id }
      });
    } else if (body.status === 'inactive') {
      updateData.isActive = false;
      updateData.isPermanentlyBanned = false;
      updateData.deletedAt = null;
    } else if (body.status === 'suspended') {
      updateData.isActive = false;
      updateData.isPermanentlyBanned = false;
      updateData.restrictedReason = "Suspended by Admin";
      updateData.deletedAt = new Date();
    } else if (body.status === 'banned') {
      updateData.isActive = false;
      updateData.isPermanentlyBanned = true;
      updateData.restrictedReason = "Permanently Banned by Super Admin";
      updateData.deletedAt = new Date();
    }

    // Update the user
    const updatedUser = await db.user.update({
      where: {
        id,
      },
      data: updateData,
    });

    // Send notifications based on status change
    if (body.status === 'active' && (!user.isActive || user.isPermanentlyBanned)) {
      await sendReactivationEmail(updatedUser);
    } else if (body.status === 'suspended' && user.isActive) {
      await sendSuspensionNoticeEmail(updatedUser, "Suspended by Admin");
      await executeCascadeCancellation(id, "Suspended by Admin");
    } else if (body.status === 'banned' && !user.isPermanentlyBanned) {
      await sendBanNoticeEmail(updatedUser, "Permanently Banned by Super Admin");
      await executeCascadeCancellation(id, "Permanently Banned by Super Admin", true);
    }

    // Log the admin action
    await logAdminAction({
      adminId: session.user.id,
      action: 'Update User',
      entityType: 'User',
      entityId: id,
      details: `Updated user details and role to ${body.role || user.role} and status to ${body.status || 'active'}`,
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: request.headers.get('user-agent')
    });

    return NextResponse.json({
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { hasPermission } = await import("@/lib/rbac");
    const permitted = await hasPermission(session.user.id, "MANAGE_USERS");
    if (!permitted) {
      return NextResponse.json(
        { message: 'Forbidden. Missing MANAGE_USERS permission' },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await request.json();

    // Find the user to ensure they exist
    const user = await db.user.findFirst({
      where: {
        id,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Handle status patch
    const updateData: any = {};
    if (body.status) {
      if (body.status === 'active') {
        updateData.isActive = true;
        updateData.isPermanentlyBanned = false;
        updateData.restrictedReason = null;
        updateData.deletedAt = null;
        
        // Wipe strike history when unsuspending/unbanning
        await db.userStrike.deleteMany({
          where: { userId: id }
        });
      } else if (body.status === 'inactive') {
        updateData.isActive = false;
        updateData.isPermanentlyBanned = false;
        updateData.deletedAt = null;
      } else if (body.status === 'suspended') {
        updateData.isActive = false;
        updateData.isPermanentlyBanned = false;
        updateData.restrictedReason = "Suspended by Admin";
        updateData.deletedAt = new Date();
      } else if (body.status === 'banned') {
        updateData.isActive = false;
        updateData.isPermanentlyBanned = true;
        updateData.restrictedReason = "Permanently Banned by Super Admin";
        updateData.deletedAt = new Date();
      }
    }

    // Update other fields if provided
    if (body.name) updateData.name = body.name;
    if (body.email) updateData.email = body.email;
    if (body.role) updateData.role = body.role;

    const updatedUser = await db.user.update({
      where: {
        id,
      },
      data: updateData,
    });

    // Send notifications based on status change
    if (body.status) {
      if (body.status === 'active' && (!user.isActive || user.isPermanentlyBanned)) {
        await sendReactivationEmail(updatedUser);
      } else if (body.status === 'suspended' && user.isActive) {
        await sendSuspensionNoticeEmail(updatedUser, "Suspended by Admin");
        await executeCascadeCancellation(id, "Suspended by Admin");
      } else if (body.status === 'banned' && !user.isPermanentlyBanned) {
        await sendBanNoticeEmail(updatedUser, "Permanently Banned by Super Admin");
        await executeCascadeCancellation(id, "Permanently Banned by Super Admin", true);
      }
    }

    // Log the admin action
    await logAdminAction({
      adminId: session.user.id,
      action: 'Patch User',
      entityType: 'User',
      entityId: id,
      details: `Patched user fields: ${Object.keys(updateData).join(', ')}`,
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: request.headers.get('user-agent')
    });

    return NextResponse.json({
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

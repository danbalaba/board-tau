import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponseFormatter } from '@/lib/api-response';
import { PrismaErrorHandler } from '@/lib/prisma-error-handler';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const createPermissionSchema = z.object({
  name: z.string().min(1, 'Permission name is required'),
  description: z.string().optional(),
  module: z.string().min(1, 'Module is required'),
  action: z.string().min(1, 'Action is required')
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        ApiResponseFormatter.error('Unauthorized', 'You must be an admin to access this resource'),
        { status: 401 }
      );
    }

    let permissions = await (db as any).permission.findMany({
      orderBy: { module: 'asc' }
    });

    const defaultPermissions = [
      // USER MODULE (STUDENT/STAFF/FACULTY)
      { name: 'CREATE_INQUIRY', description: 'Initiate and submit inquiry requests for boarding house accommodations.', module: 'User', action: 'create' },
      { name: 'VIEW_INQUIRY_STATUS', description: 'Track the status and approval flow of submitted requests.', module: 'User', action: 'read' },
      { name: 'CREATE_RESERVATION', description: 'Initiate the formalized booking process for secured slots.', module: 'User', action: 'create' },
      { name: 'VIEW_RESERVATIONS', description: 'Access the ledger of confirmed and historical property bookings.', module: 'User', action: 'read' },
      { name: 'VIEW_PAYMENT_STATUS', description: 'Monitor transaction validation and payment processing status.', module: 'User', action: 'read' },
      { name: 'MANAGE_FAVORITES', description: 'Manage personal property watchlists and saved assets.', module: 'User', action: 'manage' },
      { name: 'SUBMIT_REVIEW', description: 'Provide qualitative feedback and star ratings for boarding experiences.', module: 'User', action: 'create' },
      { name: 'UPDATE_PROFILE', description: 'Modify institutional profile metadata and account information.', module: 'User', action: 'update' },
      { name: 'UPDATE_PASSWORD', description: 'Institutional protocol for secure credential reconfiguration.', module: 'User', action: 'update' },
      { name: 'UPLOAD_AVATAR', description: 'Update institutional profile imagery and visual identification.', module: 'User', action: 'update' },
      
      // LANDLORD MODULE (PROPERTY OWNER)
      { name: 'VIEW_LANDLORD_DASHBOARD', description: 'Access the centralized overview of property and inquiry statistics.', module: 'Landlord', action: 'read' },
      { name: 'CREATE_LISTING', description: 'Initialize and submit new property listings for administrative approval.', module: 'Landlord', action: 'create' },
      { name: 'UPDATE_LISTING', description: 'Modify existing property details, pricing, and infrastructure info.', module: 'Landlord', action: 'update' },
      { name: 'DELETE_LISTING', description: 'Institutional protocol for decommissioning property records.', module: 'Landlord', action: 'delete' },
      { name: 'MANAGE_ROOM_AVAILABILITY', description: 'Update real-time room occupancy and slot status.', module: 'Landlord', action: 'update' },
      { name: 'MANAGE_IMAGES', description: 'Administrate property and room-level visual galleries.', module: 'Landlord', action: 'manage' },
      { name: 'RESPOND_INQUIRY', description: 'Approve, reject, or comment on incoming tenant inquiries.', module: 'Landlord', action: 'respond' },
      { name: 'VIEW_PAYMENTS_LANDLORD', description: 'Monitor transaction status and deposit confirmations for owned properties.', module: 'Landlord', action: 'read' },
      
      // ADMIN MODULE (SYSTEM ADMINISTRATOR - ENTERPRISE SCOPE)
      { name: 'MANAGE_USERS', description: 'Institutional control over user accounts, role linkage, and status.', module: 'Admin', action: 'manage' },
      { name: 'MODERATE_LISTINGS', description: 'Review, approve, or reject property listings to ensure quality.', module: 'Admin', action: 'moderate' },
      { name: 'MODERATE_REVIEWS', description: 'Audit and remove inappropriate qualitative content.', module: 'Admin', action: 'moderate' },
      { name: 'APPROVE_HOST_APPLICATION', description: 'Validate and authorize host applications for property owners.', module: 'Admin', action: 'approve' },
      { name: 'REJECT_HOST_APPLICATION', description: 'Decline host applications based on institutional criteria.', module: 'Admin', action: 'reject' },
      { name: 'VIEW_MODERATION_QUEUE', description: 'Access the centralized ledger of items awaiting administrative review.', module: 'Admin', action: 'read' },
      { name: 'VIEW_REVENUE', description: 'Monitor real-time platform revenue, commissions, and fees.', module: 'Admin', action: 'read' },
      { name: 'VIEW_TRANSACTIONS', description: 'Access the complete institutional ledger of all platform transactions.', module: 'Admin', action: 'read' },
      { name: 'MANAGE_COMMISSIONS', description: 'Configure platform fee structures and commission rates.', module: 'Admin', action: 'manage' },
      { name: 'MONITOR_SYSTEM_HEALTH', description: 'Real-time monitoring of server, database, and API performance.', module: 'Admin', action: 'read' },
      { name: 'VIEW_ERROR_LOGS', description: 'Access system-wide error tracking and diagnostic logs.', module: 'Admin', action: 'read' },
      { name: 'MANAGE_SECURITY_SETTINGS', description: 'Configure institutional encryption, rate-limiting, and threat detection.', module: 'Admin', action: 'manage' },
      { name: 'GENERATE_REPORTS', description: 'Compile and export institutional performance and analytical reports.', module: 'Admin', action: 'read' },
      { name: 'EXPORT_DATA', description: 'Bulk export of institutional data to CSV/Excel for external analysis.', module: 'Admin', action: 'export' },
      { name: 'CONFIGURE_SYSTEM', description: 'Manage platform core settings, feature flags, and global configurations.', module: 'Admin', action: 'manage' },
    ];

    // Individual check and sync
    let needsRefetch = false;
    for (const defPerm of defaultPermissions) {
      const exists = permissions.some((p: any) => p.name.toUpperCase() === defPerm.name);
      if (!exists) {
        await (db as any).permission.create({
          data: defPerm
        });
        needsRefetch = true;
      }
    }

    if (needsRefetch) {
      permissions = await (db as any).permission.findMany({
        orderBy: { module: 'asc' }
      });
    }

    // Cleanup Legacy Permissions logic
    const legacyPermissionNames = ['bookings:read', 'bookings:write', 'properties:read', 'properties:write', 'users:read', 'users:write'];
    const currentPermissionNames = permissions.map((p: any) => p.name as string);
    const toDelete = currentPermissionNames.filter((name: string) => legacyPermissionNames.includes(name));

    if (toDelete.length > 0) {
      await (db as any).permission.deleteMany({
        where: { name: { in: toDelete } }
      });
      // Final sync fetch
      permissions = await (db as any).permission.findMany({
        orderBy: { module: 'asc' }
      });
    }

    return NextResponse.json(
      ApiResponseFormatter.success(permissions, 'Permissions fetched successfully')
    );
  } catch (error) {
    const errorResponse = PrismaErrorHandler.handle(error);
    return NextResponse.json(
      ApiResponseFormatter.error(errorResponse.message, 'Failed to fetch permissions', errorResponse.details),
      { status: errorResponse.status }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        ApiResponseFormatter.error('Unauthorized', 'You must be an admin to access this resource'),
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = createPermissionSchema.parse(body);

    const existingPermission = await (db as any).permission.findFirst({
      where: { name: { equals: validatedData.name, mode: 'insensitive' } }
    });

    if (existingPermission) {
      return NextResponse.json(
        ApiResponseFormatter.error('Conflict', 'Permission with this name already exists'),
        { status: 409 }
      );
    }

    const permission = await (db as any).permission.create({
      data: validatedData
    });

    return NextResponse.json(
      ApiResponseFormatter.success(permission, 'Permission created successfully'),
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        ApiResponseFormatter.error('Validation Error', 'Invalid input data', error.issues),
        { status: 400 }
      );
    }

    const errorResponse = PrismaErrorHandler.handle(error);
    return NextResponse.json(
      ApiResponseFormatter.error(errorResponse.message, 'Failed to create permission', errorResponse.details),
      { status: errorResponse.status }
    );
  }
}

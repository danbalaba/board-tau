import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponseFormatter } from '@/lib/api-response';
import { PrismaErrorHandler } from '@/lib/prisma-error-handler';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { backendClient } from '@/lib/edgestore-server';

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        ApiResponseFormatter.error('Unauthorized', 'You must be an admin to access this resource'),
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '10');
    const status = searchParams.get('status') || 'pending'; // pending, approved, rejected
    const isArchived = searchParams.get('isArchived') === 'true';
    const range = searchParams.get('range') || '30d';

    // Calculate date ranges for comparisons
    let days = 30;
    if (range === '7d') days = 7;
    if (range === '90d') days = 90;
    if (range === '1y') days = 365;

    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const previousStartDate = new Date(now.getTime() - (days * 2) * 24 * 60 * 60 * 1000);

    // Calculate pagination
    const skip = (page - 1) * perPage;

    const targetStatusWhere = (status && status !== 'all') ? { status } : {};
    const whereClause: any = isArchived
      ? { isArchived: true, ...targetStatusWhere }
      : { isArchived: false, ...targetStatusWhere };

    // Fetch host applications with status counts & previous period comparison stats
    const [
      hostApplications, 
      totalPending, 
      approvedCount, 
      rejectedCount,
      totalPreviousCount,
      pendingPreviousCount,
      approvedPreviousCount,
      rejectedPreviousCount
    ] = await Promise.all([
      db.hostApplication.findMany({
        where: whereClause,
        include: { user: true } as any,
        orderBy: { createdAt: 'desc' },
        skip,
        take: perPage,
      }),
      db.hostApplication.count({ where: { status: 'pending', isArchived } as any }),
      db.hostApplication.count({ where: { status: 'approved', isArchived } as any }),
      db.hostApplication.count({ where: { status: 'rejected', isArchived } as any }),

      // Historical comparison stats for range trend percentage
      db.hostApplication.count({ where: { createdAt: { gte: previousStartDate, lt: startDate }, isArchived } as any }),
      db.hostApplication.count({ where: { status: 'pending', createdAt: { gte: previousStartDate, lt: startDate }, isArchived } as any }),
      db.hostApplication.count({ where: { status: 'approved', createdAt: { gte: previousStartDate, lt: startDate }, isArchived } as any }),
      db.hostApplication.count({ where: { status: 'rejected', createdAt: { gte: previousStartDate, lt: startDate }, isArchived } as any }),
    ]);

    // Transform data for response
    const transformedApplications = hostApplications.map((application: any) => ({
      id: application.id,
      user: {
        id: application.user?.id,
        name: application.user?.name,
        email: application.user?.email,
        image: application.user?.image,
        phoneNumber: application.user?.phoneNumber,
      },
      status: application.status,
      isArchived: (application as any).isArchived,
      businessInfo: application.businessInfo,
      contactInfo: application.contactInfo,
      selfieUrl: application.selfieUrl,
      idCardUrl: application.idCardUrl,
      businessPermitUrl: application.businessPermitUrl,
      fireSafetyUrl: application.fireSafetyUrl,
      facadePhotoUrl: application.facadePhotoUrl,
      documents: {
        selfieUrl: application.selfieUrl,
        idCardUrl: application.idCardUrl,
        businessPermitUrl: application.businessPermitUrl,
        fireSafetyUrl: application.fireSafetyUrl,
        facadePhotoUrl: application.facadePhotoUrl,
        additionalDocsUrl: application.additionalDocsUrl,
      },
      latlng: application.latlng,
      adminNotes: application.adminNotes,
      approvedBy: application.approvedBy,
      rejectedBy: application.rejectedBy,
      rejectedReason: application.rejectedReason,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
    }));

    return NextResponse.json(
      ApiResponseFormatter.success(transformedApplications, 'Host applications fetched successfully', {
        total: totalPending,
        page,
        perPage,
        totalPages: Math.ceil(totalPending / perPage),
        stats: {
          pending: totalPending,
          approved: approvedCount,
          rejected: rejectedCount,
          totalLastWeek: totalPreviousCount,
          pendingLastWeek: pendingPreviousCount,
          approvedLastWeek: approvedPreviousCount,
          rejectedLastWeek: rejectedPreviousCount,
        }
      })
    );
  } catch (error) {
    const errorResponse = PrismaErrorHandler.handle(error);
    return NextResponse.json(
      ApiResponseFormatter.error(errorResponse.message, 'Failed to fetch host applications', errorResponse.details),
      { status: errorResponse.status }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(ApiResponseFormatter.error('Unauthorized'), { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const action = searchParams.get('action');

    if (!id || action !== 'archive') {
      return NextResponse.json(ApiResponseFormatter.error('Invalid Request'), { status: 400 });
    }

    const { isArchived } = await req.json();

    const updated = await db.hostApplication.update({
      where: { id },
      data: { isArchived } as any
    });

    return NextResponse.json(ApiResponseFormatter.success(updated, 'Archive status updated'));
  } catch (error) {
    return NextResponse.json(ApiResponseFormatter.error('Update failed'), { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(ApiResponseFormatter.error('Unauthorized'), { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(ApiResponseFormatter.error('Missing ID'), { status: 400 });
    }

    // 1. Fetch the application to get file URLs
    const application = await db.hostApplication.findUnique({
      where: { id }
    });

    if (!application) {
      return NextResponse.json(ApiResponseFormatter.error('Application not found'), { status: 404 });
    }

    // 2. Collect all sensitive URLs
    const fileUrls = [
      application.selfieUrl,
      application.idCardUrl,
      application.businessPermitUrl,
      application.fireSafetyUrl,
      application.facadePhotoUrl,
      application.additionalDocsUrl
    ].filter(Boolean) as string[];

    // 3. WIPE files from EdgeStore Cloud
    console.log(`🛡️ SECURITY PURGE: Deleting ${fileUrls.length} files from EdgeStore for application ${id}`);
    
    await Promise.all(
      fileUrls.map(url => 
        (backendClient.identityDocs as any).deleteFile({ url }).catch((err: any) => {
          console.error(`Failed to delete file from EdgeStore: ${url}`, err);
        })
      )
    );

    // 4. Delete the database record
    await db.hostApplication.delete({
      where: { id }
    });

    return NextResponse.json(ApiResponseFormatter.success(null, 'Host application and all sensitive files purged successfully.'));
  } catch (error) {
    console.error('Delete failed:', error);
    return NextResponse.json(ApiResponseFormatter.error('Hard delete failed'), { status: 500 });
  }
}

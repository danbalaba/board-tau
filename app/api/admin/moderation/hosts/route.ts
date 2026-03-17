import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponseFormatter } from '@/lib/api-response';
import { PrismaErrorHandler } from '@/lib/prisma-error-handler';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
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

    // Calculate pagination
    const skip = (page - 1) * perPage;

    // Fetch host applications
    const [hostApplications, total] = await Promise.all([
      db.hostApplication.findMany({
        where: { status },
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: perPage,
      }),
      db.hostApplication.count({ where: { status } }),
    ]);

    // Transform data for response
    const transformedApplications = hostApplications.map(application => ({
      id: application.id,
      user: {
        id: application.user.id,
        name: application.user.name,
        email: application.user.email,
        image: application.user.image,
      },
      status: application.status,
      businessInfo: application.businessInfo,
      propertyInfo: application.propertyInfo,
      contactInfo: application.contactInfo,
      propertyConfig: application.propertyConfig,
      propertyImages: application.propertyImages,
      documents: application.documents,
      adminNotes: application.adminNotes,
      approvedBy: application.approvedBy,
      rejectedBy: application.rejectedBy,
      rejectedReason: application.rejectedReason,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
    }));

    return NextResponse.json(
      ApiResponseFormatter.success(transformedApplications, 'Host applications fetched successfully', {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
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

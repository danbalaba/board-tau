import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponseFormatter } from '@/lib/api-response';
import { PrismaErrorHandler } from '@/lib/prisma-error-handler';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        ApiResponseFormatter.error('Unauthorized', 'Access denied'),
        { status: 401 }
      );
    }

    const [
      pendingListings,
      pendingHosts,
      pendingReviews,
      activeListings,
      recentLogs
    ] = await Promise.all([
      db.listing.count({ where: { status: 'pending' } }),
      db.hostApplication.count({ where: { status: 'pending' } }),
      db.review.count({ where: { status: 'pending' } }),
      db.listing.count({ where: { status: 'active' } }),
      db.moderationLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: {
            select: {
              name: true,
              email: true
            }
          }
        }
      })
    ]);

    const overviewData = {
      pendingListings,
      pendingHosts,
      pendingReviews,
      activeListings,
      recentLogs: recentLogs.map((log: any) => ({
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        details: log.notes || log.entityTitle || null,
        createdAt: log.createdAt,
        adminName: log.admin?.name || 'System Admin',
        adminEmail: log.admin?.email || 'N/A'
      }))
    };

    return NextResponse.json(
      ApiResponseFormatter.success(overviewData, 'Dashboard overview data fetched successfully')
    );
  } catch (error) {
    const errorResponse = PrismaErrorHandler.handle(error);
    return NextResponse.json(
      ApiResponseFormatter.error(errorResponse.message, 'Failed to fetch dashboard overview', errorResponse.details),
      { status: errorResponse.status }
    );
  }
}

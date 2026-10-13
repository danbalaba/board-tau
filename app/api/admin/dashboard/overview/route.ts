import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cache } from '@/lib/redis';
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

    const cacheKey = "admin:dashboard:overview";
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(
        ApiResponseFormatter.success(cachedData, 'Dashboard overview data fetched successfully (cached)')
      );
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      pendingListings,
      pendingHosts,
      pendingReviews,
      activeListings,
      approvedListings,
      approvedHosts,
      approvedReviews,
      rejectedListings,
      rejectedHosts,
      rejectedReviews,
      recentLogs,
      recentActivityLogs
    ] = await Promise.all([
      db.listing.count({ where: { status: 'PENDING' } }),
      db.hostApplication.count({ where: { status: { in: ['pending', 'PENDING'] } } as any }),
      db.review.count({ where: { status: { in: ['pending', 'PENDING'] } } as any }),
      db.listing.count({ where: { status: 'ACTIVE' } }),
      db.listing.count({ where: { status: 'APPROVED' } }),
      db.hostApplication.count({ where: { status: { in: ['approved', 'APPROVED'] } } as any }),
      db.review.count({ where: { status: { in: ['approved', 'APPROVED'] } } as any }),
      db.listing.count({ where: { status: 'REJECTED' } }),
      db.hostApplication.count({ where: { status: { in: ['rejected', 'REJECTED'] } } as any }),
      db.review.count({ where: { status: { in: ['rejected', 'REJECTED', 'removed'] } } as any }),
      db.moderationLog.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: {
            select: {
              name: true,
              email: true,
              image: true,
            }
          }
        }
      }),
      db.moderationLog.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: {
          action: true,
          createdAt: true
        }
      })
    ]);

    // Compute daily 7-day turnaround trend
    const dailyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(targetDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(targetDate);
      dayEnd.setHours(23, 59, 59, 999);

      const dayLogs = recentActivityLogs.filter((l: any) => {
        const t = new Date(l.createdAt).getTime();
        return t >= dayStart.getTime() && t <= dayEnd.getTime();
      });

      const approved = dayLogs.filter((l: any) => l.action?.toLowerCase().includes('approve')).length;
      const rejected = dayLogs.filter((l: any) => l.action?.toLowerCase().includes('reject') || l.action?.toLowerCase().includes('remove') || l.action?.toLowerCase().includes('ban')).length;

      dailyActivity.push({
        day: targetDate.toLocaleDateString('en-US', { weekday: 'short' }),
        date: targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        approved,
        rejected,
        total: approved + rejected
      });
    }

    const totalApproved = approvedListings + approvedHosts + approvedReviews;
    const totalRejected = rejectedListings + rejectedHosts + rejectedReviews;
    const totalDecisions = totalApproved + totalRejected;
    const resolutionRate = totalDecisions > 0 
      ? Math.round((totalApproved / totalDecisions) * 100) 
      : 100;

    const overviewData = {
      pendingListings,
      pendingHosts,
      pendingReviews,
      activeListings,
      totalApproved,
      totalRejected,
      resolutionRate,
      dailyActivity,
      recentLogs: recentLogs.map((log: any) => ({
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        details: log.notes || log.entityTitle || null,
        createdAt: log.createdAt,
        adminName: log.admin?.name || 'System Admin',
        adminEmail: log.admin?.email || 'N/A',
        adminImage: log.admin?.image || null
      }))
    };

    // Cache overview in Redis for 60 seconds
    await cache.set(cacheKey, overviewData, 60);

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

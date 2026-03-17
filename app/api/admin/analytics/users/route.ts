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

    // Get time range from query params
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '30d'; // 7d, 30d, 90d, 1y

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Fetch user analytics
    const [totalUsers, newUsers, activeUsers, userRoles, verificationStatus] = await Promise.all([
      // Total users
      db.user.count(),
      // New users in time range
      db.user.count({
        where: { createdAt: { gte: startDate, lte: now } },
      }),
      // Active users (logged in within last 30 days)
      db.user.count({
        where: {
          lastLogin: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          isActive: true,
          deletedAt: null,
        },
      }),
      // Users by role
      db.user.groupBy({
        by: ['role'],
        _count: { id: true },
      }),
      // Verification status
      db.user.groupBy({
        by: ['isVerifiedLandlord'],
        _count: { id: true },
      }),
    ]);

    // Transform data for response
    const analytics = {
      totalUsers,
      newUsers,
      activeUsers,
      userRoles: userRoles.map((role) => ({
        role: role.role,
        count: role._count.id,
      })),
      verificationStatus: verificationStatus.map((status) => ({
        isVerifiedLandlord: status.isVerifiedLandlord,
        count: status._count.id,
      })),
      timeRange: range,
    };

    return NextResponse.json(
      ApiResponseFormatter.success(analytics, 'User analytics fetched successfully')
    );
  } catch (error) {
    const errorResponse = PrismaErrorHandler.handle(error);
    return NextResponse.json(
      ApiResponseFormatter.error(errorResponse.message, 'Failed to fetch user analytics', errorResponse.details),
      { status: errorResponse.status }
    );
  }
}

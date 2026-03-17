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
    const range = searchParams.get('range') || '30d';

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

    // Fetch revenue data
    const [totalRevenue, dailyRevenue, topProperties] = await Promise.all([
      // Total revenue
      db.reservation.aggregate({
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: startDate, lte: now },
        },
        _sum: { totalPrice: true },
      }),
      // Daily revenue
      db.reservation.groupBy({
        by: ['createdAt'],
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: startDate, lte: now },
        },
        _sum: { totalPrice: true },
        orderBy: { createdAt: 'asc' },
      }).then(data => data.map(item => ({
        date: new Date(item.createdAt).toLocaleDateString(),
        revenue: item._sum.totalPrice || 0,
      }))),
      // Top properties by revenue
      db.reservation.groupBy({
        by: ['listingId'],
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: startDate, lte: now },
        },
        _sum: { totalPrice: true },
        orderBy: { _sum: { totalPrice: 'desc' } },
        take: 10,
      }).then(data => Promise.all(
        data.map(async item => {
          const listing = await db.listing.findUnique({
            where: { id: item.listingId },
            include: { user: true },
          });
          return {
            listingId: item.listingId,
            listingTitle: listing?.title || 'Unknown Property',
            listingOwner: listing?.user?.name || 'Unknown Owner',
            revenue: item._sum.totalPrice || 0,
          };
        })
      )),
    ]);

    // Calculate monthly revenue from daily data
    const monthlyRevenueMap = new Map<string, number>();
    dailyRevenue.forEach(item => {
      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      monthlyRevenueMap.set(monthKey, (monthlyRevenueMap.get(monthKey) || 0) + item.revenue);
    });

    const monthlyRevenue = Array.from(monthlyRevenueMap.entries())
      .map(([month, revenue]) => ({
        month,
        revenue,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Calculate average daily revenue
    const daysInRange = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const averageDailyRevenue = daysInRange > 0 ? (totalRevenue._sum.totalPrice || 0) / daysInRange : 0;

    // Transform data for response
    const revenueData = {
      timeRange: range,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      averageDailyRevenue: parseFloat(averageDailyRevenue.toFixed(2)),
      dailyRevenue,
      monthlyRevenue,
      topProperties,
    };

    return NextResponse.json(
      ApiResponseFormatter.success(revenueData, 'Revenue data fetched successfully')
    );
  } catch (error) {
    const errorResponse = PrismaErrorHandler.handle(error);
    return NextResponse.json(
      ApiResponseFormatter.error(errorResponse.message, 'Failed to fetch revenue data', errorResponse.details),
      { status: errorResponse.status }
    );
  }
}

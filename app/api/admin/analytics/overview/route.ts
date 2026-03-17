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

    // Fetch executive overview data
    const [
      totalUsers,
      newUsers,
      activeUsers,
      totalListings,
      newListings,
      totalRevenue,
      totalReservations,
      averageRating,
      topProperties,
    ] = await Promise.all([
      // Users
      db.user.count(),
      db.user.count({ where: { createdAt: { gte: startDate, lte: now } } }),
      db.user.count({
        where: {
          lastLogin: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          isActive: true,
          deletedAt: null,
        },
      }),
      // Properties
      db.listing.count(),
      db.listing.count({ where: { createdAt: { gte: startDate, lte: now } } }),
      // Revenue
      db.reservation.aggregate({
        where: { paymentStatus: 'PAID', createdAt: { gte: startDate, lte: now } },
        _sum: { totalPrice: true },
      }).then(result => result._sum.totalPrice || 0),
      // Reservations
      db.reservation.count({ where: { createdAt: { gte: startDate, lte: now } } }),
      // Reviews
      db.review.aggregate({
        where: { status: 'approved', createdAt: { gte: startDate, lte: now } },
        _avg: { rating: true },
      }).then(result => (result._avg.rating || 0).toFixed(1)),
      // Top properties
      db.reservation.groupBy({
        by: ['listingId'],
        where: { paymentStatus: 'PAID', createdAt: { gte: startDate, lte: now } },
        _sum: { totalPrice: true },
        orderBy: { _sum: { totalPrice: 'desc' } },
        take: 5,
      }).then(data => Promise.all(
        data.map(async item => {
          const listing = await db.listing.findUnique({ where: { id: item.listingId } });
          return {
            listingId: item.listingId,
            listingTitle: listing?.title || 'Unknown Property',
            revenue: item._sum.totalPrice || 0,
          };
        })
      )),
    ]);

    // Calculate user growth percentage
    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - (now.getDate() - startDate.getDate()));
    const previousPeriodUsers = await db.user.count({
      where: { createdAt: { gte: previousPeriodStart, lte: startDate } },
    });

    const userGrowthPercentage = previousPeriodUsers > 0
      ? Math.round(((newUsers - previousPeriodUsers) / previousPeriodUsers) * 100)
      : 100;

    // Calculate revenue growth percentage
    const previousPeriodRevenue = await db.reservation.aggregate({
      where: {
        paymentStatus: 'PAID',
        createdAt: { gte: previousPeriodStart, lte: startDate },
      },
      _sum: { totalPrice: true },
    }).then(result => result._sum.totalPrice || 0);

    const revenueGrowthPercentage = previousPeriodRevenue > 0
      ? Math.round(((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100)
      : 100;

    // Transform data for response
    const overviewData = {
      timeRange: range,
      metrics: {
        totalUsers,
        newUsers,
        activeUsers,
        totalListings,
        newListings,
        totalRevenue,
        totalReservations,
        averageRating: parseFloat(averageRating),
        userGrowthPercentage,
        revenueGrowthPercentage,
      },
      topProperties,
    };

    return NextResponse.json(
      ApiResponseFormatter.success(overviewData, 'Executive overview fetched successfully')
    );
  } catch (error) {
    const errorResponse = PrismaErrorHandler.handle(error);
    return NextResponse.json(
      ApiResponseFormatter.error(errorResponse.message, 'Failed to fetch executive overview', errorResponse.details),
      { status: errorResponse.status }
    );
  }
}

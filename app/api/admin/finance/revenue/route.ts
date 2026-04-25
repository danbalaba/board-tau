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
    const [totalRevenue, allReservations, topProperties] = await Promise.all([
      // Total revenue
      db.reservation.aggregate({
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: startDate, lte: now },
        },
        _sum: { totalPrice: true },
      }),
      // Fetch reservations to group manually for better date handling
      db.reservation.findMany({
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: startDate, lte: now },
        },
        select: {
          createdAt: true,
          totalPrice: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
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

    // Group daily revenue and monthly revenue from all reservations
    const dailyMap = new Map<string, { revenue: number, bookings: number }>();
    const monthlyMap = new Map<string, { revenue: number, bookings: number }>();

    allReservations.forEach(res => {
      const date = new Date(res.createdAt);
      
      // Daily
      const dateKey = date.toISOString().split('T')[0];
      const daily = dailyMap.get(dateKey) || { revenue: 0, bookings: 0 };
      daily.revenue += res.totalPrice;
      daily.bookings += 1;
      dailyMap.set(dateKey, daily);

      // Monthly
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const monthly = monthlyMap.get(monthKey) || { revenue: 0, bookings: 0 };
      monthly.revenue += res.totalPrice;
      monthly.bookings += 1;
      monthlyMap.set(monthKey, monthly);
    });

    const dailyRevenue = Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        month: date, // For chart X-axis
        revenue: data.revenue,
        bookings: data.bookings
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const monthlyRevenue = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        revenue: data.revenue,
        bookings: data.bookings
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

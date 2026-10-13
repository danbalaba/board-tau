import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cache } from "@/lib/redis";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'You must be an admin to access this resource'
        },
        { status: 401 }
      );
    }
    const cacheKey = "admin:analytics";

    // Try to get from cache first
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      console.log("Serving admin analytics from cache");
      return NextResponse.json(cachedData);
    }

    // Parallel execution of all analytics queries with native MongoDB aggregations
    const [
      revenueAggregate,
      activeUsers,
      totalListings,
      reviewAggregate,
      monthlyData,
      userRoles,
      propertyTypes,
    ] = await Promise.all([
      db.reservation.aggregate({
        where: { status: "RESERVED" },
        _sum: { totalPrice: true },
      }),
      db.user.count(),
      db.listing.count(),
      db.review.aggregate({
        _avg: { rating: true },
        _count: { id: true },
      }),
      db.reservation.findMany({
        select: {
          startDate: true,
          totalPrice: true,
        },
        orderBy: {
          startDate: "asc",
        },
      }),
      db.user.groupBy({
        by: ["role"],
        _count: {
          id: true,
        },
      }),
      db.propertyType.findMany({
        include: {
          _count: {
            select: {
              listings: true,
            },
          },
        },
      }),
    ]);

    const totalRevenue = revenueAggregate._sum.totalPrice || 0;
    const averageRating = reviewAggregate._avg.rating != null
      ? reviewAggregate._avg.rating.toFixed(1)
      : "0";

    // Transform monthly data
    const monthlyStats = new Map<string, { bookings: number; revenue: number }>();

    monthlyData.forEach((reservation: any) => {
      const date = new Date(reservation.startDate);
      const monthYear = `${date.getFullYear()}-${date.getMonth()}`;

      if (!monthlyStats.has(monthYear)) {
        monthlyStats.set(monthYear, { bookings: 0, revenue: 0 });
      }

      const currentStats = monthlyStats.get(monthYear)!;
      currentStats.bookings++;
      currentStats.revenue += reservation.totalPrice || 0;
    });

    const formattedMonthlyData = Array.from(monthlyStats.entries())
      .map(([key, value]) => {
        const [year, month] = key.split("-").map(Number);
        return {
          name: new Date(year, month).toLocaleString('default', { month: 'short' }),
          bookings: value.bookings,
          revenue: value.revenue
        };
      })
      .sort((a, b) => {
        // Sort by month name
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months.indexOf(a.name) - months.indexOf(b.name);
      });

    const response = {
      success: true,
      data: {
        stats: {
          totalRevenue: `$${totalRevenue.toLocaleString()}`,
          activeUsers: activeUsers.toLocaleString(),
          totalListings: totalListings.toLocaleString(),
          averageRating: `${averageRating}/5.0`
        },
        charts: {
          monthlyData: formattedMonthlyData,
          userRoles,
          propertyTypes
        }
      }
    };

    // Cache the response for 30 minutes
    await cache.set(cacheKey, response, 1800);

    console.log("Serving admin analytics from database");
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching admin analytics:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch analytics"
      },
      { status: 500 }
    );
  }
}

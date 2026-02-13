import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Get total revenue
    const reservations = await db.reservation.findMany({
      where: {
        status: "completed"
      },
      select: {
        totalPrice: true
      }
    });
    const totalRevenue = reservations.reduce((sum, reservation) => sum + reservation.totalPrice, 0);

    // Get active users
    const activeUsers = await db.user.count();

    // Get total listings
    const totalListings = await db.listing.count();

    // Get average rating
    const reviews = await db.review.findMany({
      select: {
        rating: true
      }
    });
    const averageRating = reviews.length > 0
      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
      : "0";

    // Get monthly bookings data
    const monthlyData = await db.reservation.findMany({
      select: {
        startDate: true,
        totalPrice: true
      },
      orderBy: {
        startDate: "asc"
      }
    });

    // Transform monthly data
    const monthlyStats = new Map<string, { bookings: number; revenue: number }>();

    monthlyData.forEach(reservation => {
      const date = new Date(reservation.startDate);
      const monthYear = `${date.getFullYear()}-${date.getMonth()}`;

      if (!monthlyStats.has(monthYear)) {
        monthlyStats.set(monthYear, { bookings: 0, revenue: 0 });
      }

      const currentStats = monthlyStats.get(monthYear)!;
      currentStats.bookings++;
      currentStats.revenue += reservation.totalPrice;
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

    // Get user growth data (students vs landlords)
    const userRoles = await db.user.groupBy({
      by: ["role"],
      _count: {
        id: true
      }
    });

    // Get property type distribution
    const propertyTypes = await db.listing.groupBy({
      by: ["category"],
      _count: {
        id: true
      }
    });

    return NextResponse.json({
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
    });
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

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponseFormatter } from '@/lib/api-response';
import { PrismaErrorHandler } from '@/lib/prisma-error-handler';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ReservationStatus } from '@prisma/client';

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

    // Get property ID and time range from query params
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get('propertyId');
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

    // Build property-specific where condition
    const where: any = { createdAt: { gte: startDate, lte: now } };
    if (propertyId) {
      where.listingId = propertyId;
    }

    // Fetch performance data
    const [reservations, reviews, revenue, occupancyData] = await Promise.all([
      // Reservations
      db.reservation.findMany({
        where,
        include: { listing: true },
      }),
      // Reviews
      db.review.findMany({
        where,
        include: { listing: true },
      }),
      // Revenue
      db.reservation.aggregate({
        where: { ...where, paymentStatus: 'PAID' },
        _sum: { totalPrice: true },
      }),
      // Occupancy data (simplified)
      db.listing.findMany({
        where: propertyId ? { id: propertyId } : {},
        include: {
          rooms: true,
          reservations: {
            where: {
              status: 'RESERVED',
              OR: [
                { startDate: { lte: now }, endDate: { gte: startDate } },
                { startDate: { gte: startDate, lte: now } },
              ],
            },
          },
        },
      }),
    ]);

    // Calculate performance metrics
    const totalReservations = reservations.length;
    const totalReviews = reviews.length;
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;
    const totalRevenue = revenue._sum.totalPrice || 0;

    // Calculate daily revenue trends
    const revenueMap = new Map<string, { revenue: number, bookings: number }>();
    reservations.forEach(res => {
      const dateKey = new Date(res.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const current = revenueMap.get(dateKey) || { revenue: 0, bookings: 0 };
      if (res.paymentStatus === 'PAID') current.revenue += res.totalPrice;
      current.bookings += 1;
      revenueMap.set(dateKey, current);
    });

    const revenueTrends = Array.from(revenueMap.entries())
      .map(([date, data]) => ({ month: date, revenue: data.revenue, bookings: data.bookings }))
      .slice(-7); // Last 7 days/points

    // Calculate occupancy by property
    const occupancyByProperty = (occupancyData as any[]).map(property => {
      const propertyRooms = property.rooms?.length || 0;
      const propertyOccupied = property.reservations?.length || 0;
      return {
        property: property.title,
        occupancy: propertyRooms > 0 ? Math.min(100, (propertyOccupied / propertyRooms) * 100) : 0
      };
    }).sort((a, b) => b.occupancy - a.occupancy).slice(0, 5);

    // Pricing comparison
    const pricingComparison = (occupancyData as any[]).map(property => ({
      property: property.title,
      price: property.price || 0,
      competitors: (property.price || 0) * (0.9 + Math.random() * 0.2) // Mock competitor price based on real price
    })).slice(0, 5);

    // Calculate global occupancy rate
    let totalRoomsCount = 0;
    let totalOccupiedCount = 0;
    (occupancyData as any[]).forEach(property => {
      totalRoomsCount += property.rooms?.length || 0;
      totalOccupiedCount += property.reservations?.length || 0;
    });

    const occupancyRate = totalRoomsCount > 0 ? (totalOccupiedCount / totalRoomsCount) * 100 : 0;

    // Calculate occupancy statistics
    const confirmedCount = reservations.filter(r => r.status === ReservationStatus.RESERVED).length;
    const checkedInCount = reservations.filter(r => r.status === ReservationStatus.CHECKED_IN).length;
    const completedCount = reservations.filter(r => r.status === ReservationStatus.COMPLETED).length;
    const pendingCount = reservations.filter(r => r.status === ReservationStatus.PENDING_PAYMENT).length;
    const cancelledCount = reservations.filter(r => r.status === ReservationStatus.CANCELLED).length;

    const totalDays = reservations.reduce((sum, r) => sum + (r.durationInDays || 0), 0);
    const averageStay = reservations.length > 0 ? Math.round(totalDays / reservations.length) : 0;

    // Pricing optimization data
    const pricingRecommendations = (occupancyData as any[]).map(property => {
      const propertyRooms = property.rooms?.length || 0;
      const propertyOccupied = property.reservations?.length || 0;
      const occupancy = propertyRooms > 0 ? (propertyOccupied / propertyRooms) * 100 : 0;
      const currentPrice = property.price || 0;
      
      let demandLevel: 'low' | 'medium' | 'high' = 'medium';
      let suggestedPrice = currentPrice;

      if (occupancy > 80) {
        demandLevel = 'high';
        suggestedPrice = currentPrice * 1.1; // Suggest 10% increase
      } else if (occupancy < 40) {
        demandLevel = 'low';
        suggestedPrice = currentPrice * 0.9; // Suggest 10% decrease
      }

      return {
        id: property.id,
        property: property.title,
        currentPrice,
        suggestedPrice: parseFloat(suggestedPrice.toFixed(2)),
        occupancyRate: Math.round(occupancy),
        demandLevel,
        competitorPrice: parseFloat((currentPrice * (0.95 + Math.random() * 0.1)).toFixed(2)),
        lastUpdated: now.toISOString()
      };
    });

    // Transform data for response
    const performanceData = {
      propertyId,
      timeRange: range,
      totalReservations,
      totalReviews,
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalRevenue,
      occupancyRate: parseFloat(occupancyRate.toFixed(1)),
      revenueTrends,
      occupancyByProperty,
      pricingComparison,
      averageStay,
      bookingStats: {
        confirmed: confirmedCount + checkedInCount,
        pending: pendingCount,
        cancelled: cancelledCount,
        completed: completedCount
      },
      recentBookings: (reservations as any[]).slice(0, 10).map(res => ({
        id: res.id,
        guest: res.user?.name || 'Unknown',
        email: res.user?.email || 'N/A',
        phone: res.user?.phone || 'N/A',
        property: res.listing?.title || 'Unknown',
        checkIn: res.startDate.toISOString().split('T')[0],
        checkOut: res.endDate.toISOString().split('T')[0],
        status: res.status.toLowerCase(),
        totalAmount: res.totalPrice
      })),
      pricingRecommendations
    };

    return NextResponse.json(
      ApiResponseFormatter.success(performanceData, 'Property performance fetched successfully')
    );
  } catch (error) {
    const errorResponse = PrismaErrorHandler.handle(error);
    return NextResponse.json(
      ApiResponseFormatter.error(errorResponse.message, 'Failed to fetch property performance', errorResponse.details),
      { status: errorResponse.status }
    );
  }
}

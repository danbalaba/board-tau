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
    if (!session || session.user?.role !== 'admin') {
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
              status: 'CONFIRMED',
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

    // Calculate occupancy rate (simplified)
    let totalRooms = 0;
    let occupiedRooms = 0;

    occupancyData.forEach(property => {
      property.rooms.forEach(room => {
        totalRooms++;
        const roomReservations = property.reservations.filter(reservation =>
          reservation.roomId === room.id
        );
        if (roomReservations.length > 0) {
          occupiedRooms++;
        }
      });
    });

    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

    // Transform data for response
    const performanceData = {
      propertyId,
      timeRange: range,
      totalReservations,
      totalReviews,
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalRevenue,
      occupancyRate: parseFloat(occupancyRate.toFixed(1)),
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

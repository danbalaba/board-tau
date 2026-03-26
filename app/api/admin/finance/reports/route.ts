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

    // Get report parameters from query params
    const { searchParams } = new URL(req.url);
    const reportType = searchParams.get('type') || 'overview'; // overview, revenue, expenses, occupancy
    const timeRange = searchParams.get('range') || '30d'; // 7d, 30d, 90d, 1y

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
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

    // Fetch data based on report type
    let reportData;

    switch (reportType) {
      case 'overview':
        reportData = await fetchOverviewReport(startDate, now);
        break;
      case 'revenue':
        reportData = await fetchRevenueReport(startDate, now);
        break;
      case 'expenses':
        reportData = await fetchExpensesReport(startDate, now);
        break;
      case 'occupancy':
        reportData = await fetchOccupancyReport(startDate, now);
        break;
      default:
        reportData = await fetchOverviewReport(startDate, now);
    }

    return NextResponse.json(
      ApiResponseFormatter.success(reportData, 'Financial report fetched successfully')
    );
  } catch (error) {
    const errorResponse = PrismaErrorHandler.handle(error);
    return NextResponse.json(
      ApiResponseFormatter.error(errorResponse.message, 'Failed to fetch financial report', errorResponse.details),
      { status: errorResponse.status }
    );
  }
}

// Helper functions for different report types
async function fetchOverviewReport(startDate: Date, endDate: Date) {
  const [totalRevenue, totalReservations, averageOccupancy, topProperties] = await Promise.all([
    db.reservation.aggregate({
      where: { paymentStatus: 'PAID', createdAt: { gte: startDate, lte: endDate } },
      _sum: { totalPrice: true },
    }),
    db.reservation.count({ where: { createdAt: { gte: startDate, lte: endDate } } }),
    fetchAverageOccupancy(startDate, endDate),
    db.reservation.groupBy({
      by: ['listingId'],
      where: { paymentStatus: 'PAID', createdAt: { gte: startDate, lte: endDate } },
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

  return {
    totalRevenue: totalRevenue._sum.totalPrice || 0,
    totalReservations,
    averageOccupancy: parseFloat(averageOccupancy.toFixed(1)),
    topProperties,
  };
}

async function fetchRevenueReport(startDate: Date, endDate: Date) {
  const [dailyRevenue, monthlyRevenue] = await Promise.all([
    db.reservation.groupBy({
      by: ['createdAt'],
      where: { paymentStatus: 'PAID', createdAt: { gte: startDate, lte: endDate } },
      _sum: { totalPrice: true },
      orderBy: { createdAt: 'asc' },
    }).then(data => data.map(item => ({
      date: new Date(item.createdAt).toLocaleDateString(),
      revenue: item._sum.totalPrice || 0,
    }))),
    fetchMonthlyRevenue(startDate, endDate),
  ]);

  return {
    dailyRevenue,
    monthlyRevenue,
  };
}

async function fetchExpensesReport(startDate: Date, endDate: Date) {
  // In a real application, expenses would come from a separate table
  return {
    totalExpenses: 0,
    expensesByCategory: [],
    monthlyExpenses: [],
  };
}

async function fetchOccupancyReport(startDate: Date, endDate: Date) {
  const [totalRooms, occupiedRooms] = await Promise.all([
    db.room.count(),
    db.reservation.groupBy({
      by: ['roomId'],
      where: {
        status: 'RESERVED',
        OR: [
          { startDate: { lte: endDate }, endDate: { gte: startDate } },
          { startDate: { gte: startDate, lte: endDate } },
        ],
      },
      _count: { id: true },
    }).then(data => data.length),
  ]);

  const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

  return {
    totalRooms,
    occupiedRooms,
    occupancyRate: parseFloat(occupancyRate.toFixed(1)),
  };
}

async function fetchAverageOccupancy(startDate: Date, endDate: Date) {
  const [totalRooms, occupiedRooms] = await Promise.all([
    db.room.count(),
    db.reservation.groupBy({
      by: ['roomId'],
      where: {
        status: 'RESERVED',
        OR: [
          { startDate: { lte: endDate }, endDate: { gte: startDate } },
          { startDate: { gte: startDate, lte: endDate } },
        ],
      },
      _count: { id: true },
    }).then(data => data.length),
  ]);

  return totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;
}

async function fetchMonthlyRevenue(startDate: Date, endDate: Date) {
  const dailyRevenue = await db.reservation.groupBy({
    by: ['createdAt'],
    where: { paymentStatus: 'PAID', createdAt: { gte: startDate, lte: endDate } },
    _sum: { totalPrice: true },
    orderBy: { createdAt: 'asc' },
  });

  const monthlyRevenueMap = new Map<string, number>();
  dailyRevenue.forEach(item => {
    const date = new Date(item.createdAt);
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    monthlyRevenueMap.set(monthKey, (monthlyRevenueMap.get(monthKey) || 0) + (item._sum.totalPrice || 0));
  });

  return Array.from(monthlyRevenueMap.entries())
    .map(([month, revenue]) => ({
      month,
      revenue,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

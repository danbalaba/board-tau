import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponseFormatter } from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(ApiResponseFormatter.error('Unauthorized'), { status: 401 });
    }

    const body = await req.json();
    const { dataSource, exportFormat, dateRange, startDate, endDate } = body;

    // Calculate dates
    let start = new Date();
    let end = new Date();
    
    if (dateRange === 'today') {
      start.setHours(0, 0, 0, 0);
    } else if (dateRange === 'yesterday') {
      start.setDate(end.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
    } else if (dateRange === 'last7') {
      start.setDate(end.getDate() - 7);
    } else if (dateRange === 'last30') {
      start.setDate(end.getDate() - 30);
    } else if (dateRange === 'last90') {
      start.setDate(end.getDate() - 90);
    } else if (dateRange === 'custom') {
      start = new Date(startDate);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    }

    let data: any[] = [];
    let filename = `${dataSource}_export_${new Date().toISOString().split('T')[0]}`;

    // Fetch data based on source
    if (dataSource === 'users') {
      data = await db.user.findMany({
        where: { createdAt: { gte: start, lte: end } },
        select: { id: true, name: true, email: true, role: true, createdAt: true, lastLogin: true }
      });
    } else if (dataSource === 'listings') {
      data = await db.listing.findMany({
        where: { createdAt: { gte: start, lte: end } },
        select: { id: true, title: true, price: true, status: true, createdAt: true, region: true }
      });
    } else if (dataSource === 'reservations') {
      data = await db.reservation.findMany({
        where: { createdAt: { gte: start, lte: end } },
        select: { id: true, totalPrice: true, status: true, paymentStatus: true, createdAt: true, startDate: true, endDate: true }
      });
    } else if (dataSource === 'reviews') {
      data = await db.review.findMany({
        where: { createdAt: { gte: start, lte: end } },
        select: { id: true, rating: true, comment: true, status: true, createdAt: true, listingId: true }
      });
    } else if (dataSource === 'financial') {
      data = await db.reservation.findMany({
        where: { paymentStatus: 'PAID', createdAt: { gte: start, lte: end } },
        select: { id: true, totalPrice: true, createdAt: true, paymentMethod: true }
      });
    }

    if (data.length === 0) {
      return NextResponse.json(ApiResponseFormatter.error('No data found for the selected range'), { status: 404 });
    }

    // Format handling
    if (exportFormat === 'json') {
      return new NextResponse(JSON.stringify(data, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}.json"`
        }
      });
    }

    // CSV Generation (Default)
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const val = row[header];
          if (val instanceof Date) return `"${val.toISOString()}"`;
          const escaped = ('' + (val ?? '')).replace(/"/g, '""');
          return `"${escaped}"`;
        }).join(',')
      )
    ].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}.csv"`
      }
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(ApiResponseFormatter.error('Internal Server Error'), { status: 500 });
  }
}

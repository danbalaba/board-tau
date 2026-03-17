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

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '10');
    const paymentStatus = searchParams.get('paymentStatus') || '';
    const paymentMethod = searchParams.get('paymentMethod') || '';
    const dateRange = searchParams.get('dateRange') || '';

    // Calculate pagination
    const skip = (page - 1) * perPage;

    // Build query conditions
    const where: any = {};

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    if (dateRange) {
      const [start, end] = dateRange.split(' to ');
      if (start && end) {
        where.createdAt = {
          gte: new Date(start),
          lte: new Date(end + 'T23:59:59'),
        };
      }
    }

    // Fetch transactions
    const [transactions, total] = await Promise.all([
      db.reservation.findMany({
        where,
        include: {
          user: true,
          listing: true,
          room: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: perPage,
      }),
      db.reservation.count({ where }),
    ]);

    // Transform data for response
    const transformedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      userId: transaction.userId,
      listingId: transaction.listingId,
      roomId: transaction.roomId,
      startDate: transaction.startDate,
      endDate: transaction.endDate,
      durationInDays: transaction.durationInDays,
      totalPrice: transaction.totalPrice,
      status: transaction.status,
      paymentStatus: transaction.paymentStatus,
      paymentMethod: transaction.paymentMethod,
      paymentReference: transaction.paymentReference,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      user: {
        id: transaction.user.id,
        name: transaction.user.name,
        email: transaction.user.email,
        image: transaction.user.image,
      },
      listing: {
        id: transaction.listing.id,
        title: transaction.listing.title,
        description: transaction.listing.description,
        imageSrc: transaction.listing.imageSrc,
      },
      room: transaction.room,
    }));

    return NextResponse.json(
      ApiResponseFormatter.success(transformedTransactions, 'Transactions fetched successfully', {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      })
    );
  } catch (error) {
    const errorResponse = PrismaErrorHandler.handle(error);
    return NextResponse.json(
      ApiResponseFormatter.error(errorResponse.message, 'Failed to fetch transactions', errorResponse.details),
      { status: errorResponse.status }
    );
  }
}

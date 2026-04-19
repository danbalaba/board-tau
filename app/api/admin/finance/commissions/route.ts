import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponseFormatter } from '@/lib/api-response';
import { PrismaErrorHandler } from '@/lib/prisma-error-handler';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        ApiResponseFormatter.error('Unauthorized', 'You must be an admin to access this resource'),
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '10');
    const skip = (page - 1) * perPage;

    // Fetch reservations with payment status PAID or PENDING for commission tracking
    const [reservations, total, stats] = await Promise.all([
      db.reservation.findMany({
        where: {
          paymentStatus: { in: ['PAID', 'PENDING'] }
        },
        include: {
          user: true,
          listing: {
            include: { user: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: perPage,
      }),
      db.reservation.count({
        where: {
          paymentStatus: { in: ['PAID', 'PENDING'] }
        }
      }),
      db.reservation.aggregate({
        where: {
          paymentStatus: { in: ['PAID', 'PENDING'] }
        },
        _sum: { totalPrice: true }
      })
    ]);

    const commissionRate = 0.15; // 15% Platform Fee

    const transformedCommissions = reservations.map(res => ({
      id: res.id,
      host: res.listing?.user?.name || 'Unknown Host',
      listing: res.listing?.title || 'Unknown Property',
      amount: res.totalPrice,
      commissionRate: commissionRate * 100,
      commissionAmount: res.totalPrice * commissionRate,
      date: res.createdAt,
      status: res.paymentStatus === 'PAID' ? 'paid' : 'pending'
    }));

    const totalCommissions = (stats._sum.totalPrice || 0) * commissionRate;
    const paidCommissions = await db.reservation.aggregate({
      where: { paymentStatus: 'PAID' },
      _sum: { totalPrice: true }
    }).then(res => (res._sum.totalPrice || 0) * commissionRate);

    return NextResponse.json(
      ApiResponseFormatter.success(transformedCommissions, 'Commissions fetched successfully', {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
        stats: {
          totalCommissions,
          paidCommissions,
          pendingCommissions: totalCommissions - paidCommissions,
          currentRate: commissionRate * 100
        }
      })
    );
  } catch (error) {
    const errorResponse = PrismaErrorHandler.handle(error);
    return NextResponse.json(
      ApiResponseFormatter.error(errorResponse.message, 'Failed to fetch commissions', errorResponse.details),
      { status: errorResponse.status }
    );
  }
}

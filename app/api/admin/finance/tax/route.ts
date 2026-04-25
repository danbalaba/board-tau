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

    // Fetch revenue for the current year to calculate taxes
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const now = new Date();

    const quarterlyRevenue = await Promise.all([
      // Q1
      db.reservation.aggregate({
        where: { paymentStatus: 'PAID', createdAt: { gte: new Date(currentYear, 0, 1), lte: new Date(currentYear, 2, 31, 23, 59, 59) } },
        _sum: { totalPrice: true }
      }),
      // Q2
      db.reservation.aggregate({
        where: { paymentStatus: 'PAID', createdAt: { gte: new Date(currentYear, 3, 1), lte: new Date(currentYear, 5, 30, 23, 59, 59) } },
        _sum: { totalPrice: true }
      }),
      // Q3
      db.reservation.aggregate({
        where: { paymentStatus: 'PAID', createdAt: { gte: new Date(currentYear, 6, 1), lte: new Date(currentYear, 8, 30, 23, 59, 59) } },
        _sum: { totalPrice: true }
      }),
      // Q4
      db.reservation.aggregate({
        where: { paymentStatus: 'PAID', createdAt: { gte: new Date(currentYear, 9, 1), lte: new Date(currentYear, 11, 31, 23, 59, 59) } },
        _sum: { totalPrice: true }
      }),
    ]);

    const taxRate = 0.12; // 12% Sales Tax (VAT)

    const taxRecords = quarterlyRevenue.map((q, index) => {
      const revenue = q._sum.totalPrice || 0;
      const quarter = index + 1;
      const isPast = new Date() > new Date(currentYear, index * 3 + 2, 31);
      
      return {
        id: `tax-q${quarter}-${currentYear}`,
        period: `Q${quarter} ${currentYear}`,
        taxType: 'Sales Tax (12%)',
        amount: revenue * taxRate,
        status: revenue > 0 ? (isPast ? 'filed' : 'pending') : 'pending',
        filingDate: revenue > 0 && isPast ? new Date(currentYear, index * 3 + 3, 15).toISOString() : '',
        dueDate: new Date(currentYear, index * 3 + 3, 20, 23, 59, 59).toISOString(),
      };
    }).filter(record => record.amount > 0 || record.period.includes(currentYear.toString()));

    const totalTaxesPaid = taxRecords
      .filter(r => r.status === 'filed')
      .reduce((sum, r) => sum + r.amount, 0);

    const pendingTaxes = taxRecords
      .filter(r => r.status === 'pending')
      .reduce((sum, r) => sum + r.amount, 0);

    return NextResponse.json(
      ApiResponseFormatter.success(taxRecords, 'Tax records fetched successfully', {
        stats: {
          totalTaxesPaid,
          pendingTaxes,
          complianceRate: (totalTaxesPaid / (totalTaxesPaid + pendingTaxes || 1)) * 100,
          totalRecords: taxRecords.length
        }
      })
    );
  } catch (error) {
    const errorResponse = PrismaErrorHandler.handle(error);
    return NextResponse.json(
      ApiResponseFormatter.error(errorResponse.message, 'Failed to fetch tax records', errorResponse.details),
      { status: errorResponse.status }
    );
  }
}

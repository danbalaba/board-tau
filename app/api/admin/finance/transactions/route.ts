import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get('page') ?? 1);
  const limit = Number(searchParams.get('limit') ?? 20);
  const paymentStatus = searchParams.get('paymentStatus') ?? undefined;
  const paymentMethod = searchParams.get('paymentMethod') ?? undefined;

  const where: any = {};
  if (paymentStatus && paymentStatus !== 'ALL') where.paymentStatus = paymentStatus;
  if (paymentMethod && paymentMethod !== 'ALL') where.paymentMethod = paymentMethod;

  const [reservations, total] = await Promise.all([
    db.reservation.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        listing: { select: { title: true } },
        room: { select: { name: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    db.reservation.count({ where }),
  ]);

  return NextResponse.json({ reservations, total, page, limit });
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page') || 1);
    const limit = Number(searchParams.get('limit') || 20);
    const action = searchParams.get('action') || undefined;

    const where: any = {};
    if (action && action !== 'ALL') {
      where.action = action;
    }

    const [logs, total] = await Promise.all([
      db.adminActivityLog.findMany({
        where,
        include: {
          admin: {
            select: { name: true, email: true, role: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.adminActivityLog.count({ where })
    ]);

    return NextResponse.json({ logs, total, page, limit });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}

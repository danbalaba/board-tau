import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponseFormatter } from '@/lib/api-response';
import { PrismaErrorHandler } from '@/lib/prisma-error-handler';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        ApiResponseFormatter.error('Unauthorized', 'You must be an admin to access this resource'),
        { status: 401 }
      );
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const isSuspended = {
      AND: [
        { deletedAt: { isSet: true } },
        { NOT: { deletedAt: null } }
      ]
    };

    const [
      totalUsers,
      suspendedAccounts,
      newThisWeek,
      newLastWeek,
      pendingVerification,
      totalUsersLastWeek,
      suspendedLastWeek,
      pendingLastWeek,
    ] = await Promise.all([
      // Total registered users
      db.user.count(),
      // Currently suspended (banned) — deletedAt is set to a real date
      db.user.count({ where: isSuspended }),
      // New users registered in the last 7 days
      db.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      // New users registered 7-14 days ago (for trend comparison)
      db.user.count({ where: { createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } } }),
      // Users who have not verified their email
      db.user.count({ where: { emailVerified: null } }),
      // Total users created before this week (baseline for growth trend)
      db.user.count({ where: { createdAt: { lt: sevenDaysAgo } } }),
      // Suspended accounts suspended before this week (trend baseline)
      db.user.count({
        where: {
          AND: [
            { deletedAt: { isSet: true } },
            { NOT: { deletedAt: null } },
            { deletedAt: { lt: sevenDaysAgo } }
          ]
        }
      }),
      // Unverified accounts created before this week (trend baseline)
      db.user.count({
        where: {
          AND: [
            { emailVerified: null },
            { createdAt: { lt: sevenDaysAgo } }
          ]
        }
      }),
    ]);

    return NextResponse.json(
      ApiResponseFormatter.success({
        totalUsers,
        totalUsersLastWeek,
        suspendedAccounts,
        suspendedLastWeek,
        newThisWeek,
        newLastWeek,
        pendingVerification,
        pendingLastWeek,
      }, 'User stats fetched successfully')
    );
  } catch (error) {
    const errorResponse = PrismaErrorHandler.handle(error);
    return NextResponse.json(
      ApiResponseFormatter.error(errorResponse.message, 'Failed to fetch user stats', errorResponse.details),
      { status: errorResponse.status }
    );
  }
}

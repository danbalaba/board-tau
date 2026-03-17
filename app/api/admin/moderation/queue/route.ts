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
    const entityType = searchParams.get('entityType') || '';

    // Calculate pagination
    const skip = (page - 1) * perPage;

    // Build query conditions
    const where: any = { status: 'pending' };
    if (entityType) {
      where.entityType = entityType;
    }

    // Fetch pending items with count
    const [pendingItems, total] = await Promise.all([
      // Fetch all pending moderation items from different models
      (async () => {
        const [hostApplications, listings, reviews] = await Promise.all([
          db.hostApplication.findMany({
            where: { status: 'pending' },
            include: { user: true },
            orderBy: { createdAt: 'desc' },
          }).then(items => items.map(item => ({
            id: item.id,
            entityType: 'hostApplication',
            title: `Host Application: ${item.user?.name}`,
            description: 'New host application',
            user: item.user,
            status: item.status,
            createdAt: item.createdAt,
          }))),
          db.listing.findMany({
            where: { status: 'pending' },
            include: { user: true },
            orderBy: { createdAt: 'desc' },
          }).then(items => items.map(item => ({
            id: item.id,
            entityType: 'listing',
            title: item.title,
            description: item.description,
            user: item.user,
            status: item.status,
            createdAt: item.createdAt,
          }))),
          db.review.findMany({
            where: { status: 'pending' },
            include: { user: true, listing: true },
            orderBy: { createdAt: 'desc' },
          }).then(items => items.map(item => ({
            id: item.id,
            entityType: 'review',
            title: `Review: ${item.listing?.title}`,
            description: item.comment,
            user: item.user,
            status: item.status,
            createdAt: item.createdAt,
          }))),
        ]);

        return [...hostApplications, ...listings, ...reviews]
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(skip, skip + perPage);
      })(),
      // Get total count
      (async () => {
        const [hostCount, listingCount, reviewCount] = await Promise.all([
          db.hostApplication.count({ where: { status: 'pending' } }),
          db.listing.count({ where: { status: 'pending' } }),
          db.review.count({ where: { status: 'pending' } }),
        ]);
        return hostCount + listingCount + reviewCount;
      })(),
    ]);

    return NextResponse.json(
      ApiResponseFormatter.success(pendingItems, 'Moderation queue fetched successfully', {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      })
    );
  } catch (error) {
    const errorResponse = PrismaErrorHandler.handle(error);
    return NextResponse.json(
      ApiResponseFormatter.error(errorResponse.message, 'Failed to fetch moderation queue', errorResponse.details),
      { status: errorResponse.status }
    );
  }
}

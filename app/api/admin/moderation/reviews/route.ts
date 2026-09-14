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
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        ApiResponseFormatter.error('Unauthorized', 'You must be an admin to access this resource'),
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '10');
    const statusParam = searchParams.get('status'); // pending, approved, removed, all
    const isArchivedParam = searchParams.get('isArchived') === 'true';
    const range = searchParams.get('range') || '30d';

    // Calculate date ranges for comparisons
    let days = 30;
    if (range === '7d') days = 7;
    if (range === '90d') days = 90;
    if (range === '1y') days = 365;

    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const previousStartDate = new Date(now.getTime() - (days * 2) * 24 * 60 * 60 * 1000);

    // Calculate pagination
    const skip = (page - 1) * perPage;

    const isArchived = isArchivedParam;

    const baseTargetWhere: any = isArchived
      ? { isArchived: true }
      : { isArchived: false };

    let statusFilter: string | undefined = undefined;
    if (statusParam && statusParam.toLowerCase() !== 'all') {
      statusFilter = statusParam.toLowerCase();
    }

    const whereClause: any = isArchived
      ? { isArchived: true, ...(statusFilter ? { status: statusFilter } : {}) }
      : { isArchived: false, ...(statusFilter ? { status: statusFilter } : {}) };

    // Fetch reviews to moderate with status counts & trend stats
    const [
      reviews, 
      totalPending, 
      approvedCount, 
      rejectedCount,
      totalPreviousCount,
      pendingPreviousCount,
      approvedPreviousCount,
      rejectedPreviousCount,
      ratingAggregate
    ] = await Promise.all([
      db.review.findMany({
        where: whereClause,
        include: {
          user: true,
          listing: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: perPage,
      }),
      db.review.count({ where: { ...baseTargetWhere, status: 'pending' } }),
      db.review.count({ where: { ...baseTargetWhere, status: 'approved' } }),
      db.review.count({ where: { ...baseTargetWhere, OR: [{ status: 'removed' }, { status: 'rejected' }] } }),

      // Historical comparison stats for range trend percentage
      db.review.count({ where: { ...baseTargetWhere, createdAt: { gte: previousStartDate, lt: startDate } } }),
      db.review.count({ where: { ...baseTargetWhere, status: 'pending', createdAt: { gte: previousStartDate, lt: startDate } } }),
      db.review.count({ where: { ...baseTargetWhere, status: 'approved', createdAt: { gte: previousStartDate, lt: startDate } } }),
      db.review.count({ where: { ...baseTargetWhere, OR: [{ status: 'removed' }, { status: 'rejected' }], createdAt: { gte: previousStartDate, lt: startDate } } }),

      db.review.aggregate({
        where: baseTargetWhere,
        _avg: { rating: true },
      }),
    ]);

    const avgRating = ratingAggregate._avg.rating ? ratingAggregate._avg.rating.toFixed(1) : '0.0';

    // Transform data for response
    const transformedReviews = reviews.map((review: any) => ({
      id: review.id,
      userId: review.userId,
      listingId: review.listingId,
      rating: review.rating,
      comment: review.comment,
      cleanliness: review.cleanliness,
      accuracy: review.accuracy,
      communication: review.communication,
      location: review.location,
      value: review.value,
      status: review.status,
      isArchived: review.isArchived,
      createdAt: review.createdAt,
      response: review.response,
      respondedAt: review.respondedAt,
      user: {
        id: review.user?.id,
        name: review.user?.name,
        email: review.user?.email,
        image: review.user?.image,
      },
      listing: {
        id: review.listing?.id,
        title: review.listing?.title,
        description: review.listing?.description,
        imageSrc: review.listing?.imageSrc,
      },
    }));

    return NextResponse.json(
      ApiResponseFormatter.success(transformedReviews, 'Reviews to moderate fetched successfully', {
        total: totalPending,
        page,
        perPage,
        totalPages: Math.ceil(totalPending / perPage),
        stats: {
          pending: totalPending,
          approved: approvedCount,
          rejected: rejectedCount,
          totalLastWeek: totalPreviousCount,
          pendingLastWeek: pendingPreviousCount,
          approvedLastWeek: approvedPreviousCount,
          rejectedLastWeek: rejectedPreviousCount,
          avgRating,
        }
      })
    );
  } catch (error) {
    const errorResponse = PrismaErrorHandler.handle(error);
    return NextResponse.json(
      ApiResponseFormatter.error(errorResponse.message, 'Failed to fetch reviews to moderate', errorResponse.details),
      { status: errorResponse.status }
    );
  }
}

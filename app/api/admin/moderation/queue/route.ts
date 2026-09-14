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

    const { hasPermission } = await import("@/lib/rbac");
    const permitted = await hasPermission(session.user.id, "VIEW_MODERATION_QUEUE");
    if (!permitted) return NextResponse.json(
      ApiResponseFormatter.error('Forbidden', 'Missing permission VIEW_MODERATION_QUEUE'),
      { status: 403 }
    );

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '10');
    const entityType = searchParams.get('entityType') || '';
    const range = searchParams.get('range') || '30d';

    let days = 30;
    if (range === '7d') days = 7;
    if (range === '90d') days = 90;
    if (range === '1y') days = 365;

    // Calculate pagination
    const skip = (page - 1) * perPage;

    // Build query conditions
    const where: any = { status: 'pending' };
    if (entityType) {
      where.entityType = entityType;
    }

    // Fetch pending items with count
    const [pendingItems, counts, recentLogs] = await Promise.all([
      // Fetch all pending moderation items from different models
      (async () => {
        const [hostApplications, listings, reviews] = await Promise.all([
          db.hostApplication.findMany({
            where: { status: 'pending' },
            include: { user: true },
            orderBy: { createdAt: 'desc' },
          }).then((items: any) => items.map((item: any) => ({
            id: item.id,
            entityType: 'hostApplication',
            title: `Host Application: ${item.user?.name || 'Applicant'}`,
            description: `Verification documents submitted by ${item.user?.name || 'User'} (${item.user?.email || 'N/A'}). Awaiting administrative verification.`,
            submittedBy: item.user?.name || item.user?.email || 'Applicant',
            user: item.user,
            status: item.status,
            createdAt: item.createdAt,
            isArchived: Boolean(item.isArchived || item.isAdminArchived),
            meta: {
              email: item.user?.email,
              phone: item.user?.phone,
              governmentIdType: item.governmentIdType || 'Government ID',
              isArchived: Boolean(item.isArchived || item.isAdminArchived),
            }
          }))),
          db.listing.findMany({
            where: { status: 'PENDING' },
            include: { user: true, propertyType: true },
            orderBy: { createdAt: 'desc' },
          }).then((items: any) => items.map((item: any) => ({
            id: item.id,
            entityType: 'listing',
            title: item.title,
            description: item.description || `Property listing submitted by landlord ${item.user?.name || 'Host'}. Awaiting platform verification.`,
            submittedBy: item.user?.name || 'Landlord',
            user: item.user,
            status: item.status,
            createdAt: item.createdAt,
            isArchived: Boolean(item.isAdminArchived || item.isArchived),
            meta: {
              propertyTypeName: item.propertyType?.name || 'Property',
              price: item.price,
              address: item.address,
              isArchived: Boolean(item.isAdminArchived || item.isArchived),
            }
          }))),
          db.review.findMany({
            where: { status: 'pending' },
            include: { user: true, listing: true },
            orderBy: { createdAt: 'desc' },
          }).then((items: any) => items.map((item: any) => ({
            id: item.id,
            entityType: 'review',
            title: item.listing?.title ? `Review for ${item.listing.title}` : 'Property Review',
            description: item.comment ? `"${item.comment}"` : 'Student review awaiting moderation check.',
            submittedBy: item.user?.name || 'Student',
            user: item.user,
            status: item.status,
            createdAt: item.createdAt,
            isArchived: Boolean(item.isAdminArchived || item.isArchived),
            meta: {
              rating: item.rating,
              propertyTitle: item.listing?.title,
              isArchived: Boolean(item.isAdminArchived || item.isArchived),
            }
          }))),
        ]);

        return [...hostApplications, ...listings, ...reviews]
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(skip, skip + perPage);
      })(),
      // Get individual counts
      (async () => {
        const now = new Date();
        const pastDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

        const [
          hostCount, listingCount, reviewCount,
          hostCountLastWeek, listingCountLastWeek, reviewCountLastWeek
        ] = await Promise.all([
          db.hostApplication.count({ where: { status: 'PENDING' } }),
          db.listing.count({ where: { status: 'PENDING' } }),
          db.review.count({ where: { status: 'PENDING' } }),
          db.hostApplication.count({ where: { status: 'PENDING', createdAt: { lt: pastDate } } }),
          db.listing.count({ where: { status: 'PENDING', createdAt: { lt: pastDate } } }),
          db.review.count({ where: { status: 'PENDING', createdAt: { lt: pastDate } } }),
        ]);
        return {
          hostCount,
          listingCount,
          reviewCount,
          total: hostCount + listingCount + reviewCount,
          hostCountLastWeek,
          listingCountLastWeek,
          reviewCountLastWeek,
          totalLastWeek: hostCountLastWeek + listingCountLastWeek + reviewCountLastWeek
        };
      })(),
      // Fetch recent Moderation Logs
      db.moderationLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { admin: { select: { name: true, email: true, image: true } } }
      })
    ]);

    return NextResponse.json(
      ApiResponseFormatter.success({ pendingItems, recentLogs }, 'Moderation queue fetched successfully', {
        total: counts.total,
        page,
        perPage,
        totalPages: Math.ceil(counts.total / perPage),
        stats: {
          pendingHosts: counts.hostCount,
          pendingListings: counts.listingCount,
          pendingReviews: counts.reviewCount,
          pendingHostsLastWeek: counts.hostCountLastWeek,
          pendingListingsLastWeek: counts.listingCountLastWeek,
          pendingReviewsLastWeek: counts.reviewCountLastWeek,
          totalLastWeek: counts.totalLastWeek
        }
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

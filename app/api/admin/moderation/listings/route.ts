import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponseFormatter } from '@/lib/api-response';
import { PrismaErrorHandler } from '@/lib/prisma-error-handler';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';

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
    const permitted = await hasPermission(session.user.id, "MODERATE_LISTINGS");
    if (!permitted) return NextResponse.json(
      ApiResponseFormatter.error('Forbidden', 'Missing permission MODERATE_LISTINGS'),
      { status: 403 }
    );

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '10');
    const statusParam = searchParams.get('status'); // pending, approved, active, rejected, archived, all
    const isArchivedParam = searchParams.get('isArchived') === 'true';
    const range = searchParams.get('range') || '30d';

    // Calculate date ranges for trend comparisons
    let days = 30;
    if (range === '7d') days = 7;
    if (range === '90d') days = 90;
    if (range === '1y') days = 365;

    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const previousStartDate = new Date(now.getTime() - (days * 2) * 24 * 60 * 60 * 1000);

    // Calculate pagination
    const skip = (page - 1) * perPage;

    let statusFilter: any = undefined;
    if (statusParam) {
      const upperStatus = statusParam.toUpperCase();
      if (upperStatus === 'PENDING') statusFilter = 'PENDING';
      if (upperStatus === 'ACTIVE' || upperStatus === 'APPROVED') statusFilter = 'ACTIVE';
      if (upperStatus === 'REJECTED') statusFilter = 'REJECTED';
      if (upperStatus === 'ALL') statusFilter = undefined;
    }

    const isArchived = isArchivedParam || (statusParam && statusParam.toUpperCase() === 'ARCHIVED');

    const baseTargetWhere: any = isArchived
      ? { OR: [{ isAdminArchived: true }, { isArchived: true }] }
      : { isAdminArchived: false, isArchived: false };

    const whereClause: any = isArchived
      ? { OR: [{ isAdminArchived: true }, { isArchived: true }], ...(statusFilter ? { status: statusFilter } : {}) }
      : { isAdminArchived: false, isArchived: false, ...(statusFilter ? { status: statusFilter } : {}) };

    // Fetch listings to review with status counts & historical trend stats
    const [
      listings, 
      total, 
      approvedCount, 
      rejectedCount,
      totalPreviousCount,
      pendingPreviousCount,
      approvedPreviousCount,
      rejectedPreviousCount
    ] = await Promise.all([
      db.listing.findMany({
        where: whereClause,
        include: {
          user: true,
          propertyType: true,
          rooms: {
            include: {
              images: true,
              roomTypeDefinition: true,
              roomLinks: {
                include: {
                  attribute: true
                }
              }
            }
          },
          listingLinks: {
            include: {
              attribute: true
            }
          },
          images: true,
          leaseContracts: {
            include: {
              signatures: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: perPage,
      }),
      db.listing.count({ where: { ...baseTargetWhere, status: 'PENDING' } }),
      db.listing.count({
        where: {
          ...baseTargetWhere,
          status: 'ACTIVE',
        }
      }),
      db.listing.count({ where: { ...baseTargetWhere, status: 'REJECTED' } }),

      // Historical comparison stats for date range percentage trends
      db.listing.count({ where: { ...baseTargetWhere, createdAt: { gte: previousStartDate, lt: startDate } } }),
      db.listing.count({ where: { ...baseTargetWhere, status: 'PENDING', createdAt: { gte: previousStartDate, lt: startDate } } }),
      db.listing.count({ where: { ...baseTargetWhere, status: 'ACTIVE', createdAt: { gte: previousStartDate, lt: startDate } } }),
      db.listing.count({ where: { ...baseTargetWhere, status: 'REJECTED', createdAt: { gte: previousStartDate, lt: startDate } } }),
    ]);

    console.log('Listings Moderation API Stats Debug:', {
      total,
      approvedCount,
      rejectedCount,
    });

    // Transform data for response
    const transformedListings = listings.map((listing: any) => {
      const lat = listing.latitude ?? listing.location?.lat ?? listing.location?.coordinates?.[1] ?? 15.6885;
      const lng = listing.longitude ?? listing.location?.lng ?? listing.location?.coordinates?.[0] ?? 120.4146;
      const latlng = [lng, lat];
      const coordinates = [lat, lng];

      const address = listing.address || listing.location?.address || listing.location?.street || listing.location?.value || null;
      const city = listing.city || listing.location?.city || null;
      const zipCode = listing.zipCode || listing.location?.zipCode || null;
      const category = listing.propertyType?.name || listing.category || (listing.location as any)?.category || null;

      const primaryContract = listing.leaseContracts?.[0];
      const depositAmount = primaryContract?.depositAmount || listing.depositAmount || 0;
      const moveOutNoticeDays = primaryContract?.moveOutNoticeDays || listing.moveOutNoticeDays || 30;
      const landlordSig = primaryContract?.signatures?.find((s: any) => s.signerType === 'LANDLORD')?.signatureUrl || listing.landlordSignatureBase64;

      return {
        ...listing,
        id: listing.id,
        title: listing.title,
        description: listing.description,
        imageSrc: listing.imageSrc,
        category,
        address,
        city,
        zipCode,
        latlng,
        coordinates,
        latitude: lat,
        longitude: lng,
        roomCount: listing.roomCount,
        bathroomCount: listing.bathroomCount,
        price: listing.price,
        status: listing.status,
        rating: listing.rating,
        reviewCount: listing.reviewCount,
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt,
        depositAmount,
        moveOutNoticeDays,
        landlordSignatureBase64: landlordSig,
        user: {
          id: listing.user?.id,
          name: listing.user?.name || null,
          email: listing.user?.email || null,
          image: listing.user?.image || null,
          role: listing.user?.role || null,
          businessName: listing.user?.businessName || null,
          phoneNumber: listing.user?.phoneNumber || null,
        },
        businessInfo: listing.businessInfo || (listing.user?.businessName ? { businessName: listing.user.businessName } : null),
        rooms: listing.rooms || [],
        images: listing.images || [],
        amenities: listing.amenities || listing.amenities_list || [],
        amenities_list: listing.amenities_list || [],
        rules: listing.rules || {},
        features: listing.features || {},
        customClauses: listing.customClauses || [],
        leaseContracts: listing.leaseContracts || [],
      };
    });

    return NextResponse.json(
      ApiResponseFormatter.success(transformedListings, 'Listings to review fetched successfully', {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
        stats: {
          pending: total,
          active: approvedCount,
          rejected: rejectedCount,
          totalLastWeek: totalPreviousCount,
          pendingLastWeek: pendingPreviousCount,
          activeLastWeek: approvedPreviousCount,
          rejectedLastWeek: rejectedPreviousCount,
        }
      })
    );
  } catch (error) {
    const errorResponse = PrismaErrorHandler.handle(error);
    return NextResponse.json(
      ApiResponseFormatter.error(errorResponse.message, 'Failed to fetch listings to review', errorResponse.details),
      { status: errorResponse.status }
    );
  }
}

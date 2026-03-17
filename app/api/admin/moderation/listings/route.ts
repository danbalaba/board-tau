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
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        ApiResponseFormatter.error('Unauthorized', 'You must be an admin to access this resource'),
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '10');
    const status = searchParams.get('status') || 'pending'; // pending, approved, rejected

    // Calculate pagination
    const skip = (page - 1) * perPage;

    // Fetch listings to review
    const [listings, total] = await Promise.all([
      db.listing.findMany({
        where: { status },
        include: {
          user: true,
          rooms: true,
          images: true,
          amenities: true,
          rules: true,
          features: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: perPage,
      }),
      db.listing.count({ where: { status } }),
    ]);

    // Transform data for response
    const transformedListings = listings.map(listing => ({
      id: listing.id,
      title: listing.title,
      description: listing.description,
      imageSrc: listing.imageSrc,
      roomCount: listing.roomCount,
      bathroomCount: listing.bathroomCount,
      price: listing.price,
      location: listing.location,
      region: listing.region,
      latitude: listing.latitude,
      longitude: listing.longitude,
      status: listing.status,
      rating: listing.rating,
      reviewCount: listing.reviewCount,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
      user: {
        id: listing.user.id,
        name: listing.user.name,
        email: listing.user.email,
      },
      rooms: listing.rooms,
      images: listing.images,
      amenities: listing.amenities,
      rules: listing.rules,
      features: listing.features,
    }));

    return NextResponse.json(
      ApiResponseFormatter.success(transformedListings, 'Listings to review fetched successfully', {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
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

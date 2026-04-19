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
    const status = searchParams.get('status') || 'pending'; // pending, approved, removed

    // Calculate pagination
    const skip = (page - 1) * perPage;

    // Fetch reviews to moderate with status counts
    const [reviews, total, approvedCount] = await Promise.all([
      db.review.findMany({
        where: { status },
        include: {
          user: true,
          listing: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: perPage,
      }),
      db.review.count({ where: { status: 'pending' } }),
      db.review.count({ where: { status: 'approved' } }),
    ]);

    // Transform data for response
    const transformedReviews = reviews.map(review => ({
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
      createdAt: review.createdAt,
      response: review.response,
      respondedAt: review.respondedAt,
      user: {
        id: review.user.id,
        name: review.user.name,
        email: review.user.email,
        image: review.user.image,
      },
      listing: {
        id: review.listing.id,
        title: review.listing.title,
        description: review.listing.description,
        imageSrc: review.listing.imageSrc,
      },
    }));

    return NextResponse.json(
      ApiResponseFormatter.success(transformedReviews, 'Reviews to moderate fetched successfully', {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
        stats: {
          pending: total,
          approved: approvedCount,
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

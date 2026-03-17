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
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const priceRange = searchParams.get('priceRange') || '';

    // Build query conditions
    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) {
      where.status = status;
    }
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number);
      if (!isNaN(min) && !isNaN(max)) {
        where.price = { gte: min, lte: max };
      }
    }

    // Calculate pagination
    const skip = (page - 1) * perPage;

    // Fetch properties with count
    const [properties, total] = await Promise.all([
      db.listing.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          rooms: { select: { id: true } },
          reservations: { select: { id: true } },
          reviews: { select: { id: true } },
        },
      }),
      db.listing.count({ where }),
    ]);

    // Transform property data
    const transformedProperties = properties.map(property => ({
      id: property.id,
      title: property.title,
      description: property.description,
      owner: property.user,
      price: property.price,
      status: property.status,
      rating: property.rating,
      reviewCount: property.reviewCount,
      roomsCount: property.rooms.length,
      bookingsCount: property.reservations.length,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
    }));

    return NextResponse.json(
      ApiResponseFormatter.success(transformedProperties, 'Properties fetched successfully', {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      })
    );
  } catch (error) {
    const errorResponse = PrismaErrorHandler.handle(error);
    return NextResponse.json(
      ApiResponseFormatter.error(errorResponse.message, 'Failed to fetch properties', errorResponse.details),
      { status: errorResponse.status }
    );
  }
}

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
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';

    // Build query conditions
    const where: any = {};

    // Handle search parameters
    const nameSearch = searchParams.get('name') || '';
    const emailSearch = searchParams.get('email') || '';

    if (nameSearch || emailSearch) {
      const orConditions: any[] = [];
      if (nameSearch) {
        orConditions.push({ name: { contains: nameSearch, mode: 'insensitive' } });
      }
      if (emailSearch) {
        orConditions.push({ email: { contains: emailSearch, mode: 'insensitive' } });
      }
      where.OR = orConditions;
    } else if (search) {
      // Fallback to single search parameter for backward compatibility
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }
    if (status === 'active') {
      where.isActive = true;
      where.deletedAt = null;
    } else if (status === 'inactive') {
      where.isActive = false;
    } else if (status === 'suspended') {
      where.deletedAt = { not: null };
    }

    // Calculate pagination
    const skip = (page - 1) * perPage;

    // Fetch users with count
    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
        include: {
          listings: { select: { id: true } },
          reservations: { select: { id: true } },
        },
      }),
      db.user.count({ where }),
    ]);

    // Transform user data
    const transformedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.deletedAt ? 'suspended' : user.isActive ? 'active' : 'inactive',
      joinedAt: user.createdAt,
      lastLogin: user.lastLogin,
      emailVerified: !!user.emailVerified,
      listingsCount: user.listings.length,
      bookingsCount: user.reservations.length,
      totalSpent: 0, // Will be calculated from reservations in future
    }));

    return NextResponse.json(
      ApiResponseFormatter.success(transformedUsers, 'Users fetched successfully', {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      })
    );
  } catch (error) {
    const errorResponse = PrismaErrorHandler.handle(error);
    return NextResponse.json(
      ApiResponseFormatter.error(errorResponse.message, 'Failed to fetch users', errorResponse.details),
      { status: errorResponse.status }
    );
  }
}

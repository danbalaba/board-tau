import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponseFormatter } from '@/lib/api-response';
import { PrismaErrorHandler } from '@/lib/prisma-error-handler';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

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
      // Allow searching by both the legacy role string or the roleId
      where.OR = [
        { role: role },
        { roleRelation: { name: role } }
      ];
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
          roleRelation: true, // Include the dynamic role
        },
      }),
      db.user.count({ where }),
    ]);

    // Transform user data
    const transformedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.roleRelation?.name || user.role, // Prioritize dynamic role
      roleId: user.roleId,
      status: user.deletedAt ? 'suspended' : user.isActive ? 'active' : 'inactive',
      joinedAt: user.createdAt,
      lastLogin: user.lastLogin,
      emailVerified: !!user.emailVerified,
      listingsCount: user.listings.length,
      bookingsCount: user.reservations.length,
      totalSpent: 0,
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

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        ApiResponseFormatter.error('Unauthorized', 'You must be an admin to access this resource'),
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, email, password, role } = body;

    // Basic validation
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        ApiResponseFormatter.error('Missing required fields', 'Name, email, password and role are required'),
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        ApiResponseFormatter.error('User already exists', 'An account with this email already exists'),
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Find the dynamic role ID if it exists
    const userRole = await db.userRole.findFirst({
      where: { name: { equals: role, mode: 'insensitive' } }
    });

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role.toUpperCase(), // Legacy role field
        roleId: userRole?.id || null, // Dynamic role linkage
        isActive: true,
        emailVerified: new Date(), 
      }
    });

    return NextResponse.json(
      ApiResponseFormatter.success({
        id: user.id,
        name: user.name,
        email: user.email,
        role: userRole?.name || user.role,
        roleId: user.roleId,
        status: 'active',
        joinedAt: user.createdAt,
      }, 'User created successfully'),
      { status: 201 }
    );
  } catch (error) {
    const errorResponse = PrismaErrorHandler.handle(error);
    return NextResponse.json(
      ApiResponseFormatter.error(errorResponse.message, 'Failed to create user', errorResponse.details),
      { status: errorResponse.status }
    );
  }
}

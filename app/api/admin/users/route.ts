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
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        ApiResponseFormatter.error('Unauthorized', 'You must be an admin to access this resource'),
        { status: 401 }
      );
    }

    const { hasPermission } = await import("@/lib/rbac");
    const permitted = await hasPermission(session.user.id, "MANAGE_USERS");
    if (!permitted) return NextResponse.json(
      ApiResponseFormatter.error('Forbidden', 'Missing permission MANAGE_USERS'),
      { status: 403 }
    );

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';

    // Build query conditions as an array, merged with AND at the end
    const conditions: any[] = [];

    // SECURITY: System admins (ADMIN role) must NEVER see SUPER_ADMIN or other ADMIN accounts
    if (session.user.role === 'ADMIN') {
      conditions.push({
        NOT: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } }
      });
    }

    // Handle search parameters
    const nameSearch = searchParams.get('name') || '';
    const emailSearch = searchParams.get('email') || '';

    if (nameSearch) {
      conditions.push({ name: { contains: nameSearch, mode: 'insensitive' } });
    }
    if (emailSearch) {
      conditions.push({ email: { contains: emailSearch, mode: 'insensitive' } });
    }
    if (search && !nameSearch && !emailSearch) {
      conditions.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ]
      });
    }

    if (role) {
      const rolesArray = role.split(',').map(r => r.trim()).filter(Boolean);
      if (rolesArray.length > 0) {
        conditions.push({
          OR: [
            { role: { in: rolesArray } },
            { roleRelation: { name: { in: rolesArray } } }
          ]
        });
      }
    }

    if (status) {
      const statusesArray = status.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

      // In Prisma MongoDB, { field: null } ONLY matches explicit BSON null, NOT missing fields.
      // Use isSet:false for missing fields + null OR to cover both cases.
      const notSuspended = { OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }] };
      const isSuspended = { AND: [{ deletedAt: { isSet: true } }, { NOT: { deletedAt: null } }, { isPermanentlyBanned: { not: true } }] };
      const isBanned = { AND: [{ deletedAt: { isSet: true } }, { NOT: { deletedAt: null } }, { isPermanentlyBanned: true }] };

      if (statusesArray.length === 1) {
        const s = statusesArray[0];
        if (s === 'active') {
          conditions.push({ NOT: { isActive: false } }); // true, null, or missing → active
          conditions.push(notSuspended);
        } else if (s === 'inactive') {
          conditions.push({ isActive: false });
          conditions.push(notSuspended);
        } else if (s === 'suspended') {
          conditions.push(isSuspended);
        } else if (s === 'banned') {
          conditions.push(isBanned);
        }
      } else {
        const statusOrs: any[] = [];
        if (statusesArray.includes('active')) {
          statusOrs.push({ AND: [{ NOT: { isActive: false } }, notSuspended] });
        }
        if (statusesArray.includes('inactive')) {
          statusOrs.push({ AND: [{ isActive: false }, notSuspended] });
        }
        if (statusesArray.includes('suspended')) {
          statusOrs.push(isSuspended);
        }
        if (statusesArray.includes('banned')) {
          statusOrs.push(isBanned);
        }
        if (statusOrs.length > 0) conditions.push({ OR: statusOrs });
      }
    }

    // Merge all conditions with AND; empty = no filter
    const where = conditions.length > 0 ? { AND: conditions } : {};

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
          reservations: { where: { status: 'COMPLETED' }, select: { id: true } },
          roleRelation: true, // Include the dynamic role
        },
      }),
      db.user.count({ where }),
    ]);

    // Transform user data
    const transformedUsers = users.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.roleRelation?.name || user.role, // Prioritize dynamic role
      roleId: user.roleId,
      status: user.isPermanentlyBanned ? 'banned' : user.deletedAt ? 'suspended' : (user.isActive === false) ? 'inactive' : 'active',
      joinedAt: user.createdAt,
      lastLogin: user.lastLogin,
      emailVerified: !!user.emailVerified,
      listingsCount: user.listings.length,
      bookingsCount: user.reservations.length
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
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
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

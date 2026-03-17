import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponseFormatter } from '@/lib/api-response';
import { PrismaErrorHandler } from '@/lib/prisma-error-handler';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const createRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([])
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        ApiResponseFormatter.error('Unauthorized', 'You must be an admin to access this resource'),
        { status: 401 }
      );
    }

    const roles = await (db as any).userRole.findMany({
      orderBy: { name: 'asc' },
      include: {
        users: { select: { id: true } }
      }
    });

    const transformedRoles = (roles as any[]).map((role: any) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      userCount: role.users.length,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt
    }));

    return NextResponse.json(
      ApiResponseFormatter.success(transformedRoles, 'Roles fetched successfully')
    );
  } catch (error) {
    const errorResponse = PrismaErrorHandler.handle(error);
    return NextResponse.json(
      ApiResponseFormatter.error(errorResponse.message, 'Failed to fetch roles', errorResponse.details),
      { status: errorResponse.status }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        ApiResponseFormatter.error('Unauthorized', 'You must be an admin to access this resource'),
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = createRoleSchema.parse(body);

    const existingRole = await (db as any).userRole.findFirst({
      where: { name: { equals: validatedData.name, mode: 'insensitive' } }
    });

    if (existingRole) {
      return NextResponse.json(
        ApiResponseFormatter.error('Conflict', 'Role with this name already exists'),
        { status: 409 }
      );
    }

    const role = await (db as any).userRole.create({
      data: validatedData
    });

    return NextResponse.json(
      ApiResponseFormatter.success(role, 'Role created successfully'),
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        ApiResponseFormatter.error('Validation Error', 'Invalid input data', error.issues),
        { status: 400 }
      );
    }

    const errorResponse = PrismaErrorHandler.handle(error);
    return NextResponse.json(
      ApiResponseFormatter.error(errorResponse.message, 'Failed to create role', errorResponse.details),
      { status: errorResponse.status }
    );
  }
}

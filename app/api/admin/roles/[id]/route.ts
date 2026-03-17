import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponseFormatter } from '@/lib/api-response';
import { PrismaErrorHandler } from '@/lib/prisma-error-handler';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const updateRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required').optional(),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([]).optional()
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        ApiResponseFormatter.error('Unauthorized', 'You must be an admin to access this resource'),
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const id = resolvedParams.id;

    const role = await db.userRole.findUnique({
      where: { id },
      include: {
        users: { select: { id: true } }
      }
    });

    if (!role) {
      return NextResponse.json(
        ApiResponseFormatter.error('Not Found', 'Role not found'),
        { status: 404 }
      );
    }

    const transformedRole = {
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      userCount: role.users.length,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt
    };

    return NextResponse.json(
      ApiResponseFormatter.success(transformedRole, 'Role fetched successfully')
    );
  } catch (error) {
    const errorResponse = PrismaErrorHandler.handle(error);
    return NextResponse.json(
      ApiResponseFormatter.error(errorResponse.message, 'Failed to fetch role', errorResponse.details),
      { status: errorResponse.status }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        ApiResponseFormatter.error('Unauthorized', 'You must be an admin to access this resource'),
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await request.json();
    const validatedData = updateRoleSchema.parse(body);

    const existingRole = await db.userRole.findUnique({
      where: { id }
    });

    if (!existingRole) {
      return NextResponse.json(
        ApiResponseFormatter.error('Not Found', 'Role not found'),
        { status: 404 }
      );
    }

    if (validatedData.name) {
      const duplicateRole = await db.userRole.findFirst({
        where: {
          name: { equals: validatedData.name, mode: 'insensitive' },
          id: { not: id }
        }
      });

      if (duplicateRole) {
        return NextResponse.json(
          ApiResponseFormatter.error('Conflict', 'Role with this name already exists'),
          { status: 409 }
        );
      }
    }

    const updatedRole = await db.userRole.update({
      where: { id },
      data: validatedData
    });

    return NextResponse.json(
      ApiResponseFormatter.success(updatedRole, 'Role updated successfully')
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
      ApiResponseFormatter.error(errorResponse.message, 'Failed to update role', errorResponse.details),
      { status: errorResponse.status }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        ApiResponseFormatter.error('Unauthorized', 'You must be an admin to access this resource'),
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const id = resolvedParams.id;

    const role = await db.userRole.findUnique({
      where: { id },
      include: {
        users: { select: { id: true } }
      }
    });

    if (!role) {
      return NextResponse.json(
        ApiResponseFormatter.error('Not Found', 'Role not found'),
        { status: 404 }
      );
    }

    if (role.users.length > 0) {
      return NextResponse.json(
        ApiResponseFormatter.error('Conflict', 'Cannot delete role that is assigned to users'),
        { status: 409 }
      );
    }

    if (role.name === 'Admin') {
      return NextResponse.json(
        ApiResponseFormatter.error('Forbidden', 'Cannot delete the Admin role'),
        { status: 403 }
      );
    }

    await db.userRole.delete({
      where: { id }
    });

    return NextResponse.json(
      ApiResponseFormatter.success(null, 'Role deleted successfully')
    );
  } catch (error) {
    const errorResponse = PrismaErrorHandler.handle(error);
    return NextResponse.json(
      ApiResponseFormatter.error(errorResponse.message, 'Failed to delete role', errorResponse.details),
      { status: errorResponse.status }
    );
  }
}

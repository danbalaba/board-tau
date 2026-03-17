import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponseFormatter } from '@/lib/api-response';
import { PrismaErrorHandler } from '@/lib/prisma-error-handler';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const updatePermissionSchema = z.object({
  name: z.string().min(1, 'Permission name is required').optional(),
  description: z.string().optional(),
  module: z.string().min(1, 'Module is required').optional(),
  action: z.string().min(1, 'Action is required').optional()
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        ApiResponseFormatter.error('Unauthorized', 'You must be an admin to access this resource'),
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const id = resolvedParams.id;

    const permission = await (db as any).permission.findUnique({
      where: { id }
    });

    if (!permission) {
      return NextResponse.json(
        ApiResponseFormatter.error('Not Found', 'Permission not found'),
        { status: 404 }
      );
    }

    return NextResponse.json(
      ApiResponseFormatter.success(permission, 'Permission fetched successfully')
    );
  } catch (error) {
    const errorResponse = PrismaErrorHandler.handle(error);
    return NextResponse.json(
      ApiResponseFormatter.error(errorResponse.message, 'Failed to fetch permission', errorResponse.details),
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
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        ApiResponseFormatter.error('Unauthorized', 'You must be an admin to access this resource'),
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await request.json();
    const validatedData = updatePermissionSchema.parse(body);

    const existingPermission = await (db as any).permission.findUnique({
      where: { id }
    });

    if (!existingPermission) {
      return NextResponse.json(
        ApiResponseFormatter.error('Not Found', 'Permission not found'),
        { status: 404 }
      );
    }

    if (validatedData.name) {
      const duplicatePermission = await (db as any).permission.findFirst({
        where: {
          name: { equals: validatedData.name, mode: 'insensitive' },
          id: { not: id }
        }
      });

      if (duplicatePermission) {
        return NextResponse.json(
          ApiResponseFormatter.error('Conflict', 'Permission with this name already exists'),
          { status: 409 }
        );
      }
    }

    const updatedPermission = await (db as any).permission.update({
      where: { id },
      data: validatedData
    });

    return NextResponse.json(
      ApiResponseFormatter.success(updatedPermission, 'Permission updated successfully')
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
      ApiResponseFormatter.error(errorResponse.message, 'Failed to update permission', errorResponse.details),
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
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        ApiResponseFormatter.error('Unauthorized', 'You must be an admin to access this resource'),
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const id = resolvedParams.id;

    const permission = await (db as any).permission.findUnique({
      where: { id }
    });

    if (!permission) {
      return NextResponse.json(
        ApiResponseFormatter.error('Not Found', 'Permission not found'),
        { status: 404 }
      );
    }

    // Check if any roles are using this permission
    const rolesWithPermission = await (db as any).userRole.findMany({
      where: { permissions: { has: permission.name } }
    });

    if (rolesWithPermission.length > 0) {
      return NextResponse.json(
        ApiResponseFormatter.error(
          'Conflict',
          'Cannot delete permission that is assigned to roles',
          { roles: rolesWithPermission.map((role: any) => role.name) }
        ),
        { status: 409 }
      );
    }

    await (db as any).permission.delete({
      where: { id }
    });

    return NextResponse.json(
      ApiResponseFormatter.success(null, 'Permission deleted successfully')
    );
  } catch (error) {
    const errorResponse = PrismaErrorHandler.handle(error);
    return NextResponse.json(
      ApiResponseFormatter.error(errorResponse.message, 'Failed to delete permission', errorResponse.details),
      { status: errorResponse.status }
    );
  }
}

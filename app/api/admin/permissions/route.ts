import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponseFormatter } from '@/lib/api-response';
import { PrismaErrorHandler } from '@/lib/prisma-error-handler';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const createPermissionSchema = z.object({
  name: z.string().min(1, 'Permission name is required'),
  description: z.string().optional(),
  module: z.string().min(1, 'Module is required'),
  action: z.string().min(1, 'Action is required')
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

    const permissions = await (db as any).permission.findMany();

    return NextResponse.json(
      ApiResponseFormatter.success(permissions, 'Permissions fetched successfully')
    );
  } catch (error) {
    const errorResponse = PrismaErrorHandler.handle(error);
    return NextResponse.json(
      ApiResponseFormatter.error(errorResponse.message, 'Failed to fetch permissions', errorResponse.details),
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
    const validatedData = createPermissionSchema.parse(body);

    const existingPermission = await (db as any).permission.findFirst({
      where: { name: { equals: validatedData.name, mode: 'insensitive' } }
    });

    if (existingPermission) {
      return NextResponse.json(
        ApiResponseFormatter.error('Conflict', 'Permission with this name already exists'),
        { status: 409 }
      );
    }

    const permission = await (db as any).permission.create({
      data: validatedData
    });

    return NextResponse.json(
      ApiResponseFormatter.success(permission, 'Permission created successfully'),
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
      ApiResponseFormatter.error(errorResponse.message, 'Failed to create permission', errorResponse.details),
      { status: errorResponse.status }
    );
  }
}

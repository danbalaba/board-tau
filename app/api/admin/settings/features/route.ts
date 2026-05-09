import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponseFormatter } from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(ApiResponseFormatter.error('Unauthorized'), { status: 401 });
    }

    const features = await db.featureFlag.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(ApiResponseFormatter.success(features));
  } catch (error) {
    console.error('Features fetch error:', error);
    return NextResponse.json(ApiResponseFormatter.error('Internal Server Error'), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(ApiResponseFormatter.error('Unauthorized'), { status: 401 });
    }

    const body = await req.json();
    const { name, description, enabled, environment } = body;

    const feature = await db.featureFlag.create({
      data: { name, description, enabled, environment }
    });

    return NextResponse.json(ApiResponseFormatter.success(feature, 'Feature flag created successfully'));
  } catch (error) {
    console.error('Feature creation error:', error);
    return NextResponse.json(ApiResponseFormatter.error('Internal Server Error'), { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(ApiResponseFormatter.error('Unauthorized'), { status: 401 });
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    const feature = await db.featureFlag.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(ApiResponseFormatter.success(feature, 'Feature flag updated successfully'));
  } catch (error) {
    console.error('Feature update error:', error);
    return NextResponse.json(ApiResponseFormatter.error('Internal Server Error'), { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(ApiResponseFormatter.error('Unauthorized'), { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(ApiResponseFormatter.error('ID is required'), { status: 400 });
    }

    await db.featureFlag.delete({
      where: { id }
    });

    return NextResponse.json(ApiResponseFormatter.success(null, 'Feature flag deleted successfully'));
  } catch (error) {
    console.error('Feature deletion error:', error);
    return NextResponse.json(ApiResponseFormatter.error('Internal Server Error'), { status: 500 });
  }
}

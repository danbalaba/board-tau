import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponseFormatter } from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { subDays, startOfDay } from 'date-fns';
import { logAdminAction } from '@/lib/admin';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(ApiResponseFormatter.error('Unauthorized'), { status: 401 });
    }

    const features = await db.featureFlag.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const sevenDaysAgo = startOfDay(subDays(new Date(), 7));
    const history = await db.platformMetricSnapshot.findMany({
      where: {
        date: {
          gte: sevenDaysAgo
        }
      },
      orderBy: { date: 'asc' }
    });

    return NextResponse.json(ApiResponseFormatter.success({
      features,
      history
    }));
  } catch (error) {
    console.error('Features fetch error:', error);
    return NextResponse.json(ApiResponseFormatter.error('Internal Server Error'), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(ApiResponseFormatter.error('Unauthorized'), { status: 401 });
    }

    const body = await req.json();
    const { name, description, enabled, risk } = body;

    const feature = await db.featureFlag.create({
      data: { name, description, enabled, risk }
    });

    // Log the admin action
    await logAdminAction({
      adminId: session.user.id,
      action: 'Create Feature Flag',
      entityType: 'FeatureFlag',
      entityId: feature.id,
      details: `Feature flag '${name}' created (enabled: ${enabled}, risk: ${risk})`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: req.headers.get('user-agent')
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
    if (!session || session.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(ApiResponseFormatter.error('Unauthorized'), { status: 401 });
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    const feature = await db.featureFlag.update({
      where: { id },
      data: updateData
    });

    // Log the admin action
    await logAdminAction({
      adminId: session.user.id,
      action: 'Update Feature Flag',
      entityType: 'FeatureFlag',
      entityId: feature.id,
      details: `Feature flag '${feature.name}' updated: ${Object.keys(updateData).join(', ')}`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: req.headers.get('user-agent')
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
    if (!session || session.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(ApiResponseFormatter.error('Unauthorized'), { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(ApiResponseFormatter.error('ID is required'), { status: 400 });
    }

    const feature = await db.featureFlag.delete({
      where: { id }
    });

    // Log the admin action
    await logAdminAction({
      adminId: session.user.id,
      action: 'Delete Feature Flag',
      entityType: 'FeatureFlag',
      entityId: id,
      details: `Feature flag '${feature.name}' deleted`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: req.headers.get('user-agent')
    });

    return NextResponse.json(ApiResponseFormatter.success(null, 'Feature flag deleted successfully'));
  } catch (error) {
    console.error('Feature deletion error:', error);
    return NextResponse.json(ApiResponseFormatter.error('Internal Server Error'), { status: 500 });
  }
}

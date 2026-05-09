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

    const dashboards = await db.customDashboard.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json(ApiResponseFormatter.success(dashboards));
  } catch (error) {
    console.error('Dashboards GET error:', error);
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
    const { name, description, widgets } = body;

    const dashboard = await db.customDashboard.create({
      data: {
        name,
        description,
        widgets: widgets || [],
        userId: session.user.id
      }
    });

    return NextResponse.json(ApiResponseFormatter.success(dashboard));
  } catch (error) {
    console.error('Dashboards POST error:', error);
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
      return NextResponse.json(ApiResponseFormatter.error('Missing ID'), { status: 400 });
    }

    await db.customDashboard.delete({
      where: { id, userId: session.user.id }
    });

    return NextResponse.json(ApiResponseFormatter.success(null, 'Dashboard deleted'));
  } catch (error) {
    console.error('Dashboards DELETE error:', error);
    return NextResponse.json(ApiResponseFormatter.error('Internal Server Error'), { status: 500 });
  }
}

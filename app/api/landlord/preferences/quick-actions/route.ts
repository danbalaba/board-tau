import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/services/user';
import { db } from '@/lib/db';
import { cache } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const cacheKey = `user:quick-actions:${user.id}`;
    const cachedData = await cache.get(cacheKey);
    if (cachedData && Array.isArray(cachedData)) {
      return NextResponse.json({ success: true, data: cachedData });
    }

    const dbUser = (await db.user.findUnique({
      where: { id: user.id },
      select: { quickActions: true } as any,
    })) as any;

    const quickActions = dbUser?.quickActions || ['properties', 'profile', 'inquiries', 'bookings'];

    await cache.set(cacheKey, quickActions, 3600);

    return NextResponse.json({ success: true, data: quickActions });
  } catch (error) {
    console.error('Error fetching quick actions preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quick actions' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { quickActions } = body;

    if (!Array.isArray(quickActions) || quickActions.length > 4) {
      return NextResponse.json(
        { success: false, error: 'Invalid quick actions. Must be an array of max 4 items.' },
        { status: 400 }
      );
    }

    const updatedUser = (await db.user.update({
      where: { id: user.id },
      data: { quickActions } as any,
      select: { quickActions: true } as any,
    })) as any;

    const cacheKey = `user:quick-actions:${user.id}`;
    await cache.set(cacheKey, updatedUser.quickActions, 3600);

    return NextResponse.json({ success: true, data: updatedUser.quickActions });
  } catch (error) {
    console.error('Error updating quick actions preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update quick actions' },
      { status: 500 }
    );
  }
}

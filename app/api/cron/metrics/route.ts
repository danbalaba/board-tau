import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { startOfDay } from 'date-fns';

export async function GET(request: Request) {
  try {
    // 1. Fetch current status of all feature flags
    const flags = await db.featureFlag.findMany();
    
    const totalFeatureFlags = flags.length;
    const activeFeatureFlags = flags.filter(f => f.enabled).length;
    const inactiveFeatureFlags = totalFeatureFlags - activeFeatureFlags;

    // 2. We use startOfDay to ensure we only save one snapshot per calendar day
    const today = startOfDay(new Date());

    // 3. Upsert the snapshot for today
    const snapshot = await db.platformMetricSnapshot.upsert({
      where: { date: today },
      update: {
        totalFeatureFlags,
        activeFeatureFlags,
        inactiveFeatureFlags,
      },
      create: {
        date: today,
        totalFeatureFlags,
        activeFeatureFlags,
        inactiveFeatureFlags,
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Metrics snapshotted successfully',
      data: snapshot
    });
  } catch (error: any) {
    console.error('Failed to snapshot metrics:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to snapshot metrics',
      details: error.message
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let settings = await db.siteSettings.findFirst();
    
    // Create default settings if none exist
    if (!settings) {
      settings = await db.siteSettings.create({
        data: {
          siteName: 'BoardTAU',
          siteDescription: 'Your Ultimate Destination Connection',
          contactEmail: 'contact@boardtau.com',
          enableEmailNotifications: true,
          enablePushNotifications: false,
          enableAnalytics: true,
          enableCookies: true,
        }
      });
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const existing = await db.siteSettings.findFirst();

    let settings;
    if (existing) {
      settings = await db.siteSettings.update({
        where: { id: existing.id },
        data: body,
      });
    } else {
      settings = await db.siteSettings.create({
        data: body,
      });
    }

    await db.adminActivityLog.create({
      data: {
        adminId: session.user.id,
        action: 'UPDATE_SITE_SETTINGS',
        entityType: 'SiteSettings',
        details: JSON.stringify(body),
      }
    });

    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}

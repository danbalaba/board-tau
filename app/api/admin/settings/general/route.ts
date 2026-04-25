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

    let settings = await db.siteSettings.findFirst();

    if (!settings) {
      // Create default settings if none exist
      settings = await db.siteSettings.create({
        data: {
          siteName: 'BoardTAU',
          siteDescription: 'Your Ultimate Destination Connection',
          contactEmail: 'contact@boardtau.com',
          enableEmailNotifications: true,
          enablePushNotifications: false,
          enableAnalytics: true,
          enableCookies: true
        }
      });
    }

    return NextResponse.json(ApiResponseFormatter.success(settings));
  } catch (error) {
    console.error('Settings fetch error:', error);
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
    
    // Sanitize input: remove ID and timestamp fields if they exist in body
    const { id, updatedAt, ...settingsData } = body;

    let settings = await db.siteSettings.findFirst();

    if (settings) {
      settings = await db.siteSettings.update({
        where: { id: settings.id },
        data: settingsData
      });
    } else {
      settings = await db.siteSettings.create({
        data: settingsData
      });
    }

    return NextResponse.json(ApiResponseFormatter.success(settings, 'Settings updated successfully'));
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json(ApiResponseFormatter.error('Internal Server Error'), { status: 500 });
  }
}

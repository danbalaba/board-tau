import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let settings = await db.siteSettings.findFirst();
    if (!settings) {
      settings = await db.siteSettings.create({ data: {} });
    }

    return NextResponse.json({
      autoBackupSchedule: settings.autoBackupSchedule,
      autoBackupTime: settings.autoBackupTime,
    });
  } catch (error) {
    console.error('[GET_BACKUP_SETTINGS]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { autoBackupSchedule, autoBackupTime } = body;

    let settings = await db.siteSettings.findFirst();
    if (settings) {
      settings = await db.siteSettings.update({
        where: { id: settings.id },
        data: { autoBackupSchedule, autoBackupTime },
      });
    } else {
      settings = await db.siteSettings.create({
        data: { autoBackupSchedule, autoBackupTime },
      });
    }

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('[UPDATE_BACKUP_SETTINGS]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

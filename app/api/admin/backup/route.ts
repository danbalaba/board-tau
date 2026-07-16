import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { backendClient } from '@/lib/edgestore-server';
import { encryptMessage } from '@/lib/encryption';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const scope = searchParams.get('scope') || 'all'; // all, users, listings, reservations, reviews, messages
    const tablesParam = searchParams.get('tables');
    const specificTables = tablesParam ? tablesParam.split(',') : [];

    const shouldInclude = (tableName: string, defaultScopeCheck: boolean) => {
      if (specificTables.length > 0) {
        return specificTables.includes(tableName);
      }
      return defaultScopeCheck;
    };

    const backupData: Record<string, any> = {
      timestamp: new Date().toISOString(),
      scope,
    };

    // Level 0: Independent Tables
    if (shouldInclude('userRoles', scope === 'all' || scope === 'users')) {
      backupData.userRoles = await db.userRole.findMany();
    }
    if (shouldInclude('permissions', scope === 'all' || scope === 'users')) {
      backupData.permissions = await db.permission.findMany();
    }
    if (shouldInclude('passwordResetTokens', scope === 'all' || scope === 'users')) {
      backupData.passwordResetTokens = await db.passwordResetToken.findMany();
    }
    if (shouldInclude('categories', scope === 'all' || scope === 'listings')) {
      backupData.categories = await db.category.findMany();
    }
    if (shouldInclude('roomAmenityTypes', scope === 'all' || scope === 'listings')) {
      backupData.roomAmenityTypes = await db.roomAmenityType.findMany();
    }
    if (shouldInclude('siteSettings', scope === 'all' || scope === 'logs')) {
      backupData.siteSettings = await db.siteSettings.findMany();
    }
    if (shouldInclude('featureFlags', scope === 'all' || scope === 'logs')) {
      backupData.featureFlags = await db.featureFlag.findMany();
    }
    if (shouldInclude('platformMetricSnapshots', scope === 'all' || scope === 'logs')) {
      backupData.platformMetricSnapshots = await db.platformMetricSnapshot.findMany();
    }

    // Level 1: Core User
    if (shouldInclude('users', scope === 'all' || scope === 'users')) {
      backupData.users = await db.user.findMany();
    }

    // Level 2: User Dependencies
    if (shouldInclude('accounts', scope === 'all' || scope === 'users')) {
      backupData.accounts = await db.account.findMany();
    }
    if (shouldInclude('hostApplications', scope === 'all' || scope === 'users')) {
      backupData.hostApplications = await db.hostApplication.findMany();
    }
    if (shouldInclude('emailOTPs', scope === 'all' || scope === 'users')) {
      backupData.emailOTPs = await db.emailOTP.findMany();
    }
    if (shouldInclude('userStrikes', scope === 'all' || scope === 'users')) {
      backupData.userStrikes = await db.userStrike.findMany();
    }
    if (shouldInclude('customDashboards', scope === 'all' || scope === 'users')) {
      backupData.customDashboards = await db.customDashboard.findMany();
    }
    if (shouldInclude('notifications', scope === 'all' || scope === 'messages')) {
      backupData.notifications = await db.notification.findMany();
    }
    if (shouldInclude('adminActivityLogs', scope === 'all' || scope === 'logs')) {
      backupData.adminActivityLogs = await db.adminActivityLog.findMany();
    }
    if (shouldInclude('moderationLogs', scope === 'all' || scope === 'logs')) {
      backupData.moderationLogs = await db.moderationLog.findMany();
    }
    if (shouldInclude('listings', scope === 'all' || scope === 'listings')) {
      backupData.listings = await db.listing.findMany();
    }

    // Level 3: Listing Details
    if (shouldInclude('listingImages', scope === 'all' || scope === 'listings')) {
      backupData.listingImages = await db.listingImage.findMany();
    }
    if (shouldInclude('listingAmenities', scope === 'all' || scope === 'listings')) {
      backupData.listingAmenities = await db.listingAmenity.findMany();
    }
    if (shouldInclude('listingRules', scope === 'all' || scope === 'listings')) {
      backupData.listingRules = await db.listingRule.findMany();
    }
    if (shouldInclude('listingFeatures', scope === 'all' || scope === 'listings')) {
      backupData.listingFeatures = await db.listingFeature.findMany();
    }
    if (shouldInclude('listingCategories', scope === 'all' || scope === 'listings')) {
      backupData.listingCategories = await db.listingCategory.findMany();
    }
    if (shouldInclude('rooms', scope === 'all' || scope === 'listings')) {
      backupData.rooms = await db.room.findMany();
    }
    if (shouldInclude('messages', scope === 'all' || scope === 'messages')) {
      backupData.messages = await db.message.findMany();
    }

    // Level 4: Room Details & Initial Transactions
    if (shouldInclude('roomImages', scope === 'all' || scope === 'listings')) {
      backupData.roomImages = await db.roomImage.findMany();
    }
    if (shouldInclude('roomAmenities', scope === 'all' || scope === 'listings')) {
      backupData.roomAmenities = await db.roomAmenity.findMany();
    }
    if (shouldInclude('inquiries', scope === 'all' || scope === 'reservations')) {
      backupData.inquiries = await db.inquiry.findMany();
    }

    // Level 5: Reservations
    if (shouldInclude('reservations', scope === 'all' || scope === 'reservations')) {
      backupData.reservations = await db.reservation.findMany();
    }
    
    // Level 6: Reviews
    if (shouldInclude('reviews', scope === 'all' || scope === 'messages')) {
      backupData.reviews = await db.review.findMany();
    }

    // Use full timestamp in filename to avoid EdgeStore CDN caching issues
    const timestampStr = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `boardtau_manual_${scope}_${timestampStr}.json`;

    // Create a Blob from the JSON data
    const jsonString = JSON.stringify(backupData, null, 2);
    
    // Encrypt the entire database snapshot before uploading and downloading
    const encryptedData = encryptMessage(jsonString);
    const blob = new Blob([encryptedData], { type: 'application/json' });

    // Upload to EdgeStore using the cronBackups bucket
    const uploadRes = await backendClient.cronBackups.upload({
      content: {
        blob,
        extension: 'json',
      },
      options: {
        manualFileName: filename,
      },
      ctx: {
        userId: session.user.id,
        role: 'SUPER_ADMIN',
      },
    });

    // Log the backup action with encrypted URL
    await db.adminActivityLog.create({
      data: {
        adminId: session.user.id,
        action: 'SYSTEM_BACKUP_DOWNLOAD',
        entityType: 'System',
        details: JSON.stringify({ 
          scope,
          filename,
          url: encryptMessage(uploadRes.url),
          size: blob.size,
          status: 'success'
        }),
      }
    });
    
    return new NextResponse(encryptedData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('[BACKUP_ERROR]', error);
    return NextResponse.json({ error: 'Failed to generate backup', details: error.message }, { status: 500 });
  }
}

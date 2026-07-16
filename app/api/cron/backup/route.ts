import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { backendClient } from '@/lib/edgestore-server';
import { encryptMessage, decryptMessage } from '@/lib/encryption';

// This is required to let Vercel know this is a Cron Job and bypass some auth checks if needed
// However, we should still ensure it's called securely (Vercel sets a CRON secret header)
export async function GET(req: NextRequest) {
  try {
    // Basic security: In production, verify the CRON_SECRET from Vercel
    const authHeader = req.headers.get('authorization');
    const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}` || process.env.NODE_ENV === 'development';
    
    if (!isCron) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[CRON_BACKUP] Starting automated backup process...');

    // 1. Check if automated backups are enabled in SiteSettings
    let settings = await db.siteSettings.findFirst();
    if (settings && settings.autoBackupSchedule === 'none') {
      console.log('[CRON_BACKUP] Automated backups are disabled in settings. Skipping.');
      return NextResponse.json({ message: 'Backups disabled via settings' }, { status: 200 });
    }

    // 2. Gather all collections level by level
    const backupData: Record<string, any> = {
      timestamp: new Date().toISOString(),
      scope: 'all',
      isAutomated: true,
    };

    // Level 0
    backupData.userRoles = await db.userRole.findMany();
    backupData.permissions = await db.permission.findMany();
    backupData.passwordResetTokens = await db.passwordResetToken.findMany();
    backupData.categories = await db.category.findMany();
    backupData.roomAmenityTypes = await db.roomAmenityType.findMany();
    backupData.siteSettings = await db.siteSettings.findMany();
    backupData.featureFlags = await db.featureFlag.findMany();
    backupData.platformMetricSnapshots = await db.platformMetricSnapshot.findMany();

    // Level 1
    backupData.users = await db.user.findMany();

    // Level 2
    backupData.accounts = await db.account.findMany();
    backupData.hostApplications = await db.hostApplication.findMany();
    backupData.emailOTPs = await db.emailOTP.findMany();
    backupData.userStrikes = await db.userStrike.findMany();
    backupData.customDashboards = await db.customDashboard.findMany();
    backupData.notifications = await db.notification.findMany();
    backupData.adminActivityLogs = await db.adminActivityLog.findMany();
    backupData.moderationLogs = await db.moderationLog.findMany();
    backupData.listings = await db.listing.findMany();

    // Level 3
    backupData.listingImages = await db.listingImage.findMany();
    backupData.listingAmenities = await db.listingAmenity.findMany();
    backupData.listingRules = await db.listingRule.findMany();
    backupData.listingFeatures = await db.listingFeature.findMany();
    backupData.listingCategories = await db.listingCategory.findMany();
    backupData.rooms = await db.room.findMany();
    backupData.messages = await db.message.findMany();

    // Level 4
    backupData.roomImages = await db.roomImage.findMany();
    backupData.roomAmenities = await db.roomAmenity.findMany();
    backupData.inquiries = await db.inquiry.findMany();

    // Level 5
    backupData.reservations = await db.reservation.findMany();
    
    // Level 6
    backupData.reviews = await db.review.findMany();


    // 2. Generate JSON Buffer and encrypt the data
    const jsonString = JSON.stringify(backupData);
    
    // Use full timestamp in filename to avoid EdgeStore CDN caching issues when testing multiple times a day
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `automated_backup_${timestamp}.json`;
    
    // Encrypt the entire database snapshot before uploading!
    const encryptedData = encryptMessage(jsonString);
    
    // Create a Blob. Even though it's encrypted text, we label it JSON for convenience.
    const blob = new Blob([encryptedData], { type: 'application/json' });

    // 3. Upload to EdgeStore using the cronBackups bucket (no accessControl = server-fetchable)
    console.log(`[CRON_BACKUP] Uploading ${filename} to EdgeStore...`);
    const uploadRes = await backendClient.cronBackups.upload({
      content: {
        blob,
        extension: 'json',
      },
      options: {
        manualFileName: filename,
      },
      ctx: {
        userId: 'cron-system',
        role: 'SUPER_ADMIN',
      },
    });

    console.log('[CRON_BACKUP] Upload successful:', uploadRes.url);

    // 4. Find a Super Admin to assign the log to (since Cron doesn't have a session)
    const superAdmin = await db.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    });

    // 5. Log the successful backup
    if (superAdmin) {
      await db.adminActivityLog.create({
        data: {
          adminId: superAdmin.id,
          action: 'AUTOMATED_SYSTEM_BACKUP',
          entityType: 'System',
          details: JSON.stringify({ 
            filename,
            // Encrypt the URL at rest — raw EdgeStore URL never touches the DB in plaintext
            url: encryptMessage(uploadRes.url),
            size: blob.size,
            status: 'success'
          }),
        }
      });
    }

    // 6. Auto-Pruning (Retention Policy - keep only last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const oldBackupLogs = await db.adminActivityLog.findMany({
      where: {
        action: 'AUTOMATED_SYSTEM_BACKUP',
        createdAt: {
          lt: thirtyDaysAgo
        }
      }
    });

    if (oldBackupLogs.length > 0) {
      console.log(`[CRON_BACKUP] Found ${oldBackupLogs.length} old backups to prune.`);
      
      for (const log of oldBackupLogs) {
        if (log.details) {
          try {
            const details = JSON.parse(log.details);
            if (details.url) {
              // Decrypt the stored URL before using it
              const rawUrl = decryptMessage(details.url);
              await backendClient.cronBackups.deleteFile({ url: rawUrl });
              console.log(`[CRON_BACKUP] Deleted old backup file from EdgeStore.`);
            }
          } catch (e) {
            console.error(`[CRON_BACKUP] Failed to parse or delete old backup log:`, e);
          }
        }
        // Delete the log entry itself
        await db.adminActivityLog.delete({ where: { id: log.id } });
      }
    }

    return NextResponse.json({ success: true, url: uploadRes.url });
  } catch (error: any) {
    console.error('[CRON_BACKUP_ERROR]', error);
    return NextResponse.json({ error: 'Automated backup failed', details: error.message }, { status: 500 });
  }
}

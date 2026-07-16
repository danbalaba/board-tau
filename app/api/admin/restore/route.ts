import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { encryptMessage, decryptMessage } from '@/lib/encryption';
import { backendClient } from '@/lib/edgestore-server';
const backupSchema = z.object({
  timestamp: z.string().datetime(),
  scope: z.string(),
  isAutomated: z.boolean().optional(),
}).passthrough(); // allows other collections like users, listings, etc.

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'execute'; // 'verify' or 'execute'

    const formData = await req.formData();
    const backupFile = formData.get('backup') as File | null;
    
    if (!backupFile) {
      return NextResponse.json({ error: 'No backup file provided' }, { status: 400 });
    }
    
    const fileContent = await backupFile.text();
    let body;
    try {
      body = JSON.parse(fileContent);
    } catch (e) {
      // If direct parse fails, try decrypting first (for EdgeStore backups)
      const decrypted = decryptMessage(fileContent);
      if (decrypted && !decrypted.includes('🔒')) {
        try {
          body = JSON.parse(decrypted);
        } catch (e2) {
          return NextResponse.json({ error: 'Invalid or corrupted encrypted backup file' }, { status: 400 });
        }
      } else {
        return NextResponse.json({ error: 'Invalid JSON file or unable to decrypt' }, { status: 400 });
      }
    }
    
    // Strict Server-Side Validation using Zod
    const validationResult = backupSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Invalid backup file structure. This does not appear to be a valid BoardTAU backup snapshot.',
        details: validationResult.error.format()
      }, { status: 400 });
    }

    if (action === 'verify') {
      const backupDate = new Date(body.timestamp);
      
      const newUsersCount = await db.user.count({ where: { createdAt: { gt: backupDate } } });
      const newReservationsCount = await db.reservation.count({ where: { createdAt: { gt: backupDate } } });
      const newListingsCount = await db.listing.count({ where: { createdAt: { gt: backupDate } } });
      
      return NextResponse.json({
        newRecordsFound: newUsersCount + newReservationsCount + newListingsCount,
        stats: {
          users: newUsersCount,
          reservations: newReservationsCount,
          listings: newListingsCount
        }
      });
    }

    const currentUserId = session.user.id;
    let restoredCounts: Record<string, number> = {};

    // Helper function for safe ordered upserting
    const restoreCollection = async (
      model: any,
      records: any[],
      excludeId?: string,
      excludeField: string = 'id'
    ) => {
      let count = 0;
      if (!records || !Array.isArray(records)) return count;
      
      for (const record of records) {
        // Skip current admin user to prevent locking ourselves out during restore
        if (excludeId && record[excludeField] === excludeId) continue;
        
        try {
          const { id, ...updateData } = record;
          await model.upsert({
            where: { id },
            update: updateData,
            create: record,
          });
          count++;
        } catch (e) {
          console.error(`[RESTORE] Failed to upsert record ${record.id}`, e);
        }
      }
      return count;
    };

    // --- CREATE PRE-RESTORE SAFETY SNAPSHOT ---
    try {
      const safetyData: any = { timestamp: new Date().toISOString(), scope: 'all' };
      safetyData.userRoles = await db.userRole.findMany();
      safetyData.permissions = await db.permission.findMany();
      safetyData.users = await db.user.findMany();
      safetyData.accounts = await db.account.findMany();
      safetyData.reservations = await db.reservation.findMany();
      safetyData.listings = await db.listing.findMany();
      safetyData.rooms = await db.room.findMany();
      safetyData.messages = await db.message.findMany();
      safetyData.inquiries = await db.inquiry.findMany();
      safetyData.reviews = await db.review.findMany();
      // ... Add others as needed for a quick safety snapshot
      
      const safetyJsonString = JSON.stringify(safetyData);
      const safetyEncrypted = encryptMessage(safetyJsonString);
      const safetyBlob = new Blob([safetyEncrypted], { type: 'application/json' });
      
      const safetyTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const safetyFilename = `safety_snapshot_${safetyTimestamp}.json`;
      
      const uploadRes = await backendClient.cronBackups.upload({
        content: { blob: safetyBlob, extension: 'json' },
        options: { manualFileName: safetyFilename },
        ctx: { userId: currentUserId, role: 'SUPER_ADMIN' },
      });

      await db.adminActivityLog.create({
        data: {
          adminId: currentUserId,
          action: 'PRE_RESTORE_SAFETY_SNAPSHOT',
          entityType: 'System',
          details: JSON.stringify({ 
            filename: safetyFilename,
            url: encryptMessage(uploadRes.url),
            size: safetyBlob.size,
            status: 'success'
          }),
        }
      });
    } catch (e) {
      console.error('[RESTORE_SAFETY_SNAPSHOT_ERROR]', e);
      // We log but don't strictly block restore if snapshot fails, though it's risky
    }

    // --- RESTORE IN STRICT DEPENDENCY ORDER ---
    // Level 0
    restoredCounts.userRoles = await restoreCollection(db.userRole, body.userRoles);
    restoredCounts.permissions = await restoreCollection(db.permission, body.permissions);
    restoredCounts.passwordResetTokens = await restoreCollection(db.passwordResetToken, body.passwordResetTokens);
    restoredCounts.categories = await restoreCollection(db.category, body.categories);
    restoredCounts.roomAmenityTypes = await restoreCollection(db.roomAmenityType, body.roomAmenityTypes);
    restoredCounts.siteSettings = await restoreCollection(db.siteSettings, body.siteSettings);
    restoredCounts.featureFlags = await restoreCollection(db.featureFlag, body.featureFlags);
    restoredCounts.platformMetricSnapshots = await restoreCollection(db.platformMetricSnapshot, body.platformMetricSnapshots);

    // Level 1
    restoredCounts.users = await restoreCollection(db.user, body.users, currentUserId);

    // Level 2
    restoredCounts.accounts = await restoreCollection(db.account, body.accounts, currentUserId, 'userId');
    restoredCounts.hostApplications = await restoreCollection(db.hostApplication, body.hostApplications, currentUserId, 'userId');
    restoredCounts.emailOTPs = await restoreCollection(db.emailOTP, body.emailOTPs, currentUserId, 'userId');
    restoredCounts.userStrikes = await restoreCollection(db.userStrike, body.userStrikes, currentUserId, 'userId');
    restoredCounts.customDashboards = await restoreCollection(db.customDashboard, body.customDashboards, currentUserId, 'userId');
    restoredCounts.notifications = await restoreCollection(db.notification, body.notifications);
    restoredCounts.adminActivityLogs = await restoreCollection(db.adminActivityLog, body.adminActivityLogs);
    restoredCounts.moderationLogs = await restoreCollection(db.moderationLog, body.moderationLogs);
    restoredCounts.listings = await restoreCollection(db.listing, body.listings);

    // Level 3
    restoredCounts.listingImages = await restoreCollection(db.listingImage, body.listingImages);
    restoredCounts.listingAmenities = await restoreCollection(db.listingAmenity, body.listingAmenities);
    restoredCounts.listingRules = await restoreCollection(db.listingRule, body.listingRules);
    restoredCounts.listingFeatures = await restoreCollection(db.listingFeature, body.listingFeatures);
    restoredCounts.listingCategories = await restoreCollection(db.listingCategory, body.listingCategories);
    restoredCounts.rooms = await restoreCollection(db.room, body.rooms);
    restoredCounts.messages = await restoreCollection(db.message, body.messages);

    // Level 4
    restoredCounts.roomImages = await restoreCollection(db.roomImage, body.roomImages);
    restoredCounts.roomAmenities = await restoreCollection(db.roomAmenity, body.roomAmenities);
    restoredCounts.inquiries = await restoreCollection(db.inquiry, body.inquiries);

    // Level 5
    restoredCounts.reservations = await restoreCollection(db.reservation, body.reservations);
    
    // Level 6
    restoredCounts.reviews = await restoreCollection(db.review, body.reviews);

    // Clean up empty counts
    Object.keys(restoredCounts).forEach(key => {
      if (restoredCounts[key] === 0) delete restoredCounts[key];
    });

    // Log the restore action
    await db.adminActivityLog.create({
      data: {
        adminId: session.user.id,
        action: 'SYSTEM_RESTORE',
        entityType: 'System',
        details: JSON.stringify({ restoredCounts, strategy: 'upsert-safe' }),
      }
    });

    return NextResponse.json({
      success: true,
      message: 'System restore completed safely',
      restoredCounts
    });
  } catch (error: any) {
    console.error('[RESTORE_ERROR]', error);
    return NextResponse.json({ error: 'Failed to restore system data', details: error.message }, { status: 500 });
  }
}

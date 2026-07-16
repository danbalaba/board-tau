"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/services/user";
import { revalidatePath } from "next/cache";
import { cache } from "@/lib/redis";
import { pusherServer } from "@/lib/pusher";

export type NotificationType = "inquiry" | "reservation" | "review" | "message";

/**
 * Creates a notification for a specific user.
 * This can be used for both Landlords (new inquiry) and Students (inquiry approved).
 */
export async function createNotification({
  userId,
  type,
  title,
  description,
  link,
}: {
  userId: string;
  type: NotificationType;
  title: string;
  description: string;
  link: string;
}) {
  try {
    const notification = await db.notification.create({
      data: {
        userId,
        type,
        title,
        description,
        link,
      },
    });

    revalidatePath("/");
    
    // HI-2 FIX: Invalidate notification stats cache
    await cache.del(`notifications:stats:${userId}`);

    // Trigger Pusher event for real-time updates
    await pusherServer.trigger(
      `private-user-${userId}`,
      "new-notification",
      notification
    );

    return { success: true, notification };
  } catch (error) {
    console.error("Failed to create notification:", error);
    return { success: false, error: "Failed to create notification" };
  }
}

/**
 * Gets the count of unread notifications for the current user, grouped by type.
 * Useful for showing dots on specific menu items.
 */
export async function getUnreadNotificationStats() {
  const user = await getCurrentUser();
  if (!user) return null;

  const cacheKey = `notifications:stats:${user.id}`;

  try {
    // 1. Check Redis Cache (30s TTL)
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    // ============================================================
    // OPTIMIZED: groupBy in MongoDB instead of fetching all records
    // This runs on every page navigation — must be lightweight
    // ============================================================
    const grouped = await db.notification.groupBy({
      by: ['type'],
      where: {
        userId: user.id,
        isRead: false,
      },
      _count: { id: true },
    });

    const byType: Record<string, number> = {};
    let total = 0;
    for (const group of grouped) {
      const type = group.type.toLowerCase();
      byType[type] = group._count.id;
      total += group._count.id;
    }

    const result = { total, byType };

    // 2. Save to Redis (short 30s TTL for real-time feel)
    await cache.set(cacheKey, result, 30);

    return result;
  } catch (error) {
    console.error("Failed to fetch unread stats:", error);
    return null;
  }
}

/**
 * Gets all unread notifications for the current user.
 */
export async function getUnreadNotifications() {
  const user = await getCurrentUser();
  if (!user) return [];

  try {
    const notifications = await db.notification.findMany({
      where: {
        userId: user.id,
        isRead: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return notifications;
  } catch (error) {
    console.error("Failed to fetch unread notifications:", error);
    return [];
  }
}

/**
 * Marks all notifications of a specific type as read for the current user.
 */
export async function markNotificationsAsRead(type?: NotificationType) {
  const user = await getCurrentUser();
  if (!user) return { success: false };

  try {
    await db.notification.updateMany({
      where: {
        userId: user.id,
        isRead: false,
        ...(type ? { type } : {}),
      },
      data: {
        isRead: true,
      },
    });

    revalidatePath("/");
    await cache.del(`notifications:stats:${user.id}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to mark notifications as read:", error);
    return { success: false };
  }
}

/**
 * Marks notifications related to a specific entity (e.g. inquiryId) as read.
 */
export async function markEntityNotificationsAsRead(type: NotificationType, entityId: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false };

  try {
    // Look for notifications that have the entityId in their link
    const notifications = await db.notification.findMany({
      where: {
        userId: user.id,
        type,
        isRead: false,
        link: {
          contains: entityId,
        },
      },
    });

    if (notifications.length > 0) {
      await db.notification.updateMany({
        where: {
          id: {
            in: notifications.map((n: any) => n.id),
          },
        },
        data: {
          isRead: true,
        },
      });

      revalidatePath("/");
      await cache.del(`notifications:stats:${user.id}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to mark entity notifications as read:", error);
    return { success: false };
  }
}

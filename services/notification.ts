"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/services/user";
import { revalidatePath } from "next/cache";

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

  try {
    const unreadNotifications = await db.notification.findMany({
      where: {
        userId: user.id,
        isRead: false,
      },
      select: {
        type: true,
      },
    });

    const stats = {
      total: unreadNotifications.length,
      byType: unreadNotifications.reduce((acc, note) => {
        const type = note.type.toLowerCase();
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return stats;
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
            in: notifications.map((n) => n.id),
          },
        },
        data: {
          isRead: true,
        },
      });

      revalidatePath("/");
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to mark entity notifications as read:", error);
    return { success: false };
  }
}

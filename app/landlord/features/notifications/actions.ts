"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type NotificationType = 'inquiry' | 'reservation' | 'message' | 'review';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  createdAt: string; // ISO string for client
  isRead: boolean;
  link: string;
}

export async function getLandlordNotifications(page: number = 0, limit: number = 5) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { notifications: [], unreadCount: 0, hasMore: false };
  }

  const userId = session.user.id;
  const skip = page * limit;

  // 1. Fetch persistent notifications from the new table
  const [dbNotifications, totalCount, unreadCount] = await Promise.all([
    db.notification.findMany({
      where: { userId, isArchived: false },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    db.notification.count({ where: { userId, isArchived: false } }),
    db.notification.count({ where: { userId, isRead: false, isArchived: false } })
  ]);

  const notifications: NotificationItem[] = dbNotifications.map(n => ({
    id: n.id,
    type: n.type as NotificationType,
    title: n.title,
    description: n.description,
    createdAt: n.createdAt.toISOString(),
    isRead: n.isRead,
    link: n.link,
  }));

  return {
    notifications,
    unreadCount,
    hasMore: skip + notifications.length < totalCount,
  };
}

export async function markNotificationAsRead(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false };

    await db.notification.update({
      where: { id, userId: session.user.id },
      data: { isRead: true }
    });

    revalidatePath("/landlord");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false };

    await db.notification.updateMany({
      where: { userId: session.user.id, isRead: false },
      data: { isRead: true }
    });

    revalidatePath("/landlord");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function clearAllNotifications() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false };

    await db.notification.updateMany({
      where: { userId: session.user.id, isArchived: false },
      data: { isArchived: true }
    });

    revalidatePath("/landlord");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

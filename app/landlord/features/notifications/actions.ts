"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

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

export async function getLandlordNotifications() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { notifications: [], unreadCount: 0 };
  }

  const userId = session.user.id;

  // 1. Pending Inquiries
  const pendingInquiries = await db.inquiry.findMany({
    where: {
      listing: { userId },
      status: 'PENDING',
    },
    include: {
      user: { select: { name: true } },
      listing: { select: { title: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  // 2. Pending Reservations / Payment
  const pendingReservations = await db.reservation.findMany({
    where: {
      listing: { userId },
      status: { in: ['PENDING_PAYMENT', 'RESERVED'] },
    },
    include: {
      user: { select: { name: true } },
      listing: { select: { title: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  // 3. Unread Messages
  const unreadMessages = await db.message.findMany({
    where: {
      receiverId: userId,
      read: false,
    },
    include: {
      sender: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  // 4. Pending Reviews (no response yet)
  const pendingReviews = await db.review.findMany({
    where: {
      listing: { userId },
      response: null,
    },
    include: {
      user: { select: { name: true } },
      listing: { select: { title: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  const notifications: NotificationItem[] = [
    ...pendingInquiries.map(iq => ({
      id: iq.id,
      type: 'inquiry' as const,
      title: 'New Inquiry',
      description: `${iq.user?.name || 'A user'} inquired about ${iq.listing?.title || 'your property'}`,
      createdAt: iq.createdAt.toISOString(),
      isRead: false,
      link: `/landlord/inquiries`,
    })),
    ...pendingReservations.map(res => ({
      id: res.id,
      type: 'reservation' as const,
      title: 'New Reservation',
      description: `${res.user?.name || 'A user'} reserved ${res.listing?.title || 'your property'}`,
      createdAt: res.createdAt.toISOString(),
      isRead: false,
      link: `/landlord/reservations`,
    })),
    ...unreadMessages.map(msg => ({
      id: msg.id,
      type: 'message' as const,
      title: 'New Message',
      description: `From ${msg.sender?.name || 'Unknown'}: ${msg.content.substring(0, 30)}${msg.content.length > 30 ? '...' : ''}`,
      createdAt: msg.createdAt.toISOString(),
      isRead: false,
      link: `/landlord/tenants`, // Fallback link
    })),
    ...pendingReviews.map(rev => ({
      id: rev.id,
      type: 'review' as const,
      title: 'New Review',
      description: `${rev.user?.name || 'A user'} left a review for ${rev.listing?.title || 'your property'}`,
      createdAt: rev.createdAt.toISOString(),
      isRead: false,
      link: `/landlord/reviews`,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return {
    notifications: notifications.slice(0, 10),
    unreadCount: notifications.length,
  };
}

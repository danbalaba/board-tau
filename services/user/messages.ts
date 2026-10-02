import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { decryptMessage } from "@/lib/encryption";

export interface TenantConversation {
  id: string; // Composite: listingId_landlordId
  listingId: string;
  listingTitle: string;
  listingImage: string;
  landlordId: string;
  landlordName: string;
  landlordImage: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isArchived: boolean;
  isClosed?: boolean;
  closedReason?: string;
}

/**
 * Fetches all active conversations for the logged-in tenant.
 * A conversation is defined as a unique pair of (Listing + Landlord).
 */
export async function getTenantConversations(): Promise<TenantConversation[]> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please log in to view your messages.");
  }

  const tenantId = session.user.id;

  // 1. Get unique conversation pairs (Listing ID + Landlord ID)
  const conversationsData = await db.message.groupBy({
    by: ['listingId', 'senderId', 'receiverId'],
    where: {
      OR: [
        { senderId: tenantId },
        { receiverId: tenantId }
      ]
    },
  });

  // 2. Identify unique pairs and identify the landlord
  const uniquePairs = new Map<string, { listingId: string; landlordId: string }>();
  
  // To identify the landlord, we need to know who owns the listing. 
  // We'll collect list of listingIds first.
  const listingIds = Array.from(new Set(conversationsData.map((c: any) => c.listingId)));
  const listings = await db.listing.findMany({
    where: { id: { in: listingIds } },
    select: { id: true, userId: true, title: true, imageSrc: true, images: true }
  });

  listingIds.forEach(lId => {
    const listing = listings.find((l: any) => l.id === lId);
    if (listing) {
      const landlordId = listing.userId;
      const key = `${lId}_${landlordId}`;
      if (!uniquePairs.has(key)) {
         uniquePairs.set(key, { listingId: lId, landlordId: landlordId as string });
      }
    }
  });

  const pairsArray = Array.from(uniquePairs.values());
  if (pairsArray.length === 0) return [];

  // ============================================================
  // OPTIMIZED: 3 bulk queries instead of 3 × N individual queries
  // ============================================================

  // BULK QUERY 1: Get ALL messages for all pairs at once, sorted by newest first
  const allMessages = await db.message.findMany({
    where: {
      OR: pairsArray.map(({ listingId, landlordId }) => ({
        listingId,
        OR: [
          { senderId: tenantId, receiverId: landlordId },
          { senderId: landlordId, receiverId: tenantId },
        ],
      })),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      listing: { 
        include: { 
          user: { select: { id: true, name: true, image: true } },
          images: true
        } 
      },
    },
  });

  // Pick the LATEST message per conversation pair
  const lastMessageMap = new Map<string, typeof allMessages[0]>();
  for (const msg of allMessages) {
    const otherUserId = msg.senderId === tenantId ? msg.receiverId : msg.senderId;
    const key = `${msg.listingId}_${otherUserId}`;
    if (!lastMessageMap.has(key)) {
      lastMessageMap.set(key, msg);
    }
  }

  // BULK QUERY 2: Count ALL unread messages grouped by (listingId)
  const unreadCounts = await db.message.groupBy({
    by: ['listingId', 'senderId'],
    where: {
      receiverId: tenantId,
      OR: [
        { read: false },
        { isMarkedUnreadByTenant: true },
      ],
      senderId: { in: pairsArray.map(p => p.landlordId) },
    },
    _count: { id: true },
  });

  const unreadMap = new Map<string, number>();
  for (const u of unreadCounts) {
    unreadMap.set(`${u.listingId}_${u.senderId}`, u._count.id);
  }

  // BULK QUERY 3: Get ALL inquiry/room contexts at once
  const allInquiries = await db.inquiry.findMany({
    where: {
      userId: tenantId,
      listingId: { in: pairsArray.map(p => p.listingId) },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      room: {
        include: { images: { take: 1, select: { url: true } } }
      }
    },
  });

  // Pick the latest inquiry per listing
  const inquiryMap = new Map<string, typeof allInquiries[0]>();
  for (const inq of allInquiries) {
    if (!inquiryMap.has(inq.listingId)) {
      inquiryMap.set(inq.listingId, inq);
    }
  }

  // BULK QUERY 4: Get ALL reservation contexts at once
  const allReservations = await db.reservation.findMany({
    where: {
      userId: tenantId,
      listingId: { in: pairsArray.map(p => p.listingId) },
    },
    orderBy: { createdAt: 'desc' },
  });

  const reservationMap = new Map<string, typeof allReservations[0]>();
  for (const res of allReservations) {
    if (!reservationMap.has(res.listingId)) {
      reservationMap.set(res.listingId, res);
    }
  }

  // ============================================================
  // ASSEMBLY: Build results from in-memory maps (zero queries!)
  // ============================================================
  const now = new Date();
  const results: (TenantConversation | null)[] = pairsArray.map(({ listingId, landlordId }) => {
    const key = `${listingId}_${landlordId}`;
    const lastMessage = lastMessageMap.get(key);
    if (!lastMessage || !lastMessage.listing.user) return null;

    const inquiry = inquiryMap.get(listingId);
    const reservation = reservationMap.get(listingId);
    const unreadCount = unreadMap.get(key) || 0;

    // Evaluate if conversation is closed
    let isClosed = false;
    let closedReason = "";

    if (reservation) {
      if (reservation.status === "COMPLETED") {
        isClosed = true;
        closedReason = "Messaging is closed because your stay has been completed.";
      } else if (reservation.status === "CANCELLED") {
        isClosed = true;
        closedReason = "Messaging is closed for cancelled reservations.";
      } else if (new Date(reservation.endDate) < now) {
        isClosed = true;
        closedReason = "Messaging is closed because the stay period has ended.";
      }
    }

    if (!isClosed && inquiry) {
      if (["REJECTED", "CANCELLED", "EXPIRED"].includes(inquiry.status)) {
        isClosed = true;
        closedReason = `Messaging is closed for ${inquiry.status.toLowerCase()} inquiries.`;
      } else if (new Date(inquiry.checkOutDate) < now) {
        isClosed = true;
        closedReason = "Messaging is closed because the stay period has ended.";
      }
    }

    // Determine the best display image (Priority: Room -> Listing Gallery -> Listing imageSrc)
    let displayImage = "/images/placeholder.jpg";
    if (inquiry?.room?.images && inquiry.room.images.length > 0) {
      displayImage = inquiry.room.images[0].url;
    } else if (Array.isArray(lastMessage.listing.images) && lastMessage.listing.images.length > 0) {
      const firstImg = (lastMessage.listing.images as any)[0];
      displayImage = typeof firstImg === 'string' ? firstImg : firstImg.url;
    } else if (lastMessage.listing.imageSrc) {
      displayImage = lastMessage.listing.imageSrc;
    }

    const landlord = lastMessage.listing.user;

    return {
      id: key,
      listingId,
      listingTitle: lastMessage.listing.title,
      listingImage: displayImage,
      landlordId,
      landlordName: landlord.name || "Host",
      landlordImage: landlord.image || "",
      lastMessage: decryptMessage(lastMessage.content),
      lastMessageTime: lastMessage.createdAt.toISOString(),
      unreadCount,
      isArchived: lastMessage.isArchived,
      isClosed,
      closedReason,
    };
  });

  const filtered = results.filter((c): c is TenantConversation => c !== null);
  return filtered.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
}

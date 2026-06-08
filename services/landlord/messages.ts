import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { decryptMessage } from "@/lib/encryption";

export interface Conversation {
  id: string; // Composite or listingId_tenantId
  listingId: string;
  listingTitle: string;
  listingImage: string;
  tenantId: string;
  tenantName: string;
  tenantImage: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isArchived: boolean;
  inquiryId?: string;
}

/**
 * Fetches all active conversations for the logged-in landlord.
 * A conversation is defined as unique pair of (Listing + Tenant).
 */
export async function getLandlordConversations() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "LANDLORD") {
    throw new Error("Unauthorized: Only landlords can access this hub.");
  }

  const landlordId = session.user.id;

  // 1. Get unique conversation pairs (Listing ID + Tenant ID) 
  // We look for messages where the landlord is either sender or receiver
  const conversationsData = await db.message.groupBy({
    by: ['listingId', 'senderId', 'receiverId'],
    where: {
      OR: [
        { senderId: landlordId },
        { receiverId: landlordId }
      ]
    },
  });

  // 2. Identify unique pairs and who the "tenant" is
  const uniquePairs = new Map<string, { listingId: string; tenantId: string }>();
  conversationsData.forEach(item => {
    const tenantId = item.senderId === landlordId ? item.receiverId : item.senderId;
    const key = `${item.listingId}_${tenantId}`;
    if (!uniquePairs.has(key)) {
      uniquePairs.set(key, { listingId: item.listingId, tenantId });
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
      OR: pairsArray.map(({ listingId, tenantId }) => ({
        listingId,
        OR: [
          { senderId: landlordId, receiverId: tenantId },
          { senderId: tenantId, receiverId: landlordId },
        ],
      })),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      listing: { select: { title: true, imageSrc: true, images: true } },
      sender: { select: { id: true, name: true, image: true } },
      receiver: { select: { id: true, name: true, image: true } },
    },
  });

  // Pick the LATEST message per conversation pair (first occurrence = latest due to desc sort)
  const lastMessageMap = new Map<string, typeof allMessages[0]>();
  for (const msg of allMessages) {
    const otherUserId = msg.senderId === landlordId ? msg.receiverId : msg.senderId;
    const key = `${msg.listingId}_${otherUserId}`;
    if (!lastMessageMap.has(key)) {
      lastMessageMap.set(key, msg);
    }
  }

  // BULK QUERY 2: Count ALL unread messages grouped by (listingId + senderId)
  const unreadCounts = await db.message.groupBy({
    by: ['listingId', 'senderId'],
    where: {
      receiverId: landlordId,
      read: false,
      senderId: { in: pairsArray.map(p => p.tenantId) },
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
      OR: pairsArray.map(({ listingId, tenantId }) => ({
        listingId,
        userId: tenantId,
      })),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      room: {
        include: { images: { take: 1, select: { url: true } } }
      }
    },
  });

  // Pick the latest inquiry per pair
  const inquiryMap = new Map<string, typeof allInquiries[0]>();
  for (const inq of allInquiries) {
    const key = `${inq.listingId}_${inq.userId}`;
    if (!inquiryMap.has(key)) {
      inquiryMap.set(key, inq);
    }
  }

  // ============================================================
  // ASSEMBLY: Build results from in-memory maps (zero queries!)
  // ============================================================
  const results = pairsArray.map(({ listingId, tenantId }) => {
    const key = `${listingId}_${tenantId}`;
    const lastMessage = lastMessageMap.get(key);
    if (!lastMessage) return null;

    const unreadCount = unreadMap.get(key) || 0;
    const inquiry = inquiryMap.get(key);

    // Determine the best display image (Priority: Room -> Listing Gallery -> Listing imageSrc)
    let displayImage = "/images/placeholder.jpg";
    if (inquiry?.room?.images && inquiry.room.images.length > 0) {
      displayImage = inquiry.room.images[0].url;
    } else if (Array.isArray(lastMessage.listing.images) && (lastMessage.listing.images as any).length > 0) {
      const firstImg = (lastMessage.listing.images as any)[0];
      displayImage = typeof firstImg === 'string' ? firstImg : firstImg.url;
    } else if (lastMessage.listing.imageSrc) {
      displayImage = lastMessage.listing.imageSrc;
    }

    const otherUser = lastMessage.senderId === landlordId ? lastMessage.receiver : lastMessage.sender;

    return {
      id: key,
      listingId,
      listingTitle: lastMessage.listing.title,
      listingImage: displayImage,
      tenantId,
      tenantName: otherUser.name || "System User",
      tenantImage: otherUser.image || "",
      lastMessage: decryptMessage(lastMessage.content),
      lastMessageTime: lastMessage.createdAt.toISOString(),
      unreadCount,
      isArchived: lastMessage.isArchived,
    };
  });

  return results
    .filter((c): c is Conversation => c !== null)
    .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
}

/**
 * Fetches the full history between a landlord and a specific tenant for a property.
 */
export async function getConversationHistory(listingId: string, tenantId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const landlordId = session.user.id;

  // Verify that the conversation involves the landlord
  const messages = await db.message.findMany({
    where: {
      listingId,
      OR: [
        { senderId: landlordId, receiverId: tenantId },
        { senderId: tenantId, receiverId: landlordId }
      ]
    },
    orderBy: {
      createdAt: 'asc'
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          image: true,
        }
      }
    }
  });

  const decryptedMessages = messages.map(msg => ({
    ...msg,
    content: decryptMessage(msg.content)
  }));

  return decryptedMessages;
}

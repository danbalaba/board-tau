import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/services/user";
import { pusherServer } from "@/lib/pusher";
import { sendNewMessageEmail } from "@/services/email/notifications";
import { encryptMessage, decryptMessage } from "@/lib/encryption";
import { createNotification } from "@/services/notification";
import { hasPermission } from "@/lib/rbac";

const MAX_MESSAGE_LENGTH = 2000;

function jsonError(message: string, status: number) {
  return NextResponse.json({ ok: false, message }, { status });
}

async function assertCanMessageForListing(params: {
  listingId: string;
  currentUserId: string;
  otherUserId: string;
}) {
  const { listingId, currentUserId, otherUserId } = params;

  const listing = await db.listing.findUnique({
    where: { id: listingId },
    select: { id: true, userId: true, title: true },
  });

  if (!listing) {
    return { ok: false as const, status: 404, message: "Listing not found" };
  }

  const landlordId = listing.userId;
  const isCurrentLandlord = currentUserId === landlordId;
  const isOtherLandlord = otherUserId === landlordId;

  // Must be tenant↔landlord, where landlord owns this listing.
  if (!((isCurrentLandlord && !isOtherLandlord) || (!isCurrentLandlord && isOtherLandlord))) {
    return { ok: false as const, status: 403, message: "Messaging not allowed for this listing" };
  }

  const tenantId = isCurrentLandlord ? otherUserId : currentUserId;

  // Strict policy: tenant must have an inquiry or reservation for the listing.
  const [inquiry, reservation] = await Promise.all([
    db.inquiry.findFirst({ where: { listingId, userId: tenantId }, select: { id: true } }),
    db.reservation.findFirst({ where: { listingId, userId: tenantId }, select: { id: true } }),
  ]);

  if (!inquiry && !reservation) {
    return { ok: false as const, status: 403, message: "Tenant has no relationship with this listing" };
  }

  return { ok: true as const, listingTitle: listing.title, landlordId, tenantId };
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) return jsonError("Unauthorized", 401);

  const searchParams = request.nextUrl.searchParams;
  const listingId = searchParams.get("listingId") || "";
  const otherUserId = searchParams.get("otherUserId") || "";
  const cursor = searchParams.get("cursor");
  const limitParam = searchParams.get("limit");
  const limit = Math.min(Math.max(Number(limitParam || 30) || 30, 1), 100);

  if (!listingId || !otherUserId) return jsonError("Missing listingId or otherUserId", 400);

  const can = await assertCanMessageForListing({
    listingId,
    currentUserId: user.id,
    otherUserId,
  });

  if (!can.ok) return jsonError(can.message, can.status);

  const where: any = {
    listingId,
    OR: [
      { senderId: user.id, receiverId: otherUserId },
      { senderId: otherUserId, receiverId: user.id },
    ],
  };
  if (cursor) where.createdAt = { lt: new Date(cursor) };

  const messages = await db.message.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const decryptedMessages = messages.map((msg: any) => ({
    ...msg,
    content: decryptMessage(msg.content)
  }));

  const nextCursor = messages.length === limit ? messages[messages.length - 1]?.createdAt?.toISOString() : null;

  return NextResponse.json({ ok: true, messages: decryptedMessages, nextCursor });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) return jsonError("Unauthorized", 401);

  const permitted = await hasPermission(user.id, "SEND_MESSAGES");
  if (!permitted) return jsonError("Forbidden: Missing permission SEND_MESSAGES", 403);

  let body: { listingId?: string; receiverId?: string; content?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const listingId = String(body.listingId || "");
  const receiverId = String(body.receiverId || "");
  const content = String(body.content || "").trim();

  if (!listingId || !receiverId) return jsonError("Missing listingId or receiverId", 400);
  if (!content) return jsonError("Message content is required", 400);
  if (content.length > MAX_MESSAGE_LENGTH) return jsonError(`Message too long (max ${MAX_MESSAGE_LENGTH})`, 400);
  if (receiverId === user.id) return jsonError("Cannot message yourself", 400);

  const can = await assertCanMessageForListing({
    listingId,
    currentUserId: user.id,
    otherUserId: receiverId,
  });

  if (!can.ok) return jsonError(can.message, can.status);

  const message = await db.message.create({
    data: {
      senderId: user.id,
      receiverId,
      content: encryptMessage(content),
      read: false,
      listingId,
    } as any,
  });

  // Re-attach plaintext content for real-time broadcasts so the frontend can read it immediately
  const decryptedMessageForBroadcast = { ...message, content };

  const preview = content.length > 120 ? `${content.slice(0, 120)}…` : content;
  const isReceiverLandlord = String(receiverId) === String(can.landlordId);
  const deepLink = isReceiverLandlord 
    ? `/landlord/messages?listingId=${listingId}&tenantId=${user.id}`
    : `/messages?listingId=${listingId}&otherUserId=${user.id}`;

  await createNotification({
    userId: receiverId,
    type: "message",
    title: isReceiverLandlord ? `Leasing Inquiry: ${can.listingTitle}` : "New message from host",
    description: `${user.name || "Someone"}: ${preview}`,
    link: deepLink,
  });

  // 3. Trigger Email Notification (Prioritized before Pusher to ensure delivery)
  try {
    const receiver = await db.user.findUnique({
      where: { id: receiverId },
      select: { email: true, name: true }
    });

    if (receiver?.email) {
      await sendNewMessageEmail(
        receiver, 
        user.name || "A user", 
        can.listingTitle, 
        preview, 
        deepLink
      );
    }
  } catch (err) {
    console.error("Email trigger error:", err);
  }

  // 4. Real-time broadcasts
  const channelName = `private-chat-${listingId}-${[user.id, receiverId].sort().join("-")}`;
  await pusherServer.trigger(channelName, "new-message", decryptedMessageForBroadcast);

  // Global notification for both parties (to update Inbox/Badge in real-time)
  const syncPayload = { listingId, senderId: user.id, message: preview };
  await Promise.all([
    pusherServer.trigger(`private-user-${receiverId}`, "message-notification", syncPayload),
    pusherServer.trigger(`private-user-${user.id}`, "message-notification", syncPayload)
  ]);

  return NextResponse.json({ ok: true, message: decryptedMessageForBroadcast });
}

export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) return jsonError("Unauthorized", 401);

  const searchParams = request.nextUrl.searchParams;
  const listingId = searchParams.get("listingId");
  const otherUserId = searchParams.get("otherUserId");

  if (!listingId || !otherUserId) return jsonError("Missing listingId or otherUserId", 400);

  try {
    await db.message.deleteMany({
      where: {
        listingId,
        OR: [
          { senderId: user.id, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: user.id },
        ],
      },
    });

    return NextResponse.json({ ok: true, message: "Conversation history deleted" });
  } catch (error) {
    console.error("Delete error:", error);
    return jsonError("Failed to delete conversation", 500);
  }
}

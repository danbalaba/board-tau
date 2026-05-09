import { NextRequest, NextResponse } from "next/server";
import { getLandlordConversations } from "@/services/landlord/messages";
import { db } from "@/lib/db";
import validator from "validator";
import { pusherServer } from "@/lib/pusher";
import { sendNewMessageEmail } from "@/services/email/notifications";
import { encryptMessage } from "@/lib/encryption";
import { getCurrentUser } from "@/services/user";

/**
 * GET: Fetches the list of conversations for the Landlord Inbox Hub
 */
export async function GET(request: NextRequest) {
  try {
    const conversations = await getLandlordConversations();

    return NextResponse.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error("Error fetching landlord conversations:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST: Sends a message from the Landlord to a Tenant
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await db.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, role: true }
    });

    if (!currentUser || currentUser.role !== "LANDLORD") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { listingId, receiverId, content } = body;

    if (!listingId || !receiverId || !content) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // 1. Create the message (Encrypting the content before DB insert)
    const message = await db.message.create({
      data: {
        listingId,
        senderId: user.id,
        receiverId,
        content: encryptMessage(content.trim()),
      },
      include: {
        sender: {
          select: { id: true, name: true, image: true }
        }
      }
    });

    const displayContent = content.trim();
    // Reattach the plaintext content for real-time broadcasts
    const decryptedMessageForBroadcast = { ...message, content: displayContent };

    // 2. Create the notification for the tenant
    const listing = await db.listing.findUnique({
      where: { id: listingId },
      select: { title: true }
    });

    const deepLink = `/messages?listingId=${listingId}&otherUserId=${user.id}`;

    await db.notification.create({
      data: {
        userId: receiverId,
        type: "message",
        title: "New Message from host",
        description: `${user.name || "Host"}: ${displayContent.substring(0, 50)}...`,
        link: deepLink,
      }
    });

    // 3. Trigger Email Notification (Await to ensure delivery)
    try {
      const receiver = await db.user.findUnique({
        where: { id: receiverId },
        select: { email: true, name: true }
      });

      if (receiver?.email) {
        await sendNewMessageEmail(
          receiver,
          currentUser.name || "Host",
          listing?.title || "Property Listing",
          displayContent.substring(0, 100),
          deepLink
        );
      }
    } catch (emailErr) {
      console.error("Failed to send tenant email notification:", emailErr);
    }

    // 4. Trigger Pusher for real-time update
    const channel = `private-chat-${listingId}-${[user.id, receiverId].sort().join("-")}`;
    await pusherServer.trigger(channel, "new-message", decryptedMessageForBroadcast);

    return NextResponse.json({
      success: true,
      data: decryptedMessageForBroadcast,
    });
  } catch (error) {
    console.error("Error sending landlord message:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send message",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH: Archives/Unarchives a conversation by marking all messages as archived
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user?.id || user.role !== "LANDLORD") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { listingId, tenantId, archive = true } = body;

    if (!listingId || !tenantId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Update all messages in this conversation
    await db.message.updateMany({
      where: {
        listingId,
        OR: [
          { senderId: user.id, receiverId: tenantId },
          { senderId: tenantId, receiverId: user.id }
        ]
      },
      data: {
        isArchived: archive
      }
    });

    return NextResponse.json({
      success: true,
      message: archive ? "Conversation archived" : "Conversation restored"
    });
  } catch (error) {
    console.error("Error archiving conversation:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update conversation status",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT: Marks all messages in a conversation as read
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user?.id || user.role !== "LANDLORD") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { listingId, tenantId } = body;

    if (!listingId || !tenantId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    await db.message.updateMany({
      where: {
        listingId,
        senderId: tenantId,
        receiverId: user.id,
        read: false
      },
      data: {
        read: true
      }
    });

    return NextResponse.json({
      success: true,
      message: "Messages marked as read"
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update read status",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Permanently deletes all messages in a conversation
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user?.id || user.role !== "LANDLORD") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const listingId = searchParams.get("listingId");
    const tenantId = searchParams.get("tenantId");

    if (!listingId || !tenantId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    await db.message.deleteMany({
      where: {
        listingId,
        OR: [
          { senderId: user.id, receiverId: tenantId },
          { senderId: tenantId, receiverId: user.id }
        ]
      }
    });

    return NextResponse.json({
      success: true,
      message: "Conversation history deleted permanently"
    });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete conversation history",
      },
      { status: 500 }
    );
  }
}

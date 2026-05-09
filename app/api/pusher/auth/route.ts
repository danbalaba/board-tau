import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Pusher sends auth requests as application/x-www-form-urlencoded
    const body = await req.formData();
    const socketId = body.get("socket_id") as string;
    const channel = body.get("channel_name") as string;

    if (!socketId || !channel) {
      return new Response("Bad Request", { status: 400 });
    }

    // Security check: Only allow users to join channels that contain their own user ID
    // Channel format: private-chat-{listingId}-{userId1}-{userId2}
    if (channel.startsWith("private-chat-")) {
      const parts = channel.split("-");
      // The last two parts are always the user IDs
      const id1 = parts[parts.length - 2];
      const id2 = parts[parts.length - 1];
      const allowedIds = [id1, id2];

      if (!allowedIds.includes(session.user.id)) {
        console.warn(`Blocked unauthorized Pusher access: User ${session.user.id} tried to join ${channel}`);
        return new Response("Forbidden", { status: 403 });
      }
    } else if (channel.startsWith("private-user-")) {
      const userId = channel.replace("private-user-", "");
      
      if (userId !== session.user.id) {
        console.warn(`Blocked unauthorized Pusher access: User ${session.user.id} tried to join ${channel}`);
        return new Response("Forbidden", { status: 403 });
      }
    } else {
      // Optional: add more channel type patterns if needed (e.g. notifications)
      return new Response("Forbidden", { status: 403 });
    }

    const authResponse = pusherServer.authorizeChannel(socketId, channel);

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error("Pusher auth error:", error);
    return new Response("Internal Error", { status: 500 });
  }
}

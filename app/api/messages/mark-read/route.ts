import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/services/user";
import { db } from "@/lib/db";
import { markEntityNotificationsAsRead } from "@/services/notification";

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { listingId, otherUserId } = await request.json();

    if (!listingId || !otherUserId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Mark messages sent by the other user to me as read AND clear isolated badges
    const isLandlord = user.role === "LANDLORD" || user.isVerifiedLandlord;
    
    await db.message.updateMany({
      where: {
        listingId,
        senderId: otherUserId,
        receiverId: user.id
      },
      data: {
        read: true,
        ...(isLandlord ? { isMarkedUnreadByLandlord: false } : { isMarkedUnreadByTenant: false })
      }
    });

    // Clear global notifications
    await markEntityNotificationsAsRead("message", listingId);

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

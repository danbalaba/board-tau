import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/services/user";
import { db } from "@/lib/db";

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { listingId, otherUserId, isArchived } = await request.json();

    if (!listingId || !otherUserId || isArchived === undefined) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Mark all existing messages between these two users for this listing as archived/unarchived
    await db.message.updateMany({
      where: {
        listingId,
        OR: [
          { senderId: user.id, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: user.id },
        ],
      },
      data: {
        isArchived,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Conversation ${isArchived ? "archived" : "unarchived"} successfully`,
    });
  } catch (error) {
    console.error("Error archiving conversation:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update archive status",
      },
      { status: 500 }
    );
  }
}

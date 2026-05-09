import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/services/user";
import { db } from "@/lib/db";

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

    // Role check to update the correct field
    const isLandlord = user.role === "LANDLORD" || user.isVerifiedLandlord;
    
    // We update all messages between those two users in that listing
    // Since MongoDB Prisma doesn't support conditional OR in updates easily for different fields,
    // we can update messages where sender is otherUserId and receiver is user
    
    if (isLandlord) {
       await db.message.updateMany({
         where: { listingId, senderId: otherUserId, receiverId: user.id },
         data: { isMarkedUnreadByLandlord: true }
       });
    } else {
       await db.message.updateMany({
         where: { listingId, senderId: otherUserId, receiverId: user.id },
         data: { isMarkedUnreadByTenant: true }
       });
    }

    return NextResponse.json({ success: true, message: "Marked as unread successfully" });

  } catch (error) {
    console.error("Error marking messages as unread:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

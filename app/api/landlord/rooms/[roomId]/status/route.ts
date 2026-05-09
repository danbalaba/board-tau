import { db } from "@/lib/db";
import { requireLandlord } from "@/lib/landlord";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const landlord = await requireLandlord();
    const { roomId } = await params;
    const { status } = await req.json();

    if (!["AVAILABLE", "FULL", "MAINTENANCE"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Verify ownership before updating
    const room = await db.room.findFirst({
      where: {
        id: roomId,
        listing: { userId: landlord.id },
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found or unauthorized" }, { status: 404 });
    }

    const updated = await db.room.update({
      where: { id: roomId },
      data: { status },
    });

    revalidatePath("/landlord/rooms");

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[ROOM_STATUS_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

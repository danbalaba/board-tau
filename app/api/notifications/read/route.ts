import { NextResponse } from "next/server";
import { getCurrentUser } from "@/services/user";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await request.json();
    if (!id) {
      return new NextResponse("Missing ID", { status: 400 });
    }

    await db.notification.update({
      where: {
        id,
        userId: user.id
      },
      data: {
        isRead: true
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[NOTIFICATIONS_READ_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

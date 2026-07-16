import { NextResponse } from "next/server";
import { getCurrentUser } from "@/services/user";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const notifications = await db.notification.findMany({
      where: {
        userId: user.id,
      },
      take: limit + 1,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
      orderBy: {
        createdAt: "desc",
      },
    });

    let nextCursor: string | null = null;
    if (notifications.length > limit) {
      const nextItem = notifications.pop();
      nextCursor = nextItem!.id;
    }

    // Include unread stats in the same payload for efficiency
    const grouped = await db.notification.groupBy({
      by: ['type'],
      where: {
        userId: user.id,
        isRead: false,
      },
      _count: { id: true },
    });

    const byType: Record<string, number> = {};
    let totalUnread = 0;
    for (const group of grouped) {
      const type = group.type.toLowerCase();
      byType[type] = group._count.id;
      totalUnread += group._count.id;
    }

    return NextResponse.json({
      notifications,
      nextCursor,
      unreadStats: {
        total: totalUnread,
        byType
      }
    });
  } catch (error) {
    console.error("[NOTIFICATIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

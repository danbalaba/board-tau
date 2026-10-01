import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/services/user";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeStrikes = await db.userStrike.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: sevenDaysAgo,
        }
      }
    });

    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: { suspensionCount: true }
    });

    const suspensionCount = dbUser?.suspensionCount || 0;
    const nextStrike = activeStrikes + 1;
    const willSuspend = nextStrike >= 3 && suspensionCount === 0;
    const willBan = nextStrike >= 3 && suspensionCount >= 1;

    return NextResponse.json({
      activeStrikes,
      suspensionCount,
      nextStrike,
      willSuspend,
      willBan,
    });
  } catch (error) {
    console.error("Error fetching strike status:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/services/user";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(null);
    }

    const activeStay = await db.reservation.findFirst({
      where: {
        userId: user.id,
        status: { in: ["RESERVED", "CHECKED_IN"] as any },
        isArchived: false,
      },
      orderBy: {
        endDate: "desc",
      },
      select: {
        endDate: true,
        status: true,
        listing: {
          select: { title: true }
        }
      }
    });

    return NextResponse.json(activeStay);
  } catch (error) {
    console.error("[ACTIVE_STAY_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

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
    const take = 10;

    const inquiries = await db.inquiry.findMany({
      where: {
        listing: { userId: user.id },
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            imageSrc: true,
          },
        },
        room: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: take + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
    });

    const hasNextPage = inquiries.length > take;
    const nextCursor = hasNextPage ? inquiries[take].id : null;
    const paginatedInquiries = inquiries.slice(0, take);

    return NextResponse.json({
      inquiries: paginatedInquiries,
      nextCursor
    });

  } catch (error) {
    console.error("[LANDLORD_RESERVATIONS_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

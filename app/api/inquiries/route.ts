import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/services/user";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    const {
      listingId,
      roomId,
      moveInDate,
      stayDuration,
      occupantsCount,
      role,
      hasPets,
      smokes,
      contactMethod,
      message,
    } = data;

    // Validate required fields
    if (!listingId || !roomId || !moveInDate || !stayDuration || !role || !contactMethod) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create the inquiry
    const inquiry = await db.inquiry.create({
      data: {
        listingId,
        roomId,
        userId: user.id,
        moveInDate,
        stayDuration,
        occupantsCount,
        role,
        hasPets,
        smokes,
        contactMethod,
        message,
        status: "pending",
      },
    });

    return NextResponse.json(inquiry);
  } catch (error) {
    console.error("Error creating inquiry:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all inquiries for the current user
    const inquiries = await db.inquiry.findMany({
      where: {
        userId: user.id,
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
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(inquiries);
  } catch (error) {
    console.error("Error getting inquiries:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

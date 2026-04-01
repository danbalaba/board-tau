import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/services/user";
import { hasPermission } from "@/lib/rbac";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ENFORCE PERMISSION: CREATE_INQUIRY
    const canCreate = await hasPermission(user.id, 'CREATE_INQUIRY');
    if (!canCreate) {
      return NextResponse.json(
        { error: "Forbidden", message: "Institutional protocols prohibit this action for your current role." },
        { status: 403 }
      );
    }

    const data = await request.json();
    console.log("Inquiry data:", data);

    const {
      listingId,
      roomId,
      moveInDate,
      checkOutDate,
      occupantsCount,
      role,
      contactMethod,
      message,
      profilePhotoUrl,
      idAttachmentUrl,
      paymentMethod,
    } = data;

    // Validate required fields
    if (!listingId || !roomId || !moveInDate || !checkOutDate || !role) {
      const missingFields = [];
      if (!listingId) missingFields.push("listingId");
      if (!roomId) missingFields.push("roomId");
      if (!moveInDate) missingFields.push("moveInDate");
      if (!checkOutDate) missingFields.push("checkOutDate");
      if (!role) missingFields.push("role");
      console.log("Missing fields:", missingFields);
      return NextResponse.json({ error: "Missing required fields", missingFields }, { status: 400 });
    }

    // Get room details
    const room = await db.room.findUnique({
      where: { id: roomId },
    });
    console.log("Room details:", room);

    if (!room) {
      console.log("Room not found");
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Optional: Check if room has available slots before creating inquiry
    if (room.availableSlots <= 0) {
      console.log("Room has no available slots");
      return NextResponse.json({ error: "Room is fully booked" }, { status: 400 });
    }

    // Create inquiry with PENDING status
    const startDate = new Date(moveInDate);
    const endDate = new Date(checkOutDate);

    // Map role string to InquiryRole enum
    const roleEnum = role.toUpperCase();

    const inquiry = await (db.inquiry as any).create({
      data: {
        userId: user.id,
        listingId,
        roomId,
        moveInDate: startDate,
        checkOutDate: endDate,
        occupantsCount: occupantsCount || 1,
        role: roleEnum as any,
        message: message || "",
        profilePhotoUrl: profilePhotoUrl || null,
        idAttachmentUrl: idAttachmentUrl || null,
        paymentMethod: paymentMethod || null,
        reservationFee: (room as any).reservationFee || 0,
        status: "PENDING",
        paymentStatus: "UNPAID",
      },
    });

    console.log("Inquiry created successfully:", inquiry);
    return NextResponse.json(inquiry);
  } catch (error: any) {
    console.error("Error creating inquiry:", error);
    return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: any = {
      userId: user.id,
    };

    // Filter by status if provided
    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }

    const inquiries = await db.inquiry.findMany({
      where,
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            imageSrc: true,
            location: true,
          },
        },
        room: {
          select: {
            id: true,
            name: true,
            price: true,
            roomType: true,
            images: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(inquiries);
  } catch (error: any) {
    console.error("Error getting inquiries:", error);
    return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 });
  }
}

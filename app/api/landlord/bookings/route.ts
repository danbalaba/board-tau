import { NextRequest, NextResponse } from "next/server";
import {
  getLandlordBookings,
  getBookingDetails,
  updateBookingStatus,
} from "@/services/landlord/bookings";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get("cursor") || undefined;
    const status = searchParams.get("status") || undefined;
    const paymentStatus = searchParams.get("paymentStatus") || undefined;
    const isArchived = searchParams.get("isArchived") || undefined;
    const id = searchParams.get("id");

    if (id) {
      // Get single booking details
      const result = await getBookingDetails(id);
      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    // Get all bookings
    const result = await getLandlordBookings({ cursor, status, paymentStatus, isArchived });
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch bookings",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("id");

    if (!bookingId) {
      return NextResponse.json(
        {
          success: false,
          error: "Booking ID is required",
        },
        { status: 400 }
      );
    }

    const { status } = await request.json();

    const validStatuses = ["PENDING_PAYMENT", "RESERVED", "CHECKED_IN", "COMPLETED", "CANCELLED"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Valid status (${validStatuses.join("/")}) is required`,
        },
        { status: 400 }
      );
    }

    const result = await updateBookingStatus(bookingId, status);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update booking status",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("id");

    if (!bookingId) {
      return NextResponse.json(
        {
          success: false,
          error: "Booking ID is required",
        },
        { status: 400 }
      );
    }

    const { toggleReservationArchive } = await import("@/services/landlord/bookings");
    const result = await toggleReservationArchive(bookingId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error toggling booking archive status:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to toggle booking archive status",
      },
      { status: 500 }
    );
  }
}

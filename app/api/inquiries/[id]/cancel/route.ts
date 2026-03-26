import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/services/user";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: inquiryId } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find the inquiry
    const inquiry = await db.inquiry.findUnique({
      where: { id: inquiryId },
    });

    if (!inquiry) {
      return NextResponse.json(
        { message: "Inquiry not found" },
        { status: 404 }
      );
    }

    // Check if the user owns the inquiry
    if (inquiry.userId !== user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Check if the inquiry can be cancelled (only PENDING can be cancelled)
    if (inquiry.status !== "PENDING") {
      return NextResponse.json(
        { message: "Only pending inquiries can be cancelled" },
        { status: 400 }
      );
    }

    // Update the inquiry status to CANCELLED
    const updatedInquiry = await db.inquiry.update({
      where: { id: inquiryId },
      data: {
        status: "CANCELLED" as any,
      },
    });

    return NextResponse.json(updatedInquiry);
  } catch (error) {
    console.error("Error cancelling inquiry:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

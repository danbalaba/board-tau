import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/services/user";
import { sendReservationNotificationEmail } from "@/services/email/notifications";

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
      include: {
        listing: { select: { title: true, userId: true } },
        user: { select: { name: true } }
      }
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

    // Extract reason
    const body = await request.json();
    const { reason } = body;

    // Update the inquiry status to CANCELLED
    const updatedInquiry = await db.inquiry.update({
      where: { id: inquiryId },
      data: {
        status: "CANCELLED",
        cancellationReason: reason || "No reason specified"
      },
    });

    // Notify Landlord of cancellation
    try {
      const landlord = await db.user.findUnique({
        where: { id: inquiry.listing.userId },
        select: { email: true, name: true }
      });

      if (landlord && landlord.email) {
         await sendReservationNotificationEmail(
            landlord,
            inquiry.listing,
            "CANCELLED",
            "Inquiry Withdrawn",
            `${inquiry.user.name || 'A student'} has withdrawn their inquiry for ${inquiry.listing.title}. Reason: ${reason || 'No reason specified'}`,
            true
         );
      }

      // Notify Tenant (Receipt)
      const tenant = await db.user.findUnique({
        where: { id: inquiry.userId },
        select: { email: true }
      });

      if (tenant && tenant.email) {
        await sendReservationNotificationEmail(
            tenant,
            inquiry.listing,
            "CANCELLED",
            "Inquiry Withdrawal Receipt", // More clear
            `This email confirms that you have successfully withdrawn your inquiry for ${inquiry.listing.title}. No further action is required.`,
            false
         );
      }
    } catch (emailError) {
      console.error("Failed to notify landlord of cancellation:", emailError);
    }

    return NextResponse.json(updatedInquiry);
  } catch (error) {
    console.error("Error cancelling inquiry:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

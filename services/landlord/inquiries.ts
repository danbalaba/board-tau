"use server";

import { db } from "@/lib/db";
import { requireLandlord } from "@/lib/landlord";
import { createNotification } from "@/services/notification";
import { sendInquiryStatusEmail } from "@/services/email/notifications";

export const getLandlordInquiries = async (args?: {
  cursor?: string;
  status?: string;
  includeArchived?: boolean;
}) => {
  const landlord = await requireLandlord();

  const { cursor, status, includeArchived = false } = args || {};

  const where: any = {
    isArchived: includeArchived,
    listing: {
      userId: landlord.id,
    },
  };

  if (status) {
    where.status = status;
  }

  const inquiries = await db.inquiry.findMany({
    where,
    take: 20 + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
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
          reservationFee: true,
        },
      },
    },
  });

  const nextCursor = inquiries.length > 20 ? inquiries[20 - 1].id : null;
  const list = inquiries.slice(0, 20);

  return { inquiries: list, nextCursor };
};

export const getInquiryDetails = async (inquiryId: string) => {
  const landlord = await requireLandlord();

  const inquiry = await db.inquiry.findFirst({
    where: {
      id: inquiryId,
      listing: {
        userId: landlord.id,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      listing: {
        select: {
          id: true,
          title: true,
          imageSrc: true,
          description: true,
          amenities: true,
        },
      },
      room: {
        select: {
          id: true,
          name: true,
          price: true,
          capacity: true,
          availableSlots: true,
        },
      },
    },
  });

  if (!inquiry) {
    throw new Error("Inquiry not found");
  }

  return inquiry;
};

export const respondToInquiry = async (
  inquiryId: string,
  status: "APPROVED" | "REJECTED",
  message?: string
) => {
  const landlord = await requireLandlord();

  const inquiry = await db.inquiry.findFirst({
    where: {
      id: inquiryId,
      listing: {
        userId: landlord.id,
      },
    },
    include: {
      room: true,
      user: true,
    }
  });

  if (!inquiry) {
    throw new Error("Inquiry not found");
  }

  const updatedInquiry = await db.inquiry.update({
    where: { id: inquiryId },
    data: {
      status,
      rejectionReason: status === "REJECTED" ? message : null,
    } as any,
    include: {
      listing: { select: { title: true } }
    }
  }) as any;

  // If approved, dynamically spawn the reservation record!
  if (status === "APPROVED" && inquiry.room) {
    const moveIn = new Date(inquiry.moveInDate);
    const checkOut = new Date(inquiry.checkOutDate);

    // Calculate total days for stay reference
    const durationInDays = Math.ceil((checkOut.getTime() - moveIn.getTime()) / (1000 * 60 * 60 * 24));

    // Important: Use the fixed reservationFee from the inquiry record!
    const totalPrice = (inquiry as any).reservationFee || 0;

    await db.reservation.create({
      data: {
        userId: inquiry.userId,
        listingId: inquiry.listingId,
        roomId: inquiry.roomId,
        inquiryId: inquiry.id,
        startDate: moveIn,
        endDate: checkOut,
        durationInDays,
        totalPrice,
        occupantsCount: (inquiry as any).occupantsCount || 1,
        status: "PENDING_PAYMENT",
        paymentStatus: "PENDING",
      } as any
    });
  }

  // Notify the user about the landlord's response (Inquiry Thread)
  const statusLabel = status === "APPROVED" ? "approved" : "rejected";
  
  // Truncate message for notification feed safety
  const displayMessage = (message && message.length > 150) ? `${message.substring(0, 150)}...` : message;
  const reasonText = status === "REJECTED" && displayMessage ? ` Reason: ${displayMessage}` : "";

  await createNotification({
    userId: inquiry.userId,
    type: "inquiry",
    title: `Inquiry ${statusLabel}`,
    description: `Your inquiry for ${updatedInquiry.listing.title} has been ${statusLabel}.${reasonText}`,
    link: `/inquiries?id=${updatedInquiry.id}`, // Matching the student dashboard path with ID
  });

  // 3. Send Email Notification to Tenant
  try {
    if (inquiry.user && inquiry.user.email) {
      await sendInquiryStatusEmail(
        inquiry.user,
        updatedInquiry.listing,
        status,
        message,
        inquiry
      );
    }
  } catch (emailError) {
    console.error("Failed to send inquiry status email:", emailError);
  }

  return updatedInquiry;
};

export const deleteInquiry = async (inquiryId: string) => {
  const landlord = await requireLandlord();

  const inquiry = await db.inquiry.findFirst({
    where: {
      id: inquiryId,
      listing: {
        userId: landlord.id,
      },
    },
  });

  if (!inquiry) {
    throw new Error("Inquiry not found");
  }

  return await db.inquiry.update({
    where: { id: inquiryId },
    data: { isArchived: !inquiry.isArchived }
  });
};

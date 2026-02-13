"use server";

import { db } from "@/lib/db";
import { requireLandlord } from "@/lib/landlord";

export const getLandlordInquiries = async (args?: {
  cursor?: string;
  status?: string;
}) => {
  const landlord = await requireLandlord();

  const { cursor, status } = args || {};

  const where: any = {
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
  status: "approved" | "rejected",
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
  });

  if (!inquiry) {
    throw new Error("Inquiry not found");
  }

  const updatedInquiry = await db.inquiry.update({
    where: { id: inquiryId },
    data: {
      status,
    },
  });

  // TODO: Send notification to user

  return updatedInquiry;
};

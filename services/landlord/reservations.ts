"use server";

import { db } from "@/lib/db";
import { requireLandlord } from "@/lib/landlord";

export const getLandlordReservations = async (args?: {
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

  if (status && status !== 'all') {
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

  return { reservations: list, nextCursor };
};

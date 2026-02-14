"use server";

import { db } from "@/lib/db";
import { requireLandlord } from "@/lib/landlord";

export const getLandlordTenants = async (args?: {
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

  const reservations = await db.reservation.findMany({
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
    },
  });

  const nextCursor = reservations.length > 20 ? reservations[20 - 1].id : null;
  const list = reservations.slice(0, 20);

  return { tenants: list, nextCursor };
};

export const getTenantDetails = async (tenantId: string) => {
  const landlord = await requireLandlord();

  const reservation = await db.reservation.findFirst({
    where: {
      id: tenantId,
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
    },
  });

  if (!reservation) {
    throw new Error("Tenant not found");
  }

  return reservation;
};

export const getTenantDocument = async (tenantId: string) => {
  const landlord = await requireLandlord();

  // This is a placeholder - you would implement actual document retrieval
  // based on your database schema
  return {
    id: tenantId,
    userId: "user-123",
    documents: [
      {
        id: "doc-1",
        name: "Valid ID",
        type: "id",
        url: "/placeholder/document1.pdf",
        uploadedAt: new Date(),
        status: "verified",
      },
      {
        id: "doc-2",
        name: "Proof of Address",
        type: "address",
        url: "/placeholder/document2.pdf",
        uploadedAt: new Date(),
        status: "pending",
      },
      {
        id: "doc-3",
        name: "Student ID",
        type: "student",
        url: "/placeholder/document3.pdf",
        uploadedAt: new Date(),
        status: "verified",
      },
    ],
  };
};

export const getTenantRentalHistory = async (tenantId: string) => {
  const landlord = await requireLandlord();

  // This is a placeholder - you would implement actual rental history retrieval
  return {
    id: tenantId,
    userId: "user-123",
    history: [
      {
        id: "rental-1",
        listingId: "listing-1",
        listingTitle: "Apartment #3",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-06-30"),
        amount: 15000,
        status: "completed",
      },
      {
        id: "rental-2",
        listingId: "listing-1",
        listingTitle: "Apartment #3",
        startDate: new Date("2024-07-01"),
        endDate: new Date("2024-12-31"),
        amount: 15000,
        status: "active",
      },
    ],
  };
};

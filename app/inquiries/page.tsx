import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/user";
import { db } from "@/lib/db";
import InquiriesClient from "@/components/inquiries/InquiriesClient";

export const dynamic = 'force-dynamic';

const InquiriesPage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  // Security: If user is a LANDLORD, redirect to their landlord dashboard
  if (user.role === "LANDLORD") {
    redirect("/landlord/inquiries");
  }

  if (user.role === "ADMIN") {
    redirect("/admin");
  }

  // Get user inquiries
  const inquiries = await db.inquiry.findMany({
    where: {
      userId: user.id,
    },
    include: {
      listing: {
        select: {
          id: true,
          userId: true,
          title: true,
          imageSrc: true,
          images: true,
          location: true,
          region: true,
          country: true,
          propertyType: {
            select: {
              name: true,
            },
          },
        },
      },
      room: {
        select: {
          id: true,
          name: true,
          price: true,
          roomTypeDefinition: {
            select: {
              id: true,
              name: true,
            },
          },
          images: true,
        },
      },
      reservations: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Transform to ensure dates are serializable and match the client component interface
  const transformedInquiries = inquiries.map((inquiry: any) => ({
    ...inquiry,
    room: inquiry.room
      ? {
          ...inquiry.room,
          roomType: inquiry.room.roomTypeDefinition?.name || inquiry.listing?.propertyType?.name || "Solo Room",
        }
      : null,
    createdAt: (inquiry as any).createdAt.toISOString(),
    updatedAt: (inquiry as any).updatedAt.toISOString(),
    moveInDate: (inquiry as any).moveInDate.toISOString(),
    checkOutDate: (inquiry as any).checkOutDate ? (inquiry as any).checkOutDate.toISOString() : "",
  }));

  return <InquiriesClient initialInquiries={transformedInquiries} currentUserId={user.id} />;
};

export default InquiriesPage;

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
          title: true,
          imageSrc: true,
          location: true,
          region: true,
          country: true,
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
      reservation: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Transform to ensure dates are serializable and match the client component interface
  const transformedInquiries = inquiries.map((inquiry) => ({
    ...inquiry,
    createdAt: (inquiry as any).createdAt.toISOString(),
    updatedAt: (inquiry as any).updatedAt.toISOString(),
    moveInDate: (inquiry as any).moveInDate.toISOString(),
    checkOutDate: (inquiry as any).checkOutDate ? (inquiry as any).checkOutDate.toISOString() : "",
  }));

  return <InquiriesClient initialInquiries={transformedInquiries} />;
};

export default InquiriesPage;

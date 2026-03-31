import { getCurrentUser } from "@/services/user";
import { db } from "@/lib/db";
import LandlordReservationsClient from "../components/pages/reservations/LandlordReservationsClient";

export default async function LandlordReservationsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const take = 10;
  
  // Get all reservation requests for the landlord's listings
  const inquiries = await db.inquiry.findMany({
    where: {
      listing: { userId: user.id },
    },
    include: {
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
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: take + 1,
  });

  const hasNextPage = inquiries.length > take;
  const nextCursor = hasNextPage ? inquiries[take].id : null;
  const paginatedInquiries = inquiries.slice(0, take);

  // Convert Prisma objects to plain POJOs to avoid Next.js "toStringTag" server reference issues
  const serializedInquiries = JSON.parse(JSON.stringify(paginatedInquiries));

  return <LandlordReservationsClient initialReservations={{ inquiries: serializedInquiries, nextCursor }} />;
}

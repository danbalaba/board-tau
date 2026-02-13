"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

const ADMIN_PAGE_SIZE = 20;

/**
 * Get admin reservations with pagination and filters
 * @param args - Query parameters including cursor, status, and payment status
 * @returns Paginated reservations and next cursor
 */
export async function getAdminReservations(args: {
  cursor?: string;
  status?: string;
  paymentStatus?: string;
}) {
  await requireAdmin();

  const where: { status?: string; paymentStatus?: string; user?: { deletedAt: null }; listing?: { user?: { deletedAt: null } } } = {};
  if (args.status) where.status = args.status;
  if (args.paymentStatus) where.paymentStatus = args.paymentStatus;
  where.user = { deletedAt: null }; // Only include reservations with active users
  where.listing = { user: { deletedAt: null } }; // Only include reservations with active landlords

  const reservations = await db.reservation.findMany({
    where,
    take: ADMIN_PAGE_SIZE + 1,
    ...(args.cursor ? { cursor: { id: args.cursor }, skip: 1 } : {}),
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      listing: {
        select: {
          id: true,
          title: true,
          user: { select: { id: true, name: true, email: true } }
        }
      },
    },
  });

  const nextCursor = reservations.length > ADMIN_PAGE_SIZE ? reservations[ADMIN_PAGE_SIZE - 1].id : null;
  return { reservations: reservations.slice(0, ADMIN_PAGE_SIZE), nextCursor };
}

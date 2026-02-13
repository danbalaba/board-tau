"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

const ADMIN_PAGE_SIZE = 20;

/**
 * Get admin inquiries with pagination and status filter
 * @param args - Query parameters including cursor and status
 * @returns Paginated inquiries and next cursor
 */
export async function getAdminInquiries(args: {
  cursor?: string;
  status?: string;
}) {
  await requireAdmin();

  const where: { status?: string; user?: { deletedAt: null }; listing?: { user?: { deletedAt: null } } } = {};
  if (args.status) where.status = args.status;
  where.user = { deletedAt: null }; // Only include inquiries with active users
  where.listing = { user: { deletedAt: null } }; // Only include inquiries with active landlords

  const inquiries = await db.inquiry.findMany({
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
      room: {
        select: { id: true, name: true, roomType: true }
      }
    },
  });

  const nextCursor = inquiries.length > ADMIN_PAGE_SIZE ? inquiries[ADMIN_PAGE_SIZE - 1].id : null;
  return { inquiries: inquiries.slice(0, ADMIN_PAGE_SIZE), nextCursor };
}

"use server";

import { db } from "@/lib/db";
import { requireAdmin, logAdminAction } from "@/lib/admin";

const ADMIN_PAGE_SIZE = 20;

/**
 * Get admin listings with pagination and status filter
 * @param args - Query parameters including cursor and status
 * @returns Paginated listings and next cursor
 */
export async function getAdminListings(args: {
  cursor?: string;
  status?: string;
}) {
  await requireAdmin();

  const where: { status?: string; user?: { deletedAt: null } } = {};
  if (args.status) where.status = args.status;
  where.user = { deletedAt: null }; // Only include listings with active users

  const listings = await db.listing.findMany({
    where,
    take: ADMIN_PAGE_SIZE + 1,
    ...(args.cursor ? { cursor: { id: args.cursor }, skip: 1 } : {}),
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      images: { orderBy: { order: "asc" }, take: 3 },
    },
  });

  const nextCursor = listings.length > ADMIN_PAGE_SIZE ? listings[ADMIN_PAGE_SIZE - 1].id : null;
  return { listings: listings.slice(0, ADMIN_PAGE_SIZE), nextCursor };
}

/**
 * Moderate a listing status
 * @param listingId - Listing ID to moderate
 * @param status - New status (active/rejected/flagged)
 * @param adminId - Admin performing the action
 * @returns Success status
 */
export async function adminModerateListing(
  listingId: string,
  status: "active" | "rejected" | "flagged",
  adminId: string
) {
  await requireAdmin();

  const listing = await db.listing.findUnique({ where: { id: listingId } });
  if (!listing) throw new Error("Listing not found");

  await db.listing.update({
    where: { id: listingId },
    data: { status },
  });

  await logAdminAction({
    adminId,
    action: `listing_${status}`,
    entityType: "Listing",
    entityId: listingId,
    details: JSON.stringify({ previousStatus: listing.status, newStatus: status }),
  });

  return { success: true };
}

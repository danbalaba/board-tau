"use server";

import { db } from "@/lib/db";
import { requireAdmin, logAdminAction } from "@/lib/admin";

const ADMIN_PAGE_SIZE = 20;

/**
 * Get admin reviews with pagination and status filter
 * @param args - Query parameters including cursor and status
 * @returns Paginated reviews and next cursor
 */
export async function getAdminReviews(args: {
  cursor?: string;
  status?: string;
}) {
  await requireAdmin();

  const where: { status?: string } = {};
  if (args.status) where.status = args.status;

  const reviews = await db.review.findMany({
    where,
    take: ADMIN_PAGE_SIZE + 1,
    ...(args.cursor ? { cursor: { id: args.cursor }, skip: 1 } : {}),
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      listing: { select: { id: true, title: true } },
    },
  });

  const nextCursor = reviews.length > ADMIN_PAGE_SIZE ? reviews[ADMIN_PAGE_SIZE - 1].id : null;
  return { reviews: reviews.slice(0, ADMIN_PAGE_SIZE), nextCursor };
}

/**
 * Update review status (approved/removed)
 * @param reviewId - Review ID to update
 * @param status - New status (approved/removed)
 * @param adminId - Admin performing the action
 * @returns Success status
 */
export async function adminUpdateReviewStatus(
  reviewId: string,
  status: "approved" | "removed",
  adminId: string
) {
  await requireAdmin();

  const review = await db.review.findUnique({
    where: { id: reviewId },
    include: { listing: true },
  });
  if (!review) throw new Error("Review not found");

  await db.review.update({
    where: { id: reviewId },
    data: { status },
  });

  if (status === "approved") {
    const approved = await db.review.findMany({
      where: { listingId: review.listingId, status: "approved" },
      select: { rating: true },
    });
    const avg = approved.length
      ? approved.reduce((s, r) => s + r.rating, 0) / approved.length
      : null;
    await db.listing.update({
      where: { id: review.listingId },
      data: {
        rating: avg,
        reviewCount: approved.length,
      },
    });
  } else {
    const approved = await db.review.findMany({
      where: { listingId: review.listingId, status: "approved" },
      select: { rating: true },
    });
    const avg = approved.length
      ? approved.reduce((s, r) => s + r.rating, 0) / approved.length
      : null;
    await db.listing.update({
      where: { id: review.listingId },
      data: {
        rating: avg ?? undefined,
        reviewCount: approved.length,
      },
    });
  }

  await logAdminAction({
    adminId,
    action: `review_${status}`,
    entityType: "Review",
    entityId: reviewId,
    details: JSON.stringify({ listingId: review.listingId }),
  });

  return { success: true };
}

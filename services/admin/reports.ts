"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

/**
 * Get admin report data with date range filters
 * @param args - Query parameters including from and to dates
 * @returns Report data including user growth, listing status, bookings, and reviews
 */
export async function getAdminReportData(args: {
  from?: Date;
  to?: Date;
}) {
  await requireAdmin();

  const from = args.from ?? new Date(0);
  const to = args.to ?? new Date();

  const [
    userGrowth,
    listingStatusCounts,
    bookingTrends,
    reviewStats,
  ] = await Promise.all([
    db.user.groupBy({
      by: ["role"],
      where: { createdAt: { gte: from, lte: to }, deletedAt: null },
      _count: { id: true },
    }),
    db.listing.groupBy({
      by: ["status"],
      where: { createdAt: { gte: from, lte: to } },
      _count: { id: true },
    }),
    db.reservation.groupBy({
      by: ["status", "paymentStatus"],
      where: { createdAt: { gte: from, lte: to } },
      _count: { id: true },
    }),
    db.review.groupBy({
      by: ["status"],
      where: { createdAt: { gte: from, lte: to } },
      _count: { id: true },
    }),
  ]);

  return {
    userGrowth,
    listingStatusCounts,
    bookingTrends,
    reviewStats,
    from,
    to,
  };
}

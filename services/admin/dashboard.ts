"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

const ADMIN_PAGE_SIZE = 20;

/**
 * Get admin dashboard statistics
 * @returns Dashboard KPIs including user counts, listings, bookings, and reviews
 */
export async function getAdminDashboardStats() {
  await requireAdmin();

  const [userCounts, listingCount, activeBookings, reviewStats] = await Promise.all([
    db.user.groupBy({
      by: ["role"],
      where: { deletedAt: null },
      _count: { id: true },
    }),
    db.listing.count({ where: { status: "active" } }),
    db.reservation.count({
      where: {
        status: { in: ["pending", "confirmed"] },
        endDate: { gte: new Date() },
      },
    }),
    db.review.aggregate({
      where: { status: "approved" },
      _avg: { rating: true },
      _count: { id: true },
    }),
  ]);

  const students = userCounts.find((g) => g.role === "user")?._count.id ?? 0;
  const landlords = userCounts.find((g) => g.role === "landlord")?._count.id ?? 0;
  const admins = userCounts.find((g) => g.role === "admin")?._count.id ?? 0;

  return {
    totalUsers: students + landlords + admins,
    students,
    landlords,
    admins,
    totalListings: listingCount,
    activeBookings,
    averageRating: reviewStats._avg.rating ?? 0,
    totalReviews: reviewStats._count.id,
  };
}

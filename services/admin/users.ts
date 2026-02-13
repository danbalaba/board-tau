"use server";

import { db } from "@/lib/db";
import { requireAdmin, logAdminAction } from "@/lib/admin";

const ADMIN_PAGE_SIZE = 20;

/**
 * Get admin users with pagination and filters
 * @param args - Query parameters including cursor, role, and search
 * @returns Paginated users and next cursor
 */
export async function getAdminUsers(args: {
  cursor?: string;
  role?: string;
  search?: string;
}) {
  await requireAdmin();

  const where: { deletedAt: null; role?: string; OR?: { name?: { contains: string; mode: "insensitive" }; email?: { contains: string; mode: "insensitive" } }[] } = {
    deletedAt: null,
  };

  if (args.role) where.role = args.role;
  if (args.search?.trim()) {
    const q = args.search.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }

  const users = await db.user.findMany({
    where,
    take: ADMIN_PAGE_SIZE + 1,
    ...(args.cursor ? { cursor: { id: args.cursor }, skip: 1 } : {}),
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      isActive: true,
      deletedAt: true,
      createdAt: true,
      _count: { select: { listings: true, reservations: true, reviews: true } },
    },
  });

  const nextCursor = users.length > ADMIN_PAGE_SIZE ? users[ADMIN_PAGE_SIZE - 1].id : null;
  const list = users.slice(0, ADMIN_PAGE_SIZE);

  return { users: list, nextCursor };
}

/**
 * Update user status (active/inactive)
 * @param userId - User ID to update
 * @param isActive - New active status
 * @param adminId - Admin performing the action
 * @returns Success status
 */
export async function adminUpdateUserStatus(
  userId: string,
  isActive: boolean,
  adminId: string
) {
  await requireAdmin();

  const user = await db.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: { id: true, role: true },
  });
  if (!user) throw new Error("User not found");
  if (user.role === "admin") throw new Error("Cannot deactivate another admin");

  await db.user.update({
    where: { id: userId },
    data: { isActive },
  });

  await logAdminAction({
    adminId,
    action: isActive ? "user_activated" : "user_deactivated",
    entityType: "User",
    entityId: userId,
    details: JSON.stringify({ isActive }),
  });

  return { success: true };
}

/**
 * Soft delete a user
 * @param userId - User ID to delete
 * @param adminId - Admin performing the action
 * @returns Success status
 */
export async function adminSoftDeleteUser(userId: string, adminId: string) {
  await requireAdmin();

  const user = await db.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: { id: true, role: true },
  });
  if (!user) throw new Error("User not found");
  if (user.role === "admin") throw new Error("Cannot delete another admin");

  await db.user.update({
    where: { id: userId },
    data: { deletedAt: new Date(), isActive: false },
  });

  await logAdminAction({
    adminId,
    action: "user_soft_deleted",
    entityType: "User",
    entityId: userId,
  });

  return { success: true };
}

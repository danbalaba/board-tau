"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

const ADMIN_PAGE_SIZE = 20;

/**
 * Get admin activity logs with pagination
 * @param args - Query parameters including cursor
 * @returns Paginated logs and next cursor
 */
export async function getAdminActivityLogs(args: { cursor?: string }) {
  await requireAdmin();

  const logs = await db.adminActivityLog.findMany({
    take: ADMIN_PAGE_SIZE + 1,
    ...(args.cursor ? { cursor: { id: args.cursor }, skip: 1 } : {}),
    orderBy: { createdAt: "desc" },
    include: {
      admin: { select: { id: true, name: true, email: true } },
    },
  });

  const nextCursor = logs.length > ADMIN_PAGE_SIZE ? logs[ADMIN_PAGE_SIZE - 1].id : null;
  return { logs: logs.slice(0, ADMIN_PAGE_SIZE), nextCursor };
}

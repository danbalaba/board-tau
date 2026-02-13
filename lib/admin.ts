import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export type AdminUser = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
};

/** Require admin role; redirect if not authenticated or not admin. */
export async function requireAdmin(): Promise<AdminUser> {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  if (!user?.id || (user as { role?: string }).role !== "admin") {
    redirect("/");
  }
  return user as AdminUser;
}

/** Log an admin action for audit trail. */
export async function logAdminAction(params: {
  adminId: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  await db.adminActivityLog.create({
    data: {
      adminId: params.adminId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId ?? undefined,
      details: params.details ?? undefined,
      ipAddress: params.ipAddress ?? undefined,
      userAgent: params.userAgent ?? undefined,
    },
  });
}

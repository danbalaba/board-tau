import * as Sentry from "@sentry/nextjs";

interface SentryUserContext {
  id?: string;
  email?: string | null;
  name?: string | null;
  role?: string | null;
  isHost?: boolean;
  isSuperAdmin?: boolean;
}

/**
 * Sets structured user metadata and role context in Sentry.
 * Allows filtering errors in Sentry by user role (e.g. TENANT vs HOST vs SUPER_ADMIN).
 */
export function setSentryUserContext(user: SentryUserContext | null | undefined) {
  if (!user || !user.id) {
    Sentry.setUser(null);
    return;
  }

  Sentry.setUser({
    id: user.id,
    email: user.email || undefined,
    username: user.name || undefined,
  });

  // Attach enterprise tags for role-based error filtering in Sentry dashboard
  if (user.role) {
    Sentry.setTag("user.role", user.role);
  }
  if (typeof user.isHost === "boolean") {
    Sentry.setTag("user.is_host", user.isHost);
  }
  if (typeof user.isSuperAdmin === "boolean") {
    Sentry.setTag("user.is_super_admin", user.isSuperAdmin);
  }
}

/**
 * Records a breadcrumb for critical user operations (e.g. payment attempt, KYC upload).
 */
export function addSentryBreadcrumb(category: string, message: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level: "info",
  });
}

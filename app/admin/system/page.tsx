import React from "react";
import AdminSystemClient from "../components/pages/system/AdminSystemClient";
import { getAdminActivityLogs } from "@/services/admin";

interface PageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminSystemPage({ searchParams }: PageProps) {
  const resolved = searchParams == null ? undefined : await searchParams;
  const cursor = typeof resolved?.cursor === "string" ? resolved.cursor : undefined;

  const { logs, nextCursor } = await getAdminActivityLogs({ cursor });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">System Oversight</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Admin activity logs. All moderation and security-related actions are recorded here.
        </p>
      </div>
      <AdminSystemClient initialLogs={logs} nextCursor={nextCursor} />
    </div>
  );
}

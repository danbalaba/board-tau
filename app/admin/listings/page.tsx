import React from "react";
import AdminListingsClient from "../components/pages/listings/AdminListingsClient";
import { getAdminListings } from "@/services/admin";

interface PageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminListingsPage({ searchParams }: PageProps) {
  const resolved = searchParams == null ? undefined : await searchParams;
  const status = typeof resolved?.status === "string" ? resolved.status : undefined;
  const cursor = typeof resolved?.cursor === "string" ? resolved.cursor : undefined;

  const { listings, nextCursor } = await getAdminListings({ cursor, status });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Listing Moderation</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          View all boarding house listings. Approve, reject, or flag. Moderation actions are logged.
        </p>
      </div>
      <AdminListingsClient
        initialListings={listings}
        nextCursor={nextCursor}
        initialStatus={status}
      />
    </div>
  );
}

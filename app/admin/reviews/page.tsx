import React from "react";
import AdminReviewsClient from "../components/pages/reviews/AdminReviewsClient";
import { getAdminReviews } from "@/services/admin";

interface PageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminReviewsPage({ searchParams }: PageProps) {
  const resolved = searchParams == null ? undefined : await searchParams;
  const status = typeof resolved?.status === "string" ? resolved.status : undefined;
  const cursor = typeof resolved?.cursor === "string" ? resolved.cursor : undefined;

  const { reviews, nextCursor } = await getAdminReviews({ cursor, status });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Review & Rating Moderation</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Approve or remove reviews. Listing rating and review count update automatically when you approve or remove.
        </p>
      </div>
      <AdminReviewsClient
        initialReviews={reviews}
        nextCursor={nextCursor}
        initialStatus={status}
      />
    </div>
  );
}

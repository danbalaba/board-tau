"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { adminUpdateReviewStatus } from "@/services/admin";
import ConfirmModal from "@/app/admin/components/common/ConfirmModal";
import Button from "@/components/common/Button";
import { MdCheckCircle, MdDelete } from "react-icons/md";

type ReviewRow = {
  id: string;
  rating: number;
  comment: string | null;
  status: string;
  createdAt: Date;
  user: { id: string; name: string | null; email: string | null };
  listing: { id: string; title: string };
};

interface Props {
  initialReviews: ReviewRow[];
  nextCursor: string | null;
  initialStatus?: string;
}

export default function AdminReviewsClient({
  initialReviews,
  nextCursor,
  initialStatus,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [reviews, setReviews] = useState(initialReviews);
  const [cursor, setCursor] = useState(nextCursor);
  const [status, setStatus] = useState(initialStatus ?? "");
  const [confirm, setConfirm] = useState<{
    open: boolean;
    reviewId: string;
    action: "approved" | "removed";
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const adminId = (session?.user as { id?: string })?.id ?? "";

  useEffect(() => {
    setReviews(initialReviews);
    setCursor(nextCursor);
  }, [initialReviews, nextCursor]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    router.push(`/admin/reviews?${params.toString()}`);
  };

  const loadMore = () => {
    if (!cursor) return;
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("cursor", cursor);
    router.push(`/admin/reviews?${params.toString()}`);
  };

  const handleConfirm = async () => {
    if (!confirm) return;
    setLoading(true);
    try {
      await adminUpdateReviewStatus(confirm.reviewId, confirm.action, adminId);
      setReviews((prev) =>
        prev.map((r) =>
          r.id === confirm.reviewId ? { ...r, status: confirm.action } : r
        )
      );
      setConfirm(null);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-3 items-center">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="removed">Removed</option>
          </select>
          <Button onClick={applyFilters}>Apply</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                <th className="text-left p-3 font-medium text-zinc-700 dark:text-zinc-300">Listing</th>
                <th className="text-left p-3 font-medium text-zinc-700 dark:text-zinc-300">User</th>
                <th className="text-left p-3 font-medium text-zinc-700 dark:text-zinc-300">Rating</th>
                <th className="text-left p-3 font-medium text-zinc-700 dark:text-zinc-300">Comment</th>
                <th className="text-left p-3 font-medium text-zinc-700 dark:text-zinc-300">Status</th>
                <th className="text-right p-3 font-medium text-zinc-700 dark:text-zinc-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500 dark:text-zinc-400">
                    No reviews found.
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr
                    key={review.id}
                    className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
                  >
                    <td className="p-3">
                      <Link
                        href={`/listings/${review.listing.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {review.listing.title}
                      </Link>
                    </td>
                    <td className="p-3">
                      <div>{review.user.name || "—"}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        {review.user.email || "—"}
                      </div>
                    </td>
                    <td className="p-3">{review.rating} / 5</td>
                    <td className="p-3 max-w-[200px] truncate text-zinc-600 dark:text-zinc-400">
                      {review.comment || "—"}
                    </td>
                    <td className="p-3">
                      <span
                        className={
                          review.status === "approved"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : review.status === "removed"
                            ? "text-red-600 dark:text-red-400"
                            : "text-zinc-600 dark:text-zinc-400"
                        }
                      >
                        {review.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex gap-2 justify-end">
                        {review.status !== "approved" && (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirm({
                                open: true,
                                reviewId: review.id,
                                action: "approved",
                              })
                            }
                            className="p-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                            title="Approve"
                          >
                            <MdCheckCircle size={18} />
                          </button>
                        )}
                        {review.status !== "removed" && (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirm({
                                open: true,
                                reviewId: review.id,
                                action: "removed",
                              })
                            }
                            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
                            title="Remove"
                          >
                            <MdDelete size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {cursor && (
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 text-center">
            <Button outline onClick={loadMore}>
              Load more
            </Button>
          </div>
        )}
      </div>

      {confirm && (
        <ConfirmModal
          open={confirm.open}
          title={
            confirm.action === "approved"
              ? "Approve review"
              : "Remove review"
          }
          message={
            confirm.action === "approved"
              ? "Review will be visible and listing rating will be recalculated."
              : "Review will be hidden and listing rating will be recalculated."
          }
          confirmLabel={confirm.action === "approved" ? "Approve" : "Remove"}
          variant={confirm.action === "removed" ? "danger" : "primary"}
          onConfirm={handleConfirm}
          onCancel={() => setConfirm(null)}
          loading={loading}
        />
      )}
    </>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { adminModerateListing } from "@/services/admin";
import ConfirmModal from "@/app/admin/components/common/ConfirmModal";
import Button from "@/components/common/Button";
import { MdCheckCircle, MdCancel, MdFlag } from "react-icons/md";

type ListingRow = {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  category: string;
  price: number;
  status: string;
  userId: string;
  user: { id: string; name: string | null; email: string | null };
  images: { id: string; url: string; order: number }[];
};

interface Props {
  initialListings: ListingRow[];
  nextCursor: string | null;
  initialStatus?: string;
}

export default function AdminListingsClient({
  initialListings,
  nextCursor,
  initialStatus,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [listings, setListings] = useState(initialListings);
  const [cursor, setCursor] = useState(nextCursor);
  const [status, setStatus] = useState(initialStatus ?? "");
  const [confirm, setConfirm] = useState<{
    open: boolean;
    listingId: string;
    action: "active" | "rejected" | "flagged";
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const adminId = (session?.user as { id?: string })?.id ?? "";

  useEffect(() => {
    setListings(initialListings);
    setCursor(nextCursor);
  }, [initialListings, nextCursor]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    router.push(`/admin/listings?${params.toString()}`);
  };

  const loadMore = () => {
    if (!cursor) return;
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("cursor", cursor);
    router.push(`/admin/listings?${params.toString()}`);
  };

  const handleConfirm = async () => {
    if (!confirm) return;
    setLoading(true);
    try {
      await adminModerateListing(confirm.listingId, confirm.action, adminId);
      setListings((prev) =>
        prev.map((l) =>
          l.id === confirm.listingId ? { ...l, status: confirm.action } : l
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
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 items-center">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="flagged">Flagged</option>
            <option value="rejected">Rejected</option>
          </select>
          <Button onClick={applyFilters}>Apply</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800/50">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">Listing</th>
                <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">Landlord</th>
                <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">Category</th>
                <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">Price</th>
                <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                <th className="text-right p-4 font-semibold text-slate-700 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {listings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No listings found.
                  </td>
                </tr>
              ) : (
                listings.map((listing) => (
                  <tr
                    key={listing.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                          <Image
                            src={listing.imageSrc}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </div>
                        <div>
                          <Link
                            href={`/listings/${listing.id}`}
                            className="font-medium text-slate-900 dark:text-white hover:underline"
                          >
                            {listing.title}
                          </Link>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            {listing.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>{listing.user.name || "—"}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {listing.user.email || "—"}
                      </div>
                    </td>
                    <td className="p-4">{listing.category}</td>
                    <td className="p-4">₱{listing.price.toLocaleString()}</td>
                    <td className="p-4">
                      <span
                        className={
                          listing.status === "active"
                            ? "inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : listing.status === "flagged"
                            ? "inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : listing.status === "rejected"
                            ? "inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : "inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                        }
                      >
                        {listing.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end">
                        {listing.status !== "active" && (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirm({
                                open: true,
                                listingId: listing.id,
                                action: "active",
                              })
                            }
                            className="p-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 transition-colors"
                            title="Approve"
                          >
                            <MdCheckCircle size={18} />
                          </button>
                        )}
                        {listing.status !== "rejected" && (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirm({
                                open: true,
                                listingId: listing.id,
                                action: "rejected",
                              })
                            }
                            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
                            title="Reject"
                          >
                            <MdCancel size={18} />
                          </button>
                        )}
                        {listing.status !== "flagged" && listing.status !== "rejected" && (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirm({
                                open: true,
                                listingId: listing.id,
                                action: "flagged",
                              })
                            }
                            className="p-2 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-600 dark:text-amber-400 transition-colors"
                            title="Flag"
                          >
                            <MdFlag size={18} />
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
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 text-center">
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
            confirm.action === "active"
              ? "Approve listing"
              : confirm.action === "rejected"
              ? "Reject listing"
              : "Flag listing"
          }
          message={
            confirm.action === "active"
              ? "Listing will be visible to users."
              : confirm.action === "rejected"
              ? "Listing will be hidden. Landlord can resubmit."
              : "Listing will be marked for review."
          }
          confirmLabel={
            confirm.action === "active" ? "Approve" : confirm.action === "rejected" ? "Reject" : "Flag"
          }
          onConfirm={handleConfirm}
          onCancel={() => setConfirm(null)}
          loading={loading}
        />
      )}
    </>
  );
}

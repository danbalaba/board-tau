"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/common/Button";

type ReservationRow = {
  id: string;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  createdAt: Date;
  user: { id: string; name: string | null; email: string | null };
  listing: {
    id: string;
    title: string;
    user: { id: string; name: string | null; email: string | null };
  };
};

interface Props {
  initialReservations: ReservationRow[];
  nextCursor: string | null;
  initialStatus?: string;
  initialPaymentStatus?: string;
}

export default function AdminReservationsClient({
  initialReservations,
  nextCursor,
  initialStatus,
  initialPaymentStatus,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [reservations, setReservations] = useState(initialReservations);
  const [cursor, setCursor] = useState(nextCursor);
  const [status, setStatus] = useState(initialStatus ?? "");
  const [paymentStatus, setPaymentStatus] = useState(initialPaymentStatus ?? "");

  useEffect(() => {
    setReservations(initialReservations);
    setCursor(nextCursor);
  }, [initialReservations, nextCursor]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (paymentStatus) params.set("paymentStatus", paymentStatus);
    router.push(`/admin/reservations?${params.toString()}`);
  };

  const loadMore = () => {
    if (!cursor) return;
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("cursor", cursor);
    router.push(`/admin/reservations?${params.toString()}`);
  };

  const formatDate = (d: Date) =>
    new Date(d).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-3 items-center">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
          className="rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-sm"
        >
          <option value="">All payment statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="refunded">Refunded</option>
          <option value="failed">Failed</option>
        </select>
        <Button onClick={applyFilters}>Apply</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
              <th className="text-left p-3 font-medium text-zinc-700 dark:text-zinc-300">Listing</th>
              <th className="text-left p-3 font-medium text-zinc-700 dark:text-zinc-300">Student</th>
              <th className="text-left p-3 font-medium text-zinc-700 dark:text-zinc-300">Landlord</th>
              <th className="text-left p-3 font-medium text-zinc-700 dark:text-zinc-300">Dates</th>
              <th className="text-left p-3 font-medium text-zinc-700 dark:text-zinc-300">Total</th>
              <th className="text-left p-3 font-medium text-zinc-700 dark:text-zinc-300">Status</th>
              <th className="text-left p-3 font-medium text-zinc-700 dark:text-zinc-300">Payment</th>
            </tr>
          </thead>
          <tbody>
            {reservations.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-zinc-500 dark:text-zinc-400">
                  No reservations found.
                </td>
              </tr>
            ) : (
              reservations.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
                >
                  <td className="p-3">
                    <Link
                      href={`/listings/${r.listing.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {r.listing.title}
                    </Link>
                  </td>
                  <td className="p-3">
                    <div>{r.user.name || "—"}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {r.user.email || "—"}
                    </div>
                  </td>
                  <td className="p-3">
                    <div>{r.listing.user.name || "—"}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {r.listing.user.email || "—"}
                    </div>
                  </td>
                  <td className="p-3">
                    {formatDate(r.startDate)} – {formatDate(r.endDate)}
                  </td>
                  <td className="p-3">₱{r.totalPrice.toLocaleString()}</td>
                  <td className="p-3">
                    <span
                      className={
                        r.status === "confirmed"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : r.status === "cancelled"
                          ? "text-red-600 dark:text-red-400"
                          : "text-zinc-600 dark:text-zinc-400"
                      }
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={
                        r.paymentStatus === "paid"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : r.paymentStatus === "failed" || r.paymentStatus === "refunded"
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-zinc-600 dark:text-zinc-400"
                      }
                    >
                      {r.paymentStatus}
                    </span>
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
  );
}

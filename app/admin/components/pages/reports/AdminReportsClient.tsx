"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/common/Button";

type UserGrowthRow = { role: string; _count: { id: number } };
type ListingStatusRow = { status: string; _count: { id: number } };
type BookingTrendRow = { status: string; paymentStatus: string; _count: { id: number } };
type ReviewStatRow = { status: string; _count: { id: number } };

interface Props {
  userGrowth: UserGrowthRow[];
  listingStatusCounts: ListingStatusRow[];
  bookingTrends: BookingTrendRow[];
  reviewStats: ReviewStatRow[];
  from: Date;
  to: Date;
}

export default function AdminReportsClient({
  userGrowth,
  listingStatusCounts,
  bookingTrends,
  reviewStats,
  from,
  to,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dateFrom, setDateFrom] = useState(
    from.getTime() > 0 ? from.toISOString().slice(0, 10) : ""
  );
  const [dateTo, setDateTo] = useState(
    to.getTime() < Date.now() ? to.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
  );

  const applyRange = () => {
    const params = new URLSearchParams();
    if (dateFrom) params.set("from", dateFrom);
    if (dateTo) params.set("to", dateTo);
    router.push(`/admin/reports?${params.toString()}`);
  };

  const exportCSV = () => {
    const rows: string[][] = [
      ["Report", "BoardTAU Admin", ""],
      ["Date range", dateFrom || "all", dateTo || "now"],
      [],
      ["User growth by role"],
      ["Role", "Count"],
      ...userGrowth.map((g) => [g.role, String(g._count.id)]),
      [],
      ["Listings by status"],
      ["Status", "Count"],
      ...listingStatusCounts.map((s) => [s.status, String(s._count.id)]),
      [],
      ["Bookings by status & payment"],
      ["Status", "Payment", "Count"],
      ...bookingTrends.map((b) => [b.status, b.paymentStatus, String(b._count.id)]),
      [],
      ["Reviews by status"],
      ["Status", "Count"],
      ...reviewStats.map((r) => [r.status, String(r._count.id)]),
    ];
    const csv = rows.map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `boardtau-report-${dateFrom || "all"}-${dateTo || "now"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
            From
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
            To
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-sm"
          />
        </div>
        <Button onClick={applyRange}>Apply range</Button>
        <Button outline onClick={exportCSV}>
          Export CSV
        </Button>
        <Button outline onClick={handlePrint}>
          Print / PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:block">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <h2 className="p-4 border-b border-zinc-200 dark:border-zinc-800 font-semibold text-zinc-900 dark:text-white">
            User growth by role
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                  <th className="text-left p-3 font-medium text-zinc-700 dark:text-zinc-300">Role</th>
                  <th className="text-right p-3 font-medium text-zinc-700 dark:text-zinc-300">Count</th>
                </tr>
              </thead>
              <tbody>
                {userGrowth.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="p-4 text-center text-zinc-500 dark:text-zinc-400">
                      No data in range
                    </td>
                  </tr>
                ) : (
                  userGrowth.map((g) => (
                    <tr key={g.role} className="border-b border-zinc-100 dark:border-zinc-800">
                      <td className="p-3 capitalize">{g.role}</td>
                      <td className="p-3 text-right">{g._count.id}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <h2 className="p-4 border-b border-zinc-200 dark:border-zinc-800 font-semibold text-zinc-900 dark:text-white">
            Listings by status
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                  <th className="text-left p-3 font-medium text-zinc-700 dark:text-zinc-300">Status</th>
                  <th className="text-right p-3 font-medium text-zinc-700 dark:text-zinc-300">Count</th>
                </tr>
              </thead>
              <tbody>
                {listingStatusCounts.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="p-4 text-center text-zinc-500 dark:text-zinc-400">
                      No data in range
                    </td>
                  </tr>
                ) : (
                  listingStatusCounts.map((s) => (
                    <tr key={s.status} className="border-b border-zinc-100 dark:border-zinc-800">
                      <td className="p-3">{s.status}</td>
                      <td className="p-3 text-right">{s._count.id}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden lg:col-span-2">
          <h2 className="p-4 border-b border-zinc-200 dark:border-zinc-800 font-semibold text-zinc-900 dark:text-white">
            Bookings by status & payment
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                  <th className="text-left p-3 font-medium text-zinc-700 dark:text-zinc-300">Status</th>
                  <th className="text-left p-3 font-medium text-zinc-700 dark:text-zinc-300">Payment</th>
                  <th className="text-right p-3 font-medium text-zinc-700 dark:text-zinc-300">Count</th>
                </tr>
              </thead>
              <tbody>
                {bookingTrends.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-zinc-500 dark:text-zinc-400">
                      No data in range
                    </td>
                  </tr>
                ) : (
                  bookingTrends.map((b, i) => (
                    <tr key={`${b.status}-${b.paymentStatus}-${i}`} className="border-b border-zinc-100 dark:border-zinc-800">
                      <td className="p-3">{b.status}</td>
                      <td className="p-3">{b.paymentStatus}</td>
                      <td className="p-3 text-right">{b._count.id}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden lg:col-span-2">
          <h2 className="p-4 border-b border-zinc-200 dark:border-zinc-800 font-semibold text-zinc-900 dark:text-white">
            Reviews by status
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                  <th className="text-left p-3 font-medium text-zinc-700 dark:text-zinc-300">Status</th>
                  <th className="text-right p-3 font-medium text-zinc-700 dark:text-zinc-300">Count</th>
                </tr>
              </thead>
              <tbody>
                {reviewStats.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="p-4 text-center text-zinc-500 dark:text-zinc-400">
                      No data in range
                    </td>
                  </tr>
                ) : (
                  reviewStats.map((r) => (
                    <tr key={r.status} className="border-b border-zinc-100 dark:border-zinc-800">
                      <td className="p-3">{r.status}</td>
                      <td className="p-3 text-right">{r._count.id}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

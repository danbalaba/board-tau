import React from "react";
import AdminReportsClient from "../components/pages/reports/AdminReportsClient";
import { getAdminReportData } from "@/services/admin";

interface PageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminReportsPage({ searchParams }: PageProps) {
  const resolved = searchParams == null ? undefined : await searchParams;
  const fromStr = typeof resolved?.from === "string" ? resolved.from : undefined;
  const toStr = typeof resolved?.to === "string" ? resolved.to : undefined;
  const from = fromStr ? new Date(fromStr) : undefined;
  const to = toStr ? new Date(toStr) : undefined;

  const data = await getAdminReportData({ from, to });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Reports & Analytics</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Generate reports by date range. Export as CSV or use Print for PDF.
        </p>
      </div>
      <AdminReportsClient
        userGrowth={data.userGrowth}
        listingStatusCounts={data.listingStatusCounts}
        bookingTrends={data.bookingTrends}
        reviewStats={data.reviewStats}
        from={data.from}
        to={data.to}
      />
    </div>
  );
}

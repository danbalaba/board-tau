import React from "react";
import AdminReservationsClient from "../components/pages/reservations/AdminReservationsClient";
import { getAdminReservations } from "@/services/admin";

interface PageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminReservationsPage({ searchParams }: PageProps) {
  const resolved = searchParams == null ? undefined : await searchParams;
  const status = typeof resolved?.status === "string" ? resolved.status : undefined;
  const paymentStatus = typeof resolved?.paymentStatus === "string" ? resolved.paymentStatus : undefined;
  const cursor = typeof resolved?.cursor === "string" ? resolved.cursor : undefined;

  const { reservations, nextCursor } = await getAdminReservations({ cursor, status, paymentStatus });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Reservations & Transaction Monitoring</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          View reservation records and simulated payment status. Filter by date range, status, landlord, or student.
        </p>
      </div>
      <AdminReservationsClient
        initialReservations={reservations}
        nextCursor={nextCursor}
        initialStatus={status}
        initialPaymentStatus={paymentStatus}
      />
    </div>
  );
}

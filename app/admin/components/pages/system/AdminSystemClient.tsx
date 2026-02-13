"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/common/Button";

type LogRow = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  details: string | null;
  createdAt: Date;
  admin: { id: string; name: string | null; email: string | null };
};

interface Props {
  initialLogs: LogRow[];
  nextCursor: string | null;
}

export default function AdminSystemClient({ initialLogs, nextCursor }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [logs, setLogs] = useState(initialLogs);
  const [cursor, setCursor] = useState(nextCursor);

  useEffect(() => {
    setLogs(initialLogs);
    setCursor(nextCursor);
  }, [initialLogs, nextCursor]);

  const loadMore = () => {
    if (!cursor) return;
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("cursor", cursor);
    router.push(`/admin/system?${params.toString()}`);
  };

  const formatDate = (d: Date) =>
    new Date(d).toLocaleString("en-PH", {
      dateStyle: "short",
      timeStyle: "short",
    });

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
              <th className="text-left p-3 font-medium text-zinc-700 dark:text-zinc-300">Time</th>
              <th className="text-left p-3 font-medium text-zinc-700 dark:text-zinc-300">Admin</th>
              <th className="text-left p-3 font-medium text-zinc-700 dark:text-zinc-300">Action</th>
              <th className="text-left p-3 font-medium text-zinc-700 dark:text-zinc-300">Entity</th>
              <th className="text-left p-3 font-medium text-zinc-700 dark:text-zinc-300">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-zinc-500 dark:text-zinc-400">
                  No activity logs yet.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
                >
                  <td className="p-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="p-3">
                    <div>{log.admin.name || "—"}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {log.admin.email || "—"}
                    </div>
                  </td>
                  <td className="p-3 font-medium text-zinc-900 dark:text-white">
                    {log.action.replace(/_/g, " ")}
                  </td>
                  <td className="p-3">
                    {log.entityType}
                    {log.entityId ? ` #${log.entityId.slice(-6)}` : ""}
                  </td>
                  <td className="p-3 max-w-[200px] truncate text-zinc-500 dark:text-zinc-400">
                    {log.details || "—"}
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

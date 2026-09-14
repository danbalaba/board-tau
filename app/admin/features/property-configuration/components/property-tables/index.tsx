"use client";

import React from "react";
import { columns } from "./columns";
import { Button } from "@/app/admin/components/ui/button";
import { Plus } from "lucide-react";
import Modal from "@/components/modals/Modal";
import { AddPropertyTypeModal } from "../modals/add-property-type-modal";
import dynamic from "next/dynamic";
import { DataTable } from "@/app/admin/components/ui/table/data-table";
import { useDataTable } from "@/app/admin/hooks/use-data-table";

import { Skeleton } from "@/app/admin/components/ui/skeleton";

const DataTableToolbar = dynamic(
  () => import("@/app/admin/components/ui/table/data-table-toolbar").then((mod) => mod.DataTableToolbar),
  { ssr: false }
);

interface PropertyTableProps {
  data: any[];
  isLoading: boolean;
  onRefresh?: (deletedId?: string) => void;
}

export function PropertyTable({ data, isLoading, onRefresh }: PropertyTableProps) {
  const pageCount = Math.max(1, Math.ceil(data.length / 10));

  const { table } = useDataTable({
    data,
    columns: columns as any,
    pageCount,
    manualPagination: false,
    manualFiltering: false,
    manualSorting: false,
    meta: { onRefresh }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          {isLoading ? (
            <div className="space-y-2 py-0.5">
              <Skeleton className="h-5 w-52 rounded-md" />
              <Skeleton className="h-3.5 w-96 max-w-full rounded-md" />
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest">
                Property Categories
              </h2>
              <p className="text-xs text-slate-500">
                Configure accommodation classifications (Apartments, Boarding Houses, Dorms) used on BoardTAU.
              </p>
            </>
          )}
        </div>
        <Modal>
          <Modal.Trigger name="add-property-type">
            <Button className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 font-black uppercase tracking-wider text-xs gap-2">
              <Plus size={16} /> Add Property Category
            </Button>
          </Modal.Trigger>
          <Modal.Window name="add-property-type" size="lg" closeOnOutsideClick={false}>
            <AddPropertyTypeModal onSuccess={onRefresh} />
          </Modal.Window>
        </Modal>
      </div>

      <DataTable table={table} isLoading={isLoading}>
        <DataTableToolbar table={table} />
      </DataTable>
    </div>
  );
}


"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Edit } from "lucide-react";
import { Button } from "@/app/admin/components/ui/button";
import Modal from "@/components/modals/Modal";
import { AddCollegeModal } from "../modals/add-college-modal";
import { CellAction } from "./cell-action";

export type CollegeColumn = {
  id: string;
  name: string;
  code: string;
  latitude: number | string;
  longitude: number | string;
  logoUrl?: string;
  isActive: boolean;
};

export const columns = (onRefresh?: () => void): ColumnDef<CollegeColumn>[] => [
  {
    id: "logoUrl",
    accessorKey: "logoUrl",
    header: () => <div className="text-center">Logo</div>,
    meta: { label: "Logo" },
    cell: ({ row }) => {
      const college = row.original;
      return (
        <div className="flex items-center justify-center">
          {college.logoUrl ? (
            <img
              src={college.logoUrl}
              alt={college.name}
              className="h-10 w-10 object-contain rounded-xl bg-white border border-slate-200 dark:border-slate-800 shadow-sm"
            />
          ) : (
            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400">
              N/A
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: "name",
    accessorKey: "name",
    header: "Landmark Name",
    meta: {
      label: "Landmark Name",
      variant: "text",
      placeholder: "Search landmarks...",
    },
    enableColumnFilter: true,
    cell: ({ row }) => (
      <span className="font-semibold text-slate-900 dark:text-slate-100">{row.original.name}</span>
    ),
  },
  {
    id: "code",
    accessorKey: "code",
    header: () => <div className="text-center">Code</div>,
    meta: {
      label: "Code",
      variant: "text",
      placeholder: "Search code (e.g. CET)...",
    },
    enableColumnFilter: true,
    cell: ({ row }) => (
      <div className="text-center">
        <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
          {row.original.code}
        </span>
      </div>
    ),
  },
  {
    id: "coordinates",
    accessorKey: "coordinates",
    header: () => <div className="text-center">Coordinates</div>,
    meta: { label: "Coordinates" },
    cell: ({ row }) => {
      const lat = parseFloat(row.original.latitude as string).toFixed(4);
      const lng = parseFloat(row.original.longitude as string).toFixed(4);
      return (
        <div className="text-center">
          <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-300">
            {lat}, {lng}
          </span>
        </div>
      );
    },
  },
  {
    id: "isActive",
    accessorKey: "isActive",
    header: () => <div className="text-center">Status</div>,
    meta: {
      label: "Status",
      variant: "multiSelect",
      options: [
        { label: "Active", value: "true" },
        { label: "Disabled", value: "false" },
      ],
    },
    enableColumnFilter: true,
    filterFn: (row, id, filterValue: string[]) => {
      if (!filterValue || filterValue.length === 0) return true;
      const rowValue = Boolean(row.getValue(id));
      return filterValue.some((val) => {
        if (val === "true" || val === "active" || val === "1") return rowValue === true;
        if (val === "false" || val === "disabled" || val === "0") return rowValue === false;
        return String(rowValue) === val;
      });
    },
    cell: ({ row }) => (
      <div className="text-center">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${
            row.original.isActive
              ? "bg-primary/10 text-primary border border-primary/20"
              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
          }`}
        >
          {row.original.isActive ? "Active" : "Disabled"}
        </span>
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right pr-2">Actions</div>,
    cell: ({ row }) => (
      <div className="text-right pr-2">
        <CellAction data={row.original} onRefresh={onRefresh} />
      </div>
    ),
  },
];

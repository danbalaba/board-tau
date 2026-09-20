"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import * as LucideIcons from "lucide-react";
import { format } from "date-fns";

export type PropertyTypeColumn = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: {
    listings: number;
  };
};

export const columns: ColumnDef<PropertyTypeColumn>[] = [
  {
    id: "icon",
    accessorKey: "icon",
    header: () => <div className="text-center">Icon</div>,
    meta: { label: "Icon" },
    cell: ({ row }) => {
      const iconName = row.original.icon || "Building";
      const Icon = (LucideIcons as any)[iconName] || LucideIcons.Building;
      return (
        <div className="flex items-center justify-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
            <Icon size={20} />
          </div>
        </div>
      );
    },
  },
  {
    id: "name",
    accessorKey: "name",
    header: "Property Type",
    meta: {
      label: "Property Type",
      variant: "text",
      placeholder: "Search property types...",
    },
    enableColumnFilter: true,
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{row.original.name}</span>
        {row.original.description && (
          <span className="text-xs text-slate-500 max-w-[240px] truncate" title={row.original.description}>
            {row.original.description}
          </span>
        )}
      </div>
    )
  },
  {
    id: "listings",
    accessorKey: "listings",
    header: () => <div className="text-center">Attached Listings</div>,
    meta: { label: "Attached Listings" },
    cell: ({ row }) => {
      return (
        <div className="text-center font-medium text-sm text-slate-700 dark:text-slate-300">
          {row.original._count?.listings || 0}
        </div>
      );
    }
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
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <div className="text-center">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            isActive 
              ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light border border-primary/20" 
              : "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-500/20"
          }`}>
            {isActive ? "Active" : "Disabled"}
          </span>
        </div>
      );
    }
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: () => <div className="text-center">Created Date</div>,
    meta: { label: "Created Date" },
    cell: ({ row }) => {
      return (
        <div className="text-center text-sm font-normal text-slate-600 dark:text-slate-400">
          {format(new Date(row.original.createdAt), "MMM d, yyyy")}
        </div>
      );
    }
  },
  {
    id: "actions",
    header: () => <div className="text-right pr-2">Actions</div>,
    cell: ({ row, table }) => (
      <div className="text-right pr-2">
        <CellAction data={row.original} onRefresh={(table.options.meta as any)?.onRefresh} />
      </div>
    ),
  },
];

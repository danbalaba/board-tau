"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Building,
  RefreshCw,
  Download,
  Calendar,
  ChevronDown,
  Check,
} from "lucide-react";
import { IconFileTypePdf, IconTable, IconFileTypeCsv } from "@tabler/icons-react";
import { Button } from "@/app/admin/components/ui/button";
import { cn } from "@/lib/utils";
import Skeleton from "@/components/common/Skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/admin/components/ui/dropdown-menu";

interface PropertyConfigurationHeaderProps {
  range: string;
  setRange: (range: string) => void;
  isFetching?: boolean;
  isLoading?: boolean;
  onRefresh: () => void;
  onExport: (format: "CSV" | "EXCEL" | "PDF") => void;
}

import { AdminDateRangeDropdown } from "@/app/admin/components/ui/admin-date-range-dropdown";

export const PropertyConfigurationHeader: React.FC<PropertyConfigurationHeaderProps> = ({
  range,
  setRange,
  isFetching,
  isLoading,
  onRefresh,
  onExport,
}) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isAnyLoading = !mounted || isLoading || isFetching;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-6 rounded-3xl border border-primary/10 shadow-lg overflow-hidden bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/10 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title */}
        <div className="flex items-center gap-4">
          {isAnyLoading ? (
            <>
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div>
                <Skeleton className="h-7 w-48 mb-1.5 rounded-lg" />
                <Skeleton className="h-3 w-64 rounded-md" />
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl shadow-md flex items-center justify-center text-primary border border-gray-100 dark:border-gray-700 shrink-0">
                <Building size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight tracking-tight flex items-center gap-3">
                  Property Configuration
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Configure property types, room categories, and accommodation rules
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 self-end md:self-auto flex-wrap">
          {isAnyLoading ? (
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-9 w-[120px] rounded-xl" />
              <Skeleton className="h-9 w-9 rounded-xl" />
              <Skeleton className="h-9 w-[100px] rounded-xl" />
            </div>
          ) : (
            <>
              {/* Date Filter */}
              <AdminDateRangeDropdown range={range} onRangeChange={setRange} size="sm" />

              {/* Refresh Trigger */}
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className={cn(
                  "h-9 w-9 p-0 shadow-sm rounded-xl border-gray-200/60 dark:border-gray-700/60 bg-white/50 dark:bg-gray-800/50 hover:bg-primary/10 hover:border-primary/30 transition-all duration-200 group cursor-pointer"
                )}
              >
                <RefreshCw size={14} className={cn("text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors", (isLoading || isFetching) && "animate-spin [animation-duration:2s]")} />
              </Button>

              {/* Export Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="h-9 gap-2 shadow-md rounded-xl font-black uppercase text-[10px] tracking-widest relative z-10 bg-primary hover:bg-primary/90 text-white shadow-primary/20 transition-all cursor-pointer">
                    <Download size={13} />
                    Export
                    <ChevronDown size={13} className="opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-100 dark:border-gray-800 rounded-2xl p-2 shadow-2xl">
                  <DropdownMenuItem
                    onClick={() => onExport("PDF")}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary hover:bg-primary/10 focus:bg-primary/10 focus:text-primary hover:text-primary transition-all text-xs font-bold text-gray-700 dark:text-gray-300 group cursor-pointer mb-1 outline-none"
                  >
                    <IconFileTypePdf className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
                    PDF Document
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onExport("EXCEL")}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary hover:bg-primary/10 focus:bg-primary/10 focus:text-primary hover:text-primary transition-all text-xs font-bold text-gray-700 dark:text-gray-300 group cursor-pointer mb-1 outline-none"
                  >
                    <IconTable className="w-4 h-4 text-green-500 group-hover:scale-110 transition-transform" />
                    Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onExport("CSV")}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary hover:bg-primary/10 focus:bg-primary/10 focus:text-primary hover:text-primary transition-all text-xs font-bold text-gray-700 dark:text-gray-300 group cursor-pointer outline-none"
                  >
                    <IconFileTypeCsv className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                    CSV Data
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

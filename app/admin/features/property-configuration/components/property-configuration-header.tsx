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

const DATE_RANGES = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "1y", label: "Past Year" },
];

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
  const currentRangeLabel = DATE_RANGES.find((r) => r.value === range)?.label ?? "Last 30 Days";

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-8 rounded-[3rem] border border-emerald-500/10 shadow-xl overflow-hidden bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Title */}
        <div className="flex items-center gap-5">
          {isAnyLoading ? (
            <>
              <Skeleton className="w-14 h-14 rounded-2xl" />
              <div>
                <Skeleton className="h-8 w-56 mb-2 rounded-lg" />
                <Skeleton className="h-3 w-72 rounded-md" />
              </div>
            </>
          ) : (
            <>
              <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex items-center justify-center text-emerald-500 border border-gray-100 dark:border-gray-700">
                <Building size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight tracking-tight">
                  Property Configuration
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                    Manage property categories, room setups, landmarks & rules
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 self-end md:self-auto flex-wrap">
          {isAnyLoading ? (
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-[140px] rounded-2xl" />
              <Skeleton className="h-12 w-12 rounded-2xl" />
              <Skeleton className="h-12 w-[130px] rounded-2xl" />
            </div>
          ) : (
            <>
              {/* Date Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-12 px-5 gap-2 rounded-2xl border-emerald-200/60 dark:border-emerald-700/60 bg-emerald-50/50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 shadow-sm text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-100 dark:hover:bg-emerald-800/40 hover:text-emerald-900 dark:hover:text-emerald-300 cursor-pointer"
                  >
                    <Calendar size={16} className="text-emerald-500" />
                    {currentRangeLabel}
                    <ChevronDown size={14} className="opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-100 dark:border-gray-800 rounded-2xl p-2 shadow-2xl">
                  {DATE_RANGES.map((r) => {
                    const isSelected = range === r.value;
                    return (
                      <DropdownMenuItem
                        key={r.value}
                        onClick={() => setRange(r.value)}
                        className={cn(
                          'text-[10px] font-black py-3 px-3.5 uppercase tracking-widest cursor-pointer rounded-xl mb-1 flex items-center justify-between transition-all outline-none',
                          isSelected
                            ? 'bg-emerald-500 text-white data-[highlighted]:bg-emerald-500 data-[highlighted]:text-white focus:bg-emerald-500 focus:text-white hover:bg-emerald-500 hover:text-white shadow-md shadow-emerald-500/20'
                            : 'text-gray-600 dark:text-gray-300 data-[highlighted]:bg-emerald-500/10 data-[highlighted]:text-emerald-600 focus:bg-emerald-500/10 focus:text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-600'
                        )}
                      >
                        <span>{r.label}</span>
                        {isSelected && <Check size={14} className="text-white shrink-0 ml-2" />}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Refresh Trigger */}
              <Button
                variant="outline"
                onClick={onRefresh}
                className="h-12 w-12 p-0 shadow-sm rounded-2xl border-gray-200/60 dark:border-gray-700/60 bg-white/50 dark:bg-gray-800/50 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all duration-200 group cursor-pointer"
              >
                <RefreshCw size={18} className={cn("text-gray-500 dark:text-gray-400 group-hover:text-emerald-600 transition-colors", isFetching && "animate-spin")} />
              </Button>

              {/* Export Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="h-12 px-6 gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 font-black uppercase text-[10px] tracking-[0.2em] transition-all cursor-pointer">
                    <Download size={16} />
                    Export
                    <ChevronDown size={14} className="opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-100 dark:border-gray-800 rounded-2xl p-2 shadow-2xl">
                  <DropdownMenuItem
                    onClick={() => onExport("PDF")}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl data-[highlighted]:bg-emerald-500/10 data-[highlighted]:text-emerald-600 hover:bg-emerald-500/10 focus:bg-emerald-500/10 focus:text-emerald-600 hover:text-emerald-600 transition-all text-xs font-bold text-gray-700 dark:text-gray-300 group cursor-pointer mb-1 outline-none"
                  >
                    <IconFileTypePdf className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
                    PDF Document
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onExport("EXCEL")}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl data-[highlighted]:bg-emerald-500/10 data-[highlighted]:text-emerald-600 hover:bg-emerald-500/10 focus:bg-emerald-500/10 focus:text-emerald-600 hover:text-emerald-600 transition-all text-xs font-bold text-gray-700 dark:text-gray-300 group cursor-pointer mb-1 outline-none"
                  >
                    <IconTable className="w-4 h-4 text-green-500 group-hover:scale-110 transition-transform" />
                    Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onExport("CSV")}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl data-[highlighted]:bg-emerald-500/10 data-[highlighted]:text-emerald-600 hover:bg-emerald-500/10 focus:bg-emerald-500/10 focus:text-emerald-600 hover:text-emerald-600 transition-all text-xs font-bold text-gray-700 dark:text-gray-300 group cursor-pointer outline-none"
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

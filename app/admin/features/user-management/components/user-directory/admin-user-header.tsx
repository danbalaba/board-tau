'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, RefreshCw, Download, ChevronDown } from 'lucide-react';
import { IconFileTypePdf, IconTable, IconFileTypeCsv } from '@tabler/icons-react';
import { Button } from '@/app/admin/components/ui/button';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import Skeleton from '@/components/common/Skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/admin/components/ui/dropdown-menu';

interface AdminUserHeaderProps {
  onRefresh: () => void;
  onExport: (format: 'CSV' | 'EXCEL' | 'PDF') => void;
  isFetching?: boolean;
  isLoading?: boolean;
  range: string;
  onRangeChange: (range: string) => void;
}

import { AdminDateRangeDropdown } from '@/app/admin/components/ui/admin-date-range-dropdown';

export function AdminUserHeader({ onRefresh, onExport, isFetching, isLoading, range, onRangeChange }: AdminUserHeaderProps) {
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-8 rounded-[3rem] border border-primary/10 shadow-xl overflow-hidden bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/15 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Title */}
        <div className="flex items-center gap-5">
          {isLoading ? (
            <>
              <Skeleton className="w-14 h-14 rounded-2xl" />
              <div>
                <Skeleton className="h-8 w-48 mb-2 rounded-lg" />
                <Skeleton className="h-4 w-80 rounded-md" />
              </div>
            </>
          ) : (
            <>
              <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex items-center justify-center text-primary border border-gray-100 dark:border-gray-700">
                <Users size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight tracking-tight">
                  User Directory
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Manage registered students, landlords, and administrative accounts
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 self-end md:self-auto flex-wrap">
          {isLoading ? (
            <div className="flex items-center gap-3">
              <Skeleton className="h-11 w-[140px] rounded-2xl" />
              <Skeleton className="h-11 w-11 rounded-2xl" />
              {isSuperAdmin && (
                <Skeleton className="h-11 w-[110px] rounded-2xl" />
              )}
            </div>
          ) : (
            <>
              {/* Modern Date Range Dropdown */}
              <AdminDateRangeDropdown range={range} onRangeChange={onRangeChange} />

              <div className="flex flex-wrap items-center gap-3">
                {/* Refresh */}
                <Button
                  variant="outline"
                  onClick={onRefresh}
                  className="h-11 w-11 p-0 shadow-sm rounded-2xl border-gray-200/60 dark:border-gray-700/60 bg-white/50 dark:bg-gray-800/50 hover:bg-primary/10 hover:border-primary/30 transition-all duration-200 group cursor-pointer"
                  title="Refresh User Directory"
                >
                  <RefreshCw size={16} className={cn("text-gray-500 dark:text-gray-400 group-hover:text-primary dark:group-hover:text-primary-light transition-colors", isFetching && "animate-spin [animation-duration:2s]")} />
                </Button>

                {/* Export - Only visible to Super Admin */}
                {isSuperAdmin && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="h-11 px-5 gap-2 rounded-2xl bg-[#2f7d6d] hover:bg-[#256658] text-white shadow-lg shadow-[#2f7d6d]/20 font-bold text-xs tracking-normal transition-all relative z-10 cursor-pointer">
                        <Download size={15} />
                        <span>Export</span>
                        <ChevronDown size={14} className="opacity-70" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-100 dark:border-gray-800 rounded-2xl p-2 shadow-2xl">
                      <DropdownMenuItem onClick={() => onExport('PDF')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary hover:bg-primary/10 focus:bg-primary/10 focus:text-primary hover:text-primary transition-all text-xs font-bold text-gray-700 dark:text-gray-300 group cursor-pointer mb-1 outline-none">
                        <IconFileTypePdf className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
                        PDF Document
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onExport('EXCEL')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary hover:bg-primary/10 focus:bg-primary/10 focus:text-primary hover:text-primary transition-all text-xs font-bold text-gray-700 dark:text-gray-300 group cursor-pointer mb-1 outline-none">
                        <IconTable className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                        Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onExport('CSV')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary hover:bg-primary/10 focus:bg-primary/10 focus:text-primary hover:text-primary transition-all text-xs font-bold text-gray-700 dark:text-gray-300 group cursor-pointer outline-none">
                        <IconFileTypeCsv className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                        CSV Data
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

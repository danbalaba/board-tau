import React from 'react';
import { motion } from 'framer-motion';
import { IconTrendingUp, IconCalendarEvent, IconFileExport, IconFileSpreadsheet, IconFileTypeCsv, IconFileTypePdf } from '@tabler/icons-react';
import { Button } from '@/app/admin/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/app/admin/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/admin/components/ui/dropdown-menu';
import Skeleton from '@/components/common/Skeleton';

interface TopListingsHeaderProps {
  isLoading?: boolean;
  range?: string;
  onRangeChange?: (value: string) => void;
  onExport?: (format: 'CSV' | 'EXCEL' | 'PDF') => void;
}

export function TopListingsHeader({ 
  isLoading,
  range = '30d',
  onRangeChange,
  onExport
}: TopListingsHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-8 rounded-[3rem] border border-purple-500/10 shadow-xl overflow-hidden bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {isLoading ? (
            <>
              <Skeleton className="w-14 h-14 rounded-2xl" />
              <div>
                <Skeleton className="h-8 w-48 mb-2 rounded-lg" />
                <Skeleton className="h-4 w-64 rounded-md" />
              </div>
            </>
          ) : (
            <>
              <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex items-center justify-center text-purple-500 border border-gray-100 dark:border-gray-700">
                <IconTrendingUp size={28} stroke={2.5} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight tracking-tight flex items-center gap-3">
                  Top Listings & Intelligence
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                    Occupancy leaderboards and smart pricing insights
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          {isLoading ? (
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-[140px] rounded-2xl" />
              <Skeleton className="h-12 w-[100px] rounded-2xl" />
            </div>
          ) : (
            <>
              {onRangeChange && (
                <Select value={range} onValueChange={onRangeChange}>
                  <SelectTrigger className="h-12 px-6 gap-2 rounded-2xl border-purple-200/60 dark:border-purple-700/60 bg-purple-50/50 dark:bg-purple-900/20 shadow-sm text-[10px] font-black uppercase tracking-[0.2em] text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-800/40 w-[180px]">
                    <IconCalendarEvent size={16} className="text-purple-500 shrink-0" /> 
                    <SelectValue placeholder="Select Range" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl">
                    <SelectGroup>
                      <SelectLabel className="text-[9px] font-black uppercase tracking-widest text-gray-400">Time Period</SelectLabel>
                      <SelectItem value="7d" className="text-xs font-bold rounded-xl cursor-pointer">Last 7 Days</SelectItem>
                      <SelectItem value="30d" className="text-xs font-bold rounded-xl cursor-pointer">Last 30 Days</SelectItem>
                      <SelectItem value="90d" className="text-xs font-bold rounded-xl cursor-pointer">Last 90 Days</SelectItem>
                      <SelectItem value="1y" className="text-xs font-bold rounded-xl cursor-pointer">Past Year</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
              
              {onExport && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="h-12 px-6 gap-2 rounded-2xl bg-purple-500 hover:bg-purple-600 text-white shadow-xl shadow-purple-500/20 text-[10px] font-black uppercase tracking-[0.2em] transition-all">
                      <IconFileExport size={16} /> Export Data
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-2xl border-none shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-2">
                    <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400">Export Report</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800" />
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => onExport('CSV')} className="gap-3 p-3 rounded-xl cursor-pointer focus:bg-purple-50 dark:focus:bg-purple-900/20 focus:text-purple-600 dark:focus:text-purple-400 font-bold text-xs">
                        <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400">
                          <IconFileTypeCsv size={16} stroke={2.5} />
                        </div>
                        Export as CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onExport('EXCEL')} className="gap-3 p-3 rounded-xl cursor-pointer focus:bg-green-50 dark:focus:bg-green-900/20 focus:text-green-600 dark:focus:text-green-400 font-bold text-xs">
                        <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400">
                          <IconFileSpreadsheet size={16} stroke={2.5} />
                        </div>
                        Export as Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onExport('PDF')} className="gap-3 p-3 rounded-xl cursor-pointer focus:bg-rose-50 dark:focus:bg-rose-900/20 focus:text-rose-600 dark:focus:text-rose-400 font-bold text-xs">
                        <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400">
                          <IconFileTypePdf size={16} stroke={2.5} />
                        </div>
                        Export as PDF
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

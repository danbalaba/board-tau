import React from 'react';
import { motion } from 'framer-motion';
import { 
  IconChartBar, 
  IconCalendar, 
  IconDownload, 
  IconRefresh,
  IconChevronDown,
  IconFileTypePdf,
  IconTable,
  IconFileTypeCsv
} from '@tabler/icons-react';
import { Button } from '@/app/admin/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/admin/components/ui/dropdown-menu';
import Skeleton from '@/components/common/Skeleton';
import { cn } from '@/lib/utils';

interface AdminAnalyticsHeaderProps {
  range: string;
  onRangeChange: (range: string) => void;
  onRefresh: () => void;
  onExport: (format: 'CSV' | 'EXCEL' | 'PDF') => void;
  isFetching: boolean;
  isLoading?: boolean;
  isSuperAdmin?: boolean;
}

export function AdminAnalyticsHeader({
  range,
  onRangeChange,
  onRefresh,
  onExport,
  isFetching,
  isLoading,
  isSuperAdmin = false
}: AdminAnalyticsHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-8 rounded-[3rem] border border-fuchsia-500/10 shadow-xl overflow-hidden bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 via-transparent to-fuchsia-500/10 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-fuchsia-500/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {(isLoading || isFetching) ? (
            <>
              <Skeleton className="w-14 h-14 rounded-2xl" />
              <div>
                <Skeleton className="h-8 w-48 mb-2 rounded-lg" />
                <Skeleton className="h-4 w-64 rounded-md" />
              </div>
            </>
          ) : (
            <>
              <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex items-center justify-center text-fuchsia-500 border border-gray-100 dark:border-gray-700">
                <IconChartBar size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight tracking-tight">
                  User Analytics
                </h1>
                <p className="text-sm font-bold text-gray-500 mt-1 flex items-center gap-2 uppercase tracking-widest">
                  <IconChartBar size={14} className="text-fuchsia-500" />
                  Intelligence Suite &amp; Telemetry
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {(isLoading || isFetching) ? (
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-[140px] rounded-2xl" />
              <Skeleton className="h-10 w-10 rounded-[0.85rem]" />
              {isSuperAdmin && <Skeleton className="h-9 w-[110px] rounded-xl" />}
            </div>
          ) : (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-12 px-5 gap-2 rounded-2xl border-fuchsia-200/60 dark:border-fuchsia-700/60 shadow-sm text-[10px] font-black uppercase tracking-[0.2em] transition-all bg-fuchsia-50/50 dark:bg-fuchsia-900/20 hover:bg-fuchsia-100 dark:hover:bg-fuchsia-800/40 hover:text-fuchsia-900 dark:hover:text-fuchsia-200 relative z-10 group"
                  >
                    <IconCalendar size={16} className="text-fuchsia-500 group-hover:text-fuchsia-600 transition-colors" />
                    <span className="text-fuchsia-700 dark:text-fuchsia-400 group-hover:text-fuchsia-800 dark:group-hover:text-fuchsia-300 transition-colors">
                      {range === '7d' ? 'Last 7 Days' : 
                       range === '30d' ? 'Last 30 Days' : 
                       range === '90d' ? 'Last 90 Days' : 'Past Year'}
                    </span>
                    <IconChevronDown size={14} className="text-fuchsia-400 ml-1 opacity-70 group-hover:text-fuchsia-500 transition-colors" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-100 dark:border-gray-800 rounded-2xl p-2 shadow-2xl">
                  {[
                    { r: '7d', l: 'Last 7 Days' },
                    { r: '30d', l: 'Last 30 Days' },
                    { r: '90d', l: 'Last 90 Days' },
                    { r: '1y', l: 'Past Year' }
                  ].map(item => (
                    <DropdownMenuItem
                      key={item.r}
                      onClick={() => onRangeChange(item.r)}
                      className={cn(
                        'text-[10px] font-black py-3 uppercase tracking-widest cursor-pointer rounded-xl mb-1',
                        range === item.r ? 'bg-fuchsia-500/10 text-fuchsia-600' : 'text-gray-500'
                      )}
                    >
                      {item.l}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex flex-wrap items-center gap-3">
                {/* Refresh */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  className="h-10 w-10 p-0 shadow-sm rounded-[0.85rem] border-gray-200/60 dark:border-gray-700/60 bg-white/50 dark:bg-gray-800/50 hover:bg-pink-500/10 hover:border-pink-500/30 transition-all duration-200 group"
                >
                  <IconRefresh size={16} className={cn("text-gray-500 dark:text-gray-400 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors", isFetching && "animate-spin [animation-duration:2s]")} />
                </Button>

                {/* Export - Only visible to Super Admin */}
                {isSuperAdmin && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" className="h-9 gap-2 shadow-lg rounded-xl font-black uppercase text-[10px] tracking-widest relative z-10 bg-fuchsia-500 hover:bg-fuchsia-600 text-white shadow-fuchsia-500/20 transition-all">
                        <IconDownload size={14} />
                        Export
                        <IconChevronDown size={14} className="opacity-70" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-100 dark:border-gray-800 rounded-2xl p-2 shadow-2xl relative z-50">
                      <DropdownMenuItem onClick={() => onExport('PDF')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all text-sm font-semibold text-gray-700 dark:text-gray-300 dark:hover:text-white group cursor-pointer mb-1">
                        <IconFileTypePdf className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
                        PDF Document
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onExport('EXCEL')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all text-sm font-semibold text-gray-700 dark:text-gray-300 dark:hover:text-white group cursor-pointer mb-1">
                        <IconTable className="w-4 h-4 text-green-500 group-hover:scale-110 transition-transform" />
                        Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onExport('CSV')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all text-sm font-semibold text-gray-700 dark:text-gray-300 dark:hover:text-white group cursor-pointer">
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

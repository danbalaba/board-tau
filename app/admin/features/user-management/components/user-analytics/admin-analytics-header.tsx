import React from 'react';
import { motion } from 'framer-motion';
import { 
  IconChartBar, 
  IconCalendar, 
  IconDownload, 
  IconRefresh,
  IconChevronDown 
} from '@tabler/icons-react';
import { Button } from '@/app/admin/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/admin/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface AdminAnalyticsHeaderProps {
  range: string;
  onRangeChange: (range: string) => void;
  onRefresh: () => void;
  onExport: () => void;
  isFetching: boolean;
}

export function AdminAnalyticsHeader({ 
  range, 
  onRangeChange, 
  onRefresh, 
  onExport,
  isFetching 
}: AdminAnalyticsHeaderProps) {
  const timeRangeLabel = {
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days',
    '1y': 'Past Year'
  }[range] || range;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-8 rounded-[3rem] border border-fuchsia-500/10 shadow-xl overflow-hidden bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 via-transparent to-purple-500/5 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-fuchsia-500/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex items-center justify-center text-fuchsia-500 border border-gray-100 dark:border-gray-700">
            <IconChartBar size={28} stroke={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight tracking-tight flex items-center gap-3">
              Intelligence Suite
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse" />
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                Platform-wide user growth, verification lifecycle and demographic telemetry
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-12 px-5 gap-2 rounded-2xl border-gray-200/60 dark:border-gray-700/60 shadow-sm text-[10px] font-black uppercase tracking-[0.2em]">
                <IconCalendar size={16} className="text-fuchsia-500" />
                {timeRangeLabel}
                <IconChevronDown size={14} className="opacity-50" />
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

          <Button
            variant="outline"
            onClick={onRefresh}
            className={cn(
              "h-12 w-12 rounded-2xl border-gray-200/60 dark:border-gray-700/60 shadow-sm transition-all",
              isFetching && "animate-spin border-fuchsia-500/30"
            )}
          >
            <IconRefresh size={18} className="text-fuchsia-500" />
          </Button>
          
          <Button
            onClick={onExport}
            className="h-12 px-6 gap-2 rounded-2xl bg-gray-900 hover:bg-fuchsia-600 dark:bg-white dark:text-gray-900 dark:hover:bg-fuchsia-600 text-white shadow-xl shadow-fuchsia-500/10 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
          >
            <IconDownload size={16} /> Export Report
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

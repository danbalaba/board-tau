import React from 'react';
import { motion } from 'framer-motion';
import { 
  RefreshCw, 
  ShieldCheck,
  Terminal,
  Calendar,
  ChevronDown,
  Check
} from 'lucide-react';
import { Button } from '@/app/admin/components/ui/button';
import { cn } from '@/lib/utils';
import Skeleton from '@/components/common/Skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/admin/components/ui/dropdown-menu';

interface AdminMonitoringHeaderProps {
  title?: string;
  description?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  isLoading?: boolean;
  lastUpdated?: string;
  range?: string;
  onRangeChange?: (range: string) => void;
}

const DATE_RANGES = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '1y', label: 'Past Year' },
];

export function AdminMonitoringHeader({ 
  title = "System Health & Status", 
  description = "REAL-TIME HEALTH MONITORING & SERVICE STATUS", 
  onRefresh,
  isRefreshing,
  isLoading,
  lastUpdated,
  range = "30d",
  onRangeChange,
}: AdminMonitoringHeaderProps) {
  const currentRangeLabel = DATE_RANGES.find((r) => r.value === range)?.label ?? "Last 30 Days";

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-6 rounded-3xl border border-primary/10 shadow-lg overflow-hidden bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/10 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title & Icon */}
        <div className="flex items-center gap-4">
          {isLoading ? (
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
                <Terminal size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight tracking-tight flex items-center gap-3">
                  {title}
                </h1>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-[0.18em]">
                    {description}
                  </p>
                  {lastUpdated && (
                    <>
                      <span className="text-gray-300 dark:text-gray-700">•</span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">
                        Updated {lastUpdated}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 self-end md:self-auto flex-wrap">
          {isLoading ? (
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-9 w-[120px] rounded-xl" />
              <Skeleton className="h-9 w-9 rounded-xl" />
              <Skeleton className="h-9 w-[110px] rounded-xl" />
            </div>
          ) : (
            <>
              {/* Date Filter */}
              {onRangeChange && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-9 px-3.5 gap-2 rounded-xl border-primary/20 bg-primary/10 text-primary dark:text-primary-light shadow-sm text-[10px] font-black uppercase tracking-[0.18em] hover:bg-primary/20 hover:text-primary cursor-pointer"
                    >
                      <Calendar size={13} className="text-primary" />
                      {currentRangeLabel}
                      <ChevronDown size={13} className="opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-100 dark:border-gray-800 rounded-2xl p-2 shadow-2xl">
                    {DATE_RANGES.map((r) => {
                      const isSelected = range === r.value;
                      return (
                        <DropdownMenuItem
                          key={r.value}
                          onClick={() => onRangeChange(r.value)}
                          className={cn(
                            'text-[10px] font-black py-2.5 px-3 uppercase tracking-widest cursor-pointer rounded-xl mb-1 flex items-center justify-between transition-all outline-none',
                            isSelected
                              ? 'bg-primary text-white data-[highlighted]:bg-primary data-[highlighted]:text-white focus:bg-primary focus:text-white hover:bg-primary hover:text-white shadow-md shadow-primary/20'
                              : 'text-gray-600 dark:text-gray-300 data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary focus:bg-primary/10 focus:text-primary hover:bg-primary/10 hover:text-primary'
                          )}
                        >
                          <span>{r.label}</span>
                          {isSelected && <Check size={14} className="text-white shrink-0 ml-2" />}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Refresh Trigger */}
              {onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  className={cn(
                    "h-9 w-9 p-0 shadow-sm rounded-xl border-gray-200/60 dark:border-gray-700/60 bg-white/50 dark:bg-gray-800/50 hover:bg-primary/10 hover:border-primary/30 transition-all duration-200 group cursor-pointer"
                  )}
                >
                  <RefreshCw size={14} className={cn("text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors", isRefreshing && "animate-spin [animation-duration:2s]")} />
                </Button>
              )}

              {/* Primary Action Button */}
              <Button
                size="sm"
                className="h-9 px-3.5 gap-2 shadow-md rounded-xl font-black uppercase text-[10px] tracking-widest relative z-10 bg-primary hover:bg-primary/90 text-white shadow-primary/20 transition-all cursor-pointer"
              >
                <ShieldCheck size={13} />
                Security Check
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}





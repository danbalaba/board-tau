'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Inbox, ShieldCheck, RefreshCw } from 'lucide-react';
import { Button } from '@/app/admin/components/ui/button';
import { cn } from '@/lib/utils';

interface AdminQueueHeaderProps {
  handleRefresh?: () => void;
  onExport?: (format: 'CSV' | 'EXCEL' | 'PDF') => void;
  isLoading?: boolean;
  isFetching?: boolean;
  totalPending: number;
  isSuperAdmin?: boolean;
}

export function AdminQueueHeader({
  handleRefresh,
  onExport,
  totalPending,
  isLoading,
  isFetching,
  isSuperAdmin = false,
}: AdminQueueHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-8 rounded-[3rem] border border-indigo-500/10 shadow-xl overflow-hidden bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-indigo-500/10 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Title */}
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex items-center justify-center text-indigo-500 border border-gray-100 dark:border-gray-700">
            <Inbox size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight tracking-tight flex items-center gap-3">
              Moderation Inbox
              {totalPending > 0 && (
                <span className="flex items-center gap-1.5 bg-indigo-500/10 px-3 py-1.5 rounded-2xl border border-indigo-500/10 text-indigo-500 text-[10px] tracking-[0.2em] font-black italic shadow-sm">
                  <ShieldCheck size={12} />
                  {totalPending} PENDING
                </span>
              )}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                Review and approve pending items
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 self-end md:self-auto relative z-50">
          {/* Refresh Action */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className={cn(
              "h-11 px-4 gap-2 shadow-sm rounded-2xl border-gray-200/60 dark:border-gray-700/60 bg-white/50 dark:bg-gray-800/50 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all duration-200 group text-xs font-bold text-gray-700 dark:text-gray-300"
            )}
          >
            <RefreshCw size={16} className={cn("text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors", (isLoading || isFetching) && "animate-spin [animation-duration:2s]")} />
            <span>Sync Queue</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

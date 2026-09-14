'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, CheckCircle, XCircle, Archive, RotateCcw, Trash2, User, Clock, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/app/admin/components/ui/badge';
import type { ModerationLogItem } from '@/app/admin/hooks/use-moderation';

interface ModerationDecisionLogProps {
  recentLogs: ModerationLogItem[];
  isLoading: boolean;
}

const actionBadges: Record<string, { label: string; bg: string; text: string; icon: any }> = {
  approved: { label: 'Approved', bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', icon: CheckCircle },
  active: { label: 'Approved', bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', icon: CheckCircle },
  rejected: { label: 'Rejected', bg: 'bg-rose-500/10 border-rose-500/20', text: 'text-rose-600 dark:text-rose-400', icon: XCircle },
  archived: { label: 'Archived', bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-600 dark:text-amber-400', icon: Archive },
  unarchived: { label: 'Restored', bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-600 dark:text-blue-400', icon: RotateCcw },
  deleted: { label: 'Soft Deleted', bg: 'bg-gray-500/10 border-gray-500/20', text: 'text-gray-600 dark:text-gray-400', icon: Trash2 },
};

const entityTypeLabels: Record<string, string> = {
  listing: 'Listing',
  review: 'Review',
  hostApplication: 'Host Application'
};

export function ModerationDecisionLog({ recentLogs, isLoading }: ModerationDecisionLogProps) {
  const [filterAction, setFilterAction] = React.useState<string>('all');

  const actionFilterTabs = [
    { id: 'all', label: 'All Decisions', count: recentLogs.length },
    { id: 'approved', label: 'Approved', count: recentLogs.filter(l => l.action.toLowerCase() === 'approved' || l.action.toLowerCase() === 'active').length },
    { id: 'rejected', label: 'Rejected', count: recentLogs.filter(l => l.action.toLowerCase() === 'rejected').length },
    { id: 'archived', label: 'Archived', count: recentLogs.filter(l => l.action.toLowerCase() === 'archived' || l.action.toLowerCase() === 'unarchived').length },
  ];

  const filteredLogs = recentLogs.filter(log => {
    if (filterAction === 'all') return true;
    const act = log.action.toLowerCase();
    if (filterAction === 'approved') return act === 'approved' || act === 'active';
    if (filterAction === 'archived') return act === 'archived' || act === 'unarchived';
    return act === filterAction;
  });

  return (
    <div className="w-full bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-6 shadow-xl flex flex-col h-[650px] overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-3 pb-4 border-b border-gray-100 dark:border-gray-800/80 mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20 shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              Admin Decision History
            </h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Recent moderation decisions and review history
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 bg-gray-100/80 dark:bg-gray-800/80 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 w-full">
          {actionFilterTabs.map((tab) => {
            const isActive = filterAction === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterAction(tab.id)}
                className={cn(
                  "flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 w-full outline-none select-none",
                  isActive
                    ? "bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-500/20 font-black"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-800/50"
                )}
              >
                <span className="truncate">{tab.label}</span>
                <span className={cn(
                  "px-1.5 py-0.5 rounded-md text-[9px] font-black shrink-0",
                  isActive
                    ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                    : "bg-gray-200/60 dark:bg-gray-700/60 text-gray-500"
                )}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Log Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-12">
            <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading Decision History...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center gap-3 h-full py-16 opacity-60">
            <ShieldCheck className="w-12 h-12 text-gray-400" />
            <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">No Decision History Found</p>
            <p className="text-[11px] text-gray-400 max-w-[240px]">No logs match the selected decision filter.</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredLogs.map((log, index) => {
              const actionMeta = actionBadges[log.action.toLowerCase()] || {
                label: log.action,
                bg: 'bg-gray-500/10 border-gray-500/20',
                text: 'text-gray-600',
                icon: ShieldCheck
              };
              const ActionIcon = actionMeta.icon;

              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/60 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-3 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={cn("text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-lg flex items-center gap-1", actionMeta.bg, actionMeta.text)}>
                        <ActionIcon size={11} />
                        <span>{actionMeta.label}</span>
                      </Badge>

                      <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 bg-gray-50 dark:bg-gray-900/50 px-2 py-0.5 rounded-md border border-gray-100 dark:border-gray-800">
                        {entityTypeLabels[log.entityType] || log.entityType}
                      </span>
                    </div>

                    <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-black text-sm text-gray-900 dark:text-white tracking-tight uppercase">
                      {log.entityTitle || log.entityId}
                    </h3>

                    <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold text-gray-500 dark:text-gray-400">
                      <User size={12} className="text-gray-400" />
                      <span>Moderated by: <strong className="text-gray-700 dark:text-gray-200">{log.admin?.name || 'Admin'}</strong></span>
                    </div>

                    {log.notes && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-1.5 bg-gray-50 dark:bg-gray-900/40 p-2 rounded-xl border border-gray-100 dark:border-gray-800">
                        "{log.notes}"
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

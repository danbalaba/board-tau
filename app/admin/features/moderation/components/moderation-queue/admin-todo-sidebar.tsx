import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, CheckCircle2, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ModerationItem } from '@/app/admin/hooks/use-moderation';

interface AdminTodoSidebarProps {
  pendingItems: ModerationItem[];
  isLoading: boolean;
}

export function AdminTodoSidebar({ pendingItems, isLoading }: AdminTodoSidebarProps) {
  // Aggregate pending items by type
  const pendingHosts = pendingItems.filter(i => i.entityType === 'hostApplication').length;
  const pendingListings = pendingItems.filter(i => i.entityType === 'listing').length;
  const pendingReviews = pendingItems.filter(i => i.entityType === 'review').length;

  const totalPending = pendingItems.length;

  const tasks = [
    {
      id: 'host',
      title: 'Review Host Applications',
      count: pendingHosts,
      icon: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
    },
    {
      id: 'listing',
      title: 'Authorize Listings',
      count: pendingListings,
      icon: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    },
    {
      id: 'review',
      title: 'Moderate Reviews',
      count: pendingReviews,
      icon: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
    }
  ];

  return (
    <div className="w-full bg-white dark:bg-gray-800/80 rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-gray-700/50 flex flex-col h-full min-h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-indigo-500" />
          Auto To-Do List
        </h2>
        {totalPending > 0 && (
          <span className="text-xs font-bold bg-rose-500/10 text-rose-500 px-3 py-1 rounded-full border border-rose-500/20">
            {totalPending} Pending
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-4">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : totalPending === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-8"
          >
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-2">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">You're all caught up!</h3>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              There are no pending tasks left in the queue.
            </p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {tasks.map((task, index) => (
              <motion.div
                layout
                key={task.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden group",
                  task.count > 0 
                    ? "bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700" 
                    : "bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/20 opacity-60"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-colors mt-0.5",
                    task.count === 0 
                      ? "border-emerald-500 bg-emerald-500 text-white" 
                      : "border-gray-300 dark:border-gray-600 group-hover:border-indigo-500"
                  )}>
                    {task.count === 0 && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className={cn(
                      "font-black text-sm transition-all",
                      task.count === 0 
                        ? "text-emerald-600 dark:text-emerald-500 line-through decoration-2" 
                        : "text-gray-900 dark:text-white"
                    )}>
                      {task.title}
                    </h4>
                    {task.count > 0 ? (
                      <p className="text-xs font-bold text-rose-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.count} waiting
                      </p>
                    ) : (
                      <p className="text-xs font-bold text-emerald-500 mt-1">
                        Completed
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

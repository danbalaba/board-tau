import React from 'react';
import { motion } from 'framer-motion';
import { 
  IconActivity, 
  IconRefresh, 
  IconShieldLock,
  IconTerminal2,
  IconChevronDown 
} from '@tabler/icons-react';
import { Button } from '@/app/admin/components/ui/button';
import { cn } from '@/app/admin/lib/utils';
import Skeleton from '@/components/common/Skeleton';

interface AdminMonitoringHeaderProps {
  title: string;
  description: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  isLoading?: boolean;
}

export function AdminMonitoringHeader({ 
  title, 
  description, 
  onRefresh,
  isRefreshing,
  isLoading
}: AdminMonitoringHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-8 rounded-[3rem] border border-violet-500/10 shadow-xl overflow-hidden bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-indigo-500/5 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-500/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex items-center justify-center text-violet-500 border border-gray-100 dark:border-gray-700">
            <IconTerminal2 size={28} stroke={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight tracking-tight flex items-center gap-3">
              {title}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                {description}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          {isLoading ? (
            <>
              {onRefresh && <Skeleton className="h-12 w-36 rounded-2xl" />}
              <Skeleton className="h-12 w-40 rounded-2xl" />
            </>
          ) : (
            <>
              {/* Refresh */}
              {onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  className="h-10 w-10 p-0 shadow-sm rounded-[0.85rem] border-gray-200/60 dark:border-gray-700/60 bg-white/50 dark:bg-gray-800/50 hover:bg-violet-500/10 hover:border-violet-500/30 transition-all duration-200 group"
                >
                  <IconRefresh size={16} className={cn("text-gray-500 dark:text-gray-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors", isRefreshing && "animate-spin [animation-duration:2s]")} />
                </Button>
              )}


              <Button
                className="h-10 px-6 gap-2 rounded-[0.85rem] bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-white shadow-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
              >
                <IconShieldLock size={16} /> Security Audit
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

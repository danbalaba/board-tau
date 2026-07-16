'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { IconChartBar } from '@tabler/icons-react';
import Skeleton from '@/components/common/Skeleton';
import { RevenueData } from '@/app/admin/hooks/use-revenue-dashboard';

interface RevenueTopPropertiesProps {
  data?: RevenueData;
  isLoading: boolean;
}

export function RevenueTopProperties({ data, isLoading }: RevenueTopPropertiesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.32 }}
      className="h-full"
    >
      <div className="rounded-[2.5rem] border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 p-8 h-full">
        <div className="mb-8 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <IconChartBar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Top Properties</h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Ranking by total booking value</p>
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-[1.5rem]" />
            <Skeleton className="h-16 w-full rounded-[1.5rem]" />
          </div>
        ) : !data?.topProperties || data.topProperties.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No properties active for this query range.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.topProperties.map((prop, idx) => (
              <div 
                key={prop.listingId} 
                className="flex items-center justify-between p-4 rounded-[1.5rem] bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-[1rem] bg-primary/10 text-primary font-black text-xs flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    #{idx + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-gray-900 dark:text-white truncate">{prop.listingTitle}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{prop.listingOwner}</p>
                  </div>
                </div>
                <div className="text-sm font-black tabular-nums text-emerald-500 shrink-0 bg-emerald-500/10 px-3 py-1.5 rounded-xl">
                  ₱{prop.revenue.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

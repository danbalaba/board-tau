'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/admin/components/ui/card';
import { IconTrophy, IconTrendingUp } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import Skeleton from '@/components/common/Skeleton';
import { OccupancyByProperty } from '@/app/admin/hooks/use-top-listings';

interface OccupancyLeaderboardProps {
  data: OccupancyByProperty[];
  isLoading: boolean;
}

export function OccupancyLeaderboard({ data, isLoading }: OccupancyLeaderboardProps) {
  return (
    <Card className="border-none bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl shadow-xl rounded-[2.5rem] overflow-hidden flex flex-col h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
            <IconTrophy size={20} />
          </div>
          <div>
            <CardTitle className="text-lg font-black text-gray-900 dark:text-white">Occupancy Leaderboard</CardTitle>
            <CardDescription className="text-xs font-medium mt-1">Top 5 highest performing properties</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-5">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-4 w-12 rounded-md" />
              </div>
              <Skeleton className="h-3 w-full rounded-full" />
            </div>
          ))
        ) : data && data.length > 0 ? (
          data.map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col gap-2 group"
            >
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-gray-400 w-4">{idx + 1}.</span>
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">{item.property}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <IconTrendingUp size={14} className={cn("text-emerald-500", item.occupancy < 50 && "text-rose-500")} />
                  <span className="text-sm font-black tabular-nums text-gray-900 dark:text-white">
                    {Math.round(item.occupancy)}%
                  </span>
                </div>
              </div>
              <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden p-0.5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${item.occupancy}%` }}
                  transition={{ duration: 1, delay: 0.5 + (idx * 0.1), ease: "easeOut" }}
                  className={cn(
                    "h-full rounded-full bg-gradient-to-r",
                    item.occupancy >= 80 ? "from-emerald-400 to-emerald-500" :
                    item.occupancy >= 50 ? "from-amber-400 to-amber-500" : 
                    "from-rose-400 to-rose-500"
                  )}
                />
              </div>
            </motion.div>
          ))
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
            <IconTrophy size={48} className="text-gray-200 dark:text-gray-800 mb-3" />
            <p className="text-sm font-bold text-gray-400">No occupancy data found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

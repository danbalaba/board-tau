'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/admin/components/ui/card';
import { IconBulb, IconArrowUpRight, IconArrowDownRight, IconMinus } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import Skeleton from '@/components/common/Skeleton';
import { PricingRecommendation } from '@/app/admin/hooks/use-top-listings';

interface PricingIntelligenceProps {
  data: PricingRecommendation[];
  isLoading: boolean;
}

export function PricingIntelligence({ data, isLoading }: PricingIntelligenceProps) {
  return (
    <Card className="border-none bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl shadow-xl rounded-[2.5rem] overflow-hidden flex flex-col h-full lg:col-span-2">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl">
            <IconBulb size={20} />
          </div>
          <div>
            <CardTitle className="text-lg font-black text-gray-900 dark:text-white">Smart Pricing Intelligence</CardTitle>
            <CardDescription className="text-xs font-medium mt-1">AI-driven price optimization based on demand & occupancy</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="grid grid-cols-5 gap-4 px-4 py-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl mb-4 text-[10px] font-black uppercase tracking-widest text-gray-500">
            <div className="col-span-2">Property Name</div>
            <div>Current Price</div>
            <div>Market Demand</div>
            <div>Suggested Action</div>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="grid grid-cols-5 gap-4 px-4 items-center h-14">
                  <Skeleton className="col-span-2 h-4 w-48 rounded-md" />
                  <Skeleton className="h-4 w-16 rounded-md" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-8 w-24 rounded-lg" />
                </div>
              ))
            ) : data && data.length > 0 ? (
              data.map((item, idx) => {
                const isIncrease = item.suggestedPrice > item.currentPrice;
                const isDecrease = item.suggestedPrice < item.currentPrice;
                const isStable = !isIncrease && !isDecrease;

                const ActionIcon = isIncrease ? IconArrowUpRight : isDecrease ? IconArrowDownRight : IconMinus;
                
                return (
                  <motion.div 
                    key={item.id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="grid grid-cols-5 gap-4 px-4 py-3 items-center rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                  >
                    <div className="col-span-2 font-bold text-sm text-gray-700 dark:text-gray-300 line-clamp-1">
                      {item.property}
                    </div>
                    
                    <div className="font-black tabular-nums text-gray-900 dark:text-white">
                      ₱{item.currentPrice.toLocaleString()}
                    </div>

                    <div>
                      <span className={cn(
                        "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center w-fit",
                        item.demandLevel === 'high' ? "bg-rose-500/10 text-rose-500" :
                        item.demandLevel === 'low' ? "bg-blue-500/10 text-blue-500" :
                        "bg-emerald-500/10 text-emerald-500"
                      )}>
                        {item.demandLevel}
                      </span>
                    </div>

                    <div>
                      {isStable ? (
                        <div className="flex items-center gap-2 text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-xl w-fit">
                          <ActionIcon size={14} />
                          <span className="text-xs font-bold">Optimal</span>
                        </div>
                      ) : (
                        <div className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-xl w-fit",
                          isIncrease ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        )}>
                          <ActionIcon size={14} stroke={3} />
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                              {isIncrease ? 'Raise to' : 'Lower to'}
                            </span>
                            <span className="text-xs font-black tabular-nums">
                              ₱{item.suggestedPrice.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center col-span-5">
                <IconBulb size={48} className="text-gray-200 dark:text-gray-800 mb-3" />
                <p className="text-sm font-bold text-gray-400">Not enough data to generate pricing intelligence.</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

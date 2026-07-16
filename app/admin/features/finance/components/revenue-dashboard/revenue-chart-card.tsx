'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/app/admin/components/ui/chart';
import Skeleton from '@/components/common/Skeleton';
import { RevenueData } from '@/app/admin/hooks/use-revenue-dashboard';

interface RevenueChartCardProps {
  data?: RevenueData;
  isLoading: boolean;
}

const chartConfig = {
  revenue: {
    label: 'Gross Revenue',
    color: 'var(--primary)'
  }
} satisfies ChartConfig;

export function RevenueChartCard({ data, isLoading }: RevenueChartCardProps) {
  return (
    <motion.div 
      className="lg:col-span-2 h-full"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.16 }}
    >
      <div className="rounded-[2.5rem] border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 p-8 h-full">
        <div className="flex flex-row items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Revenue Performance</h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Real-time daily transaction volumes</p>
          </div>
          <div className="flex items-center gap-3 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-[10px] font-black uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-blue-500" /> Revenue</span>
          </div>
        </div>
        
        {isLoading ? (
          <div className="h-[350px] w-full flex items-center justify-center">
            <Skeleton className="h-full w-full rounded-[2rem]" />
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <AreaChart data={data?.dailyRevenue || []}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest" />
              <YAxis axisLine={false} tickLine={false} className="text-[10px] font-bold text-gray-400" tickFormatter={(v) => `₱${v.toLocaleString()}`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} isAnimationActive={true} animationDuration={1500} animationEasing="ease-out" />
            </AreaChart>
          </ChartContainer>
        )}
      </div>
    </motion.div>
  );
}

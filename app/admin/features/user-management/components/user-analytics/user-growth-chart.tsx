'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/admin/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { IconTrendingUp } from '@tabler/icons-react';
import type { UserAnalytics } from '@/app/admin/hooks/use-user-analytics';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/app/admin/components/ui/chart';
import { cn } from '@/lib/utils';

interface UserGrowthChartProps {
  data: UserAnalytics;
}

export function UserGrowthChart({ data }: UserGrowthChartProps) {
  const [activeMetric, setActiveMetric] = useState<'all' | 'new' | 'active'>('all');
  const chartData = data.growthData || [];

  const chartConfig = {
    newUsers: {
      label: 'New Users',
      color: '#10b981', // emerald-500
    },
    activeUsers: {
      label: 'Active Users',
      color: '#3b82f6', // blue-500
    },
  } satisfies ChartConfig;

  return (
    <Card className="flex flex-col border border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl shadow-xl rounded-[2.5rem] overflow-hidden h-full">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 pt-8 px-8">
        <div className="space-y-1.5">
          <CardTitle className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">User Growth</CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-widest text-gray-500">
            Evolution of acquisition and engagement across time
          </CardDescription>
        </div>
        
        <div className="flex bg-gray-100/50 dark:bg-gray-800/50 p-1.5 rounded-[1.25rem] border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
          {[
            { id: 'all', label: 'Summary' },
            { id: 'new', label: 'New Users' },
            { id: 'active', label: 'Active Sessions' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMetric(item.id as any)}
              className={cn(
                "px-4 py-2 text-[9px] font-black uppercase tracking-[0.15em] rounded-xl transition-all duration-300",
                activeMetric === item.id
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg scale-105"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="px-4 pt-4 pb-8">
        <div className="flex items-center gap-3 px-4 mb-8">
          <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/10 shadow-sm shadow-emerald-500/5">
            <IconTrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">+12.4%</span>
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Aggregate Velocity</span>
        </div>
        
        <ChartContainer config={chartConfig} className="h-[320px] w-full">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fillNew" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fillActive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} className="stroke-gray-100 dark:stroke-gray-800" strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={15}
              tick={{ fontSize: 9, fontWeight: 900 }}
              className="fill-gray-400 uppercase tracking-widest"
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={15}
              tick={{ fontSize: 9, fontWeight: 900 }}
              className="fill-gray-400 uppercase"
            />
            <ChartTooltip content={<ChartTooltipContent className="rounded-2xl border-none shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl" />} />
            <ChartLegend 
              content={<ChartLegendContent />} 
              className="mt-8 flex-wrap gap-x-8 gap-y-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500"
            />
            
            {(activeMetric === 'all' || activeMetric === 'new') && (
              <Area
                type="monotone"
                dataKey="newUsers"
                stroke="#10b981"
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="url(#fillNew)"
                animationDuration={2000}
                activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
              />
            )}
            
            {(activeMetric === 'all' || activeMetric === 'active') && (
              <Area
                type="monotone"
                dataKey="activeUsers"
                stroke="#3b82f6"
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="url(#fillActive)"
                animationDuration={2500}
                activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }}
              />
            )}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

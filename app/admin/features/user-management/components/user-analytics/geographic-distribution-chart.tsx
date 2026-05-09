'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/admin/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';
import { IconGlobe, IconArrowRight, IconMap } from '@tabler/icons-react';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/app/admin/components/ui/chart';
import { Button } from '@/app/admin/components/ui/button';
import type { UserAnalytics } from '@/app/admin/hooks/use-user-analytics';

interface GeographicDistributionChartProps {
  data: UserAnalytics;
}

export function GeographicDistributionChart({ data }: GeographicDistributionChartProps) {
  const [showAll, setShowAll] = useState(false);
  const rawData = data.locationData || [
    { city: 'Manila', users: 1450 },
    { city: 'Quezon', users: 1200 },
    { city: 'Cebu', users: 850 },
    { city: 'Davao', users: 650 },
    { city: 'Makati', users: 400 },
  ];

  const locationData = showAll ? rawData : rawData.slice(0, 5);

  const chartConfig = {
    users: {
      label: 'Density',
      color: '#3b82f6',
    },
  } satisfies ChartConfig;

  const topCity = rawData.length > 0 ? rawData[0].city : 'None';

  return (
    <Card className="flex flex-col border border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl shadow-xl rounded-[2.5rem] overflow-hidden h-full">
      <CardHeader className="pb-4 pt-8 px-8 flex-row items-center justify-between space-y-0">
        <div className="space-y-1.5">
          <CardTitle className="text-xl font-black tracking-tight text-gray-900 dark:text-white">User Locations</CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-widest text-gray-500">
            Regional activity hub and density mapping
          </CardDescription>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/10 shadow-sm shadow-blue-500/5">
          <IconMap className="w-6 h-6 text-blue-500" />
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 pb-10 pt-4 px-8">
        <ChartContainer config={chartConfig} className="min-h-[320px] w-full">
          <BarChart
            data={locationData}
            layout="vertical"
            margin={{ left: 0, right: 60, top: 0, bottom: 0 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-800" />
            <XAxis type="number" hide />
            <YAxis
              dataKey="city"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              width={100}
              tick={{ fontSize: 9, fontWeight: 900 }}
              className="fill-gray-400 uppercase tracking-widest"
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel indicator="line" className="rounded-2xl border-none shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl" />}
            />
            <Bar
              dataKey="users"
              fill="#3b82f6"
              radius={[0, 12, 12, 0]}
              barSize={32}
              animationDuration={1500}
            >
              <LabelList
                dataKey="users"
                position="right"
                offset={15}
                className="fill-gray-900 dark:fill-white font-black text-[11px] tabular-nums"
                formatter={(value: any) => typeof value === 'number' ? value.toLocaleString() : value}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
        
        <div className="mt-8">
          <div className="group flex items-center justify-between p-5 rounded-[2rem] bg-white/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:bg-white dark:hover:bg-gray-800 hover:shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/10 transition-transform group-hover:scale-110">
                <IconGlobe className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Main Activity Hub</span>
                <span className="text-sm font-black text-gray-900 dark:text-white">{topCity} Metropolitan</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
               <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full uppercase tracking-widest border border-blue-500/10">Active Sector</span>
               <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-500/10">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Live Flow</span>
               </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

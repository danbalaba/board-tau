'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/admin/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, LabelList, Cell, ResponsiveContainer } from 'recharts';
import { IconShieldCheck } from '@tabler/icons-react';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/app/admin/components/ui/chart';
import type { UserAnalytics } from '@/app/admin/hooks/use-user-analytics';

export function VerificationLifecycleChart({ data }: { data: UserAnalytics }) {
  const rawStatus = data.verificationStatus || [];
  const verifiedCount = rawStatus.find(s => s.isVerifiedLandlord === true)?.count || 0;
  const registeredCount = data.totalUsers || 0;
  
  const stages = [
    { 
      stage: 'Registered', 
      value: registeredCount, 
      percent: 100, 
      color: '#64748b' 
    },
    { 
      stage: 'Verified', 
      value: verifiedCount, 
      percent: registeredCount > 0 ? Math.round((verifiedCount / registeredCount) * 100) : 0, 
      color: '#d946ef' // fuchsia-500
    },
    { 
      stage: 'Active', 
      value: data.activeUsers, 
      percent: registeredCount > 0 ? Math.round((data.activeUsers / registeredCount) * 100) : 0, 
      color: '#10b981' // emerald-500
    },
  ];

  const chartConfig = {
    value: {
      label: 'Users',
    },
  } satisfies ChartConfig;

  return (
    <Card className="flex flex-col border border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl shadow-xl rounded-[2.5rem] overflow-hidden h-full">
      <CardHeader className="pb-0 pt-8 px-8 flex-row items-center justify-between space-y-0">
        <div className="space-y-1.5">
          <CardTitle className="text-xl font-black tracking-tight text-gray-900 dark:text-white">Trust Funnel</CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-widest text-gray-500">
            Platform integrity and verification health
          </CardDescription>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/10 flex items-center justify-center border border-fuchsia-500/10 shadow-sm shadow-fuchsia-500/5">
          <IconShieldCheck className="w-6 h-6 text-fuchsia-500" />
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 pb-10 pt-8 px-8 flex flex-col justify-center">
        <ChartContainer config={chartConfig} className="min-h-[320px] w-full">
          <BarChart
            data={stages}
            layout="vertical"
            margin={{ left: 0, right: 80, top: 0, bottom: 0 }}
          >
            <XAxis type="number" hide />
            <YAxis
              dataKey="stage"
              type="category"
              tickLine={false}
              axisLine={false}
              width={100}
              tick={{ fontSize: 9, fontWeight: 900 }}
              className="fill-gray-400 uppercase tracking-widest"
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel className="rounded-2xl border-none shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl" />}
            />
            <Bar
              dataKey="value"
              radius={[0, 12, 12, 0]}
              barSize={40}
              animationDuration={2000}
            >
              {stages.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  fillOpacity={0.8}
                  className="transition-all duration-300 hover:fill-opacity-100"
                />
              ))}
              <LabelList
                dataKey="percent"
                position="right"
                offset={20}
                className="fill-gray-900 dark:fill-white font-black text-[11px]"
                formatter={(value: any) => typeof value === 'number' ? `${value}%` : value}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

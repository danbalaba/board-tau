'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/admin/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, LabelList, Cell } from 'recharts';
import { ShieldCheck, UserCheck, Activity } from 'lucide-react';
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
      color: '#2f7d6d'
    },
    { 
      stage: 'Active', 
      value: data.activeUsers, 
      percent: registeredCount > 0 ? Math.round((data.activeUsers / registeredCount) * 100) : 0, 
      color: '#0ea5e9'
    },
  ];

  const chartConfig = {
    value: {
      label: 'Users',
    },
  } satisfies ChartConfig;

  return (
    <Card className="flex flex-col border-border/50 h-full shadow-sm">
      <CardHeader className="pb-0 pt-6 px-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold tracking-tight">Trust Funnel</CardTitle>
            <CardDescription className="text-[10px] uppercase font-bold tracking-wider opacity-60">Database Integrity Check</CardDescription>
          </div>
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-primary" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 pb-10 pt-6 px-10 flex flex-col justify-center">
        <ChartContainer config={chartConfig} className="min-h-[320px] w-full">
          <BarChart
            data={stages}
            layout="vertical"
            margin={{ left: -10, right: 80, top: 0, bottom: 0 }}
          >
            <XAxis type="number" hide />
            <YAxis
              dataKey="stage"
              type="category"
              tickLine={false}
              axisLine={false}
              width={120}
              tick={{ fontSize: 10, fontWeight: 800 }}
              className="fill-muted-foreground uppercase tracking-widest"
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey="value"
              radius={[0, 6, 6, 0]}
              barSize={36}
              animationDuration={2000}
            >
              {stages.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
              ))}
              <LabelList
                dataKey="percent"
                position="right"
                offset={20}
                className="fill-foreground font-black text-xs"
                formatter={(value: any) => typeof value === 'number' ? `${value}%` : value}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

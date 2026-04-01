'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/admin/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp } from 'lucide-react';
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
      color: '#2f7d6d',
    },
    activeUsers: {
      label: 'Active Users',
      color: '#0ea5e9',
    },
  } satisfies ChartConfig;

  return (
    <Card className="flex flex-col border-border/50 h-full shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold tracking-tight">User Growth</CardTitle>
          <CardDescription className="text-xs font-medium">How many new users are joining and staying active</CardDescription>
        </div>
          {/* User Roles Selection */}
          <div className="flex bg-muted/40 p-1.5 rounded-2xl border border-border/40 backdrop-blur-sm">
            {[
              { id: 'all', label: 'All' },
              { id: 'new', label: 'New Users' },
              { id: 'active', label: 'Active Users' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveMetric(item.id as any)}
                className={cn(
                  "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300",
                  activeMetric === item.id
                    ? "bg-primary text-white shadow-[0_8px_16px_rgba(47,125,109,0.3)] border-primary"
                    : "text-foreground/80 font-black hover:text-primary hover:bg-primary/10"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 pb-6">
        <div className="flex items-center gap-2 px-6 mb-6">
          <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-wider">+12.4%</span>
          </div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Last 30 Days</span>
        </div>
        
        <ChartContainer config={chartConfig} className="h-[320px] w-full">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fillNew" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2f7d6d" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#2f7d6d" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillActive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} className="stroke-muted/30" strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              tick={{ fontSize: 10, fontWeight: 700 }}
              className="fill-muted-foreground uppercase tracking-widest"
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              tick={{ fontSize: 10, fontWeight: 700 }}
              className="fill-muted-foreground uppercase"
            />
            <ChartTooltip content={<ChartTooltipContent className="rounded-2xl border-none shadow-2xl" />} />
            <ChartLegend 
              content={<ChartLegendContent />} 
              className="mt-6 flex-wrap gap-x-6 gap-y-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground"
            />
            
            {(activeMetric === 'all' || activeMetric === 'new') && (
              <Area
                type="basis"
                dataKey="newUsers"
                stroke="#2f7d6d"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="url(#fillNew)"
                animationDuration={2000}
              />
            )}
            
            {(activeMetric === 'all' || activeMetric === 'active') && (
              <Area
                type="basis"
                dataKey="activeUsers"
                stroke="#0ea5e9"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="url(#fillActive)"
                animationDuration={2500}
              />
            )}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

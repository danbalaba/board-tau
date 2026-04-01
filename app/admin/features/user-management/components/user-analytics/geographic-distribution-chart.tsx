'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/admin/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';
import { Globe, ArrowRight, Map as MapIcon } from 'lucide-react';
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
      color: '#2f7d6d',
    },
  } satisfies ChartConfig;

  const topCity = rawData.length > 0 ? rawData[0].city : 'None';

  return (
    <Card className="flex flex-col border-border/50 h-full shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6 px-6">
        <div className="flex items-center justify-between w-full">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold tracking-tight">User Locations</CardTitle>
            <CardDescription className="text-[10px] uppercase font-bold tracking-wider opacity-60">Regional activity hub</CardDescription>
          </div>
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <MapIcon className="w-4 h-4 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-6 pt-2 px-6">
        <ChartContainer config={chartConfig} className="min-h-[320px] w-full">
          <BarChart
            data={locationData}
            layout="vertical"
            margin={{ left: 0, right: 60, top: 0, bottom: 0 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" className="stroke-muted/30" />
            <XAxis type="number" hide />
            <YAxis
              dataKey="city"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              width={100}
              tick={{ fontSize: 11, fontWeight: 700 }}
              className="fill-muted-foreground uppercase tracking-widest"
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel indicator="line" />}
            />
            <Bar
              dataKey="users"
              fill="#2f7d6d"
              radius={[0, 6, 6, 0]}
              barSize={32}
              animationDuration={1500}
            >
              <LabelList
                dataKey="users"
                position="right"
                offset={12}
                className="fill-foreground font-black text-[12px] tabular-nums"
                formatter={(value: any) => typeof value === 'number' ? value.toLocaleString() : value}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
        
        <div className="mt-8 space-y-2">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 border border-primary/10 shadow-inner">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Globe className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground">Main Activity Hub</span>
                <span className="text-sm font-black text-foreground">{topCity} Area</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
               <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest border border-primary/20">Active Sector</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

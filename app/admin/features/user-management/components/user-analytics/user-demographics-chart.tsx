'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/admin/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Users } from 'lucide-react';
import type { UserAnalytics } from '@/app/admin/hooks/use-user-analytics';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/app/admin/components/ui/chart';

interface UserDemographicsChartProps {
  data: UserAnalytics;
}

export function UserDemographicsChart({ data }: UserDemographicsChartProps) {
  const [activeRoles, setActiveRoles] = useState<string[]>([]);
  const rawRoles = data.userRoles || [];

  const chartData = rawRoles
    .map((role: any) => {
      const formattedName = role.role.charAt(0).toUpperCase() + role.role.slice(1).toLowerCase();
      
      // Professional color assignments
      let fill = '#64748b'; // Default Slate
      if (formattedName === 'Admin') fill = '#8b5cf6'; // Royal Purple
      if (formattedName === 'Landlord') fill = '#2f7d6d'; // BoardTAU Emerald
      if (formattedName === 'User') fill = '#0ea5e9'; // Sky Blue

      return {
        name: formattedName,
        value: role.count,
        fill,
      };
    })
    .filter(role => activeRoles.length === 0 || activeRoles.includes(role.name));

  const chartConfig = Object.fromEntries(
    chartData.map((item: any) => [
      item.name, 
      { label: item.name, color: item.fill }
    ])
  ) satisfies ChartConfig;

  return (
    <Card className="flex flex-col border-border/50 h-full shadow-sm">
      <CardHeader className="pb-0 pt-6 px-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold tracking-tight">User Roles</CardTitle>
            <CardDescription className="text-[10px] uppercase font-bold tracking-wider opacity-60">Who is using BoardTAU</CardDescription>
          </div>
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="w-4 h-4 text-primary" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 pb-8 pt-6 px-10 flex flex-col justify-between">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[400px] w-full">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={80}
              outerRadius={110}
              strokeWidth={5}
              stroke="hsl(var(--card))"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartTooltip 
              cursor={false} 
              content={<ChartTooltipContent hideLabel className="rounded-2xl border-none shadow-2xl" />} 
            />
            <ChartLegend 
              content={<ChartLegendContent nameKey="name" />} 
              className="mt-8 flex-wrap gap-x-8 gap-y-3 text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground"
            />
          </PieChart>
        </ChartContainer>
        
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          {chartData.map((item, idx) => (
            <div key={idx} className="group flex items-center gap-3 px-5 py-2.5 rounded-full bg-muted/60 border border-border/60 transition-all hover:bg-muted/80 hover:shadow-lg shadow-sm">
              <div 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: item.fill }} 
              />
              <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                {item.name}
              </span>
              <span className="text-lg font-black tracking-tighter tabular-nums leading-none text-foreground">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

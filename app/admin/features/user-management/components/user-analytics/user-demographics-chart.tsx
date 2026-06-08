'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/admin/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { IconUsers } from '@tabler/icons-react';
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
      if (formattedName === 'Admin') fill = '#d946ef'; // Fuchsia
      if (formattedName === 'Landlord' || formattedName === 'Host') fill = '#10b981'; // Emerald
      if (formattedName === 'User' || formattedName === 'Renter') fill = '#3b82f6'; // Blue

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
    <Card className="flex flex-col border border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl shadow-xl rounded-[2.5rem] overflow-hidden h-full">
      <CardHeader className="pb-0 pt-8 px-8 flex-row items-center justify-between space-y-0">
        <div className="space-y-1.5">
          <CardTitle className="text-xl font-black tracking-tight text-gray-900 dark:text-white">Role Distribution</CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-widest text-gray-500">
            Composition of the BoardTAU ecosystem
          </CardDescription>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/10 shadow-sm shadow-amber-500/5">
          <IconUsers className="w-6 h-6 text-amber-500" />
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 pb-10 pt-8 px-8 flex flex-col justify-between">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[350px] w-full">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={8}
              stroke="transparent"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.fill} 
                  fillOpacity={0.8}
                  className="transition-all duration-300 hover:fill-opacity-100 outline-none"
                />
              ))}
            </Pie>
            <ChartTooltip 
              cursor={false} 
              content={<ChartTooltipContent hideLabel className="rounded-2xl border-none shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl" />} 
            />
            <ChartLegend 
              content={<ChartLegendContent nameKey="name" />} 
              className="mt-8 flex-wrap gap-x-6 gap-y-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500"
            />
          </PieChart>
        </ChartContainer>
        
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          {chartData.map((item, idx) => (
            <div key={idx} className="group flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 transition-all hover:bg-white dark:hover:bg-gray-800 hover:shadow-lg shadow-sm">
              <div 
                className="w-2.5 h-2.5 rounded-full shadow-sm" 
                style={{ backgroundColor: item.fill }} 
              />
              <span className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                {item.name}
              </span>
              <span className="text-sm font-black tracking-tighter tabular-nums text-gray-900 dark:text-white">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

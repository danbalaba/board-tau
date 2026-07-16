'use client';

import * as React from 'react';
import { IconTrendingUp } from '@tabler/icons-react';
import { Label, Pie, PieChart } from 'recharts';
import { Badge } from "../../../components/ui/badge";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "../../../components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "../../../components/ui/chart";
import { useExecutiveOverview } from "@/app/admin/hooks/use-executive-overview";

export function PieGraph({ data: propData }: { data?: any[] }) {
  const { data: apiResponse } = useExecutiveOverview('30d');
  const data = propData || apiResponse?.data?.charts?.propertyDistribution || [];
  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      total: { label: 'Total' }
    };
    data.forEach(item => {
      config[item.name.toLowerCase()] = {
        label: item.name,
        color: item.color
      };
    });
    return config;
  }, [data]);

  const chartData = React.useMemo(() => {
    return data.map((item: any) => ({
      ...item,
      fill: item.color || `var(--chart-${(data.indexOf(item) % 5) + 1})`
    }));
  }, [data]);

  const totalProperties = React.useMemo(() => {
    return data.reduce((acc: number, curr: any) => acc + curr.value, 0);
  }, [data]);

  return (
    <Card className='flex h-full flex-col border border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl shadow-xl rounded-[2.5rem] overflow-hidden'>
      <CardHeader className="flex flex-row items-center justify-between pb-4 px-8 pt-8 border-b border-gray-100/50 dark:border-gray-800/50">
        <div className="space-y-1.5">
          <CardTitle className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Property Split</CardTitle>
          <CardDescription className="text-[10px] uppercase font-black tracking-widest text-gray-500">Active inventory by type</CardDescription>
        </div>
        <Badge variant='outline' className="bg-blue-500/10 text-blue-500 border-none font-black uppercase text-[9px] h-6 px-3 rounded-xl shadow-sm">
          TOTAL
        </Badge>
      </CardHeader>
      <CardContent className='flex flex-1 items-center justify-center pb-0'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square max-h-[250px] min-h-[250px] w-full'
        >
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent className="rounded-2xl border-none shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl" hideLabel />} />
            <Pie
              data={chartData}
              innerRadius={70}
              outerRadius={100}
              dataKey='value'
              nameKey='name'
              strokeWidth={5}
              paddingAngle={2}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-black"
                        >
                          {totalProperties.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-[10px] uppercase font-bold tracking-widest"
                        >
                          Listings
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

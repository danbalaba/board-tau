'use client';

import * as React from 'react';
import { IconTrendingUp } from '@tabler/icons-react';
import { LabelList, Pie, PieChart } from 'recharts';
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

  return (
    <Card className='flex h-full flex-col border-none bg-card/30 backdrop-blur-md shadow-xl'>
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/5">
        <div>
          <CardTitle className="text-base font-black tracking-tight">Property Split</CardTitle>
          <CardDescription className="text-[10px] uppercase font-bold tracking-widest mt-1">Active inventory by type</CardDescription>
        </div>
        <Badge variant='outline' className="bg-blue-500/10 text-blue-500 border-none font-black uppercase text-[9px] h-5 px-2">
          <IconTrendingUp className="size-3 mr-1" />
          +5.2%
        </Badge>
      </CardHeader>
      <CardContent className='flex flex-1 items-center justify-center pb-0'>
        <ChartContainer
          config={chartConfig}
          className='[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[350px] min-h-[300px]'
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              innerRadius={30}
              dataKey='value'
              nameKey='name'
              radius={10}
              cornerRadius={8}
              paddingAngle={4}
            >
              <LabelList
                dataKey='value'
                stroke='none'
                fontSize={12}
                fontWeight={500}
                fill='currentColor'
                formatter={(value: any) => value.toString()}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

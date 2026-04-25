'use client';

import { IconTrendingUp } from '@tabler/icons-react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

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
import { Badge } from "../../../components/ui/badge";
import { useExecutiveOverview } from "@/app/admin/hooks/use-executive-overview";

export function AreaGraph({ data: propData }: { data?: any[] }) {
  const { data: apiResponse } = useExecutiveOverview('30d');
  const data = propData || apiResponse?.data?.charts?.revenue || [];
  
  const chartConfig = {
    revenue: {
      label: 'Revenue',
      color: 'var(--chart-1)'
    }
  } satisfies ChartConfig;

  return (
    <Card className="border-none bg-card/30 backdrop-blur-md shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/5">
        <div>
          <CardTitle className="text-base font-black tracking-tight">Revenue Trend</CardTitle>
          <CardDescription className="text-[10px] uppercase font-bold tracking-widest mt-1">Platform revenue over time</CardDescription>
        </div>
        <Badge variant='outline' className="bg-amber-500/10 text-amber-500 border-none font-black uppercase text-[9px] h-5 px-2">
          <IconTrendingUp className="size-3 mr-1" />
          +12.5%
        </Badge>
      </CardHeader>
      <CardContent className="pt-4">
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[350px] w-full'
        >
          <AreaChart
            data={data}
            margin={{
              left: 12,
              right: 12
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray='3 3' opacity={0.3} />
            <XAxis
              dataKey='month'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator='dot' />}
            />
            <defs>
              <DottedBackgroundPattern config={chartConfig} />
            </defs>
            <Area
              dataKey='revenue'
              type='natural'
              fill='url(#dotted-background-pattern-revenue)'
              fillOpacity={0.6}
              stroke='var(--chart-1)'
              stackId='a'
              strokeWidth={1.5}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="pt-4 border-t border-white/5">
        <div className='flex items-center gap-2'>
          <IconTrendingUp className='h-3.5 w-3.5 text-emerald-500' />
          <span className='text-[10px] font-black uppercase tracking-widest text-muted-foreground/50'>Steady platform growth · Last 30 days</span>
        </div>
      </CardFooter>
    </Card>
  );
}

const DottedBackgroundPattern = ({ config }: { config: ChartConfig }) => {
  const items = Object.fromEntries(
    Object.entries(config).map(([key, value]) => [key, (value as any).color])
  );
  return (
    <>
      {Object.entries(items).map(([key, value]) => (
        <pattern
          key={key}
          id={`dotted-background-pattern-${key}`}
          x='0'
          y='0'
          width='7'
          height='7'
          patternUnits='userSpaceOnUse'
        >
          <circle cx='3.5' cy='3.5' r='1.2' fill={value} opacity={0.6}></circle>
        </pattern>
      ))}
    </>
  );
};


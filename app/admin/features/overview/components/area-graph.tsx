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

export function AreaGraph({ data: propData, range = '30d' }: { data?: any[], range?: string }) {
  const { data: apiResponse } = useExecutiveOverview(range);
  const data = propData || apiResponse?.data?.charts?.engagement || [];
  
  const chartConfig = {
    users: {
      label: 'Signups',
      color: '#3b82f6'
    },
    listings: {
      label: 'Listings',
      color: '#f59e0b'
    },
    inquiries: {
      label: 'Inquiries',
      color: '#10b981'
    }
  } satisfies ChartConfig;

  const getRangeLabel = () => {
    switch (range) {
      case '7d': return 'Last 7 Days';
      case '90d': return 'Last 90 Days';
      case '1y': return 'Last Year';
      case '30d':
      default: return 'Last 30 Days';
    }
  };

  return (
    <Card className="flex flex-col border border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl shadow-xl rounded-[2.5rem] overflow-hidden h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4 px-8 pt-8 border-b border-gray-100/50 dark:border-gray-800/50">
        <div className="space-y-1.5">
          <CardTitle className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Platform Engagement</CardTitle>
          <CardDescription className="text-[10px] uppercase font-black tracking-widest text-gray-500">Signups, listings, and inquiries</CardDescription>
        </div>
        <Badge variant='outline' className="bg-primary/10 text-primary border-none font-black uppercase text-[9px] h-6 px-3 rounded-xl shadow-sm">
          <IconTrendingUp className="size-3 mr-1.5" />
          {getRangeLabel()}
        </Badge>
      </CardHeader>
      <CardContent className="pt-8 px-4 pb-4">
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
              content={<ChartTooltipContent className="rounded-2xl border-none shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl" indicator='dot' />}
            />
            <defs>
              <DottedBackgroundPattern config={chartConfig} />
            </defs>
            <Area
              dataKey='users'
              type='natural'
              fill='url(#dotted-background-pattern-users)'
              fillOpacity={0.4}
              stroke='#3b82f6'
              stackId='a'
              strokeWidth={1.5}
            />
            <Area
              dataKey='listings'
              type='natural'
              fill='url(#dotted-background-pattern-listings)'
              fillOpacity={0.4}
              stroke='#f59e0b'
              stackId='a'
              strokeWidth={1.5}
            />
            <Area
              dataKey='inquiries'
              type='natural'
              fill='url(#dotted-background-pattern-inquiries)'
              fillOpacity={0.4}
              stroke='#10b981'
              stackId='a'
              strokeWidth={1.5}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="pt-4 px-8 pb-8 border-t border-gray-100/50 dark:border-gray-800/50">
        <div className='flex items-center gap-2'>
          <IconTrendingUp className='h-3.5 w-3.5 text-emerald-500' />
          <span className='text-[10px] font-black uppercase tracking-widest text-muted-foreground/50'>Tracking community growth · {getRangeLabel()}</span>
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


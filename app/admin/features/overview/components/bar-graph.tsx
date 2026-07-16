'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "../../../components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "../../../components/ui/chart";
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import { Badge } from "../../../components/ui/badge";
import { useExecutiveOverview } from "@/app/admin/hooks/use-executive-overview";

export const description = 'An interactive bar chart';

const chartData = [
  { name: 'Luxury Villa Bali', revenue: 12500 },
  { name: 'Downtown Penthouse', revenue: 8400 },
  { name: 'Beachfront Condo', revenue: 6200 },
  { name: 'Mountain Cabin', revenue: 4100 },
  { name: 'City Studio', revenue: 2900 }
];

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'var(--chart-1)'
  },
  bookings: {
    label: 'Bookings',
    color: 'var(--chart-2)'
  }
} satisfies ChartConfig;

export function BarGraph({ data: propData, range = '30d' }: { data?: any[], range?: string }) {
  const { data: apiResponse } = useExecutiveOverview(range);
  const data = propData || apiResponse?.data?.topProperties || [];

  const chartData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map((item: any) => ({
      name: item.listingTitle,
      revenue: item.revenue,
    }));
  }, [data]);

  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const getRangeLabel = () => {
    switch (range) {
      case '7d': return 'Last 7 Days';
      case '90d': return 'Last 90 Days';
      case '1y': return 'Last Year';
      case '30d':
      default: return 'Last 30 Days';
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <Card className="flex flex-col border border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl shadow-xl rounded-[2.5rem] overflow-hidden h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4 px-8 pt-8 border-b border-gray-100/50 dark:border-gray-800/50">
        <div className="space-y-1.5">
          <CardTitle className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Top Performing Properties</CardTitle>
          <CardDescription className="text-[10px] uppercase font-black tracking-widest text-gray-500">Platform revenue generated per property</CardDescription>
        </div>
        <Badge variant='outline' className="bg-primary/10 text-primary border-none font-black uppercase text-[9px] h-6 px-3 rounded-xl shadow-sm">
          <IconTrendingUp className="size-3 mr-1.5" />
          {getRangeLabel()}
        </Badge>
      </CardHeader>
      <CardContent className="pt-8 px-4 pb-8">
        <ChartContainer config={chartConfig} className='aspect-auto h-[350px] w-full'>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-100 dark:stroke-gray-800" opacity={0.5} />
            <XAxis
              dataKey='name'
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.length > 15 ? value.slice(0, 15) + '...' : value}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent className="rounded-2xl border-none shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl" indicator='dashed' hideLabel />}
            />
            <Bar
              dataKey='revenue'
              fill='var(--chart-1)'
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

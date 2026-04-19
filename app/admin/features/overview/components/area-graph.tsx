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
import { useExecutiveOverview } from "@/app/admin/hooks/use-executive-overview";

export function AreaGraph({ data: propData }: { data?: any[] }) {
  const { data: apiResponse } = useExecutiveOverview('30d');
  const data = propData || apiResponse?.data?.charts?.revenue || [];
  const chartConfig = {
    revenue: {
      label: 'Revenue',
      color: 'oklch(var(--color-primary))'
    }
  } satisfies ChartConfig;

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>Revenue Growth</CardTitle>
        <CardDescription>
          Showing revenue trends for the selected period
        </CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] w-full'
        >
          <AreaChart
            data={data}
            margin={{
              left: 12,
              right: 12
            }}
          >
            <defs>
              <linearGradient id='fillRevenue' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='oklch(var(--color-primary))'
                  stopOpacity={1.0}
                />
                <stop
                  offset='95%'
                  stopColor='oklch(var(--color-primary))'
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='month'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator='dot' />}
            />
            <Area
              dataKey='revenue'
              type='natural'
              fill='url(#fillRevenue)'
              stroke='oklch(var(--color-primary))'
              stackId='a'
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className='flex w-full items-start gap-2 text-sm'>
          <div className='grid gap-2'>
            <div className='flex items-center gap-2 leading-none font-medium'>
              Steady platform growth{' '}
              <IconTrendingUp className='h-4 w-4 text-emerald-500' />
            </div>
            <div className='text-muted-foreground flex items-center gap-2 leading-none'>
              Last 30 days performance
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

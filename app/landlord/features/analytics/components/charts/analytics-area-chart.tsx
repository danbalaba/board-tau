'use client';

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/admin/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/app/admin/components/ui/chart';
import { TrendingUp, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/app/admin/components/ui/tooltip';

interface ChartDataItem {
  date: string;
  revenue: number;
  bookings: number;
}

interface AnalyticsAreaChartProps {
  data?: ChartDataItem[];
  propertyName?: string;
  isSingleProperty?: boolean;
  period?: 'month' | 'quarter' | 'year';
}

const chartConfig = {
  revenue: {
    label: 'Income (₱)',
    color: '#2f7d6d',
  },
  bookings: {
    label: 'Bookings',
    color: '#3b82f6',
  },
} satisfies ChartConfig;

function InteractiveTooltip({
  children,
  content,
}: {
  children: React.ReactNode;
  content: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <TooltipProvider>
      <Tooltip open={open} onOpenChange={setOpen} delayDuration={0}>
        <TooltipTrigger
          asChild
          onClick={() => {
            setOpen((prev) => !prev);
          }}
        >
          {children}
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-[240px] p-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white border border-slate-200/90 dark:border-slate-800/90 shadow-xl dark:shadow-2xl backdrop-blur-xl text-xs leading-snug z-[100]"
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function AnalyticsAreaChart({
  data = [],
  propertyName = 'All Properties Portfolio',
  isSingleProperty = false,
  period = 'month',
}: AnalyticsAreaChartProps) {
  const chartData = data && data.length > 0 ? data : [];

  const title = isSingleProperty
    ? `${propertyName} — Income & Bookings`
    : 'Portfolio Income & Bookings';

  const periodLabel =
    period === 'year'
      ? 'last 12 months'
      : period === 'quarter'
      ? 'last 90 days'
      : 'last 30 days';

  const description = `Daily financial and confirmed stay trends for the ${periodLabel}`;

  return (
    <Card className="pt-0 pb-0 border-none shadow-none bg-transparent">
      <CardHeader className="flex flex-col space-y-0 pb-4 px-0! border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-[#2f7d6d]/10 text-[#2f7d6d] dark:bg-emerald-500/10 dark:text-emerald-400 shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <CardTitle className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white truncate">
              {title}
            </CardTitle>
          </div>

          {/* Scope Pill Badge */}
          <div className="self-start sm:self-auto px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 shrink-0 whitespace-nowrap">
            {isSingleProperty ? 'Single Listing' : 'Full Portfolio'}
          </div>
        </div>

        <CardDescription className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="px-0! pt-6">
        {chartData.length === 0 ? (
          <div className="h-[215px] sm:h-[250px] flex items-center justify-center text-xs font-semibold text-slate-400">
            No income or booking activity recorded for this period.
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[215px] sm:h-[250px] w-full"
          >
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 15, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="fillAnalyticsRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2f7d6d" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2f7d6d" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="fillAnalyticsBookings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                className="stroke-slate-200/60 dark:stroke-slate-800/60"
              />

              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                minTickGap={28}
                tickFormatter={(value: any) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  });
                }}
                className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider"
              />

              {/* Left Y-Axis for Revenue (₱) */}
              <YAxis
                yAxisId="revenue"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: any) =>
                  `₱${Number(value) >= 1000 ? Number(value) / 1000 + 'k' : value}`
                }
                className="text-[11px] font-bold text-slate-400 dark:text-slate-500"
              />

              {/* Right Y-Axis for Bookings Count (prevents flatline) */}
              <YAxis
                yAxisId="bookings"
                orientation="right"
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                tickFormatter={(value: any) => `${value}`}
                className="text-[11px] font-bold text-blue-500/70 dark:text-blue-400/70"
              />

              <ChartTooltip
                cursor={{
                  stroke: '#2f7d6d',
                  strokeWidth: 1.5,
                  strokeDasharray: '4 4',
                }}
                content={
                  <ChartTooltipContent
                    className="w-[185px] p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl"
                    labelFormatter={(value: string) => {
                      return new Date(value).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      });
                    }}
                    formatter={(value: any, name: any) => {
                      if (name === 'revenue') {
                        return [
                          `₱${Number(value).toLocaleString()}`,
                          'Rental Income',
                        ];
                      }
                      return [`${value} stays`, 'Confirmed Bookings'];
                    }}
                    indicator="dot"
                  />
                }
              />

              <Area
                yAxisId="bookings"
                dataKey="bookings"
                name="bookings"
                type="monotone"
                fill="url(#fillAnalyticsBookings)"
                stroke="#3b82f6"
                strokeWidth={2.5}
              />

              <Area
                yAxisId="revenue"
                dataKey="revenue"
                name="revenue"
                type="monotone"
                fill="url(#fillAnalyticsRevenue)"
                stroke="#2f7d6d"
                strokeWidth={2.5}
              />
            </AreaChart>
          </ChartContainer>
        )}

        {/* Interactive Hover & Tap Legend */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-6 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          {[
            {
              key: 'bookings',
              label: 'Bookings (Right Axis)',
              color: 'bg-[#3b82f6]',
              headerColor: 'text-[#3b82f6] dark:text-blue-400',
              desc: 'Number of confirmed student room reservations',
            },
            {
              key: 'revenue',
              label: 'Income (Left Axis ₱)',
              color: 'bg-[#2f7d6d]',
              headerColor: 'text-[#2f7d6d] dark:text-emerald-400',
              desc: 'Gross rental earnings collected from student bookings',
            },
          ].map((item) => (
            <InteractiveTooltip
              key={item.key}
              content={
                <>
                  <div
                    className={`font-bold mb-1 flex items-center gap-1.5 ${item.headerColor}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${item.color}`} />
                    {item.label}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 font-normal">
                    {item.desc}
                  </p>
                </>
              }
            >
              <div className="flex items-center gap-2 cursor-pointer group py-1 px-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all">
                <span
                  className={`w-3 h-3 rounded-full ${item.color} shadow-2xs transition-transform group-hover:scale-125`}
                />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  {item.label}
                </span>
                <Info className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-[#2f7d6d] dark:group-hover:text-emerald-400 transition-colors ml-0.5" />
              </div>
            </InteractiveTooltip>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default AnalyticsAreaChart;

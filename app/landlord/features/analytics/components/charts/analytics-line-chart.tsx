'use client';

import * as React from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis, ResponsiveContainer } from 'recharts';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/app/admin/components/ui/tooltip';
import { MessageSquare, CalendarCheck, CheckCircle2, Info } from 'lucide-react';

interface ChartDataItem {
  date: string;
  inquiries: number;
  bookings: number;
}

interface AnalyticsLineChartProps {
  data?: ChartDataItem[];
  propertyName?: string;
  isSingleProperty?: boolean;
  totalBookingRequests?: number;
}

const chartConfig = {
  inquiries: {
    label: 'Tenant Inquiries',
    color: '#3b82f6',
  },
  bookings: {
    label: 'Confirmed Bookings',
    color: '#2f7d6d',
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

export function AnalyticsLineChart({
  data = [],
  propertyName = 'All Properties Portfolio',
  isSingleProperty = false,
  totalBookingRequests,
}: AnalyticsLineChartProps) {
  const chartData = data && data.length > 0 ? data : [];

  const totals = React.useMemo(() => {
    const inquiries = chartData.reduce((acc, curr) => acc + (curr.inquiries || 0), 0);
    const bookings = chartData.reduce((acc, curr) => acc + (curr.bookings || 0), 0);
    const effectiveDenominator = totalBookingRequests || Math.max(bookings, inquiries);
    const rate = effectiveDenominator > 0
      ? Math.min(100, Math.round((bookings / effectiveDenominator) * 100))
      : 0;

    return { inquiries, bookings, rate };
  }, [chartData, totalBookingRequests]);

  const title = isSingleProperty
    ? `${propertyName} — Inquiries vs. Bookings`
    : 'Inquiries vs. Bookings Funnel';

  return (
    <Card className="pt-0 pb-0 border-none shadow-none bg-transparent">
      <CardHeader className="flex flex-col space-y-0 px-0! pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-[#3b82f6]/10 text-[#3b82f6] dark:bg-blue-500/10 dark:text-blue-400 shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <CardTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">
              {title}
            </CardTitle>
          </div>

          {/* Confirmation Rate Badge (Bounded 0-100%) */}
          <div className="self-start sm:self-auto flex items-center gap-1.5 py-1 px-2.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-black shrink-0 whitespace-nowrap">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Confirmation: {totals.rate}%</span>
          </div>
        </div>

        <CardDescription className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
          Tenant room applications compared to confirmed reservations
        </CardDescription>
      </CardHeader>

      <CardContent className="px-0! pt-5">
        {chartData.length === 0 ? (
          <div className="h-[230px] flex items-center justify-center text-xs font-semibold text-slate-400">
            No inquiry or booking data recorded for this period.
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[230px] w-full"
          >
            <LineChart
              data={chartData}
              margin={{ top: 15, right: 15, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                className="stroke-slate-200/60 dark:stroke-slate-800/60"
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={(val: any) => {
                  const str = String(val);
                  if (str.length === 7) {
                    const [y, m] = str.split('-');
                    const date = new Date(Number(y), Number(m) - 1, 1);
                    return date.toLocaleDateString('en-US', { month: 'short' });
                  }
                  const d = new Date(str);
                  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
                className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                className="text-[11px] font-bold text-slate-400 dark:text-slate-500"
              />
              <ChartTooltip
                cursor={{
                  stroke: '#3b82f6',
                  strokeWidth: 1.5,
                  strokeDasharray: '4 4',
                }}
                content={
                  <ChartTooltipContent
                    className="w-[185px] p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl"
                    labelFormatter={(val: string) => {
                      if (val.length === 7) {
                        const [y, m] = val.split('-');
                        const d = new Date(Number(y), Number(m) - 1, 1);
                        return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                      }
                      return new Date(val).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      });
                    }}
                    indicator="dot"
                  />
                }
              />
              {/* Plot BOTH lines simultaneously */}
              <Line
                dataKey="inquiries"
                name="inquiries"
                type="monotone"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                dataKey="bookings"
                name="bookings"
                type="monotone"
                stroke="#2f7d6d"
                strokeWidth={2.5}
                dot={{ fill: '#2f7d6d', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ChartContainer>
        )}

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-6 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <InteractiveTooltip
            content={
              <>
                <div className="font-bold text-[#3b82f6] dark:text-blue-400 mb-1">
                  Tenant Inquiries
                </div>
                <p className="text-slate-600 dark:text-slate-300 font-normal">
                  Questions and chat messages received from prospective student boarders
                </p>
              </>
            }
          >
            <div className="flex items-center gap-2 cursor-pointer group py-1 px-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all">
              <span className="w-3 h-3 rounded-full bg-[#3b82f6] shrink-0" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Inquiries ({totals.inquiries})
              </span>
              <Info className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 ml-0.5" />
            </div>
          </InteractiveTooltip>

          <InteractiveTooltip
            content={
              <>
                <div className="font-bold text-[#2f7d6d] dark:text-emerald-400 mb-1">
                  Confirmed Bookings
                </div>
                <p className="text-slate-600 dark:text-slate-300 font-normal">
                  Total student room reservations approved and confirmed
                </p>
              </>
            }
          >
            <div className="flex items-center gap-2 cursor-pointer group py-1 px-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all">
              <span className="w-3 h-3 rounded-full bg-[#2f7d6d] shrink-0" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Bookings ({totals.bookings})
              </span>
              <Info className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 ml-0.5" />
            </div>
          </InteractiveTooltip>
        </div>
      </CardContent>
    </Card>
  );
}

export default AnalyticsLineChart;

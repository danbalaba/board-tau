'use client';

import * as React from 'react';
import { Activity } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

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
import { useExecutiveOverview } from "@/app/admin/hooks/use-executive-overview";

export const description = 'Platform Growth & Community Activity';

const chartConfig = {
  inquiries: {
    label: 'Room Inquiries',
    color: '#10b981'
  },
  users: {
    label: 'User Signups',
    color: '#3b82f6'
  },
  listings: {
    label: 'New Listings',
    color: '#f59e0b'
  }
} satisfies ChartConfig;

export function AreaGraph({ data: propData, range = '30d' }: { data?: any[], range?: string }) {
  const { data: apiResponse } = useExecutiveOverview(range);
  const data = propData || apiResponse?.data?.charts?.engagement || [];

  const [activeFilter, setActiveFilter] = React.useState<'all' | 'inquiries' | 'users' | 'listings'>('all');

  const totals = React.useMemo(() => {
    if (!data || data.length === 0) return { inquiries: 0, users: 0, listings: 0, total: 0 };
    const inquiries = data.reduce((acc: number, curr: any) => acc + (curr.inquiries || 0), 0);
    const users = data.reduce((acc: number, curr: any) => acc + (curr.users || 0), 0);
    const listings = data.reduce((acc: number, curr: any) => acc + (curr.listings || 0), 0);
    return { inquiries, users, listings, total: inquiries + users + listings };
  }, [data]);

  // Clean deduplicated date formatting for XAxis
  const formattedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map((item: any) => ({
      ...item,
      displayDate: item.month, // e.g. "Sep 15", "Sep 22", "Oct 1"
    }));
  }, [data]);

  return (
    <Card className="flex flex-col border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl shadow-xs hover:shadow-lg rounded-[24px] sm:rounded-[26px] overflow-hidden h-full transition-all duration-300">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 px-6 pt-6 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#2f7d6d]/10 text-[#2f7d6d] dark:bg-emerald-500/10 dark:text-emerald-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Platform Growth</CardTitle>
            <CardDescription className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              New signups, listings, and inquiries over time
            </CardDescription>
          </div>
        </div>

        {/* Metric Selector Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              activeFilter === 'all'
                ? 'bg-white dark:bg-slate-900 text-[#2f7d6d] dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter('inquiries')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              activeFilter === 'inquiries'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Inquiries
          </button>
          <button
            onClick={() => setActiveFilter('users')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              activeFilter === 'users'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Signups
          </button>
          <button
            onClick={() => setActiveFilter('listings')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              activeFilter === 'listings'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Listings
          </button>
        </div>
      </CardHeader>

      <CardContent className="pt-6 px-4 pb-4 flex-1 flex flex-col justify-between">
        {formattedData.length === 0 ? (
          <div className="h-[280px] flex flex-col items-center justify-center text-center p-4">
            <Activity className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">No Growth Data Recorded</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Community activity will appear here as users engage.</p>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className='aspect-auto h-[240px] sm:h-[260px] w-full'
          >
            <AreaChart
              data={formattedData}
              margin={{
                left: 10,
                right: 10,
                top: 10,
                bottom: 10,
              }}
            >
              <defs>
                <linearGradient id="fillInquiriesGrowth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="fillUsersGrowth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="fillListingsGrowth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray='3 3' className="stroke-slate-200/60 dark:stroke-slate-800/60" opacity={0.6} />
              <XAxis
                dataKey='displayDate'
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                interval="preserveStartEnd"
                className="text-[11px] font-bold text-slate-500 dark:text-slate-400"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                className="text-[11px] font-bold text-slate-400 dark:text-slate-500"
              />
              <ChartTooltip
                cursor={{ stroke: '#2f7d6d', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                content={
                  <ChartTooltipContent
                    className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl text-xs font-medium"
                    indicator='dot'
                  />
                }
              />
              
              {/* Conditional Area Rendering based on selected filter */}
              {(activeFilter === 'all' || activeFilter === 'inquiries') && (
                <Area
                  dataKey='inquiries'
                  type='monotone'
                  fill='url(#fillInquiriesGrowth)'
                  stroke='#10b981'
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: 'white', stroke: '#10b981', strokeWidth: 2 }}
                  activeDot={{ r: 5, fill: '#10b981', stroke: 'white', strokeWidth: 2 }}
                />
              )}
              {(activeFilter === 'all' || activeFilter === 'users') && (
                <Area
                  dataKey='users'
                  type='monotone'
                  fill='url(#fillUsersGrowth)'
                  stroke='#3b82f6'
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: 'white', stroke: '#3b82f6', strokeWidth: 2 }}
                  activeDot={{ r: 5, fill: '#3b82f6', stroke: 'white', strokeWidth: 2 }}
                />
              )}
              {(activeFilter === 'all' || activeFilter === 'listings') && (
                <Area
                  dataKey='listings'
                  type='monotone'
                  fill='url(#fillListingsGrowth)'
                  stroke='#f59e0b'
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: 'white', stroke: '#f59e0b', strokeWidth: 2 }}
                  activeDot={{ r: 5, fill: '#f59e0b', stroke: 'white', strokeWidth: 2 }}
                />
              )}
            </AreaChart>
          </ChartContainer>
        )}

        {/* ── Interactive Legend Bar ── */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-5 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <button
            onClick={() => setActiveFilter(activeFilter === 'inquiries' ? 'all' : 'inquiries')}
            className={`flex items-center gap-2 py-1 px-3 rounded-xl transition-all cursor-pointer ${
              activeFilter === 'inquiries' || activeFilter === 'all'
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
            <span className="text-xs font-bold">Inquiries ({totals.inquiries})</span>
          </button>

          <button
            onClick={() => setActiveFilter(activeFilter === 'users' ? 'all' : 'users')}
            className={`flex items-center gap-2 py-1 px-3 rounded-xl transition-all cursor-pointer ${
              activeFilter === 'users' || activeFilter === 'all'
                ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 font-bold'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />
            <span className="text-xs font-bold">Signups ({totals.users})</span>
          </button>

          <button
            onClick={() => setActiveFilter(activeFilter === 'listings' ? 'all' : 'listings')}
            className={`flex items-center gap-2 py-1 px-3 rounded-xl transition-all cursor-pointer ${
              activeFilter === 'listings' || activeFilter === 'all'
                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
            <span className="text-xs font-bold">Listings ({totals.listings})</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

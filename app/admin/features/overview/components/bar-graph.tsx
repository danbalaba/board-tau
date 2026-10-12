'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

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
import { Badge } from "../../../components/ui/badge";
import { useExecutiveOverview } from "@/app/admin/hooks/use-executive-overview";
import { Building2, Trophy, BarChart3, ListFilter } from 'lucide-react';

export const description = 'Top Properties by Earnings';

const chartConfig = {
  revenue: {
    label: 'Earnings',
    color: '#2f7d6d'
  }
} satisfies ChartConfig;

const rankBadges = [
  { rank: 1, label: '#1', bg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  { rank: 2, label: '#2', bg: 'bg-slate-400/15 text-slate-600 dark:text-slate-300 border-slate-400/30' },
  { rank: 3, label: '#3', bg: 'bg-amber-700/15 text-amber-700 dark:text-amber-500 border-amber-700/30' },
  { rank: 4, label: '#4', bg: 'bg-[#2f7d6d]/10 text-[#2f7d6d] dark:text-emerald-400 border-[#2f7d6d]/20' },
  { rank: 5, label: '#5', bg: 'bg-[#2f7d6d]/10 text-[#2f7d6d] dark:text-emerald-400 border-[#2f7d6d]/20' },
];

export function BarGraph({ data: propData, range = '30d' }: { data?: any[], range?: string }) {
  const { data: apiResponse } = useExecutiveOverview(range);
  const data = propData || apiResponse?.data?.topProperties || [];
  const [viewMode, setViewMode] = React.useState<'list' | 'chart'>('list');

  const chartData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map((item: any, index: number) => ({
      name: item.listingTitle,
      revenue: item.revenue,
      rank: index + 1,
    }));
  }, [data]);

  const maxRevenue = React.useMemo(() => {
    if (!chartData || chartData.length === 0) return 1;
    return Math.max(...chartData.map(d => d.revenue), 1);
  }, [chartData]);

  const totalTopRevenue = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.revenue, 0);
  }, [chartData]);

  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <Card className="flex flex-col border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl shadow-xs hover:shadow-lg rounded-[24px] sm:rounded-[26px] overflow-hidden h-full transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-4 px-6 pt-6 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#2f7d6d]/10 text-[#2f7d6d] dark:bg-emerald-500/10 dark:text-emerald-400">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Top Properties by Earnings</CardTitle>
            <CardDescription className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Properties generating the highest booking revenue
            </CardDescription>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-[#2f7d6d] dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Ranked List View"
            >
              <ListFilter className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'chart'
                  ? 'bg-white dark:bg-slate-900 text-[#2f7d6d] dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Bar Chart View"
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
          </div>

          <Badge variant="outline" className="bg-[#2f7d6d]/10 text-[#2f7d6d] dark:text-emerald-400 border-[#2f7d6d]/20 font-extrabold uppercase text-[10px] h-6 px-2.5 rounded-full shadow-2xs">
            ₱{totalTopRevenue.toLocaleString()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-5 px-6 pb-6 flex-1 flex flex-col justify-center">
        {chartData.length === 0 ? (
          <div className="h-[280px] flex flex-col items-center justify-center text-center p-4">
            <Building2 className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">No Property Revenue Recorded</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Earnings from confirmed bookings will appear here.</p>
          </div>
        ) : viewMode === 'list' ? (
          /* ── Executive Ranked Leaderboard View ── */
          <div className="space-y-3">
            {chartData.slice(0, 5).map((item, index) => {
              const rankInfo = rankBadges[index] || rankBadges[4];
              const percentage = Math.round((item.revenue / maxRevenue) * 100);

              return (
                <div
                  key={index}
                  className="group relative p-3 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/80 hover:border-[#2f7d6d]/40 dark:hover:border-emerald-500/40 hover:bg-white dark:hover:bg-slate-900 transition-all duration-300"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-6 h-6 rounded-lg border text-[11px] font-black flex items-center justify-center shrink-0 ${rankInfo.bg}`}>
                        {rankInfo.label}
                      </span>
                      <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#2f7d6d] dark:group-hover:text-emerald-400 transition-colors truncate">
                        {item.name}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-black text-[#2f7d6d] dark:text-emerald-400">
                        ₱{item.revenue.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                        {percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Gradient Volume Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-200/60 dark:bg-slate-700/60 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#2f7d6d] to-emerald-400 transition-all duration-700 ease-out"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── Modern Horizontal Bar Chart View ── */
          <ChartContainer config={chartConfig} className="aspect-auto h-[280px] sm:h-[300px] w-full">
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
            >
              <defs>
                <linearGradient id="barRevenueGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#2f7d6d" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.85} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-slate-200/60 dark:stroke-slate-800/60" opacity={0.6} />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₱${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
                className="text-[11px] font-bold text-slate-400 dark:text-slate-500"
              />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
                width={120}
                className="text-[11px] font-bold text-slate-600 dark:text-slate-300"
                tickFormatter={(value) => value && value.length > 15 ? value.slice(0, 15) + '…' : value}
              />
              <ChartTooltip
                cursor={{ fill: 'rgba(47, 125, 109, 0.06)' }}
                content={
                  <ChartTooltipContent
                    className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl text-xs font-medium"
                    indicator="dot"
                    formatter={(value: any) => (
                      <span className="font-extrabold text-[#2f7d6d] dark:text-emerald-400">
                        ₱{Number(value).toLocaleString()}
                      </span>
                    )}
                  />
                }
              />
              <Bar
                dataKey="revenue"
                fill="url(#barRevenueGradient)"
                radius={[0, 8, 8, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

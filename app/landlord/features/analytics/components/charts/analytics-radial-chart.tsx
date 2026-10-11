'use client';

import * as React from 'react';
import { RadialBar, RadialBarChart, PolarAngleAxis, ResponsiveContainer } from 'recharts';
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
import { Star, MessageSquareQuote, Award } from 'lucide-react';

interface RatingItem {
  rating: string;
  value: number;
  percentage?: number;
  fill?: string;
}

interface AnalyticsRadialChartProps {
  data?: RatingItem[];
  propertyName?: string;
  isSingleProperty?: boolean;
  averageRating?: number;
  totalReviews?: number;
}

const colors = [
  '#2f7d6d', // 5 Star - BoardTAU Teal
  '#1473E6', // 4 Star - Tech Blue
  '#F59E0B', // 3 Star - Warm Amber
  '#8B5CF6', // 2 Star - Purple
  '#EC4899', // 1 Star - Rose
];

const defaultRatingData: RatingItem[] = [
  { rating: '5 Star', value: 0, percentage: 0 },
  { rating: '4 Star', value: 0, percentage: 0 },
  { rating: '3 Star', value: 0, percentage: 0 },
  { rating: '2 Star', value: 0, percentage: 0 },
  { rating: '1 Star', value: 0, percentage: 0 },
];

const chartConfig = {
  value: {
    label: 'Reviews',
    color: '#2f7d6d',
  },
} satisfies ChartConfig;

export function AnalyticsRadialChart({
  data = [],
  propertyName = 'All Properties Portfolio',
  isSingleProperty = false,
  averageRating = 0,
  totalReviews = 0,
}: AnalyticsRadialChartProps) {
  const [metricView, setMetricView] = React.useState<'count' | 'percentage'>('count');

  const processedData = React.useMemo(() => {
    const raw = data && data.length > 0 ? data : defaultRatingData;
    return raw.map((d, i) => ({
      ...d,
      fill: d.fill || colors[i % colors.length],
      displayValue: metricView === 'percentage' ? (d.percentage ?? 0) : d.value,
    }));
  }, [data, metricView]);

  const maxVal = Math.max(...processedData.map((d) => d.displayValue), 1);
  const chartDomain = [0, maxVal * 1.15] as [number, number];

  const title = isSingleProperty
    ? `${propertyName} — Rating Distribution`
    : 'Portfolio Rating Distribution';

  const subtitle =
    totalReviews > 0
      ? `Breakdown of ${totalReviews} verified student ${totalReviews === 1 ? 'review' : 'reviews'}`
      : 'Sentiment across verified student reviews';

  return (
    <Card className="bg-transparent border-none shadow-none pt-0 pb-0">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 px-0! pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              {title}
            </CardTitle>
          </div>
          <CardDescription className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {subtitle}
          </CardDescription>
        </div>

        {/* Right side controls: Average Rating Score badge & Metric toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {averageRating > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 text-amber-700 dark:text-amber-300 text-xs font-black">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>{averageRating.toFixed(1)} ★</span>
            </div>
          )}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/80 p-0.5 border border-slate-200/60 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => setMetricView('count')}
              className={`px-2.5 py-0.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                metricView === 'count'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Count
            </button>
            <button
              type="button"
              onClick={() => setMetricView('percentage')}
              className={`px-2.5 py-0.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                metricView === 'percentage'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              %
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-0! pt-4">
        {totalReviews === 0 ? (
          <div className="flex flex-col items-center justify-center h-[230px] w-full text-center px-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mb-2.5">
              <MessageSquareQuote className="w-6 h-6 opacity-75" />
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              No verified reviews recorded yet
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[240px] mt-1">
              {isSingleProperty
                ? `Student tenants who complete stays at ${propertyName} can submit verified reviews.`
                : 'Reviews from completed stays across your properties will appear here.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            {/* Radial Bar Chart */}
            <div className="sm:col-span-6 flex items-center justify-center">
              <ChartContainer
                config={chartConfig}
                className="aspect-square h-[200px] w-full max-w-[210px]"
              >
                <RadialBarChart
                  data={processedData}
                  innerRadius="24%"
                  outerRadius="92%"
                  barSize={9}
                  startAngle={180}
                  endAngle={-180}
                >
                  <PolarAngleAxis
                    type="number"
                    domain={chartDomain}
                    angleAxisId={0}
                    tick={false}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        className="w-[165px] p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl"
                        indicator="dot"
                        nameKey="rating"
                        formatter={(value: any, name: any, item: any) => {
                          const payload = item?.payload as RatingItem;
                          const count = payload?.value ?? value;
                          const pct = payload?.percentage ?? 0;
                          return [`${count} reviews (${pct}%)`, payload?.rating || name];
                        }}
                      />
                    }
                  />
                  <RadialBar
                    dataKey="displayValue"
                    cornerRadius={6}
                    background={{ fill: 'var(--primary)', opacity: 0.05 }}
                  />
                </RadialBarChart>
              </ChartContainer>
            </div>

            {/* Structured Star Progress Breakdown */}
            <div className="sm:col-span-6 space-y-2 pr-1">
              {processedData.map((item, idx) => {
                const pct = item.percentage ?? 0;
                return (
                  <div key={item.rating} className="flex items-center gap-2.5 text-xs">
                    <span className="w-12 font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 shrink-0">
                      <span>{item.rating.replace(' Star', '')}</span>
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    </span>

                    {/* Progress Track */}
                    <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: item.fill || colors[idx % colors.length],
                        }}
                      />
                    </div>

                    {/* Number / % Label */}
                    <span className="min-w-[4.5rem] sm:min-w-[5rem] text-right font-extrabold text-[11px] text-slate-600 dark:text-slate-400 tabular-nums shrink-0">
                      {metricView === 'count'
                        ? `${item.value} ${item.value === 1 ? 'review' : 'reviews'}`
                        : `${pct}%`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AnalyticsRadialChart;

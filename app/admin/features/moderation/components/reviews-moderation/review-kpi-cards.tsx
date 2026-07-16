'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { 
  MessageSquare, 
  Clock, 
  Star, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/app/admin/components/ui/tooltip';

interface ReviewKPICardsProps {
  total: number;
  pending: number;
  averageRating: string | number;
  rejected: number;
  totalLastWeek: number;
  pendingLastWeek: number;
  rejectedLastWeek: number;
  isLoading?: boolean;
  range?: string;
}

function computeTrend(current: number, previous: number) {
  if (previous === 0 && current === 0) {
    return { label: 'No data', direction: 'stable' as const, color: 'text-blue-500', bg: 'bg-blue-500/10', icon: Minus };
  }
  if (previous === 0) {
    return { 
      label: `+${current}`, 
      direction: 'up' as const, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10', 
      icon: ArrowUpRight 
    };
  }

  const pct = ((current - previous) / previous) * 100;
  const isStable = Math.abs(pct) < 1;

  if (isStable) {
    return { label: 'Stable', direction: 'stable' as const, color: 'text-blue-500', bg: 'bg-blue-500/10', icon: Minus };
  }

  const isUp = pct > 0;
  const isGood = isUp;

  return {
    label: `${isUp ? '+' : ''}${pct.toFixed(1)}%`,
    direction: isUp ? 'up' as const : 'down' as const,
    color: isGood ? 'text-emerald-500' : 'text-rose-500',
    bg: isGood ? 'bg-emerald-500/10' : 'bg-rose-500/10',
    icon: isUp ? ArrowUpRight : ArrowDownRight,
  };
}

export function ReviewKPICards({ 
  total, pending, averageRating, rejected, 
  totalLastWeek, pendingLastWeek, rejectedLastWeek, 
  isLoading, range 
}: ReviewKPICardsProps) {
  const getRangeLabel = (r?: string) => {
    switch (r) {
      case '7d': return 'last 7 days';
      case '90d': return 'last 90 days';
      case '1y': return 'past year';
      case '30d':
      default: return 'last 30 days';
    }
  };

  const generateTrendData = (val: number, isLoad: boolean) => {
    if (isLoad || val === 0) return [{ v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }];
    return [
      { v: val * 0.8 }, { v: val * 0.85 }, { v: val * 0.82 },
      { v: val * 0.9 }, { v: val * 0.88 }, { v: val * 0.95 }, { v: val }
    ];
  };

  const kpis = [
    { 
      label: 'Total Reviews', 
      value: total, 
      icon: MessageSquare, 
      color: 'text-blue-500', 
      bg: 'bg-blue-500/10', 
      chartColor: '#3b82f6', 
      trendData: generateTrendData(total, !!isLoading),
      trend: computeTrend(total, totalLastWeek),
      tooltip: {
        title: 'Total Reviews',
        description: 'Total number of reviews across the platform.',
        detail: 'Overall platform feedback.',
      }
    },
    { 
      label: 'Pending Moderation', 
      value: pending, 
      icon: Clock, 
      color: 'text-amber-500', 
      bg: 'bg-amber-500/10', 
      chartColor: '#f59e0b', 
      trendData: generateTrendData(pending, !!isLoading),
      trend: computeTrend(pending, pendingLastWeek),
      tooltip: {
        title: 'Pending Moderation',
        description: 'Reviews that are awaiting administrative action.',
        detail: 'Requires verification.',
      }
    },
    { 
      label: 'Average Rating', 
      value: averageRating, 
      icon: Star, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10', 
      chartColor: '#10b981', 
      trendData: generateTrendData(Number(averageRating), !!isLoading),
      trend: { label: 'Stable', direction: 'stable' as const, color: 'text-blue-500', bg: 'bg-blue-500/10', icon: Minus },
      tooltip: {
        title: 'Average Rating',
        description: 'The global average rating out of 5 stars.',
        detail: 'Global score.',
      }
    },
    { 
      label: 'Flagged Content', 
      value: rejected, 
      icon: AlertTriangle, 
      color: 'text-rose-500', 
      bg: 'bg-rose-500/10', 
      chartColor: '#f43f5e', 
      trendData: generateTrendData(rejected, !!isLoading),
      trend: computeTrend(rejected, rejectedLastWeek),
      tooltip: {
        title: 'Flagged Content',
        description: 'Reviews flagged by users or system filters.',
        detail: 'Requires attention or has been removed.',
      }
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <TooltipProvider delayDuration={100}>
        {kpis.map((kpi, i) => {
          const TrendIcon = kpi.trend.icon;
          return (
            <Tooltip key={kpi.label}>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative cursor-default h-full"
                >
                  <Card className="relative overflow-hidden border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-xl rounded-[2.5rem] transition-all hover:bg-white/50 dark:hover:bg-gray-900/50 hover:shadow-2xl h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 flex-none z-10 relative">
                      <CardTitle className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                        {kpi.label}
                      </CardTitle>
                      <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110 shadow-sm", kpi.bg)}>
                        <kpi.icon className={cn("h-5 w-5", kpi.color)} />
                      </div>
                    </CardHeader>
                    <CardContent className="pb-0 flex-1 flex flex-col justify-between z-10 relative">
                      <div className="flex flex-col">
                        <div className="text-4xl font-black tabular-nums tracking-tighter text-gray-900 dark:text-white mb-2">
                          {isLoading ? (
                            <div className="h-10 w-20 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-xl" />
                          ) : (
                            kpi.value.toLocaleString()
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {isLoading ? (
                            <div className="h-5 w-16 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
                          ) : (
                            <div className={cn("flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest", kpi.trend.bg, kpi.trend.color)}>
                              <TrendIcon className="w-3 h-3" />
                              {kpi.trend.label}
                            </div>
                          )}
                          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest bg-gray-50 dark:bg-gray-800/50 px-2 py-0.5 rounded-lg">
                            vs {getRangeLabel(range)}
                          </span>
                        </div>
                      </div>
                      <div className="h-24 w-full mt-6 -mx-6 mb-[-1px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={kpi.trendData}>
                            <defs>
                              <linearGradient id={`gradient-${i}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={kpi.chartColor} stopOpacity={0.25} />
                                <stop offset="100%" stopColor={kpi.chartColor} stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <Area
                              type="monotone"
                              dataKey="v"
                              stroke={kpi.chartColor}
                              strokeWidth={3}
                              fill={`url(#gradient-${i})`}
                              isAnimationActive={!isLoading}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="max-w-[220px] p-0 border-0 shadow-2xl rounded-2xl overflow-hidden"
              >
                <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={cn("p-1.5 rounded-lg", kpi.bg)}>
                      <kpi.icon className={cn("h-3.5 w-3.5", kpi.color)} />
                    </div>
                    <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">
                      {kpi.tooltip.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                    {kpi.tooltip.description}
                  </p>
                  <div className="pt-1 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500">
                      {kpi.tooltip.detail}
                    </p>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </div>
  );
}

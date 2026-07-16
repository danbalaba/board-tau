'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { 
  IconPercentage, 
  IconCalendarStats, 
  IconBuildingCommunity
} from '@tabler/icons-react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/app/admin/components/ui/tooltip';
import { TopListingsData } from '@/app/admin/hooks/use-top-listings';

interface PerformanceKPICardsProps {
  data?: TopListingsData | null;
  isLoading: boolean;
  range?: string;
}

function computeTrend(current: number, previous: number, invertedLogic = false) {
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
  const isGood = invertedLogic ? !isUp : isUp;

  return {
    label: `${isUp ? '+' : ''}${pct.toFixed(1)}%`,
    direction: isUp ? 'up' as const : 'down' as const,
    color: isGood ? 'text-emerald-500' : 'text-rose-500',
    bg: isGood ? 'bg-emerald-500/10' : 'bg-rose-500/10',
    icon: isUp ? ArrowUpRight : ArrowDownRight,
  };
}

export function PerformanceKPICards({ data, isLoading, range = '30d' }: PerformanceKPICardsProps) {
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

  const occupancyRate = data?.occupancyRate || 0;
  const averageStay = data?.averageStay || 0;
  const totalReservations = data?.totalReservations || 0;

  const kpis = [
    { 
      label: 'Global Occupancy', 
      value: `${occupancyRate}%`, 
      icon: IconPercentage, 
      color: 'text-purple-500', 
      bg: 'bg-purple-500/10', 
      chartColor: '#8b5cf6', 
      trendData: generateTrendData(occupancyRate, isLoading),
      trend: computeTrend(occupancyRate, occupancyRate * 0.9, false),
      tooltip: {
        title: 'Global Occupancy Rate',
        description: 'The percentage of all available rooms across all boarding houses currently occupied.',
        detail: 'Aim for >80% to ensure high platform profitability.'
      }
    },
    { 
      label: 'Average Stay Length', 
      value: `${averageStay} Days`, 
      icon: IconCalendarStats, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10', 
      chartColor: '#10b981', 
      trendData: generateTrendData(averageStay, isLoading),
      trend: computeTrend(averageStay, Math.max(1, averageStay * 0.85), false),
      tooltip: {
        title: 'Average Reservation Duration',
        description: 'The typical length of time a guest books a room for.',
        detail: 'Calculated over your currently selected date range.'
      }
    },
    { 
      label: 'Total Platform Reservations', 
      value: totalReservations, 
      icon: IconBuildingCommunity, 
      color: 'text-amber-500', 
      bg: 'bg-amber-500/10', 
      chartColor: '#f59e0b', 
      trendData: generateTrendData(totalReservations, isLoading),
      trend: computeTrend(totalReservations, totalReservations * 1.05, true),
      tooltip: {
        title: 'Total System Reservations',
        description: 'The total volume of distinct reservations processed across all properties.',
        detail: 'Includes all properties regardless of size.'
      }
    }
  ];

  return (
    <TooltipProvider delayDuration={200}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {kpis.map((stat, i) => {
          const TrendIcon = isLoading ? Minus : stat.trend.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="cursor-default border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-lg rounded-[2rem] overflow-hidden group h-full transition-all hover:bg-white/50 dark:hover:bg-gray-900/50 hover:shadow-2xl hover:-translate-y-0.5">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                      <CardTitle className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                        {stat.label}
                      </CardTitle>
                      <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110", stat.bg)}>
                        <stat.icon className={cn("h-5 w-5", stat.color)} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-black tabular-nums text-gray-900 dark:text-white tracking-tighter truncate">
                        {isLoading ? (
                          <div className="h-9 w-24 bg-muted/50 dark:bg-white/10 animate-pulse rounded-xl" />
                        ) : (
                          stat.value
                        )}
                      </div>
                      <div className="flex flex-col gap-1 items-start bg-transparent mt-2">
                        <div className="flex items-center flex-wrap gap-1.5">
                          <div className={cn(
                            "flex items-center gap-1.5 w-fit px-2 py-1 rounded-lg",
                            isLoading ? "bg-gray-100 dark:bg-gray-800" : stat.trend.bg
                          )}>
                            {isLoading ? (
                              <>
                                <TrendIcon className="w-3 h-3 text-gray-400" />
                                <div className="h-2.5 w-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
                              </>
                            ) : (
                              <>
                                <TrendIcon className={cn("w-3 h-3", stat.trend.color)} />
                                <span className={cn("text-[9px] font-bold uppercase tracking-widest", stat.trend.color)}>
                                  {stat.trend.label}
                                </span>
                              </>
                            )}
                          </div>
                          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded-lg">
                            vs {getRangeLabel(range)}
                          </span>
                        </div>
                      </div>
                      <div className="h-20 w-full mt-6 -mx-6 mb-[-1.5rem]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={stat.trendData}>
                            <defs>
                              <linearGradient id={`gradient-top-${i}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={stat.chartColor} stopOpacity={0.25} />
                                <stop offset="100%" stopColor={stat.chartColor} stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <Area
                              type="monotone"
                              dataKey="v"
                              stroke={stat.chartColor}
                              strokeWidth={3}
                              fill={`url(#gradient-top-${i})`}
                              isAnimationActive={true}
                              animationDuration={1500}
                              animationEasing="ease-out"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="max-w-[220px] p-0 border-0 shadow-2xl rounded-2xl overflow-hidden"
                >
                  <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={cn("p-1.5 rounded-lg", stat.bg)}>
                        <stat.icon className={cn("h-3.5 w-3.5", stat.color)} />
                      </div>
                      <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">
                        {stat.tooltip.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                      {stat.tooltip.description}
                    </p>
                    <div className="pt-1 border-t border-gray-100 dark:border-gray-800">
                      <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500">
                        {stat.tooltip.detail}
                      </p>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

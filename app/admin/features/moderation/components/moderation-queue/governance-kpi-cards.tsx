'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { 
  IconHome, 
  IconStar, 
  IconUserPlus, 
  IconInbox,
  IconMinus,
  IconArrowUpRight,
  IconArrowDownRight
} from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/app/admin/components/ui/tooltip';

// ─── Trend calculation helper ────────────────────────────────────────────────
function computeTrend(current: number, previous: number, invertedLogic = false) {
  if (previous === 0 && current === 0) {
    return { label: 'No data', direction: 'stable' as const, color: 'text-blue-500', bg: 'bg-blue-500/10', icon: IconMinus };
  }
  if (previous === 0) {
    // If it went from 0 to something, show the absolute increase in green
    return { 
      label: `+${current}`, 
      direction: 'up' as const, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10', 
      icon: IconArrowUpRight 
    };
  }

  const pct = ((current - previous) / previous) * 100;
  const isStable = Math.abs(pct) < 1;

  if (isStable) {
    return { label: 'Stable', direction: 'stable' as const, color: 'text-blue-500', bg: 'bg-blue-500/10', icon: IconMinus };
  }

  const isUp = pct > 0;
  // User prefers up=green and down=red for consistency, regardless of whether a larger queue is 'bad'
  const isGood = isUp;

  return {
    label: `${isUp ? '+' : ''}${pct.toFixed(1)}%`,
    direction: isUp ? 'up' as const : 'down' as const,
    color: isGood ? 'text-emerald-500' : 'text-rose-500',
    bg: isGood ? 'bg-emerald-500/10' : 'bg-rose-500/10',
    icon: isUp ? IconArrowUpRight : IconArrowDownRight,
  };
}

interface ModerationKPICardsProps {
  totalPending: number;
  pendingListings: number;
  pendingReviews: number;
  pendingHosts: number;
  totalLastWeek: number;
  pendingListingsLastWeek: number;
  pendingReviewsLastWeek: number;
  pendingHostsLastWeek: number;
  isLoading?: boolean;
  range?: string;
}

export function GovernanceKPICards({ 
  totalPending, 
  pendingListings, 
  pendingReviews, 
  pendingHosts,
  totalLastWeek,
  pendingListingsLastWeek,
  pendingReviewsLastWeek,
  pendingHostsLastWeek,
  isLoading,
  range = '30d'
}: ModerationKPICardsProps) {
  
  const generateTrendData = (val: number, isLoad: boolean = false) => {
    if (isLoad || val === 0) return [{ v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }];
    return [
      { v: val * 0.8 }, { v: val * 0.85 }, { v: val * 0.82 }, 
      { v: val * 0.9 }, { v: val * 0.88 }, { v: val * 0.95 }, { v: val }
    ];
  };

  const getRangeLabel = (r: string) => {
    switch (r) {
      case '7d': return 'last 7 days';
      case '90d': return 'last 90 days';
      case '1y': return 'past year';
      case '30d':
      default: return 'last 30 days';
    }
  };

  const kpis = [
    {
      label: 'Total Pending',
      value: totalPending,
      trend: computeTrend(totalPending, totalLastWeek, true),
      icon: IconInbox,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
      chartColor: '#6366f1',
      trendData: generateTrendData(totalPending, isLoading),
      tooltip: {
        title: 'Total Pending Tasks',
        description: 'Sum of all items awaiting system administrator review across the platform.',
        detail: 'Includes listings, reviews, and host profiles.',
      },
    },
    {
      label: 'Pending Listings',
      value: pendingListings,
      trend: computeTrend(pendingListings, pendingListingsLastWeek, true),
      icon: IconHome,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      chartColor: '#10b981',
      trendData: generateTrendData(pendingListings, isLoading),
      tooltip: {
        title: 'Pending Listings',
        description: 'Properties submitted by landlords waiting for authorization.',
        detail: 'Review these promptly to help landlords start earning.',
      },
    },
    {
      label: 'Pending Reviews',
      value: pendingReviews,
      trend: computeTrend(pendingReviews, pendingReviewsLastWeek, true),
      icon: IconStar,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      chartColor: '#f59e0b',
      trendData: generateTrendData(pendingReviews, isLoading),
      tooltip: {
        title: 'Pending Reviews',
        description: 'User feedback and ratings awaiting moderation.',
        detail: 'Check for inappropriate content before approving.',
      },
    },
    {
      label: 'Pending Hosts',
      value: pendingHosts,
      trend: computeTrend(pendingHosts, pendingHostsLastWeek, true),
      icon: IconUserPlus,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      chartColor: '#8b5cf6',
      trendData: generateTrendData(pendingHosts, isLoading),
      tooltip: {
        title: 'Pending Hosts',
        description: 'Landlords waiting for business verification and approval.',
        detail: 'Verify their submitted documents and identity.',
      },
    },
  ];

  return (
    <TooltipProvider delayDuration={200}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((stat, i) => {
          const TrendIcon = stat.trend.icon;
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
                      <div className="text-3xl font-black tabular-nums text-gray-900 dark:text-white tracking-tighter">
                        {isLoading ? (
                          <div className="h-9 w-16 bg-muted/50 dark:bg-white/10 animate-pulse rounded-xl" />
                        ) : (
                          stat.value.toLocaleString()
                        )}
                      </div>
                      <div className="flex flex-col gap-1 items-start bg-transparent mt-2">
                        <div className="flex items-center flex-wrap gap-1.5">
                          <div className={cn(
                            "flex items-center gap-1.5 w-fit px-2 py-1 rounded-lg",
                            stat.trend.bg
                          )}>
                            <TrendIcon className={cn("w-3 h-3", stat.trend.color)} />
                            <span className={cn("text-[9px] font-bold uppercase tracking-widest", stat.trend.color)}>
                              {stat.trend.label}
                            </span>
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
                              <linearGradient id={`gradient-mod-${i}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={stat.chartColor} stopOpacity={0.25} />
                                <stop offset="100%" stopColor={stat.chartColor} stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <Area
                              type="monotone"
                              dataKey="v"
                              stroke={stat.chartColor}
                              strokeWidth={3}
                              fill={`url(#gradient-mod-${i})`}
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

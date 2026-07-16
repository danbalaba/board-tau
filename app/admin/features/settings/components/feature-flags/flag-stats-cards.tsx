import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui/card';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Flag, Zap, PowerOff, TrendingUp } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/app/admin/components/ui/tooltip';
import type { PlatformMetricSnapshot } from '@/app/admin/hooks/use-feature-flags';

interface FlagStatsCardsProps {
  total: number;
  active: number;
  inactive: number;
  history?: PlatformMetricSnapshot[];
}

export function FlagStatsCards({ total, active, inactive, history = [] }: FlagStatsCardsProps) {
  const getTrendData = (type: 'totalFeatureFlags' | 'activeFeatureFlags' | 'inactiveFeatureFlags', currentVal: number) => {
    // If we don't have enough history, generate a flatline of current value
    if (!history || history.length === 0) {
      return [{ v: currentVal }, { v: currentVal }];
    }
    const data = history.map(snap => ({ v: snap[type] }));
    // Append the current live value as the final point to keep the chart perfectly up to date
    data.push({ v: currentVal });
    return data;
  };

  const stats = [
    { 
      label: 'Total Flags', 
      value: total, 
      color: 'text-blue-500', 
      bg: 'bg-blue-500/10',
      chartColor: '#3b82f6',
      icon: Flag,
      trendData: getTrendData('totalFeatureFlags', total),
      tooltip: { title: 'Total Features', desc: 'All registered platform features and global settings.' }
    },
    { 
      label: 'Active Features', 
      value: active, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10',
      chartColor: '#10b981',
      icon: Zap,
      trendData: getTrendData('activeFeatureFlags', active),
      tooltip: { title: 'Active Features', desc: 'Features that are currently turned ON.' }
    },
    { 
      label: 'Inactive Features', 
      value: inactive, 
      color: 'text-gray-400', 
      bg: 'bg-gray-500/10',
      chartColor: '#9ca3af',
      icon: PowerOff,
      trendData: getTrendData('inactiveFeatureFlags', inactive),
      tooltip: { title: 'Inactive Features', desc: 'Features that are currently turned OFF.' }
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <TooltipProvider delayDuration={100}>
        {stats.map((s, i) => (
          <Tooltip key={s.label}>
            <TooltipTrigger asChild>
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="group relative cursor-default h-full"
              >
                <Card className="relative overflow-hidden border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-xl rounded-[2.5rem] transition-all hover:bg-white/50 dark:hover:bg-gray-900/50 hover:shadow-2xl flex flex-col h-full">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 flex-none z-10 relative">
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                      {s.label}
                    </CardTitle>
                    <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110 shadow-sm", s.bg)}>
                      <s.icon className={cn("h-5 w-5", s.color)} />
                    </div>
                  </CardHeader>
                  <CardContent className="pb-0 flex-1 flex flex-col justify-between z-10 relative">
                    <div className="flex flex-col">
                      <div className="text-4xl font-black tabular-nums tracking-tighter text-gray-900 dark:text-white mb-2">
                        {s.value}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className={cn("flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest", s.bg, s.color)}>
                          <TrendingUp className="w-3 h-3" />
                          Stable
                        </div>
                      </div>
                    </div>
                    <div className="h-24 w-full mt-6 -mx-6 mb-[-1px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={s.trendData}>
                          <defs>
                            <linearGradient id={`gradient-flag-${i}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={s.chartColor} stopOpacity={0.25} />
                              <stop offset="100%" stopColor={s.chartColor} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <Area
                            type="monotone"
                            dataKey="v"
                            stroke={s.chartColor}
                            strokeWidth={3}
                            fill={`url(#gradient-flag-${i})`}
                            isAnimationActive={true}
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
                  <div className={cn("p-1.5 rounded-lg", s.bg)}>
                    <s.icon className={cn("h-3.5 w-3.5", s.color)} />
                  </div>
                  <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">
                    {s.tooltip.title}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                  {s.tooltip.desc}
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
}

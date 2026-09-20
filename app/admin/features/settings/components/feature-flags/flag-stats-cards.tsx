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
      badgeText: `${total} Configured`,
      trendData: getTrendData('totalFeatureFlags', total),
      tooltip: { title: 'Total Feature Flags', desc: 'All registered platform feature toggles and capability settings.' }
    },
    { 
      label: 'Active Features', 
      value: active, 
      color: 'text-primary dark:text-emerald-400', 
      bg: 'bg-primary/10',
      chartColor: '#2f7d6d',
      icon: Zap,
      badgeText: `${active} Active Now`,
      trendData: getTrendData('activeFeatureFlags', active),
      tooltip: { title: 'Active Features', desc: 'Features that are currently turned ON for users.' }
    },
    { 
      label: 'Inactive Features', 
      value: inactive, 
      color: 'text-slate-500 dark:text-slate-400', 
      bg: 'bg-slate-500/10',
      chartColor: '#64748b',
      icon: PowerOff,
      badgeText: `${inactive} Disabled`,
      trendData: getTrendData('inactiveFeatureFlags', inactive),
      tooltip: { title: 'Inactive Features', desc: 'Features that are currently turned OFF.' }
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <TooltipProvider delayDuration={100}>
        {stats.map((s, i) => (
          <Tooltip key={s.label}>
            <TooltipTrigger asChild>
              <motion.div 
                initial={{ opacity: 0, y: 16 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: i * 0.08 }}
                className="group relative cursor-default h-full"
              >
                <Card className="cursor-default border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-md rounded-2xl overflow-hidden group h-full transition-all hover:bg-white/50 dark:hover:bg-gray-900/50 hover:shadow-xl hover:-translate-y-0.5 p-5">
                  <div className="flex flex-row items-center justify-between pb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                      {s.label}
                    </span>
                    <div className={cn("p-2.5 rounded-xl transition-transform group-hover:scale-110", s.bg)}>
                      <s.icon className={cn("h-4 w-4", s.color)} />
                    </div>
                  </div>

                  <div>
                    <div className="text-2xl font-black tabular-nums text-gray-900 dark:text-white tracking-tight">
                      {s.value}
                    </div>

                    <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
                      <div className={cn("flex items-center gap-1.5 w-fit px-2 py-0.5 rounded-md", s.bg)}>
                        <TrendingUp className={cn("w-3 h-3", s.color)} />
                        <span className={cn("text-[9px] font-bold uppercase tracking-widest", s.color)}>
                          {s.badgeText}
                        </span>
                      </div>
                    </div>

                    {/* Sparkline Area Chart */}
                    <div className="h-14 w-full mt-3 -mx-5 -mb-5">
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
                            strokeWidth={2.5}
                            fill={`url(#gradient-flag-${i})`}
                            isAnimationActive={true}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
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

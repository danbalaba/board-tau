'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Clock, CheckSquare, Zap, Target } from 'lucide-react';

interface GovernanceKPICardsProps {
  totalBacklog: number;
  resolutionRate: string;
  activeModerators: number;
}

export function GovernanceKPICards({ totalBacklog, resolutionRate, activeModerators }: GovernanceKPICardsProps) {
  const generateTrend = (val: number) => [
    { v: val * 0.9 }, { v: val * 1.0 }, { v: val * 0.95 },
    { v: val * 1.1 }, { v: val * 1.05 }, { v: val * 1.15 }, { v: val }
  ];

  const stats = [
    { title: 'Queue Backlog', value: totalBacklog.toLocaleString(), description: 'Awaiting review', icon: Clock, trend: '+4', trendDir: 'up', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10', chartColor: '#6366f1', trendData: generateTrend(totalBacklog) },
    { title: 'Resolution Rate', value: resolutionRate, description: 'System efficiency', icon: Target, trend: '+2.1%', trendDir: 'up', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', chartColor: '#10b981', trendData: generateTrend(94) },
    { title: 'System Throughput', value: '1.2s', description: 'Avg response time', icon: Zap, trend: '-150ms', trendDir: 'down', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', chartColor: '#f59e0b', trendData: generateTrend(120) },
    { title: 'Active Oversight', value: activeModerators.toLocaleString(), description: 'Moderators online', icon: CheckSquare, trend: 'Normal', trendDir: 'up', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10', chartColor: '#8b5cf6', trendData: generateTrend(activeModerators) },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="group relative bg-white dark:bg-gray-900 rounded-[24px] border border-gray-100 dark:border-gray-800 p-6 hover:shadow-xl hover:border-primary/20 transition-all duration-500 shadow-sm overflow-hidden h-full">
            <div className="flex items-start justify-between mb-4">
              <div className={cn('w-12 h-12 rounded-[18px] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm', stat.bg, stat.color)}>
                <stat.icon className="w-5 h-5" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{stat.title}</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter group-hover:text-primary transition-colors">{stat.value}</p>
              <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/50 w-fit px-2 py-0.5 rounded-lg">
                <span className={cn('text-[11px] font-bold', stat.trendDir === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>{stat.trend}</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{stat.description}</span>
              </div>
            </div>
            <div className="h-12 w-full mt-4 -mx-6 opacity-20 group-hover:opacity-50 transition-all duration-700">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stat.trendData}>
                  <defs>
                    <linearGradient id={`ggradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={stat.chartColor} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={stat.chartColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke={stat.chartColor} strokeWidth={2} fill={`url(#ggradient-${index})`} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

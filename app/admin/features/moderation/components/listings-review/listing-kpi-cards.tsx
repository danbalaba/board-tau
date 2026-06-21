'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Home, AlertTriangle, CheckSquare, Clock } from 'lucide-react';

interface ListingKPICardsProps {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export function ListingKPICards({ total, pending, approved, rejected }: ListingKPICardsProps) {
  const generateTrend = (val: number) => [
    { v: val * 0.7 }, { v: val * 0.9 }, { v: val * 0.8 },
    { v: val * 1.1 }, { v: val * 0.95 }, { v: val * 1.05 }, { v: val }
  ];

  const stats = [
    { title: 'Active Listings', value: approved.toLocaleString(), description: 'Market supply', icon: Home, trend: '+15%', trendDir: 'up', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', chartColor: '#10b981', trendData: generateTrend(approved) },
    { title: 'Pending Approval', value: pending.toLocaleString(), description: 'Require review', icon: Clock, trend: '+24%', trendDir: 'up', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', chartColor: '#f59e0b', trendData: generateTrend(pending) },
    { title: 'Flagged Content', value: (total - approved - pending - rejected).toLocaleString(), description: 'User reported', icon: AlertTriangle, trend: '-12%', trendDir: 'down', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10', chartColor: '#f43f5e', trendData: generateTrend(5) },
    { title: 'Processed Today', value: (approved + rejected).toLocaleString(), description: 'Review efficiency', icon: CheckSquare, trend: '+45%', trendDir: 'up', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10', chartColor: '#8b5cf6', trendData: generateTrend(approved + rejected) },
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
                    <linearGradient id={`lgradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={stat.chartColor} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={stat.chartColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke={stat.chartColor} strokeWidth={2} fill={`url(#lgradient-${index})`} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

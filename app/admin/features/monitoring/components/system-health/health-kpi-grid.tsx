import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui/card';
import { IconActivity, IconCircleCheck, IconCpu, IconAlertTriangle } from '@tabler/icons-react';
import { cn } from '@/app/admin/lib/utils';

const kpis = [
  {
    label: "Network Latency",
    value: "124ms",
    trend: "Optimal",
    trendColor: "text-emerald-500",
    icon: IconActivity,
    bg: "bg-emerald-500/10",
    color: "text-emerald-500"
  },
  {
    label: "Uptime Score",
    value: "99.98%",
    trend: "+0.02%",
    trendColor: "text-emerald-500",
    icon: IconCircleCheck,
    bg: "bg-violet-500/10",
    color: "text-violet-500"
  },
  {
    label: "Active Load",
    value: "42.5%",
    trend: "Stable",
    trendColor: "text-gray-500",
    icon: IconCpu,
    bg: "bg-indigo-500/10",
    color: "text-indigo-500"
  },
  {
    label: "Alerts (24h)",
    value: "3",
    trend: "1 Pending",
    trendColor: "text-amber-500",
    icon: IconAlertTriangle,
    bg: "bg-amber-500/10",
    color: "text-amber-500"
  }
];

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function HealthKPIGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((stat, i) => (
        <motion.div key={i} variants={item}>
          <Card className="group relative overflow-hidden border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-xl rounded-[2rem] transition-all hover:bg-white/50 dark:hover:bg-gray-900/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-gray-500">{stat.label}</CardTitle>
              <div className={cn("rounded-2xl p-3 transition-transform group-hover:scale-110 shadow-sm", stat.bg)}>
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black tracking-tight tabular-nums text-gray-900 dark:text-white">{stat.value}</div>
              <div className="mt-2 flex items-center space-x-2">
                <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800", stat.trendColor)}>{stat.trend}</span>
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Global Status</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

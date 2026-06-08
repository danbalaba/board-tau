import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui/card';
import { IconDatabase, IconBolt, IconLayersIntersect, IconAlertTriangle } from '@tabler/icons-react';
import { cn } from '@/app/admin/lib/utils';

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function DBKPIGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[
        { label: 'Hyper-Pool Conn', value: '160', peak: '200', icon: IconDatabase, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Queries / Sec', value: '245', peak: '310', icon: IconBolt, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { label: 'Cache Hit Rate', value: '88%', peak: '92%', icon: IconLayersIntersect, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Slow Traces', value: '12', peak: '156', icon: IconAlertTriangle, color: 'text-rose-500', bg: 'bg-rose-500/10' }
      ].map((stat, i) => (
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
              <div className="mt-2 flex items-center justify-between text-[9px] font-black text-gray-400 uppercase tracking-widest">
                <span>Peak Ops: <span className="text-gray-700 dark:text-gray-300">{stat.peak}</span></span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

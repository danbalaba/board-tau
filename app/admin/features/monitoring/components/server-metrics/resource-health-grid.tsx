import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui/card';
import { IconActivity, IconCloud } from '@tabler/icons-react';
import { cn } from '@/app/admin/lib/utils';

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function ResourceHealthGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        { label: 'Engine Load', value: '12%', peak: '45%', icon: IconActivity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Active Tasks', value: '12', peak: '24', icon: IconActivity, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { label: 'Pool Health', value: '99.9%', peak: '100%', icon: IconCloud, color: 'text-violet-500', bg: 'bg-violet-500/10' }
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
              <div className="mt-2 flex items-center space-x-2">
                <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800", stat.color)}>Peak: {stat.peak}</span>
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Health Sync</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

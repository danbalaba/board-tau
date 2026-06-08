import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui/card';
import { IconCpu, IconServer, IconDatabase } from '@tabler/icons-react';
import { cn } from '@/app/admin/lib/utils';

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function ServerKPIGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        { label: 'CPU Cluster Usage', value: '80%', peak: '95%', avg: '72%', icon: IconCpu, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Memory Allocation', value: '64 GB', peak: '58 GB', avg: '42 GB', icon: IconServer, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Storage Cluster', value: '2.4 TB', peak: '2.1 TB', avg: '1.8 TB', icon: IconDatabase, color: 'text-amber-500', bg: 'bg-amber-500/10' }
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
                <span>Peak: <span className="text-gray-700 dark:text-gray-300">{stat.peak}</span></span>
                <span className="h-1 w-1 rounded-full bg-gray-200 dark:bg-gray-700" />
                <span>Avg: <span className="text-gray-700 dark:text-gray-300">{stat.avg}</span></span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

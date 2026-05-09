import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/admin/components/ui/card';
import { IconCpu, IconServer, IconDatabase } from '@tabler/icons-react';
import { cn } from '@/app/admin/lib/utils';

export function PerformanceOverview() {
  return (
    <Card className="border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-xl rounded-[2.5rem] overflow-hidden p-2">
      <CardHeader className="flex flex-row items-center justify-between pb-6 pt-6 px-6">
         <div>
            <CardTitle className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Performance</CardTitle>
            <CardDescription className="text-[9px] uppercase font-black text-gray-500 tracking-[0.2em] mt-1">Resource Allocation</CardDescription>
         </div>
         <div className="p-3 bg-violet-500/10 rounded-2xl">
           <IconServer className="h-6 w-6 text-violet-500" />
         </div>
      </CardHeader>
      <CardContent className="space-y-8 px-6 pb-8">
        {[
          { label: 'CPU Cluster', value: 65, color: 'bg-violet-500', icon: IconCpu },
          { label: 'Memory', value: 82, color: 'bg-indigo-500', icon: IconServer },
          { label: 'Disk I/O', value: 45, color: 'bg-blue-500', icon: IconDatabase }
        ].map((metric) => (
          <div key={metric.label} className="space-y-3">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.15em] text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-2"><metric.icon size={14} className="text-violet-500" /> {metric.label}</span>
              <span className="font-black text-gray-900 dark:text-white">{metric.value}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800 shadow-inner">
              <motion.div 
                className={cn("h-full shadow-lg shadow-violet-500/20", metric.color)}
                initial={{ width: 0 }}
                animate={{ width: `${metric.value}%` }}
                transition={{ duration: 1.5, ease: "circOut" }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

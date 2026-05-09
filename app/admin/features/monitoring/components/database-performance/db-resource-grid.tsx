import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui/card';
import { IconDatabase, IconCloud, IconSearch } from '@tabler/icons-react';
import { cn } from '@/app/admin/lib/utils';

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function DBResourceGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        { label: 'Storage Allocation', value: '85 GB', desc: 'Total: 100 GB (85%)', icon: IconDatabase, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { label: 'Memory Footprint', value: '12.5 GB', desc: 'Used: 78% of 16 GB', icon: IconCloud, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Index Velocity', value: '92%', desc: 'Optimal Seek Ratio', icon: IconSearch, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
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
              <p className="text-[10px] text-gray-400 mt-2 font-black uppercase tracking-widest">{stat.desc}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui/card';
import { IconActivity, IconBolt, IconFlame, IconNetwork } from '@tabler/icons-react';
import { cn } from '@/app/admin/lib/utils';

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function APIKPIGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[
        { label: 'Total Volume', value: '22,560', sub: 'Last 24h', icon: IconActivity, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Response Delta', value: '142ms', sub: 'P95: 210ms', icon: IconBolt, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Failure Ratio', value: '0.8%', sub: 'Healthy < 1%', icon: IconFlame, color: 'text-rose-500', bg: 'bg-rose-500/10' },
        { label: 'Ingress RPS', value: '261', sub: 'Peak: 315', icon: IconNetwork, color: 'text-violet-500', bg: 'bg-violet-500/10' }
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
              <div className="mt-2 flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                {stat.sub}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui/card';
import { IconBug, IconFlame, IconActivity, IconChecklist } from '@tabler/icons-react';
import { cn } from '@/app/admin/lib/utils';

const item = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1 }
};

export function ErrorKPIGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[
        { label: 'Total Exceptions', value: '287', trend: 'Last 24h', icon: IconBug, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Critical Paths', value: '45', trend: 'Priority Triage', icon: IconFlame, color: 'text-rose-500', bg: 'bg-rose-500/10' },
        { label: 'Global Error %', value: '1.2%', trend: 'Healthy < 1%', icon: IconActivity, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { label: 'Resolution Rate', value: '85%', trend: 'Last 7 days', icon: IconChecklist, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
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
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2">{stat.trend}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

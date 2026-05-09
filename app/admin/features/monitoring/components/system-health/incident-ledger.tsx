import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/admin/components/ui/card';
import { IconAlertTriangle } from '@tabler/icons-react';
import { cn } from '@/app/admin/lib/utils';

export function IncidentLedger() {
  return (
    <Card className="border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-xl rounded-[2.5rem] p-2">
      <CardHeader className="flex flex-row items-center justify-between pb-6 pt-6 px-6">
         <div>
            <CardTitle className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Incidents</CardTitle>
            <CardDescription className="text-[9px] uppercase font-black text-gray-500 tracking-[0.2em] mt-1">Detection Log</CardDescription>
         </div>
         <div className="p-3 bg-amber-500/10 rounded-2xl">
           <IconAlertTriangle className="h-6 w-6 text-amber-500" />
         </div>
      </CardHeader>
      <CardContent className="px-4 pb-6">
        <div className="space-y-3">
           {[
             { title: 'Cluster Peak', time: '12m ago', desc: 'Node 04 peak 89%', color: 'text-rose-500', bg: 'bg-rose-500/10' },
             { title: 'CDN Latency', time: '45m ago', desc: 'SEA nodes +150ms', color: 'text-amber-500', bg: 'bg-amber-500/10' },
             { title: 'Cold Boot', time: '1h ago', desc: 'Replica rotated', color: 'text-indigo-500', bg: 'bg-indigo-500/10' }
           ].map((alert, i) => (
             <div key={i} className="flex gap-4 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 p-4 transition-all hover:bg-white dark:hover:bg-gray-800 hover:shadow-lg">
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm", alert.bg)}>
                   <IconAlertTriangle className={cn("h-5 w-5", alert.color)} />
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-[10px] font-black uppercase tracking-widest truncate text-gray-900 dark:text-white">{alert.title}</h4>
                      <span className="text-[9px] font-black text-gray-400 shrink-0">{alert.time}</span>
                   </div>
                   <p className="text-[10px] font-bold text-gray-500 line-clamp-1">{alert.desc}</p>
                </div>
             </div>
           ))}
        </div>
      </CardContent>
    </Card>
  );
}

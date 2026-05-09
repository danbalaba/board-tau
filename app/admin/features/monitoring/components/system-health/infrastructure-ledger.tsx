import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/admin/components/ui/card';
import { Badge } from '@/app/admin/components/ui/badge';
import { Button } from '@/app/admin/components/ui/button';
import { IconActivity, IconDatabase, IconBolt, IconMail, IconEye } from '@tabler/icons-react';
import { cn } from '@/app/admin/lib/utils';

const services = [
  {
    id: '1',
    name: 'Main API Gateway',
    status: 'healthy',
    uptime: '15d 8h',
    responseTime: 120,
    lastChecked: new Date().toISOString(),
    icon: IconActivity
  },
  {
    id: '2',
    name: 'Primary Database (Postgres)',
    status: 'healthy',
    uptime: '22d 5h',
    responseTime: 85,
    lastChecked: new Date().toISOString(),
    icon: IconDatabase
  },
  {
    id: '3',
    name: 'Redis Cache Layer',
    status: 'warning',
    uptime: '10d 2h',
    responseTime: 450,
    lastChecked: new Date().toISOString(),
    icon: IconBolt
  },
  {
    id: '4',
    name: 'SMTP Email Service',
    status: 'healthy',
    uptime: '8d 12h',
    responseTime: 250,
    lastChecked: new Date().toISOString(),
    icon: IconMail
  }
];

const statusStyles = {
  healthy: {
    badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    icon: 'text-emerald-500',
    bg: 'bg-emerald-500/5',
    pill: 'bg-emerald-500'
  },
  warning: {
    badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    icon: 'text-amber-500',
    bg: 'bg-amber-500/5',
    pill: 'bg-amber-500'
  },
  critical: {
    badge: 'bg-red-500/10 text-red-500 border-red-500/20',
    icon: 'text-red-500',
    bg: 'bg-red-500/5',
    pill: 'bg-red-500'
  }
};

export function InfrastructureLedger() {
  return (
    <Card className="border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-xl rounded-[2.5rem] overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between p-8">
        <div>
          <CardTitle className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Infrastructure Core</CardTitle>
          <CardDescription className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 mt-1">Live heartbeat of critical system components</CardDescription>
        </div>
        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-black uppercase tracking-widest text-[9px] px-3 py-1 rounded-full">
          Operational
        </Badge>
      </CardHeader>
      <CardContent className="px-0">
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {services.map((service) => {
            const style = statusStyles[service.status as keyof typeof statusStyles];
            const IconComp = service.icon;
            return (
              <div key={service.id} className="group relative flex flex-col gap-6 p-8 transition-all hover:bg-white/30 dark:hover:bg-gray-800/30 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-5">
                  <div className={cn("flex h-14 w-14 items-center justify-center rounded-[1.25rem] shadow-sm transition-transform group-hover:scale-110", style.bg)}>
                    <IconComp className={cn("h-7 w-7", style.icon)} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-black tracking-tight text-lg text-gray-900 dark:text-white">{service.name}</h3>
                      <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full border", style.badge)}>
                        <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", style.pill)} />
                        <span className="text-[9px] font-black uppercase tracking-wider">{service.status}</span>
                      </div>
                    </div>
                    <div className="mt-1.5 flex items-center gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><IconActivity size={12} className="text-violet-500" /> {service.uptime} uptime</span>
                      <span className="flex items-center gap-1.5 font-mono text-indigo-500 italic lowercase">{service.responseTime}ms delay</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-8 sm:justify-end">
                   <div className="hidden text-right sm:block">
                      <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Last Sync</p>
                      <p className="text-sm font-black text-gray-700 dark:text-gray-300 tabular-nums">{new Date(service.lastChecked).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                   </div>
                   <Button variant="outline" className="h-11 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-violet-500 hover:text-white hover:border-violet-500 gap-2 px-5 text-[10px] font-black uppercase tracking-widest transition-all">
                     <IconEye size={16} /> Telemetry
                   </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

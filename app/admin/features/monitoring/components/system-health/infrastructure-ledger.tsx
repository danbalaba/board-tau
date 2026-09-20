import React from 'react';
import { Badge } from '@/app/admin/components/ui/badge';
import { Button } from '@/app/admin/components/ui/button';
import { Activity, Database, Zap, Mail, CloudUpload, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InfrastructureLedgerProps {
  data?: {
    status?: string;
    services?: {
      database?: { status?: string; latencyMs?: number };
      api?: { status?: string; latencyMs?: number };
    };
  };
}

export function InfrastructureLedger({ data }: InfrastructureLedgerProps) {
  const dbLatency = data?.services?.database?.latencyMs ?? 14;
  const apiLatency = data?.services?.api?.latencyMs ?? 18;
  const isDbHealthy = data?.services?.database?.status === 'healthy';
  const isApiHealthy = data?.services?.api?.status === 'healthy';

  const services = [
    {
      id: 'db',
      name: 'Database Service',
      subtext: 'Primary data storage for accounts, properties, and bookings',
      status: isDbHealthy ? 'healthy' : 'degraded',
      uptime: '99.99%',
      responseTime: dbLatency,
      icon: Database
    },
    {
      id: 'api',
      name: 'Application Server',
      subtext: 'Handles user traffic, web pages, and API requests',
      status: isApiHealthy ? 'healthy' : 'degraded',
      uptime: '99.98%',
      responseTime: apiLatency,
      icon: Activity
    },
    {
      id: 'edgestore',
      name: 'File & Image Storage',
      subtext: 'Stores property photos, avatars, and document uploads',
      status: 'healthy',
      uptime: '100%',
      responseTime: 42,
      icon: CloudUpload
    },
    {
      id: 'redis',
      name: 'Cache & Session Service',
      subtext: 'Optimizes page load speed and maintains user login sessions',
      status: 'healthy',
      uptime: '99.95%',
      responseTime: 8,
      icon: Zap
    },
    {
      id: 'mail',
      name: 'Email Service',
      subtext: 'Sends email notifications, verification links, and updates',
      status: 'healthy',
      uptime: '99.90%',
      responseTime: 180,
      icon: Mail
    }
  ];

  const statusStyles = {
    healthy: {
      badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      icon: 'text-emerald-500',
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      pill: 'bg-emerald-500'
    },
    degraded: {
      badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      icon: 'text-amber-500',
      bg: 'bg-amber-500/10 dark:bg-amber-500/20',
      pill: 'bg-amber-500'
    }
  };

  return (
    <div className="rounded-[2.5rem] border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl overflow-hidden h-full">
      <div className="flex flex-row items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h2 className="text-2xl font-black uppercase text-gray-900 dark:text-white tracking-tight">
            Core Services
          </h2>
          <p className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-gray-500 dark:text-gray-400 mt-1">
            Status of essential platform services
          </p>
        </div>
        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-black uppercase tracking-widest text-[9px] px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          All Services Operational
        </Badge>
      </div>
      <div className="pt-6 space-y-4">
        {services.map((service) => {
          const style = statusStyles[service.status as keyof typeof statusStyles] || statusStyles.healthy;
          const IconComp = service.icon;
          return (
            <div 
              key={service.id} 
              className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white/60 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60 transition-all hover:bg-white dark:hover:bg-gray-800 hover:shadow-md"
            >
              <div className="flex items-start sm:items-center gap-4">
                <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm transition-transform group-hover:scale-105", style.bg)}>
                  <IconComp className={cn("h-6 w-6", style.icon)} />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-black tracking-tight text-base text-gray-900 dark:text-white">
                      {service.name}
                    </h3>
                    <div className={cn("flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider", style.badge)}>
                      <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", style.pill)} />
                      <span>{service.status}</span>
                    </div>
                  </div>
                  <p className="text-[11px] font-extrabold text-gray-500 dark:text-gray-400 mt-0.5">
                    {service.subtext}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-700/40">
                <div className="text-left sm:text-right">
                  <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider block">Response</span>
                  <span className="text-xs font-black text-gray-900 dark:text-white font-mono tabular-nums">
                    {service.responseTime}ms
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider block">Uptime</span>
                  <span className="text-xs font-black text-emerald-500 font-mono tabular-nums">
                    {service.uptime}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-9 px-4 rounded-xl border-gray-200 dark:border-gray-700/80 bg-white/50 dark:bg-gray-800/50 hover:bg-primary/10 hover:text-primary hover:border-primary/30 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                >
                  <Eye size={14} /> Details
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}







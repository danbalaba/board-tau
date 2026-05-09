import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/admin/components/ui/card';
import { Badge } from '@/app/admin/components/ui/badge';
import { Button } from '@/app/admin/components/ui/button';
import { IconFlame, IconAlertTriangle, IconBug, IconActivity, IconFileReport, IconEye } from '@tabler/icons-react';
import { cn } from '@/app/admin/lib/utils';

type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

const severityStyles: Record<Severity, { badge: string; color: string; bg: string; icon: any }> = {
  critical: {
    badge: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
    icon: IconFlame
  },
  high: {
    badge: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    icon: IconAlertTriangle
  },
  medium: {
    badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    icon: IconBug
  },
  low: {
    badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    icon: IconActivity
  },
  info: {
    badge: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
    color: 'text-slate-500',
    bg: 'bg-slate-500/10',
    icon: IconFileReport
  }
};

const recentErrorsData = [
  {
    id: '1',
    errorType: '500 | SQL Ingress Failure',
    message: 'Failed to connect to primary database cluster',
    stackTrace: 'Error at /api/host-applications -> db.connect()',
    occurrences: 150,
    severity: 'high' as Severity,
    lastOccurred: '2m ago'
  },
  {
    id: '2',
    errorType: '408 | Payment Timeout',
    message: 'Stripe API handshake latency peak detected',
    stackTrace: 'Error at /api/payments -> stripe.capture()',
    occurrences: 45,
    severity: 'medium' as Severity,
    lastOccurred: '5m ago'
  },
  {
    id: '3',
    errorType: '401 | Auth Delta Guard',
    message: 'Invalid JWT signature detected from unknown origin',
    stackTrace: 'Error at /api/auth -> jwt.verify()',
    occurrences: 28,
    severity: 'medium' as Severity,
    lastOccurred: '10m ago'
  },
  {
    id: '4',
    errorType: '503 | Cache Store Cold',
    message: 'Redis cluster unreachable during peak allocation',
    stackTrace: 'Error at /api/cache -> redis.mget()',
    occurrences: 12,
    severity: 'low' as Severity,
    lastOccurred: '15m ago'
  }
];

export function ActiveIncidentLedger() {
  return (
    <Card className="border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-xl rounded-[2.5rem] overflow-hidden p-2">
      <CardHeader className="p-8 pb-4">
        <CardTitle className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Active Incident Ledger</CardTitle>
        <CardDescription className="text-[10px] uppercase font-black text-gray-500 tracking-[0.2em] mt-1">Real-time trace of application exceptions</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {recentErrorsData.map((error) => {
            const style = severityStyles[error.severity];
            const IconComp = style.icon;
            return (
              <div key={error.id} className="group relative flex items-start gap-6 p-8 transition-all hover:bg-white/40 dark:hover:bg-gray-800/40">
                <div className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-transform group-hover:scale-110", style.bg)}>
                  <IconComp className={cn("h-7 w-7", style.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <h4 className="text-lg font-black tracking-tight font-mono text-gray-900 dark:text-white">{error.errorType}</h4>
                       <Badge variant="outline" className={cn("text-[9px] font-black uppercase px-3 py-1 rounded-full border shadow-sm", style.badge)}>
                         {error.severity}
                       </Badge>
                       <Badge variant="outline" className="text-[9px] font-black uppercase px-3 py-1 rounded-full bg-white/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 shadow-sm text-gray-600 dark:text-gray-400">
                         {error.occurrences} Events
                       </Badge>
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{error.lastOccurred}</span>
                  </div>
                  <p className="text-sm font-black text-gray-700 dark:text-gray-300 mt-2">{error.message}</p>
                  <div className="mt-3 text-[10px] font-mono text-gray-500 dark:text-gray-400 bg-gray-100/50 dark:bg-gray-950/50 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 line-clamp-1 group-hover:line-clamp-none transition-all shadow-inner italic">
                    {error.stackTrace}
                  </div>
                </div>
                <Button variant="outline" className="h-11 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-violet-500 hover:text-white hover:border-violet-500 gap-2 px-6 text-[10px] font-black uppercase tracking-widest transition-all shrink-0 mt-1">
                  <IconEye size={16} /> Trace
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

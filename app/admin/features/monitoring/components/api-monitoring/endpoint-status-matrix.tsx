import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/admin/components/ui/card';
import { Badge } from '@/app/admin/components/ui/badge';
import { Button } from '@/app/admin/components/ui/button';
import { IconLink, IconEye, IconAlertTriangle, IconBolt } from '@tabler/icons-react';
import { cn } from '@/app/admin/lib/utils';

const endpointPerformanceData = [
  { endpoint: '/api/properties', avgTime: 120, errorRate: 0.2, status: 'healthy' as const },
  { endpoint: '/api/bookings', avgTime: 150, errorRate: 0.8, status: 'warning' as const },
  { endpoint: '/api/users', avgTime: 95, errorRate: 0.1, status: 'healthy' as const },
  { endpoint: '/api/payments', avgTime: 250, errorRate: 1.5, status: 'warning' as const },
  { endpoint: '/api/reviews', avgTime: 85, errorRate: 0.3, status: 'healthy' as const },
  { endpoint: '/api/host-apps', avgTime: 180, errorRate: 2.1, status: 'critical' as const }
];

const statusStyles = {
  healthy: {
    badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/5',
    dot: 'bg-emerald-500'
  },
  warning: {
    badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    color: 'text-amber-500',
    bg: 'bg-amber-500/5',
    dot: 'bg-amber-500'
  },
  critical: {
    badge: 'bg-red-500/10 text-red-500 border-red-500/20',
    color: 'text-red-500',
    bg: 'bg-red-500/5',
    dot: 'bg-red-500'
  }
};

export function EndpointStatusMatrix() {
  return (
    <Card className="border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-xl rounded-[2.5rem] overflow-hidden p-2">
      <CardHeader className="p-8 pb-4">
        <CardTitle className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Endpoint Status Matrix</CardTitle>
        <CardDescription className="text-[10px] uppercase font-black text-gray-500 tracking-[0.2em] mt-1">Real-time health status of platform microservices</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {endpointPerformanceData.map((endpoint, index) => {
            const style = statusStyles[endpoint.status];
            return (
              <div key={index} className="group relative flex items-center justify-between p-8 transition-all hover:bg-white/40 dark:hover:bg-gray-800/40">
                <div className="flex items-center space-x-6">
                  <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm transition-transform group-hover:scale-110", style.bg)}>
                    <IconLink className={cn("h-7 w-7", style.color)} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                       <h3 className="text-lg font-black tracking-tight font-mono text-gray-900 dark:text-white">{endpoint.endpoint}</h3>
                       <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full border shadow-sm", style.badge)}>
                          <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", style.dot)} />
                          <span className="text-[9px] font-black uppercase tracking-wider">{endpoint.status}</span>
                       </div>
                    </div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1.5">
                      Latency: <span className="text-gray-900 dark:text-white font-black">{endpoint.avgTime}ms</span> • Error Rate: <span className={cn("font-black", endpoint.errorRate > 1 ? 'text-rose-500' : 'text-emerald-500')}>{endpoint.errorRate}%</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" className="h-11 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-violet-500 hover:text-white hover:border-violet-500 gap-2 px-6 text-[10px] font-black uppercase tracking-widest transition-all">
                    <IconEye size={16} /> Inspect
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

export function DiagnosticEventLog() {
  return (
    <Card className="border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-xl rounded-[2.5rem] overflow-hidden p-2">
      <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
        <div>
          <CardTitle className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Diagnostic Event Log</CardTitle>
          <CardDescription className="text-[10px] uppercase font-black text-gray-500 tracking-[0.2em] mt-1">Latest critical failure incidents</CardDescription>
        </div>
        <div className="p-3 bg-rose-500/10 rounded-2xl">
          <IconAlertTriangle className="h-6 w-6 text-rose-500" />
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-5 p-6 rounded-[2rem] border border-rose-500/10 bg-rose-500/5 transition-all hover:bg-rose-500/10 hover:shadow-lg">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-500 shadow-sm">
              <IconAlertTriangle size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                 <h4 className="text-[11px] font-black uppercase tracking-[0.1em] text-rose-600 dark:text-rose-400">500 | Server Triage</h4>
                 <Badge className="bg-rose-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">Critical</Badge>
              </div>
              <p className="text-[11px] text-gray-600 dark:text-gray-400 font-bold leading-relaxed">
                Ingress failure at <span className="font-mono text-gray-900 dark:text-white">/api/host-apps</span> - 150+ incidents detected.
              </p>
              <p className="text-[9px] font-black text-rose-400/60 uppercase tracking-widest mt-3">Active since 2m ago</p>
            </div>
          </div>
          <div className="flex items-start gap-5 p-6 rounded-[2rem] border border-amber-500/10 bg-amber-500/5 transition-all hover:bg-amber-500/10 hover:shadow-lg">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-500 shadow-sm">
              <IconBolt size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                 <h4 className="text-[11px] font-black uppercase tracking-[0.1em] text-amber-600 dark:text-amber-400">408 | Request Timeout</h4>
                 <Badge className="bg-amber-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">Warning</Badge>
              </div>
              <p className="text-[11px] text-gray-600 dark:text-gray-400 font-bold leading-relaxed">
                Network timeout at <span className="font-mono text-gray-900 dark:text-white">/api/payments</span> - Stripe handshake stalled.
              </p>
              <p className="text-[9px] font-black text-amber-400/60 uppercase tracking-widest mt-3">Detected 5m ago</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

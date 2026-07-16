'use client';

import React from 'react';
import { AdminMonitoringHeader } from './admin-monitoring-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/admin/components/ui/card';
import { IconDatabase, IconServer, IconActivity } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';

export default function SystemHealth() {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['systemHealth'],
    queryFn: async () => {
      const res = await fetch('/api/admin/monitoring/health');
      if (!res.ok) throw new Error('Failed to fetch system health');
      return res.json();
    },
    refetchInterval: 30000, // Every 30 seconds
  });

  const handleRefresh = async () => {
    await refetch();
  };

  const dbStatus = data?.services?.database?.status === 'healthy';
  const apiStatus = data?.services?.api?.status === 'healthy';

  return (
    <div className="space-y-8 p-1">
      <AdminMonitoringHeader 
        title="System Sentinel" 
        description="Real-time infrastructure telemetry and autonomous health monitoring"
        onRefresh={handleRefresh}
        isRefreshing={isFetching}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-xl rounded-[2.5rem] overflow-hidden p-2">
          <CardHeader className="p-6">
            <CardTitle className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase flex items-center gap-2">
              <IconActivity className={`h-5 w-5 ${dbStatus && apiStatus ? 'text-emerald-500 animate-pulse' : 'text-rose-500'}`} />
              Service Status
            </CardTitle>
            <CardDescription className="text-[9px] uppercase font-black text-gray-500 tracking-[0.2em] mt-1">
              Active Platform Subsystems
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-6 pb-6">
            {[
              { 
                name: 'Database (MongoDB)', 
                desc: 'Prisma Client Connection', 
                status: isLoading ? 'Checking...' : dbStatus ? 'Online' : 'Degraded', 
                icon: IconDatabase, 
                color: dbStatus ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10',
                latency: data?.services?.database?.latencyMs 
              },
              { 
                name: 'API Server', 
                desc: 'Next.js Routes', 
                status: isLoading ? 'Checking...' : apiStatus ? 'Online' : 'Degraded', 
                icon: IconServer, 
                color: apiStatus ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10',
                latency: data?.services?.api?.latencyMs
              },
            ].map((subsystem) => (
              <div key={subsystem.name} className="flex items-center justify-between p-4 rounded-2xl bg-white/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${subsystem.color}`}>
                    <subsystem.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">{subsystem.name}</h4>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">{subsystem.desc}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      {subsystem.status === 'Online' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${subsystem.status === 'Online' ? 'bg-emerald-500' : subsystem.status === 'Checking...' ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-wider ${subsystem.status === 'Online' ? 'text-emerald-600 dark:text-emerald-400' : subsystem.status === 'Checking...' ? 'text-amber-500' : 'text-rose-500'}`}>
                      {subsystem.status}
                    </span>
                  </div>
                  {subsystem.latency !== undefined && (
                    <span className="text-[9px] font-bold text-gray-400 tabular-nums">{subsystem.latency}ms</span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/app/admin/components/ui/card';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { Button } from '@/app/admin/components/ui/button';
import { RefreshCw, Activity, Cpu, HardDrive, Network } from 'lucide-react';
import { Skeleton } from '@/app/admin/components/ui/skeleton';
import { toast } from 'sonner';

interface MetricsData {
  current: {
    cpuUsage: number;
    memoryUsage: number;
    networkIn: number;
    networkOut: number;
    loadAvg: {
      '1m': number;
      '5m': number;
      '15m': number;
    };
    processes: {
      total: number;
      active: number;
    };
  };
  history: {
    cpu: { time: string; value: number }[];
    memory: { time: string; value: number }[];
    network: { time: string; inbound: number; outbound: number }[];
  };
}

export function ServerMetrics() {
  const [data, setData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMetrics = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await fetch('/api/admin/monitoring/servers');
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        toast.error('Failed to fetch server metrics');
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
      toast.error('An error occurred while fetching metrics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // Refresh every minute to keep the charts moving
    const interval = setInterval(() => fetchMetrics(true), 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </div>
    );
  }

  if (!data) return null;

  const { current, history } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Server Metrics</h2>
          <p className="text-muted-foreground">Live resource utilization and performance trends</p>
        </div>
        <Button 
          onClick={() => fetchMetrics(true)} 
          disabled={refreshing}
          variant="outline"
          className="shadow-sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm ring-1 ring-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">CPU Usage</CardTitle>
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <Cpu className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{current.cpuUsage}%</div>
            <div className="flex items-center space-x-2 mt-2">
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ease-out ${current.cpuUsage > 80 ? 'bg-red-500' : 'bg-blue-500'}`} 
                  style={{ width: `${current.cpuUsage}%` }}
                ></div>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-3 font-medium uppercase">Load Avg (1m): {current.loadAvg['1m']}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Memory Usage</CardTitle>
            <div className="p-1.5 bg-green-50 rounded-lg">
              <Activity className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{current.memoryUsage}%</div>
            <div className="flex items-center space-x-2 mt-2">
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ease-out ${current.memoryUsage > 85 ? 'bg-red-500' : 'bg-green-500'}`} 
                  style={{ width: `${current.memoryUsage}%` }}
                ></div>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-3 font-medium uppercase">Active Processes: {current.processes.active}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Network Traffic</CardTitle>
            <div className="p-1.5 bg-purple-50 rounded-lg">
              <Network className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{current.networkIn} MB/s</div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] font-bold text-blue-600">IN: {current.networkIn} MB/s</span>
              <span className="text-[10px] font-bold text-green-600">OUT: {current.networkOut} MB/s</span>
            </div>
            <div className="flex items-center space-x-1 mt-2">
               <div className="h-1 bg-blue-400 rounded-full" style={{ width: '65%' }}></div>
               <div className="h-1 bg-green-400 rounded-full" style={{ width: '35%' }}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm ring-1 ring-border overflow-hidden">
          <CardHeader className="bg-muted/20 border-b">
            <CardTitle className="text-base">CPU Utilization</CardTitle>
            <CardDescription>Percentage over the last 3 hours</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history.cpu}>
                  <defs>
                    <linearGradient id="colorCpuMetrics" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="value" name="CPU %" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCpuMetrics)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border overflow-hidden">
          <CardHeader className="bg-muted/20 border-b">
            <CardTitle className="text-base">Memory Trend</CardTitle>
            <CardDescription>Memory load over the last 3 hours</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history.memory}>
                  <defs>
                    <linearGradient id="colorMemMetrics" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="value" name="Memory %" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorMemMetrics)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-border overflow-hidden">
        <CardHeader className="bg-muted/20 border-b">
          <CardTitle className="text-base">Network Bandwidth</CardTitle>
          <CardDescription>Inbound and Outbound traffic rates</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history.network}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="inbound" name="Inbound (MB/s)" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
                <Line type="monotone" dataKey="outbound" name="Outbound (MB/s)" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-muted/20 border-none shadow-none ring-1 ring-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center">
              <HardDrive className="h-3 w-3 mr-2" />
              Storage I/O
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">Optimal</div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase">Disk Status: Healthy</p>
          </CardContent>
        </Card>

        <Card className="bg-muted/20 border-none shadow-none ring-1 ring-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center">
              <Activity className="h-3 w-3 mr-2" />
              System Load
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{current.loadAvg['1m']}</div>
            <div className="flex justify-between mt-1">
              <span className="text-[9px] font-medium text-muted-foreground">1m: {current.loadAvg['1m']}</span>
              <span className="text-[9px] font-medium text-muted-foreground">5m: {current.loadAvg['5m']}</span>
              <span className="text-[9px] font-medium text-muted-foreground">15m: {current.loadAvg['15m']}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/20 border-none shadow-none ring-1 ring-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center">
              <Cpu className="h-3 w-3 mr-2" />
              Runtime Env
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{current.processes.total} Tasks</div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase">Active: {current.processes.active}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


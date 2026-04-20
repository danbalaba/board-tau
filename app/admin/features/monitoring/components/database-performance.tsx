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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { Button } from '@/app/admin/components/ui/button';
import { RefreshCw, Database, Layers, HardDrive } from 'lucide-react';
import { Skeleton } from '@/app/admin/components/ui/skeleton';
import { toast } from 'sonner';

interface DatabaseData {
  summary: {
    activeConnections: number;
    queriesPerSecond: number;
    cacheHitRate: number;
    slowQueries: number;
  };
  storage: {
    totalSizeMB: number;
    dataSizeMB: number;
    indexSizeMB: number;
    objects: number;
    collections: number;
  };
  collectionStats: {
    name: string;
    count: number;
    avgTime: number;
  }[];
  history: {
    connections: { time: string; active: number; idle: number }[];
    cache: { time: string; hits: number; misses: number }[];
  };
}

export function DatabasePerformance() {
  const [data, setData] = useState<DatabaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await fetch('/api/admin/monitoring/database');
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        toast.error('Failed to fetch database metrics');
      }
    } catch (error) {
      console.error('Error fetching db metrics:', error);
      toast.error('An error occurred while fetching database metrics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh every 2 minutes
    const interval = setInterval(() => fetchData(true), 120000);
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { summary, storage, collectionStats, history } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Database Performance</h2>
          <p className="text-muted-foreground">Monitor real-time database throughput and storage metrics</p>
        </div>
        <Button 
          onClick={() => fetchData(true)} 
          disabled={refreshing}
          variant="outline"
          className="shadow-sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm ring-1 ring-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.activeConnections}</div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-semibold">Active Sessions</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Throughput</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.queriesPerSecond}</div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-semibold">Est. Queries / Sec</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cache Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{summary.cacheHitRate}%</div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-semibold">Hit Rate Efficiency</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Slow Queries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${summary.slowQueries > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {summary.slowQueries}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-semibold">Latencies {'>'} 100ms</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm ring-1 ring-border overflow-hidden">
          <CardHeader className="bg-muted/20 border-b">
            <CardTitle className="text-base font-bold">Top Collections Analysis</CardTitle>
            <CardDescription>Document counts across main collections</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={collectionStats} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: 'hsl(var(--foreground))' }} width={80} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="count" name="Documents" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border overflow-hidden">
          <CardHeader className="bg-muted/20 border-b">
            <CardTitle className="text-base font-bold">Database Connections</CardTitle>
            <CardDescription>Active vs Idle session trends</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history.connections}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Legend iconType="circle" />
                  <Line type="monotone" dataKey="active" name="Active" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 4 }} />
                  <Line type="monotone" dataKey="idle" name="Idle" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-border overflow-hidden">
        <CardHeader className="bg-muted/20 border-b">
          <CardTitle className="text-base font-bold">Storage Overview</CardTitle>
          <CardDescription>Physical database space allocation (Real-time)</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
               <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100">
                    <HardDrive className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Storage</p>
                    <p className="text-2xl font-bold">{storage.totalSizeMB} MB</p>
                  </div>
               </div>
               <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: '70%' }}></div>
               </div>
            </div>

            <div className="space-y-4">
               <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-green-50 rounded-xl border border-green-100">
                    <Database className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Data Volume</p>
                    <p className="text-2xl font-bold">{storage.dataSizeMB} MB</p>
                  </div>
               </div>
               <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full transition-all duration-1000" style={{ width: '45%' }}></div>
               </div>
            </div>

            <div className="space-y-4">
               <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-100">
                    <Layers className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Index Size</p>
                    <p className="text-2xl font-bold">{storage.indexSizeMB} MB</p>
                  </div>
               </div>
               <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full transition-all duration-1000" style={{ width: '25%' }}></div>
               </div>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t">
             <div className="text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Collections</p>
                <p className="text-xl font-extrabold">{storage.collections}</p>
             </div>
             <div className="text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Documents</p>
                <p className="text-xl font-extrabold">{storage.objects.toLocaleString()}</p>
             </div>
             <div className="text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Engine</p>
                <p className="text-xl font-extrabold">WiredTiger</p>
             </div>
             <div className="text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Health Status</p>
                <p className="text-xl font-extrabold text-green-600">Optimal</p>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


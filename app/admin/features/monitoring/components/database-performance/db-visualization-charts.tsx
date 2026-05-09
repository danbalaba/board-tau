import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/admin/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import { IconSearch, IconActivity, IconLayersIntersect } from '@tabler/icons-react';

const queryPerformanceData = [
  { query: 'SELECT * FROM users', avgTime: 120, count: 1500 },
  { query: 'SELECT * FROM properties', avgTime: 85, count: 2200 },
  { query: 'SELECT * FROM bookings', avgTime: 150, count: 1800 },
  { query: 'SELECT * FROM reviews', avgTime: 95, count: 1200 },
  { query: 'SELECT * FROM payments', avgTime: 110, count: 950 },
  { query: 'SELECT * FROM host_applications', avgTime: 75, count: 350 }
];

export function QueryLatencyChart() {
  return (
    <Card className="border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-xl rounded-[2.5rem] overflow-hidden p-2">
      <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
        <div>
          <CardTitle className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Top Query Latency</CardTitle>
          <CardDescription className="text-[10px] uppercase font-black text-gray-500 tracking-[0.2em] mt-1">Average Execution Time per Procedure</CardDescription>
        </div>
        <div className="p-3 bg-blue-500/10 rounded-2xl">
          <IconSearch className="h-6 w-6 text-blue-500" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={queryPerformanceData} layout="vertical" margin={{ left: 0, right: 40 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900 }} className="fill-gray-400" />
              <YAxis dataKey="query" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 900 }} width={120} className="fill-gray-400 uppercase" />
              <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: '1.5rem', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }} />
              <Bar dataKey="avgTime" name="Latency (ms)" radius={[0, 10, 10, 0]}>
                {queryPerformanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.avgTime > 130 ? '#f43f5e' : '#3b82f6'} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

const connectionData = [
  { time: '09:00', active: 120, idle: 35 },
  { time: '09:15', active: 135, idle: 42 },
  { time: '09:30', active: 145, idle: 45 },
  { time: '09:45', active: 130, idle: 38 },
  { time: '10:00', active: 150, idle: 50 },
  { time: '10:15', active: 142, idle: 48 },
  { time: '10:30', active: 138, idle: 43 },
  { time: '10:45', active: 140, idle: 40 },
  { time: '11:00', active: 155, idle: 55 },
  { time: '11:15', active: 160, idle: 58 },
  { time: '11:30', active: 148, idle: 45 },
  { time: '11:45', active: 142, idle: 42 }
];

export function ConnectionLogisticsChart() {
  return (
    <Card className="border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-xl rounded-[2.5rem] overflow-hidden p-2">
      <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
        <div>
          <CardTitle className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Connection Logistics</CardTitle>
          <CardDescription className="text-[10px] uppercase font-black text-gray-500 tracking-[0.2em] mt-1">Active vs Idle Pool Instances</CardDescription>
        </div>
        <div className="p-3 bg-emerald-500/10 rounded-2xl">
          <IconActivity className="h-6 w-6 text-emerald-500" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={connectionData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900 }} dy={10} className="fill-gray-400 uppercase" />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900 }} className="fill-gray-400" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: '1.5rem', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }} />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '30px', fontSize: '9px', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.1em' }} />
              <Line type="monotone" dataKey="active" name="Active Cluster" stroke="#10b981" strokeWidth={4} dot={false} strokeLinecap="round" />
              <Line type="monotone" dataKey="idle" name="Pending Pool" stroke="#64748b" strokeWidth={4} dot={false} strokeLinecap="round" strokeDasharray="6 6" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

const cachePerformanceData = [
  { time: '09:00', hits: 85, misses: 15 },
  { time: '09:15', hits: 88, misses: 12 },
  { time: '09:30', hits: 92, misses: 8 },
  { time: '09:45', hits: 87, misses: 13 },
  { time: '10:00', hits: 83, misses: 17 },
  { time: '10:15', hits: 89, misses: 11 },
  { time: '10:30', hits: 91, misses: 9 },
  { time: '10:45', hits: 86, misses: 14 },
  { time: '11:00', hits: 84, misses: 16 },
  { time: '11:15', hits: 88, misses: 12 },
  { time: '11:30', hits: 90, misses: 10 },
  { time: '11:45', hits: 87, misses: 13 }
];

export function CacheEfficiencyMatrix() {
  return (
    <Card className="border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-xl rounded-[2.5rem] overflow-hidden p-2">
      <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
        <div>
          <CardTitle className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Cache Efficiency Matrix</CardTitle>
          <CardDescription className="text-[10px] uppercase font-black text-gray-500 tracking-[0.2em] mt-1">Hit/Miss Distribution Over T-Intervals</CardDescription>
        </div>
        <div className="p-3 bg-violet-500/10 rounded-2xl">
          <IconLayersIntersect className="h-6 w-6 text-violet-500" />
        </div>
      </CardHeader>
      <CardContent className="p-8 pt-0">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cachePerformanceData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900 }} dy={10} className="fill-gray-400 uppercase" />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900 }} className="fill-gray-400" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: '1.5rem', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }} />
              <Legend iconType="square" wrapperStyle={{ paddingTop: '30px', fontSize: '9px', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.1em' }} />
              <Bar dataKey="hits" name="Cache Hits (%)" stackId="a" fill="#8b5cf6" radius={[0, 0, 0, 0]} />
              <Bar dataKey="misses" name="Cold Misses (%)" stackId="a" fill="#f43f5e" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

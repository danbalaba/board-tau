import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/admin/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { IconActivity, IconNetwork } from '@tabler/icons-react';

const apiPerformanceData = [
  { time: '09:00', avgResponse: 120, requests: 1500 },
  { time: '09:15', avgResponse: 135, requests: 1650 },
  { time: '09:30', avgResponse: 145, requests: 1800 },
  { time: '09:45', avgResponse: 130, requests: 1700 },
  { time: '10:00', avgResponse: 150, requests: 2000 },
  { time: '10:15', avgResponse: 142, requests: 1900 },
  { time: '10:30', avgResponse: 138, requests: 1850 },
  { time: '10:45', avgResponse: 140, requests: 1880 },
  { time: '11:00', avgResponse: 155, requests: 2100 },
  { time: '11:15', avgResponse: 160, requests: 2200 },
  { time: '11:30', avgResponse: 148, requests: 2050 },
  { time: '11:45', avgResponse: 142, requests: 1980 }
];

export function TemporalThroughput() {
  return (
    <Card className="border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-xl rounded-[2.5rem] overflow-hidden p-2">
      <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
        <div>
          <CardTitle className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Temporal Throughput</CardTitle>
          <CardDescription className="text-[10px] uppercase font-black text-gray-500 tracking-[0.2em] mt-1">Response vs Traffic Distribution</CardDescription>
        </div>
        <div className="p-3 bg-blue-500/10 rounded-2xl">
          <IconActivity className="h-6 w-6 text-blue-500" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={apiPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900 }} dy={10} className="fill-gray-400 uppercase" />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900 }} className="fill-gray-400" />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900 }} className="fill-gray-400" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: '1.5rem', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }} 
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '30px', fontSize: '9px', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.1em' }} />
              <Line yAxisId="left" type="monotone" dataKey="avgResponse" name="Response (ms)" stroke="#3b82f6" strokeWidth={4} dot={false} strokeLinecap="round" />
              <Line yAxisId="right" type="monotone" dataKey="requests" name="Traffic Volume" stroke="#10b981" strokeWidth={4} dot={false} strokeLinecap="round" strokeDasharray="6 6" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

const endpointPerformanceData = [
  { endpoint: '/api/properties', avgTime: 120, errorRate: 0.2, status: 'healthy' },
  { endpoint: '/api/bookings', avgTime: 150, errorRate: 0.8, status: 'warning' },
  { endpoint: '/api/users', avgTime: 95, errorRate: 0.1, status: 'healthy' },
  { endpoint: '/api/payments', avgTime: 250, errorRate: 1.5, status: 'warning' },
  { endpoint: '/api/reviews', avgTime: 85, errorRate: 0.3, status: 'healthy' },
  { endpoint: '/api/host-apps', avgTime: 180, errorRate: 2.1, status: 'critical' }
];

export function EndpointVelocity() {
  return (
    <Card className="border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-xl rounded-[2.5rem] overflow-hidden p-2">
      <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
        <div>
          <CardTitle className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Endpoint Velocity</CardTitle>
          <CardDescription className="text-[10px] uppercase font-black text-gray-500 tracking-[0.2em] mt-1">Mean Response Time per Ingress</CardDescription>
        </div>
        <div className="p-3 bg-emerald-500/10 rounded-2xl">
          <IconNetwork className="h-6 w-6 text-emerald-500" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={endpointPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="endpoint" axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 900 }} dy={10} className="fill-gray-400 uppercase" />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900 }} className="fill-gray-400" />
              <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: '1.5rem', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }} />
              <Bar dataKey="avgTime" name="Mean Time (ms)" radius={[10, 10, 0, 0]}>
                {endpointPerformanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.status === 'healthy' ? '#10b981' : entry.status === 'warning' ? '#f59e0b' : '#f43f5e'} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

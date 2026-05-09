import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/admin/components/ui/card';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { IconCpu, IconServer, IconNetwork } from '@tabler/icons-react';

const cpuData = [
  { time: '09:00', value: 45 }, { time: '09:15', value: 52 }, { time: '09:30', value: 65 }, { time: '09:45', value: 58 },
  { time: '10:00', value: 72 }, { time: '10:15', value: 68 }, { time: '10:30', value: 55 }, { time: '10:45', value: 61 },
  { time: '11:00', value: 75 }, { time: '11:15', value: 80 }, { time: '11:30', value: 70 }, { time: '11:45', value: 65 }
];

const memoryData = [
  { time: '09:00', value: 68 }, { time: '09:15', value: 72 }, { time: '09:30', value: 78 }, { time: '09:45', value: 80 },
  { time: '10:00', value: 85 }, { time: '10:15', value: 88 }, { time: '10:30', value: 82 }, { time: '10:45', value: 80 },
  { time: '11:00', value: 85 }, { time: '11:15', value: 88 }, { time: '11:30', value: 82 }, { time: '11:45', value: 80 }
];

export function ComputeTelemetryCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-xl rounded-[2.5rem] overflow-hidden p-2">
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
          <div><CardTitle className="text-xl font-black text-gray-900 dark:text-white tracking-tight">CPU Telemetry</CardTitle><CardDescription className="text-[10px] uppercase font-black text-gray-500 tracking-[0.2em] mt-1">Active Core Utilization Trends</CardDescription></div>
          <div className="p-3 bg-blue-500/10 rounded-2xl"><IconCpu className="h-6 w-6 text-blue-500" /></div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cpuData}>
                <defs><linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900 }} dy={10} className="fill-gray-400 uppercase" />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900 }} className="fill-gray-400" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: '1.5rem', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }} />
                <Area type="monotone" dataKey="value" name="CPU %" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCpu)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <Card className="border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-xl rounded-[2.5rem] overflow-hidden p-2">
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
          <div><CardTitle className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Memory Allocation</CardTitle><CardDescription className="text-[10px] uppercase font-black text-gray-500 tracking-[0.2em] mt-1">RAM Consumption Metrics</CardDescription></div>
          <div className="p-3 bg-emerald-500/10 rounded-2xl"><IconServer className="h-6 w-6 text-emerald-500" /></div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={memoryData}>
                <defs><linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900 }} dy={10} className="fill-gray-400 uppercase" />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900 }} className="fill-gray-400" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: '1.5rem', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }} />
                <Area type="monotone" dataKey="value" name="Memory %" stroke="#10b981" fillOpacity={1} fill="url(#colorMemory)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const networkData = [
  { time: '09:00', inbound: 4.5, outbound: 2.3 }, { time: '09:15', inbound: 5.2, outbound: 2.8 }, { time: '09:30', inbound: 6.1, outbound: 3.2 }, { time: '09:45', inbound: 5.8, outbound: 3.0 },
  { time: '10:00', inbound: 7.5, outbound: 4.1 }, { time: '10:15', inbound: 6.8, outbound: 3.8 }, { time: '10:30', inbound: 5.5, outbound: 2.9 }, { time: '10:45', inbound: 6.1, outbound: 3.3 },
  { time: '11:00', inbound: 8.2, outbound: 4.5 }, { time: '11:15', inbound: 9.1, outbound: 5.2 }, { time: '11:30', inbound: 7.8, outbound: 4.3 }, { time: '11:45', inbound: 6.5, outbound: 3.6 }
];

export function NetworkThroughputChart() {
  return (
    <Card className="border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-xl rounded-[2.5rem] overflow-hidden p-2">
      <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
        <div><CardTitle className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Network Throughput</CardTitle><CardDescription className="text-[10px] uppercase font-black text-gray-500 tracking-[0.2em] mt-1">Inbound vs Outbound Transmission Rates</CardDescription></div>
        <div className="p-3 bg-violet-500/10 rounded-2xl"><IconNetwork className="h-6 w-6 text-violet-500" /></div>
      </CardHeader>
      <CardContent className="p-8 pt-0">
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={networkData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900 }} dy={10} className="fill-gray-400 uppercase" />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900 }} className="fill-gray-400" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: '1.5rem', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }} />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '30px', fontSize: '9px', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.1em' }} />
              <Line type="monotone" dataKey="inbound" name="Inbound (MB/s)" stroke="#3b82f6" strokeWidth={4} dot={false} strokeLinecap="round" />
              <Line type="monotone" dataKey="outbound" name="Outbound (MB/s)" stroke="#8b5cf6" strokeWidth={4} dot={false} strokeLinecap="round" strokeDasharray="6 6" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

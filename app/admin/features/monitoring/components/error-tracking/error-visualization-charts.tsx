import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/admin/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { IconActivity, IconChartPie } from '@tabler/icons-react';

const errorTrendData = [
  { time: '09:00', count: 12 },
  { time: '09:15', count: 8 },
  { time: '09:30', count: 15 },
  { time: '09:45', count: 10 },
  { time: '10:00', count: 25 },
  { time: '10:15', count: 18 },
  { time: '10:30', count: 14 },
  { time: '10:45', count: 20 },
  { time: '11:00', count: 28 },
  { time: '11:15', count: 32 },
  { time: '11:30', count: 25 },
  { time: '11:45', count: 18 }
];

const errorByTypeData = [
  { name: '5xx Errors', value: 45, color: '#f43f5e' },
  { name: '4xx Errors', value: 30, color: '#f59e0b' },
  { name: '3xx Errors', value: 15, color: '#3b82f6' },
  { name: '2xx Errors', value: 10, color: '#10b981' }
];

export function ErrorAnomalyTrend() {
  return (
    <Card className="border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-xl rounded-[2.5rem] overflow-hidden p-2">
      <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
        <div>
          <CardTitle className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Anomaly Trend</CardTitle>
          <CardDescription className="text-[10px] uppercase font-black text-gray-500 tracking-[0.2em] mt-1">Exception frequency per T-Interval</CardDescription>
        </div>
        <div className="p-3 bg-rose-500/10 rounded-2xl">
          <IconActivity className="h-6 w-6 text-rose-500" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={errorTrendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900 }} dy={10} className="fill-gray-400 uppercase" />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900 }} className="fill-gray-400" />
              <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: '1.5rem', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }} />
              <Bar dataKey="count" name="Interval Errors" fill="#f43f5e" radius={[10, 10, 0, 0]} fillOpacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function ErrorSpectrum() {
  return (
    <Card className="border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-xl rounded-[2.5rem] overflow-hidden p-2">
      <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
        <div>
          <CardTitle className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Spectrum</CardTitle>
          <CardDescription className="text-[10px] uppercase font-black text-gray-500 tracking-[0.2em] mt-1">HTTP Classification Distribution</CardDescription>
        </div>
        <div className="p-3 bg-indigo-500/10 rounded-2xl">
          <IconChartPie className="h-6 w-6 text-indigo-500" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={errorByTypeData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value" stroke="transparent">
                {errorByTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} className="hover:fill-opacity-100 transition-all outline-none" />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: '1.5rem', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }} />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '30px', fontSize: '9px', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.1em' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

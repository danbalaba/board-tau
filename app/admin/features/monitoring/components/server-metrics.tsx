'use client';

import React from 'react';
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
  Line,
  AreaChart,
  Area
} from 'recharts';

// Sample server metrics data
const cpuData = [
  { time: '09:00', value: 45 },
  { time: '09:15', value: 52 },
  { time: '09:30', value: 65 },
  { time: '09:45', value: 58 },
  { time: '10:00', value: 72 },
  { time: '10:15', value: 68 },
  { time: '10:30', value: 55 },
  { time: '10:45', value: 61 },
  { time: '11:00', value: 75 },
  { time: '11:15', value: 80 },
  { time: '11:30', value: 70 },
  { time: '11:45', value: 65 }
];

const memoryData = [
  { time: '09:00', value: 68 },
  { time: '09:15', value: 72 },
  { time: '09:30', value: 78 },
  { time: '09:45', value: 80 },
  { time: '10:00', value: 85 },
  { time: '10:15', value: 88 },
  { time: '10:30', value: 82 },
  { time: '10:45', value: 80 },
  { time: '11:00', value: 85 },
  { time: '11:15', value: 88 },
  { time: '11:30', value: 82 },
  { time: '11:45', value: 80 }
];

const networkData = [
  { time: '09:00', inbound: 4.5, outbound: 2.3 },
  { time: '09:15', inbound: 5.2, outbound: 2.8 },
  { time: '09:30', inbound: 6.1, outbound: 3.2 },
  { time: '09:45', inbound: 5.8, outbound: 3.0 },
  { time: '10:00', inbound: 7.5, outbound: 4.1 },
  { time: '10:15', inbound: 6.8, outbound: 3.8 },
  { time: '10:30', inbound: 5.5, outbound: 2.9 },
  { time: '10:45', inbound: 6.1, outbound: 3.3 },
  { time: '11:00', inbound: 8.2, outbound: 4.5 },
  { time: '11:15', inbound: 9.1, outbound: 5.2 },
  { time: '11:30', inbound: 7.8, outbound: 4.3 },
  { time: '11:45', inbound: 6.5, outbound: 3.6 }
];

export function ServerMetrics() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Server Metrics</h2>
          <p className="text-muted-foreground">Monitor server performance and resource utilization</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>CPU Usage</CardTitle>
            <CardDescription>Current CPU utilization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">80%</div>
            <p className="text-sm text-muted-foreground">Peak: 95% • Avg: 72%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Memory Usage</CardTitle>
            <CardDescription>Current memory utilization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">88%</div>
            <p className="text-sm text-muted-foreground">Peak: 92% • Avg: 82%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Network Traffic</CardTitle>
            <CardDescription>Current network bandwidth</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">9.1 MB/s</div>
            <p className="text-sm text-muted-foreground">Inbound: 9.1 MB/s • Outbound: 5.2 MB/s</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>CPU Usage Over Time</CardTitle>
            <CardDescription>CPU utilization trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cpuData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#1890ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="value" name="CPU %" stroke="#1890ff" fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Memory Usage Over Time</CardTitle>
            <CardDescription>Memory utilization trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={memoryData}>
                  <defs>
                    <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#52c41a" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#52c41a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="value" name="Memory %" stroke="#52c41a" fillOpacity={1} fill="url(#colorMemory)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Network Traffic</CardTitle>
          <CardDescription>Inbound and outbound network traffic</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={networkData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="inbound" name="Inbound (MB/s)" stroke="#1890ff" strokeWidth={2} />
                <Line type="monotone" dataKey="outbound" name="Outbound (MB/s)" stroke="#52c41a" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Disk I/O</CardTitle>
            <CardDescription>Disk read/write operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">250 IOPS</div>
            <p className="text-sm text-muted-foreground">Read: 180 IOPS • Write: 70 IOPS</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Load Average</CardTitle>
            <CardDescription>System load average</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">4.2</div>
            <p className="text-sm text-muted-foreground">1min: 4.2 • 5min: 3.8 • 15min: 3.5</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Processes</CardTitle>
            <CardDescription>Active processes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1,247</div>
            <p className="text-sm text-muted-foreground">Active: 1,247 • Sleeping: 856</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

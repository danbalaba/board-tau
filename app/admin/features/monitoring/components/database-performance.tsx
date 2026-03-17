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
  Line
} from 'recharts';

// Sample database performance data
const queryPerformanceData = [
  { query: 'SELECT * FROM users', avgTime: 120, count: 1500 },
  { query: 'SELECT * FROM properties', avgTime: 85, count: 2200 },
  { query: 'SELECT * FROM bookings', avgTime: 150, count: 1800 },
  { query: 'SELECT * FROM reviews', avgTime: 95, count: 1200 },
  { query: 'SELECT * FROM payments', avgTime: 110, count: 950 },
  { query: 'SELECT * FROM host_applications', avgTime: 75, count: 350 }
];

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

export function DatabasePerformance() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Database Performance</h2>
          <p className="text-muted-foreground">Monitor database query performance and connections</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Active Connections</CardTitle>
            <CardDescription>Current active connections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">160</div>
            <p className="text-sm text-muted-foreground">Max: 200 • Avg: 142</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Queries per Second</CardTitle>
            <CardDescription>Current QPS rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">245</div>
            <p className="text-sm text-muted-foreground">Peak: 310 • Avg: 220</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cache Hit Rate</CardTitle>
            <CardDescription>Query cache efficiency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">88%</div>
            <p className="text-sm text-muted-foreground">Ideal: greater than 90% • Misses: 12%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Slow Queries</CardTitle>
            <CardDescription>Queries taking 100ms or more</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <p className="text-sm text-muted-foreground">Last hour: 12 • Last 24h: 156</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Query Performance</CardTitle>
            <CardDescription>Average query execution time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={queryPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="query" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avgTime" name="Avg Time (ms)" fill="#1890ff" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Database Connections</CardTitle>
            <CardDescription>Active vs idle connections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={connectionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="active" name="Active" stroke="#1890ff" strokeWidth={2} />
                  <Line type="monotone" dataKey="idle" name="Idle" stroke="#52c41a" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cache Performance</CardTitle>
          <CardDescription>Cache hits and misses over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cachePerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="hits" name="Hits (%)" fill="#52c41a" />
                <Bar dataKey="misses" name="Misses (%)" fill="#f5222d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Memory Usage</CardTitle>
            <CardDescription>Database memory consumption</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12.5 GB</div>
            <p className="text-sm text-muted-foreground">Total: 16 GB • Used: 78%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Disk Usage</CardTitle>
            <CardDescription>Database disk space</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">85 GB</div>
            <p className="text-sm text-muted-foreground">Total: 100 GB • Used: 85%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Index Efficiency</CardTitle>
            <CardDescription>Index usage ratio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">92%</div>
            <p className="text-sm text-muted-foreground">Queries using indexes</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

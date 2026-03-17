'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/app/admin/components/ui/card';
import { Badge } from '@/app/admin/components/ui/badge';
import { Button } from '@/app/admin/components/ui/button';
import { Eye, RefreshCw, AlertTriangle } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

// Sample API monitoring data
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

type Status = 'healthy' | 'warning' | 'critical';

const statusColors: Record<Status, 'default' | 'secondary' | 'destructive'> = {
  healthy: 'default',
  warning: 'secondary',
  critical: 'destructive'
};

const statusLabels: Record<Status, string> = {
  healthy: 'Healthy',
  warning: 'Warning',
  critical: 'Critical'
};

const endpointPerformanceData: Array<{
  endpoint: string;
  avgTime: number;
  errorRate: number;
  status: Status;
}> = [
  { endpoint: '/api/properties', avgTime: 120, errorRate: 0.2, status: 'healthy' },
  { endpoint: '/api/bookings', avgTime: 150, errorRate: 0.8, status: 'warning' },
  { endpoint: '/api/users', avgTime: 95, errorRate: 0.1, status: 'healthy' },
  { endpoint: '/api/payments', avgTime: 250, errorRate: 1.5, status: 'warning' },
  { endpoint: '/api/reviews', avgTime: 85, errorRate: 0.3, status: 'healthy' },
  { endpoint: '/api/host-applications', avgTime: 180, errorRate: 2.1, status: 'critical' }
];

export function ApiMonitoring() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">API Monitoring</h2>
          <p className="text-muted-foreground">Monitor API endpoints and request performance</p>
        </div>
        <Button onClick={() => console.log('Refresh data')}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Requests</CardTitle>
            <CardDescription>All API requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">22,560</div>
            <p className="text-sm text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Response Time</CardTitle>
            <CardDescription>Mean response time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">142 ms</div>
            <p className="text-sm text-muted-foreground">95th percentile: 210 ms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Error Rate</CardTitle>
            <CardDescription>Percentage of failed requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0.8%</div>
            <p className="text-sm text-muted-foreground">Healthy: less than 1%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Throughput</CardTitle>
            <CardDescription>Requests per second</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">261</div>
            <p className="text-sm text-muted-foreground">Peak: 315</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>API Performance</CardTitle>
            <CardDescription>Average response time over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={apiPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="avgResponse" name="Avg Response (ms)" stroke="#1890ff" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="requests" name="Requests" stroke="#52c41a" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Endpoint Performance</CardTitle>
            <CardDescription>Average response time per endpoint</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={endpointPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="endpoint" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avgTime" name="Avg Time (ms)" fill="#1890ff" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Endpoint Status</CardTitle>
          <CardDescription>Real-time status of all API endpoints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {endpointPerformanceData.map((endpoint, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    endpoint.status === 'healthy' ? 'bg-green-500' :
                    endpoint.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <h3 className="font-medium">{endpoint.endpoint}</h3>
                    <p className="text-sm text-muted-foreground">
                      Avg: {endpoint.avgTime}ms • Errors: {endpoint.errorRate}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={statusColors[endpoint.status]}>
                    {statusLabels[endpoint.status]}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => console.log('View', endpoint.endpoint)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Errors</CardTitle>
          <CardDescription>Latest API error events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-red-900">500 Internal Server Error</h4>
                <p className="text-sm text-red-700">
                  GET /api/host-applications - 150+ occurrences in last 15 minutes
                </p>
                <p className="text-xs text-red-600">Last seen: 2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-yellow-900">408 Request Timeout</h4>
                <p className="text-sm text-yellow-700">
                  POST /api/payments - 45+ occurrences in last 15 minutes
                </p>
                <p className="text-xs text-yellow-600">Last seen: 5 minutes ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

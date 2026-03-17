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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Sample error tracking data
const errorTrendData = [
  { time: '09:00', count: 12, severity: 'low' },
  { time: '09:15', count: 8, severity: 'low' },
  { time: '09:30', count: 15, severity: 'medium' },
  { time: '09:45', count: 10, severity: 'low' },
  { time: '10:00', count: 25, severity: 'high' },
  { time: '10:15', count: 18, severity: 'medium' },
  { time: '10:30', count: 14, severity: 'medium' },
  { time: '10:45', count: 20, severity: 'high' },
  { time: '11:00', count: 28, severity: 'high' },
  { time: '11:15', count: 32, severity: 'high' },
  { time: '11:30', count: 25, severity: 'high' },
  { time: '11:45', count: 18, severity: 'medium' }
];

const errorByTypeData = [
  { name: '5xx Errors', value: 45, color: '#ef4444' },
  { name: '4xx Errors', value: 30, color: '#f59e0b' },
  { name: '3xx Errors', value: 15, color: '#3b82f6' },
  { name: '2xx Errors', value: 10, color: '#10b981' }
];

type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

const severityColors: Record<Severity, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  critical: 'destructive',
  high: 'destructive',
  medium: 'secondary',
  low: 'default',
  info: 'outline'
};

const severityLabels: Record<Severity, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  info: 'Info'
};

const recentErrorsData: Array<{
  id: string;
  errorType: string;
  message: string;
  stackTrace: string;
  occurrences: number;
  severity: Severity;
  lastOccurred: string;
}> = [
  {
    id: '1',
    errorType: '500 Internal Server Error',
    message: 'Failed to connect to database',
    stackTrace: 'Error at /api/host-applications -> database.connect',
    occurrences: 150,
    severity: 'high',
    lastOccurred: '2 minutes ago'
  },
  {
    id: '2',
    errorType: '408 Request Timeout',
    message: 'Payment service timeout',
    stackTrace: 'Error at /api/payments -> stripe.createPaymentIntent',
    occurrences: 45,
    severity: 'medium',
    lastOccurred: '5 minutes ago'
  },
  {
    id: '3',
    errorType: '401 Unauthorized',
    message: 'Invalid JWT token',
    stackTrace: 'Error at /api/auth -> verifyToken',
    occurrences: 28,
    severity: 'medium',
    lastOccurred: '10 minutes ago'
  },
  {
    id: '4',
    errorType: '503 Service Unavailable',
    message: 'Redis connection failed',
    stackTrace: 'Error at /api/cache -> redis.get',
    occurrences: 12,
    severity: 'low',
    lastOccurred: '15 minutes ago'
  }
];

export function ErrorTracking() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Error Tracking</h2>
          <p className="text-muted-foreground">Track and analyze system errors</p>
        </div>
        <Button onClick={() => console.log('Refresh data')}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Errors</CardTitle>
            <CardDescription>All error occurrences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">287</div>
            <p className="text-sm text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Critical Errors</CardTitle>
            <CardDescription>Severity level critical</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">45</div>
            <p className="text-sm text-muted-foreground">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Error Rate</CardTitle>
            <CardDescription>Percentage of errors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1.2%</div>
            <p className="text-sm text-muted-foreground">Healthy: less than 1%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Error Resolution</CardTitle>
            <CardDescription>Issues resolved</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">85%</div>
            <p className="text-sm text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Error Trends</CardTitle>
            <CardDescription>Error occurrences over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={errorTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Errors" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Error by Type</CardTitle>
            <CardDescription>Distribution by HTTP status code</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={errorByTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {errorByTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Errors</CardTitle>
          <CardDescription>Latest error occurrences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentErrorsData.map((error) => (
              <div key={error.id} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-red-900">{error.errorType}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge variant={severityColors[error.severity]}>
                        {severityLabels[error.severity]}
                      </Badge>
                      <Badge variant="outline">{error.occurrences}x</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-red-700 mt-1">{error.message}</p>
                  <p className="text-xs text-red-600 mt-1">{error.stackTrace}</p>
                  <p className="text-xs text-red-500 mt-2">{error.lastOccurred}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => console.log('View error details')}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

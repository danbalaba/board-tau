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

interface Service {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  uptime: string;
  responseTime: number;
  lastChecked: string;
}

const services: Service[] = [
  {
    id: '1',
    name: 'API Server',
    status: 'healthy',
    uptime: '15d 8h',
    responseTime: 120,
    lastChecked: '2024-01-10T10:30:00Z'
  },
  {
    id: '2',
    name: 'Database',
    status: 'healthy',
    uptime: '22d 5h',
    responseTime: 85,
    lastChecked: '2024-01-10T10:29:00Z'
  },
  {
    id: '3',
    name: 'Cache',
    status: 'warning',
    uptime: '10d 2h',
    responseTime: 450,
    lastChecked: '2024-01-10T10:28:00Z'
  },
  {
    id: '4',
    name: 'Email Service',
    status: 'healthy',
    uptime: '8d 12h',
    responseTime: 250,
    lastChecked: '2024-01-10T10:27:00Z'
  }
];

const statusColors = {
  healthy: 'default',
  warning: 'secondary',
  critical: 'destructive'
};

const statusLabels = {
  healthy: 'Healthy',
  warning: 'Warning',
  critical: 'Critical'
};

const statusIcons = {
  healthy: '✅',
  warning: '⚠️',
  critical: '❌'
};

export function SystemHealth() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Health</h2>
          <p className="text-muted-foreground">Monitor system status and uptime</p>
        </div>
        <Button onClick={() => console.log('Refresh data')}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Services</CardTitle>
            <CardDescription>All monitored services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{services.length}</div>
            <p className="text-sm text-muted-foreground">Total services</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Healthy Services</CardTitle>
            <CardDescription>Services in healthy state</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {services.filter(service => service.status === 'healthy').length}
            </div>
            <p className="text-sm text-muted-foreground">Healthy services</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Warning Services</CardTitle>
            <CardDescription>Services with warnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {services.filter(service => service.status === 'warning').length}
            </div>
            <p className="text-sm text-muted-foreground">Warning services</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Critical Services</CardTitle>
            <CardDescription>Services in critical state</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {services.filter(service => service.status === 'critical').length}
            </div>
            <p className="text-sm text-muted-foreground">Critical services</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Status</CardTitle>
          <CardDescription>Real-time status of all monitored services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{statusIcons[service.status]}</div>
                  <div>
                    <h3 className="font-medium">{service.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Uptime: {service.uptime} • Response: {service.responseTime}ms
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last checked: {new Date(service.lastChecked).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={statusColors[service.status] as any}>
                    {statusLabels[service.status]}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => console.log('View', service.id)}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Performance</CardTitle>
            <CardDescription>Resource utilization and performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">CPU Usage</span>
                  <span className="text-sm">65%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Memory Usage</span>
                  <span className="text-sm">82%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Disk Space</span>
                  <span className="text-sm">45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>Latest system alerts and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-yellow-900">High Memory Usage</h4>
                  <p className="text-sm text-yellow-700">Memory usage is above 80% threshold</p>
                  <p className="text-xs text-yellow-600">5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900">Cache Response Time</h4>
                  <p className="text-sm text-blue-700">Cache response time is above 400ms</p>
                  <p className="text-xs text-blue-600">15 minutes ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

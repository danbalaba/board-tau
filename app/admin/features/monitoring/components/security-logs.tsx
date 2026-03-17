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

type Severity = 'low' | 'medium' | 'high';
type EventType = 'login' | 'failed-login' | 'data-access' | 'unauthorized-access' | 'security-scan' | 'configuration-change';

interface SecurityEvent {
  id: string;
  timestamp: string;
  type: EventType;
  severity: Severity;
  user: string;
  ip: string;
  location: string;
  details: string;
}

const securityEvents: SecurityEvent[] = [
  {
    id: '1',
    timestamp: '2024-01-10T11:32:45Z',
    type: 'failed-login',
    severity: 'high',
    user: 'johndoe@example.com',
    ip: '192.168.1.105',
    location: 'New York, NY',
    details: 'Multiple failed login attempts from the same IP'
  },
  {
    id: '2',
    timestamp: '2024-01-10T11:28:12Z',
    type: 'unauthorized-access',
    severity: 'high',
    user: 'anonymous',
    ip: '45.123.45.67',
    location: 'Moscow, Russia',
    details: 'Attempt to access restricted endpoint'
  },
  {
    id: '3',
    timestamp: '2024-01-10T11:25:00Z',
    type: 'configuration-change',
    severity: 'medium',
    user: 'admin@boardtau.com',
    ip: '10.0.0.5',
    location: 'San Francisco, CA',
    details: 'Database configuration updated'
  },
  {
    id: '4',
    timestamp: '2024-01-10T11:20:30Z',
    type: 'data-access',
    severity: 'low',
    user: 'sarah@example.com',
    ip: '172.16.0.23',
    location: 'London, UK',
    details: 'Downloaded property data export'
  },
  {
    id: '5',
    timestamp: '2024-01-10T11:15:45Z',
    type: 'security-scan',
    severity: 'low',
    user: 'system',
    ip: '10.0.0.1',
    location: 'San Francisco, CA',
    details: 'Daily security scan completed'
  },
  {
    id: '6',
    timestamp: '2024-01-10T11:10:00Z',
    type: 'login',
    severity: 'low',
    user: 'mike@example.com',
    ip: '192.168.2.45',
    location: 'Chicago, IL',
    details: 'Successful login from new device'
  }
];

const typeColors: Record<EventType, 'default' | 'destructive' | 'secondary'> = {
  login: 'default',
  'failed-login': 'destructive',
  'data-access': 'secondary',
  'unauthorized-access': 'destructive',
  'security-scan': 'default',
  'configuration-change': 'secondary'
};

const severityColors: Record<Severity, 'default' | 'destructive' | 'secondary'> = {
  low: 'default',
  medium: 'secondary',
  high: 'destructive'
};

const severityLabels: Record<Severity, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High'
};

export function SecurityLogs() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Security Logs</h2>
          <p className="text-muted-foreground">Monitor security events and activities</p>
        </div>
        <Button onClick={() => console.log('Refresh data')}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Events</CardTitle>
            <CardDescription>All security events in last 24h</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">156</div>
            <p className="text-sm text-muted-foreground">+8% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>High Severity</CardTitle>
            <CardDescription>Critical security events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">23</div>
            <p className="text-sm text-muted-foreground">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Failed Logins</CardTitle>
            <CardDescription>Unsuccessful login attempts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8</div>
            <p className="text-sm text-muted-foreground">Failed login attempts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Scans</CardTitle>
            <CardDescription>Automated security checks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">4</div>
            <p className="text-sm text-muted-foreground">Completed scans</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Security Events</CardTitle>
          <CardDescription>All security events in chronological order</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityEvents.map((event) => (
              <div key={event.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                  event.severity === 'high' ? 'text-red-600' :
                  event.severity === 'medium' ? 'text-yellow-600' : 'text-green-600'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 capitalize">{event.type.replace('-', ' ')}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge variant={severityColors[event.severity]}>
                        {severityLabels[event.severity]}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">
                    <span className="font-medium">{event.user}</span> • {event.ip} • {event.location}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{event.details}</p>
                  <p className="text-xs text-gray-500 mt-2">{new Date(event.timestamp).toLocaleString()}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => console.log('View', event.id)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Top Countries</CardTitle>
            <CardDescription>Events by country</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>United States</span>
                <Badge variant="default">85</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>United Kingdom</span>
                <Badge variant="default">24</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Russia</span>
                <Badge variant="destructive">18</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Canada</span>
                <Badge variant="default">12</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Germany</span>
                <Badge variant="default">7</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Event Types</CardTitle>
            <CardDescription>Security event distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Login Events</span>
                <Badge variant="default">45</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Failed Logins</span>
                <Badge variant="destructive">8</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Data Access</span>
                <Badge variant="default">32</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Configuration Changes</span>
                <Badge variant="default">18</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Security Scans</span>
                <Badge variant="default">4</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Users</CardTitle>
            <CardDescription>Most active users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>admin@boardtau.com</span>
                <Badge variant="default">28</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>johndoe@example.com</span>
                <Badge variant="destructive">15</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>sarah@example.com</span>
                <Badge variant="default">12</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>mike@example.com</span>
                <Badge variant="default">9</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>system</span>
                <Badge variant="default">4</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

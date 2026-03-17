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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/app/admin/components/ui/table';
import { Badge } from '@/app/admin/components/ui/badge';
import { Button } from '@/app/admin/components/ui/button';
import { Eye, CheckCircle, XCircle } from 'lucide-react';

interface ModerationItem {
  id: string;
  type: 'listing' | 'review' | 'host-application';
  title: string;
  user: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  priority: 'low' | 'medium' | 'high';
  reason?: string;
}

const moderationQueue: ModerationItem[] = [
  {
    id: '1',
    type: 'listing',
    title: 'Cozy Studio in Downtown',
    user: 'Jane Smith',
    status: 'pending',
    submittedAt: '2024-01-10T09:30:00Z',
    priority: 'high',
    reason: 'New property listing'
  },
  {
    id: '2',
    type: 'review',
    title: 'Great experience at Beach Villa',
    user: 'Mike Johnson',
    status: 'pending',
    submittedAt: '2024-01-10T08:15:00Z',
    priority: 'medium',
    reason: 'Review flagged for inappropriate content'
  },
  {
    id: '3',
    type: 'host-application',
    title: 'Host Application - John Doe',
    user: 'John Doe',
    status: 'pending',
    submittedAt: '2024-01-09T16:45:00Z',
    priority: 'high',
    reason: 'New host application'
  },
  {
    id: '4',
    type: 'listing',
    title: 'Luxury Apartment with Ocean View',
    user: 'Sarah Williams',
    status: 'pending',
    submittedAt: '2024-01-09T14:20:00Z',
    priority: 'medium',
    reason: 'Listing update'
  },
  {
    id: '5',
    type: 'review',
    title: 'Disappointing stay at City Center',
    user: 'Tom Brown',
    status: 'pending',
    submittedAt: '2024-01-08T11:00:00Z',
    priority: 'low',
    reason: 'Negative review'
  }
];

const typeLabels = {
  listing: 'Listing',
  review: 'Review',
  'host-application': 'Host Application'
};

const priorityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High'
};

const priorityColors = {
  low: 'secondary',
  medium: 'default',
  high: 'destructive'
};

export function ModerationQueue() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Moderation Queue</h2>
          <p className="text-muted-foreground">Review and moderate content on the platform</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Moderation Items</CardTitle>
          <CardDescription>
            {moderationQueue.length} items pending review
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {moderationQueue.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Badge variant="outline">{typeLabels[item.type]}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.user}</TableCell>
                  <TableCell>
                    {new Date(item.submittedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={priorityColors[item.priority] as any}>
                      {priorityLabels[item.priority]}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{item.reason}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => console.log('View', item.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => console.log('Approve', item.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => console.log('Reject', item.id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Pending Items</CardTitle>
            <CardDescription>Items awaiting moderation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{moderationQueue.length}</div>
            <p className="text-sm text-muted-foreground">Currently pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>High Priority</CardTitle>
            <CardDescription>Items requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {moderationQueue.filter(item => item.priority === 'high').length}
            </div>
            <p className="text-sm text-muted-foreground">High priority</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Response Time</CardTitle>
            <CardDescription>Time to moderate items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">4.2h</div>
            <p className="text-sm text-muted-foreground">Average response time</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

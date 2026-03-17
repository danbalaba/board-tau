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

interface HostApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  experience: string;
  motivation: string;
  documentsVerified: boolean;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  lastUpdated: string;
}

const hostApplications: HostApplication[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    experience: '3 years in property management',
    motivation: 'I want to share my knowledge and help people find great accommodation',
    documentsVerified: true,
    status: 'pending',
    submittedAt: '2024-01-09T16:45:00Z',
    lastUpdated: '2024-01-09T16:45:00Z'
  },
  {
    id: '2',
    name: 'Sarah Williams',
    email: 'sarah.w@example.com',
    phone: '+1 (555) 234-5678',
    experience: '1 year hosting on other platforms',
    motivation: 'I love meeting new people and providing comfortable stays',
    documentsVerified: true,
    status: 'pending',
    submittedAt: '2024-01-08T14:20:00Z',
    lastUpdated: '2024-01-08T14:20:00Z'
  },
  {
    id: '3',
    name: 'Michael Chen',
    email: 'michael.c@example.com',
    phone: '+1 (555) 345-6789',
    experience: 'First time hosting',
    motivation: 'I have a spare room and want to earn extra income',
    documentsVerified: false,
    status: 'pending',
    submittedAt: '2024-01-07T11:30:00Z',
    lastUpdated: '2024-01-07T11:30:00Z'
  }
];

const statusColors = {
  pending: 'secondary',
  approved: 'default',
  rejected: 'destructive'
};

const statusLabels = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected'
};

export function HostApplications() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Host Applications</h2>
          <p className="text-muted-foreground">Review and approve host applications</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Host Applications</CardTitle>
          <CardDescription>
            {hostApplications.filter(app => app.status === 'pending').length} applications pending review
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hostApplications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.name}</TableCell>
                  <TableCell>{app.email}</TableCell>
                  <TableCell>{app.phone}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {app.experience}
                  </TableCell>
                  <TableCell>
                    <Badge variant={app.documentsVerified ? 'default' : 'destructive'}>
                      {app.documentsVerified ? 'Verified' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[app.status] as any}>
                      {statusLabels[app.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(app.submittedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => console.log('View', app.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {app.status === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => console.log('Approve', app.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => console.log('Reject', app.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
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
            <CardTitle>Total Applications</CardTitle>
            <CardDescription>All host applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{hostApplications.length}</div>
            <p className="text-sm text-muted-foreground">Total applications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Review</CardTitle>
            <CardDescription>Applications awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {hostApplications.filter(app => app.status === 'pending').length}
            </div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documents Verified</CardTitle>
            <CardDescription>Applications with verified documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {hostApplications.filter(app => app.documentsVerified).length}
            </div>
            <p className="text-sm text-muted-foreground">Verified</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

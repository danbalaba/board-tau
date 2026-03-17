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
import { Edit, Eye } from 'lucide-react';

interface Commission {
  id: string;
  host: string;
  listing: string;
  amount: number;
  commissionRate: number;
  commissionAmount: number;
  date: string;
  status: 'pending' | 'paid' | 'failed';
}

const commissions: Commission[] = [
  {
    id: '1',
    host: 'Jane Smith',
    listing: 'Cozy Studio in Downtown',
    amount: 150.00,
    commissionRate: 10,
    commissionAmount: 15.00,
    date: '2024-01-10T10:30:00Z',
    status: 'paid'
  },
  {
    id: '2',
    host: 'Mike Johnson',
    listing: 'Beach Villa',
    amount: 250.00,
    commissionRate: 10,
    commissionAmount: 25.00,
    date: '2024-01-10T09:15:00Z',
    status: 'pending'
  },
  {
    id: '3',
    host: 'Tom Brown',
    listing: 'Luxury Apartment',
    amount: 300.00,
    commissionRate: 8,
    commissionAmount: 24.00,
    date: '2024-01-09T16:45:00Z',
    status: 'paid'
  },
  {
    id: '4',
    host: 'Sarah Williams',
    listing: 'City Center Apartment',
    amount: 180.00,
    commissionRate: 10,
    commissionAmount: 18.00,
    date: '2024-01-09T14:20:00Z',
    status: 'failed'
  },
  {
    id: '5',
    host: 'John Doe',
    listing: 'Beach Villa',
    amount: 250.00,
    commissionRate: 10,
    commissionAmount: 25.00,
    date: '2024-01-08T11:30:00Z',
    status: 'paid'
  }
];

const statusColors = {
  pending: 'secondary',
  paid: 'default',
  failed: 'destructive'
};

const statusLabels = {
  pending: 'Pending',
  paid: 'Paid',
  failed: 'Failed'
};

export function CommissionsManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Commissions & Fees</h2>
          <p className="text-muted-foreground">Manage commission rates and calculate fees</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Current Commission Rate</CardTitle>
            <CardDescription>Default commission percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">10%</div>
            <p className="text-sm text-muted-foreground">Standard commission rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Commissions</CardTitle>
            <CardDescription>All commissions processed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${commissions.reduce((sum, commission) => sum + commission.commissionAmount, 0).toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">Total commission revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Payments</CardTitle>
            <CardDescription>Commissions awaiting payment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${commissions
                .filter(commission => commission.status === 'pending')
                .reduce((sum, commission) => sum + commission.commissionAmount, 0)
                .toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">Pending commission payments</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commission Transactions</CardTitle>
          <CardDescription>View and manage all commission transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Host</TableHead>
                <TableHead>Listing</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissions.map((commission) => (
                <TableRow key={commission.id}>
                  <TableCell>{commission.host}</TableCell>
                  <TableCell>{commission.listing}</TableCell>
                  <TableCell>${commission.amount.toFixed(2)}</TableCell>
                  <TableCell>{commission.commissionRate}%</TableCell>
                  <TableCell>${commission.commissionAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    {new Date(commission.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[commission.status] as any}>
                      {statusLabels[commission.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => console.log('View', commission.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => console.log('Edit', commission.id)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

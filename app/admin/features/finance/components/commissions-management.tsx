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

import { useCommissions } from '@/app/admin/hooks/use-commissions';

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
  const { data: apiResponse, isLoading, error } = useCommissions();
  const commissions = apiResponse?.data || [];
  const stats = apiResponse?.meta?.stats || { totalCommissions: 0, paidCommissions: 0, pendingCommissions: 0, currentRate: 15 };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading commissions...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error.message}</div>;
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
            <div className="text-3xl font-bold">{stats.currentRate}%</div>
            <p className="text-sm text-muted-foreground">Standard platform fee</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Commissions</CardTitle>
            <CardDescription>All commissions processed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${stats.totalCommissions.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">Total platform earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Payments</CardTitle>
            <CardDescription>Commissions awaiting payment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${stats.pendingCommissions.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">Awaiting reservation payout</p>
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

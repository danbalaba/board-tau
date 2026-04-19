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
import { Eye } from 'lucide-react';

import { useTransactions } from '@/app/admin/hooks/use-transactions';

const statusColors: Record<string, any> = {
  PAID: 'default',
  PENDING: 'secondary',
  FAILED: 'destructive',
  UNPAID: 'outline'
};

const statusLabels: Record<string, string> = {
  PAID: 'Completed',
  PENDING: 'Pending',
  FAILED: 'Failed',
  UNPAID: 'Unpaid'
};

export function TransactionsManagement() {
  const { data: apiResponse, isLoading, error } = useTransactions();
  const transactions = apiResponse?.data || [];
  const stats = apiResponse?.meta?.stats || { totalAmount: 0, completedCount: 0, failedCount: 0 };
  const total = apiResponse?.meta?.total || 0;

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading transactions...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error.message}</div>;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Transactions</h2>
          <p className="text-muted-foreground">Manage and track all transactions</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>
            View and manage all payment transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Listing</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {new Date(transaction.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>{transaction.user?.name || 'Unknown'}</TableCell>
                  <TableCell>{transaction.listing?.title || 'Unknown'}</TableCell>
                  <TableCell>${transaction.totalPrice.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[transaction.paymentStatus] || 'outline'}>
                      {statusLabels[transaction.paymentStatus] || transaction.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>{transaction.paymentMethod || 'N/A'}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => console.log('View transaction', transaction.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Transactions</CardTitle>
            <CardDescription>All time transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{total}</div>
            <p className="text-sm text-muted-foreground">Total transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Amount</CardTitle>
            <CardDescription>Sum of all transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${stats.totalAmount.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">Total amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completed Transactions</CardTitle>
            <CardDescription>Successfully processed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.completedCount}
            </div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Failed Transactions</CardTitle>
            <CardDescription>Transactions that failed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.failedCount}
            </div>
            <p className="text-sm text-muted-foreground">Failed</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

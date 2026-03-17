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

interface Transaction {
  id: string;
  date: string;
  user: string;
  listing: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  paymentMethod: string;
}

const transactions: Transaction[] = [
  {
    id: '1',
    date: '2024-01-10T10:30:00Z',
    user: 'Jane Smith',
    listing: 'Cozy Studio in Downtown',
    amount: 150.00,
    status: 'completed',
    paymentMethod: 'Credit Card'
  },
  {
    id: '2',
    date: '2024-01-10T09:15:00Z',
    user: 'Mike Johnson',
    listing: 'Beach Villa',
    amount: 250.00,
    status: 'pending',
    paymentMethod: 'PayPal'
  },
  {
    id: '3',
    date: '2024-01-09T16:45:00Z',
    user: 'Tom Brown',
    listing: 'Luxury Apartment',
    amount: 300.00,
    status: 'completed',
    paymentMethod: 'Credit Card'
  },
  {
    id: '4',
    date: '2024-01-09T14:20:00Z',
    user: 'Sarah Williams',
    listing: 'City Center Apartment',
    amount: 180.00,
    status: 'failed',
    paymentMethod: 'Debit Card'
  },
  {
    id: '5',
    date: '2024-01-08T11:30:00Z',
    user: 'John Doe',
    listing: 'Beach Villa',
    amount: 250.00,
    status: 'refunded',
    paymentMethod: 'Credit Card'
  }
];

const statusColors = {
  completed: 'default',
  pending: 'secondary',
  failed: 'destructive',
  refunded: 'outline'
};

const statusLabels = {
  completed: 'Completed',
  pending: 'Pending',
  failed: 'Failed',
  refunded: 'Refunded'
};

export function TransactionsManagement() {
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
                    {new Date(transaction.date).toLocaleString()}
                  </TableCell>
                  <TableCell>{transaction.user}</TableCell>
                  <TableCell>{transaction.listing}</TableCell>
                  <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[transaction.status] as any}>
                      {statusLabels[transaction.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>{transaction.paymentMethod}</TableCell>
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
            <div className="text-3xl font-bold">{transactions.length}</div>
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
              ${transactions.reduce((sum, tx) => sum + tx.amount, 0).toFixed(2)}
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
              {transactions.filter(tx => tx.status === 'completed').length}
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
              {transactions.filter(tx => tx.status === 'failed').length}
            </div>
            <p className="text-sm text-muted-foreground">Failed</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

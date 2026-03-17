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
import { Eye, Download } from 'lucide-react';

interface TaxRecord {
  id: string;
  period: string;
  taxType: string;
  amount: number;
  status: 'filed' | 'pending' | 'failed';
  filingDate: string;
  dueDate: string;
  notes?: string;
}

const taxRecords: TaxRecord[] = [
  {
    id: '1',
    period: 'Q4 2023',
    taxType: 'Sales Tax',
    amount: 1250.00,
    status: 'filed',
    filingDate: '2023-10-15T10:30:00Z',
    dueDate: '2023-10-15T23:59:59Z'
  },
  {
    id: '2',
    period: 'Q4 2023',
    taxType: 'Income Tax',
    amount: 3500.00,
    status: 'filed',
    filingDate: '2023-10-15T09:15:00Z',
    dueDate: '2023-10-15T23:59:59Z'
  },
  {
    id: '3',
    period: 'Q1 2024',
    taxType: 'Sales Tax',
    amount: 1800.00,
    status: 'pending',
    filingDate: '',
    dueDate: '2024-04-15T23:59:59Z'
  },
  {
    id: '4',
    period: 'Q1 2024',
    taxType: 'Income Tax',
    amount: 4200.00,
    status: 'pending',
    filingDate: '',
    dueDate: '2024-04-15T23:59:59Z'
  }
];

const statusColors = {
  filed: 'default',
  pending: 'secondary',
  failed: 'destructive'
};

const statusLabels = {
  filed: 'Filed',
  pending: 'Pending',
  failed: 'Failed'
};

export function TaxCompliance() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tax Compliance</h2>
          <p className="text-muted-foreground">Manage tax filings and compliance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Taxes Paid</CardTitle>
            <CardDescription>All taxes paid this year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${taxRecords
                .filter(record => record.status === 'filed')
                .reduce((sum, record) => sum + record.amount, 0)
                .toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">Total taxes paid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Taxes</CardTitle>
            <CardDescription>Taxes pending filing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${taxRecords
                .filter(record => record.status === 'pending')
                .reduce((sum, record) => sum + record.amount, 0)
                .toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">Pending taxes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Records</CardTitle>
            <CardDescription>Number of tax records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{taxRecords.length}</div>
            <p className="text-sm text-muted-foreground">Total tax records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance Rate</CardTitle>
            <CardDescription>Tax filing compliance rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">50%</div>
            <p className="text-sm text-muted-foreground">Compliance rate</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tax Records</CardTitle>
          <CardDescription>View and manage all tax records</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Tax Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Filing Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taxRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.period}</TableCell>
                  <TableCell>{record.taxType}</TableCell>
                  <TableCell>${record.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[record.status] as any}>
                      {statusLabels[record.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {record.filingDate ? new Date(record.filingDate).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    {new Date(record.dueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => console.log('View', record.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {record.status === 'filed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => console.log('Download', record.id)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      )}
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

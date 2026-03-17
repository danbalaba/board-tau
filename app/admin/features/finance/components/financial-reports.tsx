'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/app/admin/components/ui/card';
import { Button } from '@/app/admin/components/ui/button';
import { Download, Eye } from 'lucide-react';

interface Report {
  id: string;
  name: string;
  date: string;
  type: string;
  format: string;
  status: 'generated' | 'generating' | 'failed';
  size: string;
}

const reports: Report[] = [
  {
    id: '1',
    name: 'Monthly Revenue Report',
    date: '2024-01-10T10:30:00Z',
    type: 'Financial',
    format: 'PDF',
    status: 'generated',
    size: '2.5 MB'
  },
  {
    id: '2',
    name: 'Quarterly Tax Report',
    date: '2024-01-09T09:15:00Z',
    type: 'Tax',
    format: 'Excel',
    status: 'generated',
    size: '1.8 MB'
  },
  {
    id: '3',
    name: 'Annual Financial Summary',
    date: '2024-01-08T16:45:00Z',
    type: 'Financial',
    format: 'PDF',
    status: 'generated',
    size: '4.2 MB'
  },
  {
    id: '4',
    name: 'Host Earnings Report',
    date: '2024-01-07T14:20:00Z',
    type: 'Financial',
    format: 'CSV',
    status: 'generated',
    size: '850 KB'
  }
];

export function FinancialReports() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Financial Reports</h2>
          <p className="text-muted-foreground">Generate and manage financial reports</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Reports</CardTitle>
            <CardDescription>All generated reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{reports.length}</div>
            <p className="text-sm text-muted-foreground">Generated reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>PDF Reports</CardTitle>
            <CardDescription>PDF format reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {reports.filter(report => report.format === 'PDF').length}
            </div>
            <p className="text-sm text-muted-foreground">PDF reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Excel Reports</CardTitle>
            <CardDescription>Excel format reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {reports.filter(report => report.format === 'Excel').length}
            </div>
            <p className="text-sm text-muted-foreground">Excel reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CSV Reports</CardTitle>
            <CardDescription>CSV format reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {reports.filter(report => report.format === 'CSV').length}
            </div>
            <p className="text-sm text-muted-foreground">CSV reports</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
          <CardDescription>View and download generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Download className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{report.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {report.type} • {report.format} • {report.size}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Generated on {new Date(report.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => console.log('View', report.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => console.log('Download', report.id)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generate New Report</CardTitle>
          <CardDescription>Create a new financial report</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium">Report Type</h3>
              <select className="w-full p-2 border rounded-lg">
                <option>Monthly Revenue Report</option>
                <option>Quarterly Tax Report</option>
                <option>Annual Financial Summary</option>
                <option>Host Earnings Report</option>
                <option>Guest Spending Report</option>
              </select>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Format</h3>
              <select className="w-full p-2 border rounded-lg">
                <option>PDF</option>
                <option>Excel</option>
                <option>CSV</option>
              </select>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Date Range</h3>
              <select className="w-full p-2 border rounded-lg">
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
                <option>Last 12 Months</option>
                <option>Custom Range</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={() => console.log('Generate report')}>
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/app/admin/components/ui/card';
import { Button } from '@/app/admin/components/ui/button';
import { Badge } from '@/app/admin/components/ui/badge';
import { 
  FileText, 
  Download, 
  Eye, 
  Clock, 
  Plus, 
  Filter,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface Report {
  id: string;
  name: string;
  type: string;
  generatedAt: string;
  status: 'completed' | 'processing' | 'failed';
  format: 'PDF' | 'CSV' | 'XLSX';
  size: string;
}

export function ReportsCenter() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Fetch reports from the real backend API
  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/finance/reports?type=list');
      const result = await response.json();
      
      if (result.success && result.data) {
        // Map backend report structure to frontend Report interface
        const formattedReports: Report[] = result.data.reports.map((r: any) => ({
          id: r.id,
          name: r.name,
          type: r.type,
          generatedAt: r.date,
          status: 'completed',
          format: r.format as any,
          size: r.size
        }));
        setReports(formattedReports);
      } else {
        toast.error('Failed to fetch report list from server');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Connection error while fetching reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerateReport = () => {
    setGenerating(true);
    toast.info('Generating custom report...');
    
    // Simulate generation process
    setTimeout(() => {
      const newReport: Report = {
        id: `rep-${Math.floor(Math.random() * 1000)}`,
        name: 'Custom Platform Analysis',
        type: 'Platform',
        generatedAt: new Date().toISOString(),
        status: 'completed',
        format: 'PDF',
        size: '1.2 MB'
      };
      setReports(prev => [newReport, ...prev]);
      setGenerating(false);
      toast.success('Report generated successfully');
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reports Center</h2>
          <p className="text-muted-foreground">Manage, schedule, and download analytical reports</p>
        </div>
        <Button onClick={handleGenerateReport} disabled={generating} className="shadow-lg shadow-primary/20">
          {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
          Generate New Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm ring-1 ring-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center">
              <Clock className="h-4 w-4 mr-2 text-blue-500" />
              Scheduled Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">Active recurring delivery schedules</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm ring-1 ring-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center">
              <FileText className="h-4 w-4 mr-2 text-emerald-500" />
              Total Generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Reports available for download</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm ring-1 ring-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center">
              <Filter className="h-4 w-4 mr-2 text-amber-500" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground mt-1">Analytical domains covered</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-border overflow-hidden">
        <CardHeader className="bg-muted/20 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Recent Reports</CardTitle>
              <CardDescription>Browse and download your generated documents</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="h-8 text-xs font-bold uppercase tracking-widest">
                All Types
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs font-bold uppercase tracking-widest">
                All Formats
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Syncing with Archive...</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {reports.map((report) => (
                <div key={report.id} className="p-4 hover:bg-muted/5 transition-colors group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold">{report.name}</h4>
                        <div className="flex items-center space-x-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          <span className="flex items-center">
                            <Badge variant="outline" className="h-4 text-[8px] font-bold mr-2 uppercase">{report.type}</Badge>
                            {new Date(report.generatedAt).toLocaleString()}
                          </span>
                          <span>•</span>
                          <span>{report.size}</span>
                          <span>•</span>
                          <span className="flex items-center text-emerald-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {report.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest">
                        <Eye className="h-3 w-3 mr-1.5" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest bg-muted/30">
                        <Download className="h-3 w-3 mr-1.5" />
                        Download {report.format}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && reports.length === 0 && (
            <div className="p-12 text-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No reports found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

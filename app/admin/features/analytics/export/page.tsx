'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/app/admin/components/ui/card';
import { Button } from '@/app/admin/components/ui/button';
import { Input } from '@/app/admin/components/ui/input';
import { Label } from '@/app/admin/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/admin/components/ui/select';
import { Download, FileText, Database, Calendar, CheckCircle2, AlertCircle, Loader2, FileJson, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/app/admin/components/ui/badge';
import { Switch } from '@/app/admin/components/ui/switch';

const exportOptions = [
  { value: 'csv', label: 'Comma Separated (CSV)', icon: FileSpreadsheet, color: 'text-emerald-500' },
  { value: 'json', label: 'JavaScript Object (JSON)', icon: FileJson, color: 'text-amber-500' },
  { value: 'pdf', label: 'Portable Document (PDF)', icon: FileText, color: 'text-red-500' }
];

const dataSources = [
  { value: 'users', label: 'User Directory', description: 'Full list of registered members and their roles' },
  { value: 'listings', label: 'Property Inventory', description: 'All listings including status and regional data' },
  { value: 'reservations', label: 'Booking History', description: 'Complete record of all stays and payments' },
  { value: 'reviews', label: 'Guest Feedback', description: 'Aggregated reviews and rating metrics' },
  { value: 'financial', label: 'Financial Records', description: 'Taxable revenue and payment methodology' }
];

const dateRanges = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7', label: 'Last 7 Days' },
  { value: 'last30', label: 'Last 30 Days' },
  { value: 'last90', label: 'Last 90 Days' },
  { value: 'custom', label: 'Custom Range' }
];

export default function DataExport() {
  const [formData, setFormData] = useState({
    dataSource: 'users',
    exportFormat: 'csv',
    dateRange: 'last30',
    startDate: '',
    endDate: '',
    includeHeaders: true,
    anonymize: false
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleChange = (name: string, value: boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsExporting(true);
    
    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch('/api/admin/analytics/export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.message || 'Export failed');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${formData.dataSource}_export_${new Date().toISOString().split('T')[0]}.${formData.exportFormat}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        resolve('Success');
      } catch (error: any) {
        reject(error.message);
      } finally {
        setIsExporting(false);
      }
    });

    toast.promise(promise, {
      loading: 'Preparing dataset...',
      success: 'Export complete!',
      error: (err) => `Error: ${err}`
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Data Export Center</h1>
          <p className="text-muted-foreground">Extract platform datasets for external analysis and auditing</p>
        </div>
        <div className="flex items-center space-x-2">
           <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
             <CheckCircle2 className="w-3 h-3 mr-1" />
             Live Database Sync
           </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-border">
            <CardHeader className="bg-muted/10 border-b">
              <CardTitle className="text-base font-bold flex items-center">
                <Database className="w-4 h-4 mr-2 text-primary" />
                Dataset Configuration
              </CardTitle>
              <CardDescription>Select the source and timeframe for your data extraction</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Select Primary Data Source</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dataSources.map((source) => (
                    <div 
                      key={source.value}
                      onClick={() => handleSelectChange('dataSource', source.value)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.dataSource === source.value 
                        ? 'border-primary bg-primary/5 shadow-sm' 
                        : 'border-transparent bg-muted/30 hover:bg-muted/50'
                      }`}
                    >
                      <h4 className="text-sm font-bold">{source.label}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{source.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Timeframe</Label>
                  <Select
                    value={formData.dateRange}
                    onValueChange={(v) => handleSelectChange('dateRange', v)}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dateRanges.map(r => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                   <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Export Format</Label>
                   <Select
                    value={formData.exportFormat}
                    onValueChange={(v) => handleSelectChange('exportFormat', v)}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {exportOptions.map(o => (
                        <SelectItem key={o.value} value={o.value}>
                          <div className="flex items-center">
                            <o.icon className={`w-4 h-4 mr-2 ${o.color}`} />
                            {o.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.dateRange === 'custom' && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Start Date</Label>
                    <Input 
                      type="date" 
                      value={formData.startDate}
                      onChange={(e) => handleSelectChange('startDate', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">End Date</Label>
                    <Input 
                      type="date" 
                      value={formData.endDate}
                      onChange={(e) => handleSelectChange('endDate', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm ring-1 ring-border overflow-hidden">
            <CardHeader className="bg-muted/10 border-b">
              <CardTitle className="text-sm font-bold">Extraction Options</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
               <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold">Include Headers</Label>
                    <p className="text-xs text-muted-foreground">Add column titles to the first row of the export</p>
                  </div>
                  <Switch 
                    checked={formData.includeHeaders} 
                    onCheckedChange={(v) => handleToggleChange('includeHeaders', v)} 
                  />
               </div>
               <div className="h-px bg-border my-4" />
               <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold">Privacy Masking</Label>
                    <p className="text-xs text-muted-foreground">Anonymize sensitive user fields (Email, Phone)</p>
                  </div>
                  <Switch 
                    checked={formData.anonymize} 
                    onCheckedChange={(v) => handleToggleChange('anonymize', v)} 
                  />
               </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
           <Card className="border-none shadow-sm ring-1 ring-border bg-primary text-primary-foreground">
              <CardHeader>
                 <CardTitle className="text-base font-bold flex items-center">
                    <Download className="w-5 h-5 mr-2" />
                    Extraction Summary
                 </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Source</p>
                    <p className="text-lg font-bold">{dataSources.find(s => s.value === formData.dataSource)?.label}</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Interval</p>
                    <p className="text-lg font-bold">
                       {formData.dateRange === 'custom' 
                         ? `${formData.startDate || '...'} to ${formData.endDate || '...'}`
                         : dateRanges.find(r => r.value === formData.dateRange)?.label
                       }
                    </p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Output</p>
                    <p className="text-lg font-bold font-mono">{formData.exportFormat.toUpperCase()}</p>
                 </div>
              </CardContent>
              <CardFooter className="pt-4 border-t border-primary-foreground/20">
                 <Button 
                   onClick={handleSubmit} 
                   className="w-full bg-white text-primary hover:bg-white/90 font-bold uppercase tracking-widest text-xs h-11"
                   disabled={isExporting || (formData.dateRange === 'custom' && (!formData.startDate || !formData.endDate))}
                 >
                   {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Run Extraction'}
                 </Button>
              </CardFooter>
           </Card>

           <Card className="border-none shadow-sm ring-1 ring-border">
              <CardHeader className="pb-3">
                 <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center">
                    <Calendar className="w-3 h-3 mr-2" />
                    Last Extraction
                 </CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="flex items-center space-x-3 text-sm">
                    <div className="p-2 rounded-lg bg-muted">
                       <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div>
                       <p className="font-bold">users_export_apr20.csv</p>
                       <p className="text-[10px] text-muted-foreground font-bold uppercase">10 minutes ago • 244 KB</p>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}

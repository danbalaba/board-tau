'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/admin/components/ui/card';
import { Button } from '@/app/admin/components/ui/button';
import { Input } from '@/app/admin/components/ui/input';
import { Label } from '@/app/admin/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/admin/components/ui/select';
import { 
  IconDownload as Download, 
  IconFileText as FileText, 
  IconDatabase as Database, 
  IconCalendar as Calendar, 
  IconCircleCheck as CheckCircle2, 
  IconLoader2 as Loader2, 
  IconFileSpreadsheet,
  IconFileCode,
  IconSettingsAutomation,
  IconWorld
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { Badge } from '@/app/admin/components/ui/badge';
import { Switch } from '@/app/admin/components/ui/switch';
import { cn } from '@/app/admin/lib/utils';
import PageContainer from '@/app/admin/components/layout/page-container';
import { motion } from 'framer-motion';

const exportOptions = [
  { value: 'csv', label: 'Comma Separated (CSV)', icon: IconFileSpreadsheet, color: 'text-emerald-500' },
  { value: 'json', label: 'JavaScript Object (JSON)', icon: IconFileCode, color: 'text-amber-500' },
  { value: 'pdf', label: 'Portable Document (PDF)', icon: FileText, color: 'text-red-500' }
];

const dataSources = [
  { value: 'users', label: 'User Directory', description: 'Full list of registered members and their roles', icon: IconUserSearch },
  { value: 'listings', label: 'Property Inventory', description: 'All listings including status and regional data', icon: IconWorld },
  { value: 'reservations', label: 'Booking History', description: 'Complete record of all stays and payments', icon: IconCalendar },
  { value: 'reviews', label: 'Guest Feedback', description: 'Aggregated reviews and rating metrics', icon: IconFileText },
  { value: 'financial', label: 'Financial Records', description: 'Taxable revenue and payment methodology', icon: Database }
];

const dateRanges = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7', label: 'Last 7 Days' },
  { value: 'last30', label: 'Last 30 Days' },
  { value: 'last90', label: 'Last 90 Days' },
  { value: 'custom', label: 'Custom Range' }
];

import { IconUserSearch } from '@tabler/icons-react';

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
    <PageContainer
      pageTitle="Extraction Central"
      pageDescription="Global dataset export hub for external auditing and deep-dive analytics"
      pageHeaderAction={
        <div className="flex items-center gap-2">
           <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-black uppercase tracking-widest text-[9px] h-9 px-4 flex items-center gap-2">
             <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
             Live Database Sync
           </Badge>
        </div>
      }
    >
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none bg-card/30 backdrop-blur-md shadow-xl ring-1 ring-white/5">
            <CardHeader className="pb-8">
              <CardTitle className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                <Database className="w-6 h-6 text-primary" />
                Inference Source Selection
              </CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Define the primary dataset cluster for extraction</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dataSources.map((source) => {
                  const IconComp = source.icon;
                  return (
                    <div 
                      key={source.value}
                      onClick={() => handleSelectChange('dataSource', source.value)}
                      className={cn(
                        "relative group p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300",
                        formData.dataSource === source.value 
                        ? 'border-primary bg-primary/5 shadow-2xl shadow-primary/10' 
                        : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10'
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "p-2.5 rounded-xl transition-all",
                          formData.dataSource === source.value ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/30' : 'bg-white/10 text-muted-foreground group-hover:text-foreground'
                        )}>
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black tracking-tight uppercase">{source.label}</h4>
                          <p className="text-[10px] text-muted-foreground/80 mt-0.5 font-medium line-clamp-1">{source.description}</p>
                        </div>
                      </div>
                      {formData.dataSource === source.value && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-white/5">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">T-Interval Parameters</Label>
                  <Select
                    value={formData.dateRange}
                    onValueChange={(v) => handleSelectChange('dateRange', v)}
                  >
                    <SelectTrigger className="h-11 bg-white/5 border-white/10 font-bold uppercase text-[10px] tracking-widest">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dateRanges.map(r => (
                        <SelectItem key={r.value} value={r.value} className="font-bold uppercase text-[10px] tracking-widest">{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Encapsulation Protocol</Label>
                   <Select
                    value={formData.exportFormat}
                    onValueChange={(v) => handleSelectChange('exportFormat', v)}
                  >
                    <SelectTrigger className="h-11 bg-white/5 border-white/10 font-bold uppercase text-[10px] tracking-widest">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {exportOptions.map(o => (
                        <SelectItem key={o.value} value={o.value} className="font-bold uppercase text-[10px] tracking-widest">
                          <div className="flex items-center gap-2">
                            <o.icon className={cn("w-4 h-4", o.color)} />
                            {o.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.dateRange === 'custom' && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-2 gap-4 p-6 rounded-2xl bg-black/20 border border-white/5"
                >
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Start Marker</Label>
                    <Input 
                      type="date" 
                      value={formData.startDate}
                      onChange={(e) => handleSelectChange('startDate', e.target.value)}
                      className="bg-white/5 border-white/10 h-10 font-mono text-[10px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">End Marker</Label>
                    <Input 
                      type="date" 
                      value={formData.endDate}
                      onChange={(e) => handleSelectChange('endDate', e.target.value)}
                      className="bg-white/5 border-white/10 h-10 font-mono text-[10px]"
                    />
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none bg-card/30 backdrop-blur-md shadow-xl ring-1 ring-white/5 overflow-hidden">
            <CardHeader className="bg-white/5 pb-4">
              <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <IconSettingsAutomation className="w-4 h-4 text-primary" />
                Advanced Directives
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
               <div className="flex items-center justify-between py-2">
                  <div className="space-y-1">
                    <Label className="text-sm font-black tracking-tight uppercase">Include Key-Headers</Label>
                    <p className="text-[10px] text-muted-foreground font-medium">Embed metadata labels in the primary header-row</p>
                  </div>
                  <Switch 
                    checked={formData.includeHeaders} 
                    onCheckedChange={(v) => handleToggleChange('includeHeaders', v)} 
                    className="data-[state=checked]:bg-primary"
                  />
               </div>
               <div className="h-px bg-white/5 my-4" />
               <div className="flex items-center justify-between py-2">
                  <div className="space-y-1">
                    <Label className="text-sm font-black tracking-tight uppercase">Privacy Masking</Label>
                    <p className="text-[10px] text-muted-foreground font-medium">Auto-anonymize sensitive identity-fields during stream</p>
                  </div>
                  <Switch 
                    checked={formData.anonymize} 
                    onCheckedChange={(v) => handleToggleChange('anonymize', v)} 
                    className="data-[state=checked]:bg-primary"
                  />
               </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
           <Card className="border-none bg-primary shadow-2xl shadow-primary/20 text-white overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
              <CardHeader className="relative z-10">
                 <CardTitle className="text-base font-black uppercase italic tracking-tighter flex items-center gap-3">
                    <Download className="w-6 h-6" />
                    Manifest Summary
                 </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 space-y-6">
                 <div className="space-y-1 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Source Vector</p>
                    <p className="text-lg font-black tracking-tight uppercase">{dataSources.find(s => s.value === formData.dataSource)?.label}</p>
                 </div>
                 <div className="space-y-1 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Interval Window</p>
                    <p className="text-lg font-black tracking-tight uppercase">
                       {formData.dateRange === 'custom' 
                         ? `${formData.startDate || '...'} -> ${formData.endDate || '...'}`
                         : dateRanges.find(r => r.value === formData.dateRange)?.label
                       }
                    </p>
                 </div>
                 <div className="space-y-1 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Encapsulation</p>
                    <p className="text-2xl font-black tracking-tighter font-mono">{formData.exportFormat.toUpperCase()}</p>
                 </div>
              </CardContent>
              <CardFooter className="relative z-10 pt-4 pb-8">
                 <Button 
                   onClick={handleSubmit} 
                   className="w-full bg-white text-primary hover:bg-white/90 font-black uppercase tracking-widest text-[11px] h-14 rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95"
                   disabled={isExporting || (formData.dateRange === 'custom' && (!formData.startDate || !formData.endDate))}
                 >
                   {isExporting ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                     <>
                       <Download className="w-5 h-5 mr-2" />
                       Execute Extraction
                     </>
                   )}
                 </Button>
              </CardFooter>
           </Card>

           <Card className="border-none bg-card/30 backdrop-blur-md shadow-xl ring-1 ring-white/5">
              <CardHeader className="pb-4">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    Last Stream Trace
                 </CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                       <IconFileSpreadsheet className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                       <p className="font-black text-sm uppercase tracking-tight truncate">users_manifest_0425.csv</p>
                       <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">T-10m • 244 KB</p>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>
      </motion.div>
    </PageContainer>
  );
}

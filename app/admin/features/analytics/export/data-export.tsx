'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/admin/components/ui/card';
import { Button } from '@/app/admin/components/ui/button';
import { Input } from '@/app/admin/components/ui/input';
import { Label } from '@/app/admin/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/admin/components/ui/select';
import { Checkbox } from '@/app/admin/components/ui/checkbox';
import { 
  IconDownload as Download, 
  IconFileText as FileText, 
  IconChartBar as BarChart, 
  IconChartPie as PieChart, 
  IconChartLine as LineChart,
  IconHistory as History,
  IconDatabase,
  IconCloud,
  IconShieldCheck,
  IconTableExport,
  IconFilter
} from '@tabler/icons-react';
import { cn } from '@/app/admin/lib/utils';
import PageContainer from '@/app/admin/components/layout/page-container';
import { motion } from 'framer-motion';
import { Badge } from '@/app/admin/components/ui/badge';

// Mock data export options
const exportOptions = [
  { value: 'csv', label: 'CSV' },
  { value: 'json', label: 'JSON' },
  { value: 'pdf', label: 'PDF' },
  { value: 'excel', label: 'Excel' }
];

const dataSources = [
  { value: 'users', label: 'Users' },
  { value: 'listings', label: 'Listings' },
  { value: 'reservations', label: 'Reservations' },
  { value: 'reviews', label: 'Reviews' },
  { value: 'financial', label: 'Financial Data' },
  { value: 'analytics', label: 'Analytics Data' }
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
    compress: false
  });
  const [exporting, setExporting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setExporting(true);
    // Simulate export
    setTimeout(() => {
      setExporting(false);
      alert('Data export started!');
    }, 2000);
  };

  return (
    <PageContainer
      pageTitle="Data Foundry"
      pageDescription="Configure high-fidelity datasets and initialize secure transmission protocols"
      pageHeaderAction={
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-none font-black uppercase text-[9px] h-5 px-2">
            Secure Tunnel Active
          </Badge>
          <Button variant="outline" size="sm" className="h-9 gap-2 hover:bg-white/5 border-border/40 font-black uppercase text-[10px] tracking-widest">
            <History className="w-4 h-4" />
            Audit Ledger
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="border-none bg-card/30 backdrop-blur-md shadow-xl">
                  <CardHeader className="pb-8">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <IconTableExport className="w-5 h-5" />
                      </div>
                      <CardTitle className="text-xl font-black tracking-tight">Dataset blueprint</CardTitle>
                    </div>
                    <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Define the structural dimensions of your export package</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Primary Data Vector</Label>
                        <Select
                          value={formData.dataSource}
                          onValueChange={(value) => handleSelectChange('dataSource', value)}
                        >
                          <SelectTrigger className="bg-white/5 border-white/10 h-12 font-bold uppercase text-xs">
                            <SelectValue placeholder="Select dataset" />
                          </SelectTrigger>
                          <SelectContent className="bg-background/95 backdrop-blur-xl border-border/40">
                            {dataSources.map(source => (
                              <SelectItem key={source.value} value={source.value} className="text-xs font-bold uppercase">Source: {source.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Transmission Format</Label>
                        <Select
                          value={formData.exportFormat}
                          onValueChange={(value) => handleSelectChange('exportFormat', value)}
                        >
                          <SelectTrigger className="bg-white/5 border-white/10 h-12 font-bold uppercase text-xs">
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                          <SelectContent className="bg-background/95 backdrop-blur-xl border-border/40">
                            {exportOptions.map(option => (
                              <SelectItem key={option.value} value={option.value} className="text-xs font-bold uppercase">Format: {option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Time Horizon</Label>
                      <Select
                        value={formData.dateRange}
                        onValueChange={(value) => handleSelectChange('dateRange', value)}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 h-12 font-bold uppercase text-xs">
                          <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent className="bg-background/95 backdrop-blur-xl border-border/40">
                          {dateRanges.map(range => (
                            <SelectItem key={range.value} value={range.value} className="text-xs font-bold uppercase">{range.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.dateRange === 'custom' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-2">
                          <Label htmlFor="startDate" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Start Protocol</Label>
                          <Input
                            id="startDate"
                            name="startDate"
                            type="date"
                            value={formData.startDate}
                            onChange={handleChange}
                            className="bg-white/5 border-white/10 h-10 font-bold"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endDate" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">End Protocol</Label>
                          <Input
                            id="endDate"
                            name="endDate"
                            type="date"
                            value={formData.endDate}
                            onChange={handleChange}
                            className="bg-white/5 border-white/10 h-10 font-bold"
                            required
                          />
                        </div>
                      </motion.div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/5 border border-white/5 transition-all hover:bg-white/10 group">
                        <Checkbox 
                          id="includeHeaders" 
                          name="includeHeaders"
                          checked={formData.includeHeaders}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeHeaders: !!checked }))}
                          className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary" 
                        />
                        <Label htmlFor="includeHeaders" className="text-[10px] font-black uppercase tracking-widest cursor-pointer group-hover:text-primary transition-colors">Include Metadata Headers</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/5 border border-white/5 transition-all hover:bg-white/10 group">
                        <Checkbox 
                          id="compress" 
                          name="compress"
                          checked={formData.compress}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, compress: !!checked }))}
                          className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary" 
                        />
                        <Label htmlFor="compress" className="text-[10px] font-black uppercase tracking-widest cursor-pointer group-hover:text-primary transition-colors">LZW PayLoad Compression</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <Card className="border-none bg-card/30 backdrop-blur-md shadow-xl">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                       <BarChart className="w-5 h-5 text-primary opacity-50" />
                       <CardTitle className="text-lg font-black tracking-tight">Export Preview</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      {[
                        { label: 'Primary Vector', value: dataSources.find(s => s.value === formData.dataSource)?.label },
                        { label: 'Target Format', value: exportOptions.find(o => o.value === formData.exportFormat)?.label },
                        { label: 'Time Horizon', value: formData.dateRange === 'custom' ? `${formData.startDate} → ${formData.endDate}` : dateRanges.find(r => r.value === formData.dateRange)?.label }
                      ].map((item, i) => (
                        <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5">
                          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-1">{item.label}</div>
                          <div className="text-xs font-black uppercase tracking-tight">{item.value || 'N/A'}</div>
                        </div>
                      ))}
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 gap-3 shadow-lg shadow-primary/20 font-black uppercase text-xs tracking-widest mt-4"
                      disabled={exporting || (formData.dateRange === 'custom' && (!formData.startDate || !formData.endDate))}
                    >
                      {exporting ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing Payload...
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5" />
                          Initialize Transfer
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <Card className="border-none bg-emerald-500/5 backdrop-blur-md shadow-xl ring-1 ring-emerald-500/20">
                 <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-500">
                        <IconShieldCheck className="w-4 h-4" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80">End-to-End Encryption</p>
                    </div>
                    <p className="text-xs font-medium text-emerald-500/60 leading-relaxed italic">All datasets are salted and hashed before transmission via secure SOC2 compliant tunnels.</p>
                 </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}

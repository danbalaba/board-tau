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
import { 
  IconFileText, 
  IconFileSpreadsheet, 
  IconFileCode, 
  IconEye, 
  IconDownload, 
  IconPlus,
  IconChartBar,
  IconSearch,
  IconCalendar,
  IconArrowUpRight
} from '@tabler/icons-react';
import PageContainer from '@/app/admin/components/layout/page-container';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

import { useFinancialReports } from '@/app/admin/hooks/use-financial-reports';

export function FinancialReports() {
  const { data: apiResponse, isLoading, error } = useFinancialReports('list');
  const reports = apiResponse?.data?.reports || [];
  const stats = apiResponse?.data?.stats || { total: 0, pdf: 0, excel: 0, csv: 0 };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Compiling intelligence reports...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error.message}</div>;

  const kpis = [
    { title: "Total Archives", value: stats.total, icon: IconFileText, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "PDF Documents", value: stats.pdf, icon: IconFileText, color: "text-rose-500", bg: "bg-rose-500/10" },
    { title: "Excel Worksheets", value: stats.excel, icon: IconFileSpreadsheet, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "CSV Datasets", value: stats.csv, icon: IconFileCode, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  const getFormatIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case 'pdf': return IconFileText;
      case 'excel':
      case 'xlsx': return IconFileSpreadsheet;
      case 'csv': return IconFileCode;
      default: return IconFileText;
    }
  };

  const getFormatColor = (format: string) => {
    switch (format.toLowerCase()) {
      case 'pdf': return "text-rose-500 bg-rose-500/10";
      case 'excel':
      case 'xlsx': return "text-emerald-500 bg-emerald-500/10";
      case 'csv': return "text-amber-500 bg-amber-500/10";
      default: return "text-blue-500 bg-blue-500/10";
    }
  };

  return (
    <PageContainer>
      <div className="space-y-8 pb-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Financial Intelligence</h2>
            <p className="text-muted-foreground text-sm mt-1">On-demand reporting and multi-format data visualization exports.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <IconSearch className="w-4 h-4" /> Browse
            </Button>
            <Button className="h-9 gap-2">
              <IconPlus className="w-4 h-4" /> New Report
            </Button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="group relative overflow-hidden border-none bg-card/30 backdrop-blur-md shadow-xl transition-all hover:bg-card/40">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{kpi.title}</CardTitle>
                  <div className={cn("p-2 rounded-lg", kpi.bg)}>
                    <kpi.icon className={cn("w-4 h-4", kpi.color)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpi.value}</div>
                  <div className="flex items-center mt-1 space-x-1">
                    <IconArrowUpRight className="w-3 h-3 text-emerald-500" />
                    <span className="text-[10px] text-muted-foreground">Historical records</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Generated Reports List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <IconChartBar className="w-5 h-5 text-primary" />
                Latest Generations
              </h3>
            </div>
            
            <div className="space-y-3">
              {reports.map((report: any, i: number) => {
                const FormatIcon = getFormatIcon(report.format);
                return (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group"
                  >
                    <div className="flex items-center justify-between p-4 bg-card/30 backdrop-blur-md rounded-xl border border-border/40 hover:border-primary/40 transition-all hover:bg-muted/30">
                      <div className="flex items-center gap-4">
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", getFormatColor(report.format))}>
                          <FormatIcon className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold truncate max-w-[200px] md:max-w-md">{report.name}</h4>
                          <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <IconCalendar className="w-3 h-3" />
                              {new Date(report.date).toLocaleDateString()}
                            </span>
                            <span className="bg-primary/5 px-1.5 py-0.5 rounded uppercase font-mono tracking-tighter">{report.type}</span>
                            <span className="font-mono text-primary/70">{report.size}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-full hover:bg-primary/20"
                          onClick={() => console.log('View', report.id)}
                        >
                          <IconEye className="h-4 w-4 text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-full hover:bg-emerald-500/20"
                          onClick={() => console.log('Download', report.id)}
                        >
                          <IconDownload className="h-4 w-4 text-emerald-500" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Generator Controls */}
          <div className="space-y-6">
            <div className="px-1">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <IconPlus className="w-5 h-5 text-primary" />
                Generator Unit
              </h3>
            </div>
            
            <Card className="border-none bg-card/60 backdrop-blur-lg shadow-xl shadow-black/10">
              <CardHeader>
                <CardTitle className="text-sm">Compile Parameters</CardTitle>
                <CardDescription className="text-xs">Select data scope and export format.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Target Module</label>
                  <select className="w-full bg-background/50 text-sm p-3 rounded-xl border border-border/50 focus:ring-1 focus:ring-primary outline-none appearance-none">
                    <option>Monthly Revenue Analysis</option>
                    <option>Quarterly Tax Compliance</option>
                    <option>Annual Fiscal Summary</option>
                    <option>Host Remittance Ledger</option>
                    <option>Platform Loss/Gain Dataset</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Export Protocol</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['PDF', 'Excel', 'CSV'].map((format) => (
                      <div key={format} className="relative">
                        <input type="radio" name="format" id={format} className="peer hidden" defaultChecked={format === 'PDF'} />
                        <label htmlFor={format} className="flex flex-col items-center justify-center p-3 rounded-xl border border-border/50 bg-background/30 cursor-pointer peer-checked:border-primary peer-checked:bg-primary/5 transition-all text-xs font-medium">
                          {format}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Temporal Scope</label>
                  <select className="w-full bg-background/50 text-sm p-3 rounded-xl border border-border/50 focus:ring-1 focus:ring-primary outline-none">
                    <option>Current Fiscal Period</option>
                    <option>Last 90 Trading Days</option>
                    <option>Trailing 12 Months</option>
                    <option>Custom Temporal Window</option>
                  </select>
                </div>

                <Button className="w-full h-12 rounded-xl text-xs font-bold uppercase tracking-widest mt-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" onClick={() => console.log('Generate report')}>
                  Deploy Generation
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

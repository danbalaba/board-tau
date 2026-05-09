'use client';

import React from 'react';
import { motion } from 'framer-motion';
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
  IconCalendar,
  IconArrowUpRight
} from '@tabler/icons-react';
import { cn } from "@/lib/utils";

import { useFinancialReports } from '@/app/admin/hooks/use-financial-reports';
import { AdminReportsHeader } from './admin-reports-header';

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
      case 'pdf': return "text-rose-500 bg-rose-500/10 border-rose-500/20";
      case 'excel':
      case 'xlsx': return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case 'csv': return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      default: return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-6">
      <AdminReportsHeader />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-lg rounded-[2rem] overflow-hidden group">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{kpi.title}</CardTitle>
                <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110", kpi.bg)}>
                  <kpi.icon className={cn("w-5 h-5", kpi.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-gray-900 dark:text-white tabular-nums tracking-tighter">{kpi.value}</div>
                <div className="flex items-center mt-2 gap-1.5 bg-gray-50 dark:bg-gray-800/50 w-fit px-2 py-1 rounded-lg">
                  <IconArrowUpRight className="w-3 h-3 text-emerald-500" />
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Historical records</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Generated Reports List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2 mb-2">
            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <IconChartBar className="w-5 h-5 text-blue-500" />
              Latest Generations
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((report: any, i: number) => {
              const FormatIcon = getFormatIcon(report.format);
              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group"
                >
                  <div className="p-5 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-[2rem] border border-gray-100 dark:border-gray-800 hover:border-blue-500/30 hover:shadow-xl transition-all h-full flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 shadow-sm hover:text-blue-500">
                        <IconEye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 shadow-sm hover:text-emerald-500">
                        <IconDownload className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border mb-4", getFormatColor(report.format))}>
                      <FormatIcon className="h-7 w-7" />
                    </div>
                    
                    <h4 className="text-sm font-black text-gray-900 dark:text-white mb-2 pr-12 leading-tight">
                      {report.name}
                    </h4>
                    
                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <IconCalendar className="w-3.5 h-3.5" />
                        {new Date(report.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-[0.5rem] text-[9px] font-black uppercase tracking-widest">
                          {report.type}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-gray-400">{report.size}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Generator Controls */}
        <div className="space-y-6">
          <div className="px-2 mb-2">
            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <IconPlus className="w-5 h-5 text-blue-500" />
              Generator Unit
            </h3>
          </div>
          
          <div className="rounded-[2.5rem] border border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-1">Compile Parameters</h4>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select data scope and export format.</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-2">Target Module</label>
                <select className="w-full bg-white dark:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-300 p-4 rounded-[1.25rem] border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none shadow-sm">
                  <option>Monthly Revenue Analysis</option>
                  <option>Quarterly Tax Compliance</option>
                  <option>Annual Fiscal Summary</option>
                  <option>Host Remittance Ledger</option>
                  <option>Platform Loss/Gain Dataset</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-2">Export Protocol</label>
                <div className="grid grid-cols-3 gap-3">
                  {['PDF', 'Excel', 'CSV'].map((format) => (
                    <div key={format} className="relative">
                      <input type="radio" name="format" id={format} className="peer hidden" defaultChecked={format === 'PDF'} />
                      <label htmlFor={format} className="flex flex-col items-center justify-center p-4 rounded-[1.25rem] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 cursor-pointer peer-checked:border-blue-500 peer-checked:bg-blue-500/5 peer-checked:text-blue-500 transition-all text-xs font-black uppercase tracking-widest shadow-sm">
                        {format}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-2">Temporal Scope</label>
                <select className="w-full bg-white dark:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-300 p-4 rounded-[1.25rem] border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none shadow-sm">
                  <option>Current Fiscal Period</option>
                  <option>Last 90 Trading Days</option>
                  <option>Trailing 12 Months</option>
                  <option>Custom Temporal Window</option>
                </select>
              </div>

              <Button className="w-full h-14 rounded-[1.25rem] text-[11px] font-black uppercase tracking-[0.2em] mt-4 bg-gray-900 hover:bg-blue-600 dark:bg-white dark:text-gray-900 dark:hover:bg-blue-600 shadow-xl shadow-blue-500/20 transition-all">
                Deploy Generation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

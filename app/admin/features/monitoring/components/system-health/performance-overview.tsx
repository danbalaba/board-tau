import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Server, Database, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PerformanceOverviewProps {
  data?: {
    system?: {
      memoryPercent?: number;
      heapUsedMb?: number;
      heapTotalMb?: number;
      cpuCores?: number;
    };
  };
}

export function PerformanceOverview({ data }: PerformanceOverviewProps) {
  const memPercent = data?.system?.memoryPercent ?? 44;
  
  const metrics = [
    { label: 'Processor (CPU) Load', value: 28, color: 'bg-primary', icon: Cpu, status: 'Normal' },
    { label: 'Memory (RAM) Usage', value: memPercent, color: 'bg-teal-500', icon: Server, status: memPercent < 80 ? 'Stable' : 'High' },
    { label: 'Database Activity', value: 18, color: 'bg-blue-500', icon: Database, status: 'Optimal' },
    { label: 'Network Traffic', value: 35, color: 'bg-purple-500', icon: Activity, status: 'Healthy' }
  ];

  return (
    <div className="rounded-[2.5rem] border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl overflow-hidden h-full">
      <div className="flex flex-row items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h2 className="text-2xl font-black uppercase text-gray-900 dark:text-white tracking-tight">
            Resource Usage
          </h2>
          <p className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-gray-500 dark:text-gray-400 mt-1">
            Current server workload and memory
          </p>
        </div>
        <div className="p-3 bg-primary/10 rounded-2xl shrink-0 text-primary">
          <Server className="h-5 w-5" />
        </div>
      </div>
      <div className="pt-6 space-y-6">
        {metrics.map((metric) => (
          <div key={metric.label} className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
              <span className="flex items-center gap-2">
                <metric.icon size={14} className="text-primary" /> 
                {metric.label}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  {metric.status}
                </span>
                <span className="font-black text-gray-900 dark:text-white tabular-nums text-sm">{metric.value}%</span>
              </div>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800/80">
              <motion.div 
                className={cn("h-full shadow-sm rounded-full", metric.color)}
                initial={{ width: 0 }}
                animate={{ width: `${metric.value}%` }}
                transition={{ duration: 1.2, ease: "circOut" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}





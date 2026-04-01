// app/admin/features/moderation/components/host-applications/index.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  ShieldCheck, 
  RefreshCcw, 
  Search, 
  SearchIcon, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/app/admin/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ApplicationKPICards } from './application-kpi-cards';
import { ApplicationTable } from './application-table';

// Mock data (Preserving your original data values)
const mockApplications: any[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    experience: '3 years in property management',
    motivation: 'I want to share my knowledge and help people find great accommodation',
    documentsVerified: true,
    status: 'pending',
    submittedAt: '2024-01-09T16:45:00Z',
    lastUpdated: '2024-01-09T16:45:00Z'
  },
  {
    id: '2',
    name: 'Sarah Williams',
    email: 'sarah.w@example.com',
    phone: '+1 (555) 234-5678',
    experience: '1 year hosting on other platforms',
    motivation: 'I love meeting new people and providing comfortable stays',
    documentsVerified: true,
    status: 'pending',
    submittedAt: '2024-01-08T14:20:00Z',
    lastUpdated: '2024-01-08T14:20:00Z'
  },
  {
    id: '3',
    name: 'Michael Chen',
    email: 'michael.c@example.com',
    phone: '+1 (555) 345-6789',
    experience: 'First time hosting',
    motivation: 'I have a spare room and want to earn extra income',
    documentsVerified: false,
    status: 'pending',
    submittedAt: '2024-01-07T11:30:00Z',
    lastUpdated: '2024-01-07T11:30:00Z'
  }
];

export function HostApplicationsDashboard() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [applications, setApplications] = useState(mockApplications);

  const handleSync = async () => {
    setIsSyncing(true);
    // Simulate API fetch delay
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSyncing(false);
    toast.success('Moderation queue synchronized with latest submissions.');
  };

  const handleApprove = (id: string) => {
    setApplications(apps => apps.map(app => 
      app.id === id ? { ...app, status: 'approved' } : app
    ));
    toast.success('Application approved successfully.');
  };

  const handleReject = (id: string) => {
    setApplications(apps => apps.map(app => 
      app.id === id ? { ...app, status: 'rejected' } : app
    ));
    toast.warning('Application rejected.');
  };

  const pendingCount = applications.filter(a => a.status === 'pending').length;
  const approvedCount = applications.filter(a => a.status === 'approved').length;
  const rejectedCount = applications.filter(a => a.status === 'rejected').length;

  return (
    <div className="p-6 lg:p-10 space-y-10">
      {/* Executive Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border/50 pb-10">
        <div className="space-y-1">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black tracking-tighter text-foreground uppercase flex items-center gap-4"
          >
            Host Applications
            {pendingCount > 0 && (
              <span className="flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 rounded-2xl border border-amber-500/10 text-amber-500 text-[10px] tracking-[0.2em] font-black">
                <ShieldAlert className="w-3 h-3" />
                ACTION REQUIRED
              </span>
            )}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground font-medium text-sm flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Vetting and authorizing new property hosts
          </motion.p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={handleSync}
            className={cn("h-11 w-11 rounded-xl border-border/60", isSyncing && "animate-spin")}
          >
            <RefreshCcw className="w-4 h-4" />
          </Button>

          <Button
            variant="default"
            className="h-11 px-8 gap-3 rounded-2xl bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-95 text-white"
          >
            <ArrowRight className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Verification Logs</span>
          </Button>
        </div>
      </div>

      {/* KPI Section */}
      <ApplicationKPICards 
        total={applications.length} 
        pending={pendingCount} 
        approved={approvedCount} 
        rejected={rejectedCount} 
      />

      {/* Main Table Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pl-4 border-l-[3px] border-primary">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/80 text-primary">Live Moderation List</h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ApplicationTable 
            applications={applications}
            onView={(id) => toast.info(`Viewing application detail: ${id}`)}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </motion.div>
      </div>
    </div>
  );
}

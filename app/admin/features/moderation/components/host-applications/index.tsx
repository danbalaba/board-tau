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
import { useHostApplications, useModerationDecision } from '@/app/admin/hooks/use-moderation';
import { Button } from '@/app/admin/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ApplicationKPICards } from './application-kpi-cards';
import { ApplicationTable } from './application-table';

export function HostApplicationsDashboard() {
  const { data: apiResponse, isLoading, refetch, isFetching } = useHostApplications();
  const { mutate: decide } = useModerationDecision();

  const handleSync = async () => {
    await refetch();
    toast.success('Moderation queue synchronized with latest submissions.');
  };

  const handleAction = (id: string, action: 'approve' | 'reject') => {
    decide({ id, entityType: 'hostApplication', action }, {
      onSuccess: () => {
        toast.success(`Application ${action === 'approve' ? 'authorized' : 'rejected'} successfully.`);
      },
      onError: (err: any) => {
        toast.error(`Database Error: ${err.message}`);
      }
    });
  };

  const applications = apiResponse?.data || [];
  const pendingCount = apiResponse?.meta?.stats?.pending || 0;
  const approvedCount = apiResponse?.meta?.stats?.approved || 0;
  const rejectedCount = apiResponse?.meta?.stats?.rejected || 0;

  if (isLoading) {
    return (
      <div className="p-6 lg:p-10 text-center">
        <h2 className="text-2xl font-bold italic animate-pulse">Initializing Security Clearance...</h2>
      </div>
    );
  }

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
                {pendingCount} ACTION REQUIRED
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
            className={cn("h-11 w-11 rounded-xl border-border/60", isFetching && "animate-spin")}
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
        total={pendingCount} 
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
            applications={applications.map((app: any) => ({
              id: app.id,
              name: app.user.name,
              email: app.user.email,
              phone: app.contactInfo?.phoneNumber || 'N/A',
              experience: app.businessInfo?.experience || 'N/A',
              motivation: app.businessInfo?.motivation || 'N/A',
              documentsVerified: !!app.documents,
              status: app.status,
              submittedAt: app.createdAt,
              lastUpdated: app.updatedAt
            }))}
            onView={(id) => toast.info(`Viewing application detail: ${id}`)}
            onApprove={(id) => handleAction(id, 'approve')}
            onReject={(id) => handleAction(id, 'reject')}
          />
        </motion.div>
      </div>
    </div>
  );
}

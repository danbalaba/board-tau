// app/admin/features/moderation/components/moderation-queue/index.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  RefreshCcw, 
  Clock, 
  Filter, 
  Search, 
  FileText, 
  User as UserIcon,
  ExternalLink,
  CheckCircle,
  XCircle,
  TrendingUp,
  Inbox
} from 'lucide-react';
import { Button } from '@/app/admin/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/app/admin/components/ui/dialog';
import { Badge } from '@/app/admin/components/ui/badge';
import { toast } from 'sonner';
import { useModerationQueue, useModerationDecision, type ModerationItem } from '@/app/admin/hooks/use-moderation';
import { GovernanceKPICards } from './governance-kpi-cards';
import { DecisionTable } from './decision-table';
import { cn } from '@/lib/utils';

export function GovernanceCenter() {
  const [page, setPage] = useState(1);
  const [entityType, setEntityType] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const { data, isLoading, isError, error, refetch, isFetching } = useModerationQueue({
    page,
    entityType: entityType || undefined,
  });

  const { mutate: decide, isPending: isDeciding } = useModerationDecision();

  const handleDecision = (id: string, type: 'listing' | 'review' | 'hostApplication', action: 'approve' | 'reject') => {
    decide({ id, entityType: type, action }, {
      onSuccess: () => {
        toast.success(`System Authorization: Item ${action === 'approve' ? 'authorized' : 'rejected'} successfully.`);
        setIsDetailsOpen(false);
      },
      onError: (err: any) => {
        toast.error(`Database Error: ${err.message}`);
      }
    });
  };

  const openDetails = (item: ModerationItem) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };

  const handleSync = async () => {
    await refetch();
    toast.success('Governance feed updated.');
  };

  const total = data?.meta?.total || 0;
  const items = data?.data || [];

  return (
    <div className="p-6 lg:p-10 space-y-12">
      {/* Executive Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border/50 pb-10">
        <div className="space-y-1">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black tracking-tighter text-foreground uppercase flex items-center gap-4"
          >
            Governance Center
            {total > 0 && (
              <span className="flex items-center gap-1.5 bg-indigo-500/10 px-3 py-1.5 rounded-2xl border border-indigo-500/10 text-indigo-500 text-[10px] tracking-[0.2em] font-black italic">
                {total} PRIORITY ITEMS
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
            Administrative oversight and final authorization queue
          </motion.p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={handleSync}
            className={cn("h-11 w-11 rounded-xl border-border/60 bg-background/50", (isLoading || isFetching) && "animate-spin")}
          >
            <RefreshCcw className="w-4 h-4 text-primary" />
          </Button>

          <Button
            variant="default"
            className="h-11 px-8 gap-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 transition-all active:scale-95 text-white"
          >
            <Filter className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Filter Pipeline</span>
          </Button>
        </div>
      </div>

      {/* KPI Section */}
      <GovernanceKPICards 
        totalBacklog={total} 
        resolutionRate="94.2%" 
        activeModerators={3} 
      />

      {/* Main Table Section */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
          <div className="flex items-center gap-3 pl-4 border-l-[3px] border-indigo-500">
            <Inbox className="w-5 h-5 text-indigo-500" />
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/80">Decision Inbox</h2>
          </div>

          <div className="flex gap-1.5 bg-muted/40 p-1.5 rounded-2xl border border-border/40 backdrop-blur-sm">
            {[
              { label: 'All', value: '' },
              { label: 'Listings', value: 'listing' },
              { label: 'Profiles', value: 'hostApplication' },
              { label: 'Reviews', value: 'review' },
            ].map((tab) => (
              <button
                key={tab.label}
                onClick={() => setEntityType(tab.value)}
                className={cn(
                  "px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300",
                  entityType === tab.value 
                    ? "bg-indigo-600 shadow-lg shadow-indigo-600/20 text-white" 
                    : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/60"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <DecisionTable 
            items={items}
            onInspect={openDetails}
            onDecision={handleDecision}
            isDeciding={isDeciding}
          />
        </motion.div>
      </div>

      {/* Details Briefing Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[700px] border-indigo-500/20 bg-background/95 backdrop-blur-3xl rounded-[40px] p-0 overflow-hidden shadow-2xl">
          <div className="bg-indigo-600/10 border-b border-indigo-500/20 py-8 px-10">
            <DialogHeader>
              <div className="flex items-center gap-6">
                <div className="h-14 w-14 bg-indigo-600 shadow-xl shadow-indigo-600/20 rounded-3xl flex items-center justify-center">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Moderation Briefing</DialogTitle>
                  <DialogDescription className="text-xs font-bold uppercase tracking-widest text-indigo-600/60 flex items-center gap-2 mt-1">
                    <ShieldCheck className="w-3 h-3" />
                    Security Clearance Level 1 Required
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>
          
          <div className="p-10 space-y-10">
            <div className="grid grid-cols-2 gap-10">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-[0.25em]">Entity Identification</p>
                <div className="flex flex-col gap-2">
                   <div className="flex items-center gap-2">
                     <p className="text-xl font-black tracking-tighter uppercase">{selectedItem?.title}</p>
                   </div>
                   <Badge variant="outline" className="w-fit text-[9px] font-black border-primary/20 bg-primary/5 uppercase tracking-widest px-3 py-1 scale-110 origin-left">
                     INTERNAL ID: {selectedItem?.id.slice(-8).toUpperCase()}
                   </Badge>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-[0.25em]">System Timestamp</p>
                <div className="flex items-center gap-3 text-lg font-black tracking-tighter">
                  <Clock className="w-5 h-5 text-indigo-500" />
                  {selectedItem && new Date(selectedItem.createdAt).toLocaleString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </div>

            <div className="space-y-4 p-8 bg-card/40 rounded-[32px] border border-border/40 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <UserIcon className="w-4 h-4 text-emerald-500" />
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest italic">Initiator Biological Signature</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-3xl bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center text-xl font-black italic text-indigo-600 shadow-inner">
                  {selectedItem?.user.name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-lg font-black tracking-tight uppercase text-foreground">{selectedItem?.user.name}</p>
                  <p className="text-xs font-medium text-muted-foreground italic lowercase">{selectedItem?.user.email}</p>
                </div>
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-border/40 hover:bg-indigo-600 hover:text-white transition-all group">
                  <ExternalLink className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-[0.25em] px-1">Case Narrative & Evidence</p>
              <div className="p-8 bg-muted/30 border border-border/20 rounded-[32px] text-sm font-medium italic leading-relaxed text-foreground/80 lowercase first-letter:uppercase shadow-inner">
                "{selectedItem?.description || "No anomalous system notes detected. Standard procedural review required for this entity."}"
              </div>
            </div>
          </div>

          <div className="px-10 pb-10 flex gap-4">
            <Button 
              variant="outline" 
              onClick={() => setIsDetailsOpen(false)} 
              className="h-14 px-8 flex-1 rounded-3xl border-border/40 bg-card/40 hover:bg-background text-[11px] font-black uppercase tracking-widest"
            >
              Abort Briefing
            </Button>
            <Button
              className="h-14 bg-rose-500 hover:bg-rose-600 text-white flex-1 rounded-3xl shadow-xl shadow-rose-500/20 text-[11px] font-black uppercase tracking-widest"
              disabled={isDeciding}
              onClick={() => selectedItem && handleDecision(selectedItem.id, selectedItem.entityType, 'reject')}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Negative Decision
            </Button>
            <Button
              className="h-14 bg-emerald-500 hover:bg-emerald-600 text-white flex-1 rounded-3xl shadow-xl shadow-emerald-500/20 text-[11px] font-black uppercase tracking-widest"
              disabled={isDeciding}
              onClick={() => selectedItem && handleDecision(selectedItem.id, selectedItem.entityType, 'approve')}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Authorize Release
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

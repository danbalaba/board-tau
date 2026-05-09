// app/admin/features/moderation/components/moderation-queue/index.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconShieldCheck, 
  IconRefresh, 
  IconClock, 
  IconFilter, 
  IconFileText, 
  IconUser,
  IconExternalLink,
  IconCircleCheck,
  IconCircleX,
  IconInbox
} from '@tabler/icons-react';
import { Button } from '@/app/admin/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/admin/components/ui/dialog';
import { Badge } from '@/app/admin/components/ui/badge';
import { toast } from 'sonner';
import { useModerationQueue, useModerationDecision, type ModerationItem } from '@/app/admin/hooks/use-moderation';
import { GovernanceKPICards } from './governance-kpi-cards';
import { AdminQueueHeader } from './admin-queue-header';
import { AdminQueueCard } from './admin-queue-card';
import { cn } from '@/lib/utils';
import PageContainer from '@/app/admin/components/layout/page-container';

export function GovernanceCenter() {
  const [page, setPage] = useState(1);
  const [entityType, setEntityType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
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

  const filteredItems = useMemo(() => {
    let result = [...items];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.title?.toLowerCase().includes(q) || 
        item.user.name?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [items, searchQuery]);

  return (
    <div className="p-6 lg:p-10 space-y-6">
      <AdminQueueHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        entityType={entityType}
        setEntityType={setEntityType}
        viewMode={viewMode}
        setViewMode={setViewMode}
        handleRefresh={handleSync}
        totalPending={total}
        isLoading={isLoading || isFetching}
      />

      <GovernanceKPICards 
        totalBacklog={total} 
        resolutionRate="94.2%" 
        activeModerators={3} 
      />

      <div className="min-h-[400px] relative mt-8">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-24 flex flex-col items-center justify-center gap-6"
            >
              <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin shadow-xl shadow-indigo-500/10" />
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-500 animate-pulse">Syncing Unified Queue</p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
            >
              {filteredItems.length > 0 && (
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                    Showing {filteredItems.length} priority item{filteredItems.length !== 1 ? 's' : ''}
                  </span>
                  <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
                </div>
              )}

              <AnimatePresence mode="wait">
                {filteredItems.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center shadow-sm"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-500/10 rounded-2xl mb-4 text-indigo-500">
                      <IconInbox size={24} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Inbox is Clear</h3>
                    <p className="text-sm font-medium text-gray-400 max-w-sm mx-auto leading-relaxed">
                      {searchQuery ? `No items found matching "${searchQuery}"` : "All governance systems are clear. Zero backlog at this time."}
                    </p>
                    {searchQuery && (
                      <Button variant="outline" onClick={() => setSearchQuery("")} className="mt-8 rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest">
                        Clear Search
                      </Button>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="list"
                    className={cn(
                      viewMode === "grid"
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        : "space-y-4"
                    )}
                  >
                    {filteredItems.map((item: ModerationItem, idx: number) => (
                      <AdminQueueCard 
                        key={`${viewMode}-${item.id}`}
                        item={item}
                        idx={idx}
                        viewMode={viewMode}
                        onDecision={handleDecision}
                        isDeciding={isDeciding}
                        onInspect={() => openDetails(item)}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Details Briefing Dialog - Used generically for all types here */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[700px] border-indigo-500/20 bg-background/95 backdrop-blur-3xl rounded-[40px] p-0 overflow-hidden shadow-2xl">
          <div className="bg-indigo-600/10 border-b border-indigo-500/20 py-8 px-10">
            <div className="flex items-center gap-6">
              <div className="h-14 w-14 bg-indigo-600 shadow-xl shadow-indigo-600/20 rounded-3xl flex items-center justify-center">
                <IconFileText className="w-7 h-7 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Moderation Briefing</DialogTitle>
                <DialogDescription className="text-xs font-bold uppercase tracking-widest text-indigo-600/60 flex items-center gap-2 mt-1">
                  <IconShieldCheck className="w-3 h-3" />
                  Security Clearance Level 1 Required
                </DialogDescription>
              </div>
            </div>
          </div>
          
          <div className="p-10 space-y-10">
            <div className="grid grid-cols-2 gap-10">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-[0.25em]">Entity Identification</p>
                <div className="flex flex-col gap-2">
                   <div className="flex items-center gap-2">
                     <p className="text-xl font-black tracking-tighter uppercase truncate max-w-[250px]">{selectedItem?.title}</p>
                   </div>
                   <Badge variant="outline" className="w-fit text-[9px] font-black border-primary/20 bg-primary/5 uppercase tracking-widest px-3 py-1 scale-110 origin-left">
                     INTERNAL ID: {selectedItem?.id.slice(-8).toUpperCase()}
                   </Badge>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-[0.25em]">System Timestamp</p>
                <div className="flex items-center gap-3 text-lg font-black tracking-tighter">
                  <IconClock className="w-5 h-5 text-indigo-500" />
                  {selectedItem && new Date(selectedItem.createdAt).toLocaleString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </div>

            <div className="space-y-4 p-8 bg-card/40 rounded-[32px] border border-border/40 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <IconUser className="w-4 h-4 text-emerald-500" />
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest italic">Initiator Signature</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-3xl bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center text-xl font-black italic text-indigo-600 shadow-inner">
                  {selectedItem?.user.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-black tracking-tight uppercase text-foreground truncate">{selectedItem?.user.name}</p>
                  <p className="text-xs font-medium text-muted-foreground italic lowercase truncate">{selectedItem?.user.email}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-[0.25em] px-1">Case Narrative & Evidence</p>
              <div className="p-8 bg-muted/30 border border-border/20 rounded-[32px] text-sm font-medium italic leading-relaxed text-foreground/80 shadow-inner">
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
              <IconCircleX className="w-4 h-4 mr-2" />
              Negative Decision
            </Button>
            <Button
              className="h-14 bg-emerald-500 hover:bg-emerald-600 text-white flex-1 rounded-3xl shadow-xl shadow-emerald-500/20 text-[11px] font-black uppercase tracking-widest"
              disabled={isDeciding}
              onClick={() => selectedItem && handleDecision(selectedItem.id, selectedItem.entityType, 'approve')}
            >
              <IconCircleCheck className="w-4 h-4 mr-2" />
              Authorize Release
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

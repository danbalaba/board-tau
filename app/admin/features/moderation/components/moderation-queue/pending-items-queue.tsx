'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ExternalLink, Inbox, CheckCircle2, User, Home, Star, FileText, Building2, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Badge } from '@/app/admin/components/ui/badge';
import { Button } from '@/app/admin/components/ui/button';
import type { ModerationItem } from '@/app/admin/hooks/use-moderation';

interface PendingItemsQueueProps {
  pendingItems: ModerationItem[];
  isLoading: boolean;
}

const typeLabels: Record<string, string> = {
  listing: 'Listing',
  review: 'Review',
  hostApplication: 'Host Application'
};

const typeColors: Record<string, string> = {
  listing: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  review: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  hostApplication: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
};

export function PendingItemsQueue({ pendingItems, isLoading }: PendingItemsQueueProps) {
  const router = useRouter();
  const [filterType, setFilterType] = useState<string>('all');

  // Compute category counts
  const counts = {
    all: pendingItems.length,
    listing: pendingItems.filter(i => i.entityType === 'listing').length,
    hostApplication: pendingItems.filter(i => i.entityType === 'hostApplication').length,
    review: pendingItems.filter(i => i.entityType === 'review').length,
  };

  const filterTabs = [
    { id: 'all', label: 'All Queues', count: counts.all, icon: Inbox },
    { id: 'listing', label: 'Listings', count: counts.listing, icon: Home },
    { id: 'hostApplication', label: 'Hosts', count: counts.hostApplication, icon: User },
    { id: 'review', label: 'Reviews', count: counts.review, icon: Star },
  ];

  // Sort FIFO: Oldest pending items first (highest priority waiting time)
  const sortedItems = [...pendingItems]
    .filter(item => filterType === 'all' || item.entityType === filterType)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const handleReviewRedirect = (entityType: string, entityId: string, isArchived?: boolean) => {
    const archiveQuery = isArchived ? '&isArchived=true' : '';
    switch (entityType) {
      case 'hostApplication':
        router.push(`/admin/moderation/hosts?id=${entityId}${archiveQuery}`);
        break;
      case 'listing':
        router.push(`/admin/moderation/listings?id=${entityId}${archiveQuery}`);
        break;
      case 'review':
        router.push(`/admin/moderation/reviews?id=${entityId}${archiveQuery}`);
        break;
      default:
        break;
    }
  };

  return (
    <div className="w-full bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-6 shadow-xl flex flex-col h-[650px] overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-3 pb-4 border-b border-gray-100 dark:border-gray-800/80 mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 shrink-0">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              Pending Actions
              {sortedItems.length > 0 && (
                <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  {sortedItems.length} Waiting
                </span>
              )}
            </h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Items awaiting review, sorted by oldest submission
            </p>
          </div>
        </div>

        {/* Segmented Filter Pills - Placed Full Width Below Title */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 bg-gray-100/80 dark:bg-gray-800/80 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 w-full">
          {filterTabs.map((tab) => {
            const isActive = filterType === tab.id;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={cn(
                  "flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 w-full outline-none select-none",
                  isActive
                    ? "bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-500/20 font-black"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-800/50"
                )}
              >
                <TabIcon size={12} className={isActive ? "text-indigo-500 shrink-0" : "opacity-60 shrink-0"} />
                <span className="truncate">{tab.label}</span>
                <span className={cn(
                  "px-1.5 py-0.5 rounded-md text-[9px] font-black shrink-0",
                  isActive
                    ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                    : "bg-gray-200/60 dark:bg-gray-700/60 text-gray-500"
                )}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Queue Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-12">
            <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Syncing Pending Queue...</span>
          </div>
        ) : sortedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center gap-3 h-full py-16 opacity-60">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">Queue Up To Date</p>
            <p className="text-[11px] text-gray-400 max-w-[240px]">All submitted items have been reviewed and resolved.</p>
          </div>
        ) : (
          <AnimatePresence>
            {sortedItems.map((item, index) => {
              const meta = (item as any).meta || {};
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/60 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-3.5 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center flex-wrap gap-2">
                      <Badge variant="outline" className={cn("text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-lg", typeColors[item.entityType])}>
                        {typeLabels[item.entityType] || item.entityType}
                      </Badge>
                      
                      <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-500" />
                        {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleReviewRedirect(item.entityType, item.id, (item as any).isArchived || meta?.isArchived)}
                      className="h-8 px-3.5 text-[10px] font-black uppercase tracking-widest bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-500/20 gap-1.5 transition-all opacity-90 group-hover:opacity-100 shrink-0"
                    >
                      <span>Review Item</span>
                      <ExternalLink size={12} />
                    </Button>
                  </div>

                  <div>
                    <h3 className="font-black text-sm text-gray-900 dark:text-white tracking-tight uppercase">
                      {item.title || item.id}
                    </h3>
                    
                    {/* Rich Entity-Specific Metadata */}
                    <div className="flex items-center flex-wrap gap-2 mt-2">
                      {item.entityType === 'hostApplication' && (
                        <>
                          <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-800/40 flex items-center gap-1">
                            <User size={11} /> Applicant: {item.submittedBy}
                          </span>
                          {meta.email && (
                            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 px-2 py-0.5 rounded-md border border-gray-100 dark:border-gray-800">
                              {meta.email}
                            </span>
                          )}
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-lg border border-amber-200/50 dark:border-amber-800/40 flex items-center gap-1">
                            <FileText size={11} className="shrink-0" />
                            <span>{meta.governmentIdType || 'Government ID'} Verification Pending</span>
                          </span>
                        </>
                      )}

                      {item.entityType === 'listing' && (
                        <>
                          <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-100 dark:border-emerald-800/40 flex items-center gap-1">
                            <User size={11} /> Landlord: {item.submittedBy}
                          </span>
                          {meta.propertyTypeName && (
                            <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 bg-gray-100/70 dark:bg-gray-800/70 px-2.5 py-1 rounded-lg flex items-center gap-1">
                              <Building2 size={11} className="shrink-0 text-gray-500" />
                              <span>{meta.propertyTypeName}</span>
                            </span>
                          )}
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-lg border border-emerald-200/50 dark:border-emerald-800/40 flex items-center gap-1">
                            <ShieldCheck size={11} className="shrink-0" />
                            <span>Property Authorization Pending</span>
                          </span>
                        </>
                      )}

                      {item.entityType === 'review' && (
                        <>
                          <span className="text-[10px] font-bold bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-lg border border-amber-100 dark:border-amber-800/40 flex items-center gap-1">
                            <User size={11} /> Reviewer: {item.submittedBy}
                          </span>
                          {meta.rating && (
                            <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-lg border border-amber-200/50 dark:border-amber-800/40 flex items-center gap-1">
                              <Star size={11} className="shrink-0 text-amber-500 fill-amber-500" />
                              <span>Rating: {meta.rating}/5</span>
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    {item.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-3 line-clamp-2 bg-gray-50/80 dark:bg-gray-900/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800/80 italic font-normal">
                        "{item.description}"
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

// app/admin/features/moderation/components/reviews-moderation/index.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  RefreshCcw, 
  MessageSquare, 
  Star,
  Download,
  AlertCircle,
  LayoutGrid
} from 'lucide-react';
import { Button } from '@/app/admin/components/ui/button';
import { toast } from 'sonner';
import { useReviewsModeration, useModerationDecision } from '@/app/admin/hooks/use-moderation';
import { ReviewKPICards } from './review-kpi-cards';
import { ReviewTable } from './review-table';
import { cn } from '@/lib/utils';

export function ReviewsModerationDashboard() {
  const { data: apiResponse, isLoading, refetch, isFetching } = useReviewsModeration();
  const { mutate: decide } = useModerationDecision();

  const handleRefresh = async () => {
    await refetch();
    toast.success('Reputation feed synchronized successfully.');
  };

  const handleAction = (id: string, action: 'approve' | 'reject') => {
    decide({ id, entityType: 'review', action }, {
      onSuccess: () => {
        toast.success(`Feedback ${action === 'approve' ? 'authorized' : 'rejected'} successfully.`);
      },
      onError: (err: any) => {
        toast.error(`Database Error: ${err.message}`);
      }
    });
  };

  const reviews = apiResponse?.data || [];
  const pendingCount = apiResponse?.meta?.stats?.pending || 0;
  const approvedCount = apiResponse?.meta?.stats?.approved || 0;
  
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '4.8'; // Default rating if no pending reviews

  if (isLoading) {
    return (
      <div className="p-6 lg:p-10 text-center">
        <h2 className="text-2xl font-bold italic animate-pulse">Monitoring Platform Sentiment...</h2>
      </div>
    );
  }

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
            Review Moderation
            <span className="flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 rounded-2xl border border-amber-500/10 text-amber-500 text-[10px] tracking-[0.2em] font-black uppercase shadow-sm">
              <Star className="w-3 h-3 fill-amber-500" />
              {pendingCount} SENSITIVE CONTENT
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground font-medium text-sm flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Vetting and authorizing user reputation feedback
          </motion.p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            className={cn("h-11 w-11 rounded-xl border-border/60 bg-background/50", isFetching && "animate-spin")}
          >
            <RefreshCcw className="w-4 h-4 text-primary" />
          </Button>

          <Button
            variant="default"
            className="h-11 px-8 gap-3 rounded-2xl bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-95 text-white"
          >
            <Download className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Sentiment Export</span>
          </Button>
        </div>
      </div>

      {/* KPI Section */}
      <ReviewKPICards 
        total={pendingCount + approvedCount} 
        pending={pendingCount} 
        averageRating={avgRating} 
      />

      {/* Table Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pl-4 border-l-[3px] border-amber-500">
          <MessageSquare className="w-5 h-5 text-amber-500" />
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/70">Social Proof Moderation</h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ReviewTable 
            reviews={reviews.map((r: any) => ({
              id: r.id,
              listing: r.listing?.title || 'Unknown Listing',
              user: r.user?.name || 'Anonymous',
              rating: r.rating,
              comment: r.comment,
              status: r.status,
              submittedAt: r.createdAt,
              lastUpdated: r.createdAt
            }))}
            onView={(id) => toast.info(`Viewing details for review: ${id}`)}
            onApprove={(id) => handleAction(id, 'approve')}
            onReject={(id) => handleAction(id, 'reject')}
          />
        </motion.div>
      </div>
    </div>
  );
}

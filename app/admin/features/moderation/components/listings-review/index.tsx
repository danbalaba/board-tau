// app/admin/features/moderation/components/listings-review/index.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  ShieldCheck, 
  RefreshCcw, 
  Search, 
  Download,
  AlertCircle,
  LayoutGrid
} from 'lucide-react';
import { Button } from '@/app/admin/components/ui/button';
import { toast } from 'sonner';
import { useListingsReview, useModerationDecision } from '@/app/admin/hooks/use-moderation';
import { ListingKPICards } from './listing-kpi-cards';
import { ListingQueue } from './listing-queue';
import { ListingReviewCard } from './listing-review-card';
import { cn } from '@/lib/utils';

export function ListingsReviewDashboard() {
  const { data: apiResponse, isLoading, refetch, isFetching } = useListingsReview();
  const { mutate: decide } = useModerationDecision();

  const listings = apiResponse?.data || [];
  const [selectedListing, setSelectedListing] = React.useState<any>(null);

  // Set initial selected listing when data loads
  React.useEffect(() => {
    if (listings.length > 0 && !selectedListing) {
      setSelectedListing(listings[0]);
    }
  }, [listings, selectedListing]);

  const handleRefresh = async () => {
    await refetch();
    toast.success('Market inventory synchronized.');
  };

  const handleAction = (id: string, action: 'approve' | 'reject') => {
    decide({ id, entityType: 'listing', action }, {
      onSuccess: () => {
        toast.success(`Listing ${action === 'approve' ? 'authorized' : 'rejected'} successfully.`);
        // Move to next listing or clear if none left
        const remainingListings = listings.filter((l: any) => l.id !== id);
        if (remainingListings.length > 0) {
          setSelectedListing(remainingListings[0]);
        } else {
          setSelectedListing(null);
        }
      },
      onError: (err: any) => {
        toast.error(`Database Error: ${err.message}`);
      }
    });
  };

  const pendingCount = apiResponse?.meta?.stats?.pending || 0;
  const approvedCount = apiResponse?.meta?.stats?.active || 0;
  const rejectedCount = apiResponse?.meta?.stats?.rejected || 0;

  if (isLoading) {
    return (
      <div className="p-6 lg:p-10 text-center">
        <h2 className="text-2xl font-bold italic animate-pulse">Scanning Platform Assets...</h2>
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
            Listing Assets
            <span className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-2xl border border-primary/10 text-primary text-[10px] tracking-[0.2em] font-black italic">
              {pendingCount} INSPECTION REQUIRED
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground font-medium text-sm flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Vetting property listings for quality and compliance
          </motion.p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            className={cn("h-11 w-11 rounded-xl border-border/60", isFetching && "animate-spin")}
          >
            <RefreshCcw className="w-4 h-4 text-primary" />
          </Button>

          <Button
            variant="default"
            className="h-11 px-8 gap-3 rounded-2xl bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-95 text-white"
          >
            <Download className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Inventory Report</span>
          </Button>
        </div>
      </div>

      {/* KPI Section */}
      <ListingKPICards 
        total={pendingCount} 
        pending={pendingCount} 
        approved={approvedCount} 
        rejected={rejectedCount} 
      />

      {/* Main Grid: List + Details */}
      {listings.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-1 space-y-6">
            <div className="flex items-center gap-3 pl-4 border-l-[3px] border-emerald-500">
              <LayoutGrid className="w-5 h-5 text-emerald-500" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/70">Review Stack</h2>
            </div>
            <ListingQueue 
              listings={listings} 
              selectedId={selectedListing?.id} 
              onSelect={setSelectedListing} 
            />
          </div>

          <div className="xl:col-span-3 space-y-6">
            <div className="flex items-center gap-3 pl-4 border-l-[3px] border-amber-500">
              <Building2 className="w-5 h-5 text-amber-500" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/70">Property Inspector</h2>
            </div>
            {selectedListing && (
              <motion.div
                key={selectedListing.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 100 }}
              >
                <ListingReviewCard 
                  listing={{
                    ...selectedListing,
                    images: selectedListing.images || [selectedListing.imageSrc],
                    host: selectedListing.user ? {
                      name: selectedListing.user.name,
                      avatar: selectedListing.user.image,
                      email: selectedListing.user.email
                    } : { name: 'Unknown Host', avatar: '', email: '' }
                  }} 
                  onApprove={(id) => handleAction(id, 'approve')}
                  onReject={(id) => handleAction(id, 'reject')}
                  onModify={(id) => toast.info('Modification requested (Functionality coming soon)')}
                />
              </motion.div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-[40px] border border-dashed border-border/50">
          <ShieldCheck className="w-16 h-16 text-emerald-500/20 mb-6" />
          <h3 className="text-xl font-bold uppercase tracking-tighter">Queue is Clear</h3>
          <p className="text-muted-foreground text-sm font-medium">All platform assets have been successfully vetted.</p>
        </div>
      )}
    </div>
  );
}

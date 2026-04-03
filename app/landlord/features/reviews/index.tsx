'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  IconStar, 
  IconMessage, 
  IconChevronDown,
  IconInbox,
  IconLayoutGrid,
  IconList,
  IconClock,
  IconCircleCheck,
  IconCircleX,
  IconFilter,
  IconHistory
} from '@tabler/icons-react';
import Button from "@/components/common/Button";
import { cn } from '@/lib/utils';
import { generateTablePDF } from '@/utils/pdfGenerator';
import GenerateReportButton from '@/components/common/GenerateReportButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/admin/components/ui/dropdown-menu';

import LandlordReviewCard from './components/reviews-card';

interface Review {
  id: string;
  listing: {
    id: string;
    title: string;
    imageSrc: string;
  };
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  rating: number;
  comment: string | null;
  response: string | null;
  status: string;
  createdAt: Date | string;
  respondedAt: Date | string | null;
}

interface LandlordReviewsFeatureProps {
  reviews: {
    reviews: Review[];
    nextCursor: string | null;
  };
}

export default function LandlordReviewsFeature({ reviews }: LandlordReviewsFeatureProps) {
  const router = useRouter();
  const [listings, setListings] = useState(reviews.reviews);
  const [nextCursor, setNextCursor] = useState(reviews.nextCursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  useEffect(() => {
    setListings(reviews.reviews);
    setNextCursor(reviews.nextCursor);
  }, [reviews]);

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    approved: 'bg-green-500/10 text-green-600 border-green-500/20',
    rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
  };

  const filteredReviews = useMemo(() => {
    return listings.filter(review => {
      const statusMatch = selectedStatus === 'all' || review.status.toLowerCase() === selectedStatus.toLowerCase();
      const ratingMatch = selectedRating === 'all' || review.rating === parseInt(selectedRating);
      return statusMatch && ratingMatch;
    });
  }, [selectedStatus, selectedRating, listings]);

  const [respondModal, setRespondModal] = useState<{
    isOpen: boolean;
    reviewId: string;
    reviewTitle: string;
  }>({ isOpen: false, reviewId: '', reviewTitle: '' });
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleUpdateResponse = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseText.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/landlord/reviews?id=${respondModal.reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: responseText.trim() }),
      });

      if (res.ok) {
        const reviewId = respondModal.reviewId;
        const responseValue = responseText.trim();
        setListings(prev => prev.map(review => 
          review.id === reviewId ? { ...review, response: responseValue, status: 'approved', respondedAt: new Date() } : review
        ));
        setRespondModal({ isOpen: false, reviewId: '', reviewTitle: '' });
        setResponseText('');
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  }, [responseText, respondModal.reviewId, router]);

  const handleLoadMore = useCallback(async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const response = await fetch(`/api/landlord/reviews?cursor=${nextCursor}`);
      const data = await response.json();
      if (data.success && data.data) {
        setListings(prev => [...prev, ...data.data.reviews]);
        setNextCursor(data.data.nextCursor);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextCursor, isLoadingMore]);

  const handleGenerateReport = async () => {
    const columns = ['Listing', 'Guest', 'Rating', 'Comment', 'Date'];
    const data = filteredReviews.map((r: any) => [
      r.listing.title,
      r.user.name || r.user.email,
      `${r.rating} / 5`,
      r.comment || 'N/A',
      new Date(r.createdAt).toLocaleDateString()
    ]);
    await generateTablePDF('Reviews_Report', columns, data, {
      title: 'Property Reviews Report',
      subtitle: `Compilation of all ${filteredReviews.length} reviews`,
      author: 'Landlord Dashboard'
    });
  };

  return (
    <div className="space-y-6 pb-20 p-2">
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/10 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-primary hover:scale-110 transition-transform duration-300"><IconStar size={22} /></div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-0.5 tracking-tight">Guest Reviews</h1>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Manage property reviews and responses</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 lg:w-auto">
            <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm shadow-sm">
              <button onClick={() => setViewMode('grid')} className={cn("p-2 rounded-xl transition-all duration-300", viewMode === 'grid' ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-gray-400 hover:text-gray-900 dark:hover:text-white")} title="Grid View"><IconLayoutGrid size={18} /></button>
              <button onClick={() => setViewMode('list')} className={cn("p-2 rounded-xl transition-all duration-300", viewMode === 'list' ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-gray-400 hover:text-gray-900 dark:hover:text-white")} title="List View"><IconList size={18} /></button>
            </div>
            <GenerateReportButton onGeneratePDF={handleGenerateReport} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary transition-all shadow-sm">
              <IconFilter size={14} />Status: {selectedStatus.toUpperCase()}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 p-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-2xl">
            <DropdownMenuGroup>
              {[{ value: 'all', label: 'All Reviews', icon: IconInbox }, { value: 'pending', label: 'Pending', icon: IconClock }, { value: 'approved', label: 'Approved', icon: IconCircleCheck }, { value: 'rejected', label: 'Rejected', icon: IconCircleX }].map((opt: any) => {
                const Icon = opt.icon;
                return (
                  <DropdownMenuItem key={opt.value} onClick={() => setSelectedStatus(opt.value)} className={cn("cursor-pointer flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-bold transition-all", selectedStatus === opt.value ? "bg-primary/10 text-primary" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700")}>
                    <Icon size={14} />{opt.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary transition-all shadow-sm">
              <IconStar size={14} />Rating: {selectedRating.toUpperCase()}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 p-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-2xl">
            <DropdownMenuGroup>
              {['all', '5', '4', '3', '2', '1'].map((rating) => (
                <DropdownMenuItem key={rating} onClick={() => setSelectedRating(rating)} className={cn("cursor-pointer flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-bold transition-all", selectedRating === rating ? "bg-amber-500/10 text-amber-600" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700")}>
                  {rating === 'all' ? 'All Ratings' : `${rating} Stars`}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {filteredReviews.length === 0 ? (
        <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-[32px] border border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-300 mb-6"><IconInbox size={32} /></div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">No reviews match your filters</h3>
          <p className="text-sm font-medium text-gray-400 max-w-sm mx-auto">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className={cn(viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4")}>
          {filteredReviews.map((review) => (
            <LandlordReviewCard 
              key={review.id} 
              review={review} 
              viewMode={viewMode}
              statusColors={statusColors}
              onRespond={(r) => setRespondModal({ isOpen: true, reviewId: r.id, reviewTitle: r.listing.title })}
              onViewDetails={(id) => router.push(`/landlord/reviews/${id}`)}
            />
          ))}
        </div>
      )}

      {nextCursor && (
        <div className="flex justify-center pt-8">
          <Button outline className="rounded-xl px-10 py-4 group transition-all" onClick={handleLoadMore} isLoading={isLoadingMore}>
            <span className="flex items-center gap-2 uppercase font-black tracking-[0.15em] text-[10px]">{isLoadingMore ? 'Fetching...' : 'Load More Reviews'}<IconChevronDown size={10} /></span>
          </Button>
        </div>
      )}

      {respondModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 w-full max-w-lg shadow-2xl p-8">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">Respond to Review</h2>
            <form onSubmit={handleUpdateResponse} className="space-y-6">
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Write a professional response..."
                className="w-full p-4 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium min-h-[160px] transition-all"
              />
              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
                <Button outline type="button" onClick={() => { setRespondModal({ isOpen: false, reviewId: '', reviewTitle: '' }); setResponseText(''); }} className="w-full sm:w-auto px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest">Cancel</Button>
                <Button type="submit" disabled={submitting || !responseText.trim()} className="w-full sm:w-auto px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest bg-primary text-white shadow-lg shadow-primary/20">
                  {submitting ? 'Submitting...' : 'Submit Response'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

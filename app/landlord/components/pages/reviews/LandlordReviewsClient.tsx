'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaStar, FaEye, FaComment, FaChevronDown } from 'react-icons/fa';
import Button from "@/components/common/Button";
import ModernSelect from '@/components/common/ModernSelect';
import { cn } from '@/lib/utils';

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
  createdAt: Date;
  respondedAt: Date | null;
}

interface LandlordReviewsClientProps {
  reviews: {
    reviews: Review[];
    nextCursor: string | null;
  };
}

export default function LandlordReviewsClient({ reviews }: LandlordReviewsClientProps) {
  const { reviews: reviewsList, nextCursor } = reviews;
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<string>('all');

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20',
    approved: 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20',
    rejected: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20',
  };

  const router = useRouter();

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            size={14}
            className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  const filteredReviews = reviewsList.filter(review => {
    const statusMatch = selectedStatus === 'all' || review.status === selectedStatus;
    const ratingMatch = selectedRating === 'all' || review.rating === parseInt(selectedRating);
    return statusMatch && ratingMatch;
  });

  const [respondModal, setRespondModal] = useState<{
    isOpen: boolean;
    reviewId: string;
    reviewTitle: string;
  }>({ isOpen: false, reviewId: '', reviewTitle: '' });
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRespond = async (reviewId: string, response: string) => {
    try {
      const res = await fetch(`/api/landlord/reviews?id=${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ response }),
      });

      if (res.ok) {
        // Refresh the reviews list
        window.location.reload();
      }
    } catch (error) {
      console.error('Error responding to review:', error);
    }
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!responseText.trim()) {
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/landlord/reviews?id=${respondModal.reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ response: responseText.trim() }),
      });

      if (res.ok) {
        setRespondModal({ isOpen: false, reviewId: '', reviewTitle: '' });
        setResponseText('');
        // Refresh the reviews list
        window.location.reload();
      }
    } catch (error) {
      console.error('Error responding to review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/10 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-primary hover:scale-110 transition-transform duration-300">
              <FaStar size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-0.5 tracking-tight">
                Reviews
              </h1>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Manage property reviews and responses
              </p>
            </div>
          </div>
          <div className="hidden sm:inline-flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-4 py-2 rounded-xl shadow-sm">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total</span>
            <span className="font-black text-primary text-base">{filteredReviews.length}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto mt-2 sm:mt-0">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 whitespace-nowrap mb-0 sm:mb-2 text-right w-16 sm:w-auto">
              Status:
            </span>
            <ModernSelect
              instanceId="reviewStatus"
              value={selectedStatus}
              onChange={setSelectedStatus}
              className="w-full sm:w-auto min-w-[200px]"
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
              ]}
            />
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 whitespace-nowrap mb-0 sm:mb-2 text-right w-16 sm:w-auto">
              Rating:
            </span>
            <ModernSelect
              instanceId="reviewRating"
              value={selectedRating}
              onChange={setSelectedRating}
              className="w-full sm:w-auto min-w-[200px]"
              options={[
                { value: 'all', label: 'All Ratings' },
                { value: '5', label: '5 Stars' },
                { value: '4', label: '4 Stars' },
                { value: '3', label: '3 Stars' },
                { value: '2', label: '2 Stars' },
                { value: '1', label: '1 Star' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4 text-primary">
            <FaStar size={24} />
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
            No reviews found
          </h3>
          <p className="text-sm font-medium text-gray-500 max-w-sm mx-auto">
            Your properties haven't received any reviews matching the current criteria yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
              <div
              key={review.id}
              className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-xl hover:border-primary/20 transition-all duration-300 shadow-sm"
            >
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="relative w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden flex-shrink-0 group-hover:shadow-md transition-all duration-300">
                  {review.listing.imageSrc ? (
                    <img
                      src={review.listing.imageSrc}
                      alt={review.listing.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <FaStar size={24} />
                    </div>
                  )}
                </div>
                <div className="flex-1 w-full">
                  <div className="flex items-start justify-between mb-1 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn("px-2 py-0.5 rounded-md text-[9px] uppercase font-black tracking-widest", statusColors[review.status])}>
                          {review.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors line-clamp-1">
                        {review.listing.title}
                      </h3>
                    </div>
                    <div className="bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10 flex items-center gap-2 shadow-sm">
                      {renderStars(review.rating)}
                      <span className="text-xs font-black text-primary">
                        {review.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black uppercase">
                      {review.user.name?.charAt(0) || 'U'}
                    </div>
                    <p className="text-sm font-medium text-gray-500">
                      <span className="font-bold text-gray-900 dark:text-gray-100">{review.user.name || 'Anonymous User'}</span> 
                      <span className="mx-1.5 opacity-50">•</span> 
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic relative mb-4">
                    <span className="absolute -top-3 left-4 text-3xl text-gray-200 dark:text-gray-700">"</span>
                    <p className="relative z-10 whitespace-pre-line">{review.comment || 'No comment provided.'}</p>
                  </div>

                  {review.response && (
                    <div className="flex flex-col mb-4">
                      <div className="flex items-center gap-2 mb-2 pl-4">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 text-[10px] font-black uppercase">
                          L
                        </div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">Your Response</p>
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider ml-auto">
                          {new Date(review.respondedAt!).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="ml-10 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 rounded-xl rounded-tl-sm p-3 text-sm text-gray-700 dark:text-gray-300">
                        {review.response}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 mt-2 border-t border-gray-100 dark:border-gray-800">
                <Button
                  outline
                  onClick={() => router.push(`/landlord/reviews/${review.id}`)}
                  className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border-gray-200 dark:border-gray-700"
                >
                  <span className="flex items-center gap-2">
                    <FaEye size={12} />
                    View Details
                  </span>
                </Button>
                
                {!review.response && (
                  <div className="flex items-center gap-2 border-l border-gray-100 dark:border-gray-800 pl-3">
                    <Button
                      onClick={() => setRespondModal({
                        isOpen: true,
                        reviewId: review.id,
                        reviewTitle: review.listing.title
                      })}
                      className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                    >
                      <span className="flex items-center gap-2">
                        <FaComment size={12} />
                        Respond
                      </span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {nextCursor && (
        <div className="text-center py-6">
          <Button
            outline
            onClick={() => console.log('Load more reviews')}
            className="px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest border-gray-200 dark:border-gray-700 hover:border-primary/50"
          >
            <span className="flex items-center justify-center gap-2">
              Load More
              <FaChevronDown size={12} className="animate-bounce" />
            </span>
          </Button>
        </div>
      )}

      {/* Respond Modal */}
      {respondModal.isOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 w-full max-w-lg shadow-2xl overflow-hidden shadow-gray-200/50 dark:shadow-none animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                Respond to Review
              </h2>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-6 line-clamp-1">
                For property: <span className="text-primary">{respondModal.reviewTitle}</span>
              </p>
              
              <form onSubmit={handleSubmitResponse} className="space-y-6">
                <div>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Write your response clearly and professionally..."
                    className="w-full p-4 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900 dark:text-white text-sm font-medium resize-none min-h-[140px] transition-all"
                  />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 px-1">
                    Your response will be visible publicly.
                  </p>
                </div>
                
                <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
                  <Button
                    outline
                    type="button"
                    onClick={() => {
                      setRespondModal({ isOpen: false, reviewId: '', reviewTitle: '' });
                      setResponseText('');
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400"
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    type="submit"
                    disabled={submitting || !responseText.trim()}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none"
                  >
                    {submitting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></div>
                        Submitting...
                      </div>
                    ) : (
                      <span className="flex items-center gap-2">
                        <FaComment size={12} />
                        Submit Response
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

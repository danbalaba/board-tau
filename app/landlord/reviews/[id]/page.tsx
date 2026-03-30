'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  IconStar, 
  IconStarFilled, 
  IconMessage, 
  IconArrowLeft, 
  IconCalendar, 
  IconUser, 
  IconHome,
  IconClock,
  IconCheck,
  IconLoader2,
  IconQuote
} from '@tabler/icons-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helper';
import Button from "@/components/common/Button";
import { useRouter } from 'next/navigation';

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

export default function ReviewDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const resolvedParams = await params;
      
      const fetchReviewDetails = async () => {
        try {
          const res = await fetch(`/api/landlord/reviews?id=${resolvedParams.id}`);
          if (!res.ok) {
            throw new Error('Failed to fetch review details');
          }
          const data = await res.json();
          setReview(data.data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
          setLoading(false);
        }
      };

      fetchReviewDetails();
    };

    fetchData();
  }, [params]);

  const renderStars = useCallback((rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <IconStarFilled
            key={star}
            size={18}
            className={star <= rating ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]' : 'text-gray-200 dark:text-gray-700'}
          />
        ))}
      </div>
    );
  }, []);

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!response.trim()) return;
    setSubmitting(true);

    try {
      const resolvedParams = await params;
      const res = await fetch(`/api/landlord/reviews?id=${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: response.trim() }),
      });

      if (!res.ok) throw new Error('Failed to submit response');

      const data = await res.json();
      setReview(data.data);
      setResponse('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    approved: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    rejected: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="text-primary"
          >
            <IconLoader2 size={40} />
          </motion.div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 animate-pulse">Loading review details</p>
        </div>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto text-center"
        >
          <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-rose-500 shadow-xl shadow-rose-500/10">
            <IconQuote size={32} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">Review not found</h2>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-8 leading-relaxed italic">
            "{error || 'The review you are looking for might have been removed or is currently unavailable.'}"
          </p>
          <Button
            onClick={() => router.push('/landlord/reviews')}
            className="rounded-2xl px-8 py-3 bg-primary text-white shadow-lg shadow-primary/20"
          >
            <IconArrowLeft size={16} className="mr-2" />
            Back to Reviews
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 selection:bg-primary/20">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Header */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Link
            href="/landlord/reviews"
            className="group flex items-center gap-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-5 py-2.5 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-xl active:scale-95"
          >
            <div className="p-1.5 bg-gray-50 dark:bg-gray-700 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
              <IconArrowLeft size={14} strokeWidth={3} />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest">Back to Inbox</span>
          </Link>

          <div className="flex items-center gap-2">
             <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
               <IconHome size={14} className="text-primary" />
               <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Review Details</span>
             </div>
          </div>
        </motion.div>

        {/* Main Content Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-white dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden"
        >
          {/* Header Accent Bloom */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
          
          <div className="p-8 md:p-12 relative z-10">
            {/* Property & User Info */}
            <div className="flex flex-col md:flex-row gap-10 items-start mb-12">
              <div className="relative group flex-shrink-0">
                <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-blue-500 rounded-[32px] blur-sm opacity-25 group-hover:opacity-40 transition-opacity" />
                <div className="relative w-32 h-32 md:w-40 md:h-40 bg-gray-50 dark:bg-gray-800 rounded-[28px] overflow-hidden border border-white dark:border-gray-700 shadow-xl shadow-gray-200/50 dark:shadow-none">
                  {review.listing.imageSrc ? (
                    <img
                      src={review.listing.imageSrc}
                      alt={review.listing.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-300">
                      <IconHome size={40} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <p className="text-[8px] font-black text-white uppercase tracking-widest truncate">{review.listing.title}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 w-full flex flex-col pt-2">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-tight group-hover:text-primary transition-colors">
                    {review.listing.title}
                  </h1>
                  <span className={cn(
                    "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm",
                    statusColors[review.status]
                  )}>
                    {review.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-8 mb-8">
                  <div className="flex items-center gap-4 bg-gray-50/50 dark:bg-gray-800/50 py-2.5 px-5 rounded-2xl border border-gray-100/50 dark:border-gray-700/50">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-black text-sm uppercase ring-4 ring-white dark:ring-gray-800 shadow-lg shadow-primary/20">
                      {review.user.name?.charAt(0) || <IconUser size={16} />}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5 leading-none">Perspective Tenant</p>
                      <p className="text-base font-black text-gray-900 dark:text-white leading-none truncate max-w-[150px] sm:max-w-[200px]">{review.user.name || 'Anonymous'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {renderStars(review.rating)}
                    <span className="text-lg font-black text-gray-900 dark:text-white">{review.rating.toFixed(1)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  <div className="flex items-center gap-2">
                    <IconCalendar size={14} className="text-primary" />
                    <span>Posted {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="my-10 bg-gray-100 dark:bg-gray-800 h-[1px]" />

            {/* Review Body */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-12">
                <div className="relative mb-6">
                  <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8 inline-block bg-primary/10 px-4 py-2 rounded-full text-primary">
                    The Statement
                  </h2>
                  <div className="relative p-10 bg-gray-50 dark:bg-gray-800/50 rounded-[40px] border border-gray-100 dark:border-gray-800 group overflow-hidden">
                    {/* Quotation Marks Decor */}
                    <IconQuote size={80} className="absolute -top-4 -left-4 text-gray-200 dark:text-gray-700 opacity-50 group-hover:rotate-12 transition-transform duration-700" />
                    <IconQuote size={80} className="absolute -bottom-4 -right-4 text-gray-200 dark:text-gray-700 opacity-50 group-hover:-rotate-12 transition-transform duration-700 rotate-180" />
                    
                    <p className="relative z-10 text-xl md:text-2xl font-black text-gray-900 dark:text-white italic leading-[1.6] selection:text-white selection:bg-primary">
                      {review.comment || 'No comment provided.'}
                    </p>
                  </div>
                </div>

                {/* Response Section */}
                <AnimatePresence mode="wait">
                  {review.response ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-12"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] bg-emerald-500/10 px-4 py-2 rounded-full text-emerald-600">
                          Your Public Response
                        </h2>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400">
                          <IconClock size={12} className="text-emerald-500" />
                          {new Date(review.respondedAt!).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="relative p-8 bg-emerald-50/30 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 rounded-[32px] overflow-hidden">
                         <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500/50" />
                         <p className="text-lg font-bold text-gray-700 dark:text-gray-300 leading-relaxed pl-4">
                           {review.response}
                         </p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-12"
                    >
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-amber-100 dark:bg-amber-500/20 rounded-2xl text-amber-600">
                            <IconMessage size={24} />
                          </div>
                          <div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase leading-none">Draft a Response</h2>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">This will be shared publicly with the tenant</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                           <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                           <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Pending</span>
                        </div>
                      </div>
                      
                      <form onSubmit={handleSubmitResponse} className="space-y-6 relative group">
                        <div className="relative">
                          <textarea
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            placeholder="Type your professional response here..."
                            className="w-full px-8 py-8 bg-gray-50/50 dark:bg-gray-800/50 border border-transparent focus:border-primary focus:bg-white dark:focus:bg-gray-800 rounded-[40px] text-gray-900 dark:text-white text-lg font-bold leading-relaxed min-h-[220px] transition-all duration-500 outline-none shadow-inner group-hover:shadow-lg focus:shadow-2xl focus:shadow-primary/5"
                          />
                        </div>
                        
                        <div className="flex items-center justify-end">
                          <Button
                            type="submit"
                            disabled={submitting || !response.trim()}
                            className="rounded-3xl px-12 py-5 bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none min-w-[240px]"
                          >
                            <div className="relative flex items-center justify-center gap-3 h-full">
                              {submitting ? (
                                <>
                                  <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  >
                                    <IconLoader2 size={16} />
                                  </motion.div>
                                  <span className="text-xs font-black uppercase tracking-[0.2em] animate-pulse">Publishing...</span>
                                </>
                              ) : (
                                <>
                                  <span className="text-xs font-black uppercase tracking-[0.2em]">Post Public Response</span>
                                  <div className="p-1 px-1.5 bg-white/20 rounded-lg group-hover:rotate-12 transition-transform">
                                    <IconCheck size={12} strokeWidth={3} />
                                  </div>
                                </>
                              )}
                            </div>
                          </Button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer Hint */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] mb-4">Internal Review System v2.0</p>
        </motion.div>
      </div>
    </div>
  );
}

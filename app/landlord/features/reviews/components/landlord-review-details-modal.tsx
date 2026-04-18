'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  IconStarFilled, 
  IconX, 
  IconMessage, 
  IconCalendar,
  IconHome,
  IconCircleCheck,
  IconPlayerPlay,
  IconChevronLeft,
  IconChevronRight,
  IconMessageCircle,
  IconClock
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helper';
import Modal from '@/components/modals/Modal';
import Avatar from '@/components/common/Avatar';
import Button from '@/components/common/Button';
import { toast } from 'sonner';

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
    image?: string | null;
  };
  rating: number;
  comment: string | null;
  images: string[];
  videos?: string[];
  response: string | null;
  status: string;
  createdAt: Date | string;
  respondedAt: Date | string | null;
}

interface LandlordReviewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewId: string | null;
  onSuccess?: (id: string, response: string) => void;
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  approved: 'bg-green-500/10 text-green-600 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
};

export function LandlordReviewDetailsModal({
  isOpen,
  onClose,
  reviewId,
  onSuccess
}: LandlordReviewDetailsModalProps) {
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [responseText, setResponseText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMediaIdx, setSelectedMediaIdx] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchReviewDetails = async () => {
      if (!reviewId || !isOpen) return;
      
      try {
        setLoading(true);
        const res = await fetch(`/api/landlord/reviews?id=${reviewId}`);
        if (!res.ok) throw new Error('Failed to fetch details');
        const data = await res.json();
        setReview(data.data);
      } catch (err) {
        console.error(err);
        toast.error('Could not load review details');
      } finally {
        setLoading(false);
      }
    };

    fetchReviewDetails();
  }, [reviewId, isOpen]);

  const handleSubmitResponse = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!responseText.trim() || !reviewId) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/landlord/reviews?id=${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: responseText.trim() }),
      });

      if (!res.ok) throw new Error('Failed to submit');
      const data = await res.json();
      setReview(data.data);
      setResponseText('');
      toast.success('Response recorded successfully');
      
      if (onSuccess) {
        onSuccess(reviewId, data.data.response || responseText.trim());
      }
    } catch (err) {
      toast.error('Failed to submit response');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <IconStarFilled
          key={star}
          size={16}
          className={star <= rating ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-700'}
        />
      ))}
    </div>
  );

  const allMedia = review ? [
    ...(review.images || []).map(url => ({ url, type: 'image' as const })),
    ...(review.videos || []).map(url => ({ url, type: 'video' as const }))
  ] : [];

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedMediaIdx === null) return;
    setSelectedMediaIdx((selectedMediaIdx + 1) % allMedia.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedMediaIdx === null) return;
    setSelectedMediaIdx((selectedMediaIdx - 1 + allMedia.length) % allMedia.length);
  };

  return (
    <>
    <Modal isOpen={isOpen} onClose={onClose} title="Review Details" width="lg">
      <div className="p-8 space-y-8 bg-white dark:bg-gray-900">
        
        <AnimatePresence mode="wait">
          {loading ? (
             <motion.div 
               key="loading"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="h-64 flex flex-col items-center justify-center gap-4"
             >
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading Photos & Videos...</p>
             </motion.div>
          ) : review && (
            <motion.div
              key="content"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.1,
                  }
                }
              }}
              className="space-y-8"
            >
              {/* Profile Card */}
              <motion.div 
                variants={{
                  hidden: { opacity: 0, scale: 0.95, y: 10 },
                  visible: { opacity: 1, scale: 1, y: 0 }
                }}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-amber-500/20 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 backdrop-blur-sm transition-all duration-300">
                  <div className="flex items-center gap-5">
                     <Avatar 
                        src={review.user.image} 
                        name={review.user.name} 
                        className="w-16 h-16 rounded-[1.25rem] shadow-2xl border-4 border-white dark:border-gray-800" 
                     />
                     <div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-none mb-2">{review.user.name || 'Anonymous Guest'}</h3>
                        <div className="flex items-center gap-2">
                          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verified Guest Review</p>
                        </div>
                     </div>
                  </div>
                  <div className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm backdrop-blur-md", 
                    statusColors[review.status] || 'bg-gray-100 text-gray-500'
                  )}>
                    {review.status}
                  </div>
                </div>
              </motion.div>
  
              {/* Guest Feedback Section */}
              <motion.div 
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 }
                }}
                className="bg-gray-50/30 dark:bg-gray-800/30 p-6 rounded-3xl border border-gray-100/50 dark:border-gray-800/50"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-3 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary-rgb),0.4)]"></div>
                  Guest Feedback
                </span>
                
                <div className="flex flex-col md:flex-row gap-6">
                   <div className="w-full md:w-40 aspect-square rounded-2xl overflow-hidden shadow-inner border border-gray-100 dark:border-gray-800 shrink-0">
                      <img src={review.listing.imageSrc} alt="" className="w-full h-full object-cover" />
                   </div>
                   <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xl font-black text-gray-900 dark:text-white leading-tight">
                          {review.listing.title}
                        </h4>
                        <div className="bg-white dark:bg-gray-900 px-3 py-1.5 rounded-xl border border-gray-50 dark:border-gray-800 flex items-center gap-2">
                           {renderStars(review.rating)}
                           <span className="text-xs font-black text-primary">{review.rating}.0</span>
                        </div>
                      </div>
                      <div className="bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-gray-100/50 dark:border-gray-800/50 text-sm text-gray-700 dark:text-gray-300 italic font-medium leading-relaxed">
                        "{review.comment || 'No comment provided'}"
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-3 flex items-center gap-2">
                        <IconCalendar size={12} />
                        Recorded on {new Date(review.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                      </p>
                   </div>
                </div>
              </motion.div>
  
              {/* Media Gallery Section */}
              {allMedia.length > 0 && (
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="bg-gray-50/30 dark:bg-gray-800/30 p-6 rounded-3xl border border-gray-100/50 dark:border-gray-800/50"
                >
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-3 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.4)]"></div>
                    Guest Photos & Videos
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {allMedia.map((item, idx) => (
                      <motion.div 
                        key={idx} 
                        whileHover={{ scale: 1.05, rotate: 1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedMediaIdx(idx)}
                        className="aspect-square rounded-[1.5rem] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm relative group cursor-zoom-in transition-all"
                      >
                         {item.type === 'image' ? (
                            <img src={item.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Review Media" />
                         ) : (
                            <div className="relative w-full h-full bg-gray-100 dark:bg-gray-900/50">
                               <video src={item.url} className="w-full h-full object-cover opacity-60" />
                               <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white border border-white/40 group-hover:scale-110 transition-transform">
                                     <IconPlayerPlay size={16} fill="white" />
                                  </div>
                               </div>
                            </div>
                         )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
  
              {/* Response Section */}
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="pt-8 border-t border-gray-100 dark:border-gray-800"
              >
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white">Respond to Review</h4>
                  <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800 mx-6"></div>
                </div>
  
                {review.response ? (
                   <div className="bg-emerald-500/5 dark:bg-emerald-500/10 p-6 rounded-[2rem] border border-emerald-500/10 dark:border-emerald-500/20 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors">
                        <IconHome size={100} />
                      </div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                           <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center">
                              <IconCircleCheck size={20} />
                           </div>
                           <div>
                             <h6 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Response Sent</h6>
                             <p className="text-[8px] font-bold text-gray-400 uppercase">Replied on: {new Date(review.respondedAt!).toLocaleDateString()}</p>
                           </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-200 font-bold leading-relaxed indent-4">
                          {review.response}
                        </p>
                      </div>
                   </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative group">
                      <textarea 
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Write your reply here..."
                        className="w-full bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-[1.5rem] p-6 text-sm text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[120px] resize-none transition-all placeholder:text-[10px] placeholder:uppercase placeholder:font-black placeholder:tracking-widest placeholder:text-gray-400"
                      />
                    </div>
                    
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 py-5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 group/act"
                      onClick={() => handleSubmitResponse()}
                      isLoading={isSubmitting}
                      disabled={!responseText.trim()}
                    >
                      <IconMessageCircle size={18} className="group-hover:scale-110 transition-transform" />
                      Send My Reply
                    </Button>
                  </div>
                )}
  
                <div className="mt-6 flex items-center justify-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl">
                  <IconClock size={12} className="text-gray-400" />
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">
                    Response will be visible to all verified students
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>

    {/* Media Fullscreen Preview - Portalled to body to escape all parent stacking contexts */}
    {mounted && createPortal(
      <AnimatePresence>
        {selectedMediaIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black backdrop-blur-2xl"
            onClick={() => setSelectedMediaIdx(null)}
          >
            <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors z-[11000] bg-white/10 p-3 rounded-2xl">
              <IconX size={32} />
            </button>

            {allMedia.length > 1 && (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); handlePrev(e as any); }}
                  className="absolute left-8 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-[11000] backdrop-blur-md"
                >
                  <IconChevronLeft size={32} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleNext(e as any); }}
                  className="absolute right-8 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-[11000] backdrop-blur-md"
                >
                   <IconChevronRight size={32} />
                </button>
              </>
            )}

            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="relative max-w-6xl w-full h-[80vh] flex items-center justify-center p-4 border border-white/5 rounded-[3rem] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
               {allMedia[selectedMediaIdx].type === 'image' ? (
                  <img src={allMedia[selectedMediaIdx].url} className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl" alt="Preview" />
               ) : (
                  <video src={allMedia[selectedMediaIdx].url} controls autoPlay className="max-w-full max-h-full rounded-3xl shadow-2xl" />
               )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    )}
  </>
);
}

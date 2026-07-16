'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/modals/Modal';
import { Button } from '@/app/admin/components/ui/button';
import { 
  User, 
  Building, 
  Check, 
  X,
  MessageCircle,
  Star,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';
import SafeImage from '@/components/common/SafeImage';

interface AdminReviewModalProps {
  review: any | null;
  isOpen: boolean;
  onClose: () => void;
  onDecision: (id: string, action: 'approve' | 'reject', reason?: string, banUser?: boolean) => void;
  isDeciding?: boolean;
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500 text-white',
  approved: 'bg-emerald-500 text-white',
  rejected: 'bg-rose-500 text-white',
};

export function AdminReviewModal({
  review,
  isOpen,
  onClose,
  onDecision,
  isDeciding
}: AdminReviewModalProps) {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [customReason, setCustomReason] = useState("");
  const [banUser, setBanUser] = useState(false);

  useEffect(() => {
    if (isOpen && review) {
      setIsInitialLoading(true);
      setShowRejectConfirm(false);
      setCustomReason("");
      setBanUser(false);
      
      const timer = setTimeout(() => setIsInitialLoading(false), 600);
      return () => clearTimeout(timer);
    }
  }, [isOpen, review]);

  if (!review) return null;

  const handleAction = async (action: 'approve' | 'reject', reason?: string) => {
    onDecision(review.id, action, reason, banUser);
  };

  const PREDEFINED_REASONS = [
    "Contains hate speech or offensive language",
    "Spam or promotional content",
    "Irrelevant to the property or experience",
    "Contains private or sensitive information"
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Review Details" width="lg">
      <div className="p-8 space-y-8 bg-white dark:bg-gray-900 overflow-hidden relative">
        
        <AnimatePresence mode="wait">
          {isInitialLoading ? (
            <motion.div 
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-96 flex flex-col items-center justify-center gap-4"
            >
              <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading Review Data...</p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
              className="space-y-8"
            >
              {/* Overlay for Reject Confirmation */}
              {showRejectConfirm && (
                <div className="absolute inset-x-0 bottom-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-8 border-t border-rose-100 dark:border-rose-900/30 rounded-b-[32px] animate-in slide-in-from-bottom-full duration-300">
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1">Remove Review</h3>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Provide a reason for moderation</p>
                      </div>
                      <button onClick={() => setShowRejectConfirm(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                        <X size={20} />
                      </button>
                    </div>

                    <div className="space-y-4 mb-6 text-left">
                      <div className="flex flex-wrap gap-2">
                        {PREDEFINED_REASONS.map((reason) => (
                          <button
                            key={reason}
                            onClick={() => handleAction('reject', reason)}
                            disabled={isDeciding}
                            className="px-3 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-gray-600 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 border border-gray-100 dark:border-gray-700 hover:border-rose-200 rounded-xl text-xs font-bold transition-all text-left"
                          >
                            {reason}
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        placeholder="Or type a custom reason..."
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all min-h-[80px]"
                      />
                    </div>

                    <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20">
                      <input 
                        type="checkbox" 
                        id="banUser" 
                        checked={banUser} 
                        onChange={(e) => setBanUser(e.target.checked)} 
                        className="w-5 h-5 rounded border-rose-300 text-rose-500 focus:ring-rose-500" 
                      />
                      <label htmlFor="banUser" className="text-sm font-bold text-rose-700 dark:text-rose-400 cursor-pointer">
                        Also suspend the user who posted this review
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowRejectConfirm(false)}
                        className="rounded-xl py-6 h-auto text-xs font-black uppercase tracking-widest border-gray-200 dark:border-gray-800"
                      >
                        Cancel
                      </Button>
                      <Button
                        disabled={isDeciding || (!customReason.trim() && !PREDEFINED_REASONS.includes(customReason))}
                        onClick={() => handleAction('reject', customReason)}
                        className="rounded-xl py-6 h-auto text-xs font-black uppercase tracking-widest shadow-lg bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20"
                      >
                        Confirm Removal
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Author Banner */}
              <motion.div 
                variants={{
                  hidden: { opacity: 0, scale: 0.95, y: 10 },
                  visible: { opacity: 1, scale: 1, y: 0 }
                }}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-primary/20 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 backdrop-blur-sm">
                  <div className="flex items-center gap-5">
                     {review.user?.image ? (
                       <SafeImage src={review.user.image} alt={review.user.name} className="w-16 h-16 rounded-[1.25rem] shadow-2xl border-4 border-white dark:border-gray-800 object-cover" />
                     ) : (
                       <div className="w-16 h-16 rounded-[1.25rem] shadow-2xl border-4 border-white dark:border-gray-800 bg-amber-500/10 flex items-center justify-center text-amber-500 text-xl font-bold">
                         {review.user?.name?.charAt(0) || 'U'}
                       </div>
                     )}
                     <div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-none mb-2">{review.user?.name || 'Anonymous User'}</h3>
                        <div className="flex items-center gap-2">
                          <Calendar size={12} className="text-gray-400" />
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            {format(new Date(review.createdAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                     </div>
                  </div>
                  <span className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm", 
                    statusColors[review.status] || 'bg-gray-100 text-gray-500'
                  )}>
                    {review.status}
                  </span>
                </div>
              </motion.div>

              {/* Main Content Layout */}
              <div className="space-y-6">
                
                {/* Context Info */}
                <motion.div 
                  variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                  className="bg-gray-50/30 dark:bg-gray-800/30 p-5 rounded-3xl border border-gray-100/50 dark:border-gray-800/50 flex flex-col gap-3"
                >
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2 mb-2">
                    <Building size={14} /> Property
                  </span>
                  <div>
                    <p className="text-sm font-black text-gray-900 dark:text-white">{review.listing?.title || 'Unknown Property'}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Property Name</p>
                  </div>
                </motion.div>

                {/* Review Content */}
                <motion.div 
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  className="bg-amber-500/5 dark:bg-amber-500/10 p-6 rounded-3xl border border-amber-500/20 relative"
                >
                  <div className="absolute top-6 right-6 flex items-center gap-1 bg-white dark:bg-gray-900 px-3 py-1.5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <Star size={16} className="text-amber-500 fill-amber-500" />
                    <span className="text-sm font-black text-gray-900 dark:text-white">{review.rating?.toFixed(1) || '0.0'}</span>
                  </div>

                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 flex items-center gap-2 mb-4">
                    <MessageCircle size={14} /> Review
                  </span>
                  
                  <div className="mt-6 text-gray-800 dark:text-gray-200 font-medium leading-relaxed italic border-l-4 border-amber-500/30 pl-4">
                    "{review.comment || 'No textual feedback provided.'}"
                  </div>

                  {/* Sub-ratings if they exist */}
                  {(review.cleanliness || review.accuracy || review.communication || review.location || review.value) && (
                    <div className="mt-8 pt-6 border-t border-amber-500/10 grid grid-cols-2 md:grid-cols-3 gap-4">
                      {review.cleanliness && (
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Cleanliness</p>
                          <div className="flex gap-0.5">{Array.from({length: 5}).map((_, i) => <Star key={i} size={10} className={i < review.cleanliness ? "text-amber-500 fill-amber-500" : "text-gray-300 dark:text-gray-700 fill-gray-300 dark:fill-gray-700"} />)}</div>
                        </div>
                      )}
                      {review.accuracy && (
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Accuracy</p>
                          <div className="flex gap-0.5">{Array.from({length: 5}).map((_, i) => <Star key={i} size={10} className={i < review.accuracy ? "text-amber-500 fill-amber-500" : "text-gray-300 dark:text-gray-700 fill-gray-300 dark:fill-gray-700"} />)}</div>
                        </div>
                      )}
                      {review.communication && (
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Communication</p>
                          <div className="flex gap-0.5">{Array.from({length: 5}).map((_, i) => <Star key={i} size={10} className={i < review.communication ? "text-amber-500 fill-amber-500" : "text-gray-300 dark:text-gray-700 fill-gray-300 dark:fill-gray-700"} />)}</div>
                        </div>
                      )}
                      {review.location && (
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Location</p>
                          <div className="flex gap-0.5">{Array.from({length: 5}).map((_, i) => <Star key={i} size={10} className={i < review.location ? "text-amber-500 fill-amber-500" : "text-gray-300 dark:text-gray-700 fill-gray-300 dark:fill-gray-700"} />)}</div>
                        </div>
                      )}
                      {review.value && (
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Value</p>
                          <div className="flex gap-0.5">{Array.from({length: 5}).map((_, i) => <Star key={i} size={10} className={i < review.value ? "text-amber-500 fill-amber-500" : "text-gray-300 dark:text-gray-700 fill-gray-300 dark:fill-gray-700"} />)}</div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Management Actions */}
              <motion.div 
                variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
                className="pt-8 border-t border-gray-100 dark:border-gray-800"
              >
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white">Decision</h4>
                  <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800 mx-6"></div>
                </div>
                
                {review.status === 'pending' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button 
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 py-6 h-auto rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] group/act"
                      onClick={() => handleAction('approve')}
                      disabled={isDeciding}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Check size={18} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
                        Approve
                      </span>
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full rounded-[1.25rem] py-6 h-auto border-rose-200 text-rose-500 hover:bg-rose-50 dark:border-rose-900/30 dark:hover:bg-rose-900/10 text-[10px] font-black uppercase tracking-[0.2em] transition-all group/rev"
                      onClick={() => setShowRejectConfirm(true)}
                      disabled={isDeciding}
                    >
                      <span className="flex items-center justify-center gap-2">
                         <X size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform" /> 
                         Remove
                      </span>
                    </Button>
                  </div>
                ) : (
                   <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl flex items-center justify-center border border-dashed border-gray-200 dark:border-gray-700">
                      <p className="text-xs font-black text-gray-500 uppercase tracking-widest">
                        Decision already made: <span className={review.status === 'approved' ? 'text-emerald-500' : 'text-rose-500'}>{review.status}</span>
                      </p>
                   </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}

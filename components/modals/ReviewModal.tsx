'use client';

import React, { useState } from 'react';
import Modal from './Modal';
import Heading from '../common/Heading';
import Button from '../common/Button';
import { Star, Upload, X, Check, Camera, MessageSquare, List, SkipForward, Sparkles, Target, MessageCircle, MapPin, BadgeDollarSign, Play, ChevronDown, Info, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResponsiveToast } from '../common/ResponsiveToast';
import { useRouter } from 'next/navigation';
import validator from 'validator';
import { cn } from '@/utils/helper';
import { ArrowRight, ArrowLeft, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useEdgeStore } from '@/lib/edgestore';
import SafeImage from '../common/SafeImage';
import MediaPreviewOverlay from '@/components/common/MediaPreviewOverlay';

import { z } from 'zod';

const reviewStep1Schema = z.object({
  cleanliness: z.number().min(1, 'Please rate Cleanliness'),
  accuracy: z.number().min(1, 'Please rate Accuracy'),
  communication: z.number().min(1, 'Please rate Communication'),
  location: z.number().min(1, 'Please rate Location'),
  value: z.number().min(1, 'Please rate Value'),
});

const reviewStep2Schema = z.object({
  comment: z.string().trim().min(10, 'Please write at least 10 characters detailing your stay experience.'),
});

interface ReviewModalProps {
  reservation: any;
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { 
    id: 'cleanliness', 
    label: 'Cleanliness & Hygiene', 
    icon: Sparkles, 
    tooltip: 'How clean and spotless was your room and shared areas?' 
  },
  { 
    id: 'accuracy', 
    label: 'Listing Accuracy', 
    icon: Target, 
    tooltip: 'Did the room match the photos, amenities, and description?' 
  },
  { 
    id: 'communication', 
    label: 'Landlord & Host', 
    icon: MessageCircle, 
    tooltip: 'Was the landlord responsive, friendly, and easy to reach?' 
  },
  { 
    id: 'location', 
    label: 'Location & Safety', 
    icon: MapPin, 
    tooltip: 'Was the neighborhood safe, quiet, and convenient to get around?' 
  },
  { 
    id: 'value', 
    label: 'Value for Money', 
    icon: BadgeDollarSign, 
    tooltip: 'Did the quality of your stay justify the overall price?' 
  },
];

const RATING_LABELS: Record<number, { text: string; badgeClass: string }> = {
  1: { text: "Needs Improvement", badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" },
  2: { text: "Fair", badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  3: { text: "Good", badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  4: { text: "Very Good", badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  5: { text: "Excellent!", badgeClass: "bg-primary/10 text-primary border-primary/20" },
};

const REVIEW_TAGS = [
  "Clean & Tidy",
  "Helpful Landlord",
  "Great Location",
  "Quiet Environment",
  "Fast Wi-Fi",
  "Worth the Price"
];

export default function ReviewModal({ reservation, isOpen, onClose }: ReviewModalProps) {
  const router = useRouter();
  const rToast = useResponsiveToast();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const { edgestore } = useEdgeStore();
  
  // Media Preview State
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  // Live Star Hover & Rating State
  const [hoveredRatings, setHoveredRatings] = useState<Record<string, number>>({});

  // Inline Uploading Loader State
  const [uploadingCount, setUploadingCount] = useState(0);

  // Zod Field Validation Error State
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const resetState = () => {
    setStep(1);
    setValidationErrors({});
    setShowSkipConfirm(false);
    setExpandedCategory(null);
    setHoveredRatings({});
    setUploadingCount(0);
    setRatings({
      cleanliness: 0,
      accuracy: 0,
      communication: 0,
      location: 0,
      value: 0,
    });
    setComment('');
    setImages([]);
    setVideos([]);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  // Reset state whenever the modal closes
  React.useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  const [ratings, setRatings] = useState<Record<string, number>>({
    cleanliness: 0,
    accuracy: 0,
    communication: 0,
    location: 0,
    value: 0,
  });
  
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);

  // Combined media for gallery
  const allMedia = [
    ...images.map(url => ({ url, type: 'image' as const })),
    ...videos.map(url => ({ url, type: 'video' as const }))
  ];

  const openPreview = (index: number) => {
    setPreviewIndex(index);
    setPreviewOpen(true);
  };

  const handleRatingChange = (category: string, value: number) => {
    setRatings(prev => ({ 
      ...prev, 
      [category]: prev[category] === value ? 0 : value 
    }));
    if (validationErrors[category]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[category];
        return updated;
      });
    }
  };

  const addTagToComment = (tag: string) => {
    if (comment.includes(tag)) return;
    setComment(prev => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed}, ${tag}` : tag;
    });
    if (validationErrors.comment) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated.comment;
        return updated;
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const imageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const videoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    const maxImageSize = 5 * 1024 * 1024; // 5MB
    const maxVideoSize = 25 * 1024 * 1024; // 25MB

    const filesToAdd = Array.from(files).slice(0, 10 - (images.length + videos.length));
    if (filesToAdd.length === 0) return;

    setUploadingCount(filesToAdd.length);

    for (const file of filesToAdd) {
      const isImage = imageTypes.includes(file.type);
      const isVideo = videoTypes.includes(file.type);

      if (!isImage && !isVideo) {
        setUploadingCount(prev => Math.max(0, prev - 1));
        continue;
      }

      const limit = isImage ? maxImageSize : maxVideoSize;
      if (file.size > limit) {
        setUploadingCount(prev => Math.max(0, prev - 1));
        continue;
      }

      try {
        const res = await edgestore.reviewMedia.upload({ file });
        if (isImage) {
          setImages(prev => [...prev, res.url]);
        } else {
          setVideos(prev => [...prev, res.url]);
        }
      } catch (error) {
        console.error("Upload error:", error);
      } finally {
        setUploadingCount(prev => Math.max(0, prev - 1));
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async () => {
    setIsLoading(true);
    const overallRating = Math.round(
      Object.values(ratings).reduce((a, b) => a + b, 0) / CATEGORIES.length
    );

    try {
      const sanitizedComment = validator.escape(comment.trim());

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: reservation.listingId,
          reservationId: reservation.id,
          rating: overallRating,
          comment: sanitizedComment,
          images,
          videos,
          ...ratings
        })
      });

      if (response.ok) {
        rToast.success({ title: "Review Submitted", description: "Thank you! Your review has been submitted." });
        
        // Dispatch custom event to sync notifications in real-time
        window.dispatchEvent(new CustomEvent("sync-notifications"));
        
        router.refresh();
        onClose();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit review');
      }
    } catch (error: any) {
      rToast.error({ title: "Error", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      const parseResult = reviewStep1Schema.safeParse(ratings);
      if (!parseResult.success) {
        const fieldErrors: Record<string, string> = {};
        parseResult.error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0].toString()] = issue.message;
          }
        });
        setValidationErrors(fieldErrors);
        return;
      }
      setValidationErrors({});
      setStep(2);
    } else if (step === 2) {
      const parseResult = reviewStep2Schema.safeParse({ comment });
      if (!parseResult.success) {
        const fieldErrors: Record<string, string> = {};
        parseResult.error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0].toString()] = issue.message;
          }
        });
        setValidationErrors(fieldErrors);
        return;
      }
      setValidationErrors({});
      setStep(3);
    }
  };

  const onConfirmSkip = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: reservation.listingId,
          reservationId: reservation.id,
          rating: 0,
          comment: "User skipped rating.",
          images: [],
          videos: [],
          cleanliness: 0,
          accuracy: 0,
          communication: 0,
          location: 0,
          value: 0
        })
      });

      if (response.ok) {
        rToast.success({ title: "Review Skipped", description: "Status updated successfully." });
        
        // Dispatch custom event to sync notifications in real-time
        window.dispatchEvent(new CustomEvent("sync-notifications"));
        
        router.refresh();
        onClose();
      } else {
        throw new Error('Failed to skip review');
      }
    } catch (error: any) {
      rToast.error({ title: "Error", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    if (showSkipConfirm) {
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center text-center space-y-6 pt-6 pb-2"
        >
          <div className="w-20 h-20 rounded-3xl bg-amber-500/10 flex items-center justify-center text-amber-500 ring-8 ring-amber-500/5">
            <AlertCircle size={40} strokeWidth={2.2} />
          </div>
          <div className="space-y-2 max-w-sm">
            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Skip giving feedback?</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
              Your feedback helps landlords improve and helps fellow boarders find the right home. Skipping will finalize your checkout without a review.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row w-full gap-3 pt-2">
            <Button 
              outline 
              onClick={() => setShowSkipConfirm(false)}
              disabled={isLoading}
              className="w-full flex items-center justify-center py-3.5 font-black uppercase tracking-wider text-xs border-gray-200 dark:border-gray-700 rounded-2xl"
            >
              <XCircle size={18} strokeWidth={2.2} className="mr-2" /> Continue Review
            </Button>
            <Button 
              onClick={onConfirmSkip} 
              isLoading={isLoading}
              className="w-full flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white shadow-xl shadow-amber-500/20 py-3.5 font-black uppercase tracking-wider text-xs rounded-2xl"
            >
              <CheckCircle size={18} strokeWidth={2.2} className="mr-2" /> Skip for Now
            </Button>
          </div>
        </motion.div>
      );
    }

    switch (step) {
      case 1:
        const hasStep1Error = Object.keys(validationErrors).some(k => CATEGORIES.some(c => c.id === k));

        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 sm:p-5 rounded-3xl border border-primary/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
               <div className="flex items-center gap-3.5">
                 <div className="w-10 h-10 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shrink-0 shadow-sm">
                    <List size={20} strokeWidth={2.5} /> 
                 </div>
                 <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white tracking-tight">How was your stay?</h3>
                    <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Rate each area from 1 to 5 stars to share your experience.</p>
                 </div>
               </div>
            </div>

            {hasStep1Error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-rose-50 dark:bg-rose-950/40 border-l-4 border-rose-500 rounded-2xl flex items-start gap-3 shadow-sm text-rose-900 dark:text-rose-100"
              >
                <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={18} />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">Rating Required</h4>
                  <p className="text-xs font-semibold leading-relaxed">
                    Please give a star rating (1 to 5 stars) for all 5 areas below before continuing.
                  </p>
                </div>
              </motion.div>
            )}
            
            <div className="space-y-3.5">
              {CATEGORIES.map((cat: any) => {
                const Icon = cat.icon;
                const isExpanded = expandedCategory === cat.id;
                const catError = validationErrors[cat.id];
                const activeScore = (hoveredRatings[cat.id] && hoveredRatings[cat.id] > 0) 
                  ? hoveredRatings[cat.id] 
                  : (ratings[cat.id] || 0);
                const activeLabel = RATING_LABELS[activeScore];
                
                return (
                <motion.div 
                  key={cat.id}
                  layout
                  className={cn(
                    "relative flex flex-col group bg-white dark:bg-gray-900 p-4 sm:p-5 rounded-[2rem] border transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/40 hover:bg-primary/[0.01]",
                    catError 
                      ? "border-rose-500 ring-2 ring-rose-500/10 bg-rose-500/5" 
                      : "border-gray-100 dark:border-gray-800/80"
                  )}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                    {/* Left: Icon, Label, and Hover Badge */}
                    <div className="flex items-center justify-between sm:justify-start gap-3 flex-1 min-w-0 relative group/tooltip">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={cn(
                          "w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors shadow-sm",
                          catError 
                            ? "bg-rose-500/10 text-rose-500" 
                            : ratings[cat.id] > 0
                              ? "bg-primary/10 text-primary"
                              : "bg-gray-50 dark:bg-gray-800 text-gray-400 group-hover:text-primary group-hover:bg-primary/10"
                        )}>
                          <Icon className="w-5 h-5" strokeWidth={2.2} />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 block truncate">
                              {cat.label}
                            </span>
                            {activeScore > 0 && activeLabel && (
                              <motion.span 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={cn(
                                  "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-xs transition-all",
                                  activeLabel.badgeClass
                                )}
                              >
                                {activeScore} ★ {activeLabel.text}
                              </motion.span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 hidden sm:block truncate font-medium">
                            {cat.tooltip}
                          </p>
                          {catError && (
                            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1 animate-pulse">
                              <AlertCircle size={11} />
                              {catError}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Mobile Dropdown Trigger */}
                      <button 
                        onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                        className="sm:hidden w-8 h-8 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-400 active:bg-primary active:text-white transition-all shadow-sm shrink-0"
                      >
                         <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {/* Interactive Stars Group with Hover Micro-animations */}
                    <div 
                      className="flex gap-1.5 sm:gap-2 bg-gray-50 dark:bg-gray-800/60 p-2.5 sm:p-3 rounded-[1.25rem] w-full justify-center sm:w-fit sm:justify-start shrink-0 border border-gray-100 dark:border-gray-800"
                      onMouseLeave={() => setHoveredRatings(prev => ({ ...prev, [cat.id]: 0 }))}
                    >
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = activeScore >= star;
                        return (
                          <motion.button
                            key={star}
                            type="button"
                            whileTap={{ scale: 0.85 }}
                            whileHover={{ scale: 1.25, rotate: 6 }}
                            onMouseEnter={() => setHoveredRatings(prev => ({ ...prev, [cat.id]: star }))}
                            onClick={() => handleRatingChange(cat.id, star)}
                            className="relative p-1 transition-transform cursor-pointer focus:outline-none"
                            title={`${star} Star${star > 1 ? 's' : ''}`}
                          >
                            <Star 
                              className={cn(
                                "w-6 h-6 sm:w-7 sm:h-7 transition-all duration-200",
                                isFilled 
                                  ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]" 
                                  : "fill-transparent text-gray-300 dark:text-gray-600 hover:text-amber-300"
                              )} 
                              strokeWidth={1.8}
                            />
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mobile Expanded Tooltip */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="sm:hidden overflow-hidden"
                      >
                        <div className="mt-3 p-3 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/10 flex items-start gap-2.5">
                           <Info size={14} className="text-primary mt-0.5 shrink-0" />
                           <p className="text-[11px] font-semibold text-primary leading-relaxed">
                              {cat.tooltip}
                           </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )})}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-5">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 sm:p-5 rounded-3xl border border-primary/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
               <div className="flex items-center gap-3.5">
                 <div className="w-10 h-10 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shrink-0 shadow-sm">
                    <MessageSquare size={20} strokeWidth={2.5} /> 
                 </div>
                 <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white tracking-tight">Tell us about your stay</h3>
                    <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Share your overall feedback to help future boarders.</p>
                 </div>
               </div>
            </div>
            
            <div className="space-y-4">
              {/* Quick Tag Suggestions */}
              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 block">Quick Suggestions:</span>
                <div className="flex flex-wrap gap-2">
                  {REVIEW_TAGS.map((tag) => {
                    const isAdded = comment.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => addTagToComment(tag)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1.5 border shadow-2xs active:scale-95",
                          isAdded 
                            ? "bg-primary text-white border-primary shadow-sm" 
                            : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary/40 hover:text-primary"
                        )}
                      >
                        {isAdded ? <Check size={12} strokeWidth={3} /> : <Sparkles size={12} className="opacity-60" />}
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="relative group">
                <div className="absolute top-5 left-5 text-gray-400 group-focus-within:text-primary transition-colors pointer-events-none">
                  <MessageSquare size={20} />
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => {
                    setComment(e.target.value);
                    if (validationErrors.comment && e.target.value.trim().length >= 10) {
                      setValidationErrors(prev => {
                        const updated = { ...prev };
                        delete updated.comment;
                        return updated;
                      });
                    }
                  }}
                  placeholder="What did you like most about the room, cleanliness, wifi, or landlord? Any suggestions for improvement?"
                  className={cn(
                    "w-full h-52 pl-14 pr-6 py-5 rounded-[2rem] border-2 bg-white dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-950 outline-none font-medium text-sm transition-all shadow-xs focus:shadow-xl resize-none text-gray-900 dark:text-white leading-relaxed",
                    validationErrors.comment 
                      ? "border-rose-500 ring-2 ring-rose-500/10 bg-rose-500/5" 
                      : "border-gray-100 dark:border-gray-800 focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                  )}
                />
                <div className="absolute bottom-5 right-5 px-3 py-1 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700 text-[10px] font-black tracking-wider text-gray-400 group-focus-within:text-primary transition-colors">
                  {comment.length} characters (min 10)
                </div>
              </div>

              {validationErrors.comment && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 bg-rose-500/10 border-l-4 border-rose-500 rounded-r-2xl flex items-center gap-2.5"
                >
                  <AlertCircle className="text-rose-500 shrink-0" size={16} />
                  <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                    {validationErrors.comment}
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-5">
             <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 sm:p-5 rounded-3xl border border-primary/15 flex justify-between items-center">
               <div className="flex items-center gap-3.5">
                 <div className="w-10 h-10 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shrink-0 shadow-sm">
                    <Camera size={20} strokeWidth={2.5} />
                 </div>
                 <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white tracking-tight">Share photos or videos</h3>
                    <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Add up to 10 real photos or videos of your stay.</p>
                 </div>
               </div>
               <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0">
                 Optional
               </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <AnimatePresence>
                {/* Images Preview */}
                {images.map((img, index) => (
                  <motion.div 
                    key={`img-${index}`} 
                    initial={{ scale: 0.8, opacity: 0, rotate: -3 }} 
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0.8, opacity: 0, rotate: 5 }}
                    className="aspect-square rounded-[2rem] overflow-hidden relative group border-2 border-primary/20 shadow-xl shadow-primary/10 cursor-pointer"
                    onClick={() => openPreview(index)}
                  >
                    <SafeImage src={img} alt="Preview" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                      className="absolute top-3 right-3 bg-rose-500/90 backdrop-blur-md text-white p-2 rounded-xl opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:bg-rose-600 hover:scale-110 shadow-lg z-10"
                    >
                      <X size={14} strokeWidth={3} />
                    </button>
                    <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] font-black text-primary uppercase shadow-sm">
                      Photo
                    </div>
                  </motion.div>
                ))}

                {/* Videos Preview */}
                {videos.map((vid, index) => (
                  <motion.div 
                    key={`vid-${index}`} 
                    initial={{ scale: 0.8, opacity: 0, rotate: -3 }} 
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0.8, opacity: 0, rotate: 5 }}
                    className="aspect-square rounded-[2rem] overflow-hidden relative group border-2 border-emerald-500/20 shadow-xl shadow-emerald-500/10 bg-black cursor-pointer"
                    onClick={() => openPreview(images.length + index)}
                  >
                    <video src={vid} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all">
                       <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-lg">
                          <Play size={20} fill="white" />
                       </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeVideo(index); }}
                      className="absolute top-3 right-3 bg-rose-500/90 backdrop-blur-md text-white p-2 rounded-xl opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:bg-rose-600 hover:scale-110 shadow-lg z-10"
                    >
                      <X size={14} strokeWidth={3} />
                    </button>
                    <div className="absolute bottom-3 left-3 bg-emerald-500/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] font-black text-white uppercase shadow-sm">
                      Video
                    </div>
                  </motion.div>
                ))}

                {/* Animated Uploading Loader Tiles */}
                {Array.from({ length: uploadingCount }).map((_, i) => (
                  <motion.div 
                    key={`uploading-${i}`} 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="aspect-square rounded-[2rem] border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex flex-col items-center justify-center p-4 relative overflow-hidden shadow-lg shadow-primary/5"
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-primary/20 animate-pulse pointer-events-none" />
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-900 flex items-center justify-center shadow-md border border-primary/30 mb-2 relative z-10">
                      <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-primary relative z-10 animate-pulse">
                      Uploading...
                    </span>
                    <span className="text-[8px] font-bold text-gray-400 mt-0.5 relative z-10">
                      Adding attachment
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {images.length + videos.length + uploadingCount < 10 && (
                <label className="aspect-square rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center gap-2.5 cursor-pointer hover:bg-primary/5 hover:border-primary/40 transition-all group shadow-2xs hover:shadow-inner bg-gray-50/50 dark:bg-gray-900/50 p-4 text-center">
                  <div className="w-12 h-12 rounded-[1.25rem] bg-white dark:bg-gray-800 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 group-hover:-translate-y-1 transition-all shadow-sm">
                    <Upload size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors">Upload Media</span>
                    <span className="text-[8px] font-bold text-gray-400 mt-0.5">JPG, PNG, MP4 (MAX 10)</span>
                  </div>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*,video/*" 
                    className="hidden" 
                    onChange={handleFileUpload} 
                  />
                </label>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} width="lg" hasFixedFooter={true} fullOnMobile={true} closeOnOutsideClick={false}>
        <div className="flex flex-col h-full sm:h-auto max-h-full sm:max-h-[85vh] overflow-hidden">
          {/* Header */}
          <div className="px-5 sm:px-8 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center shrink-0 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-primary/10 text-primary rounded-2xl shrink-0">
                <Sparkles size={22} />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-black text-gray-900 dark:text-white tracking-tight">
                  {showSkipConfirm ? "Skip Feedback?" : step === 1 ? "Rate Your Stay" : step === 2 ? "Write Your Review" : "Add Photos & Videos"}
                </h2>
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] block mt-0.5">
                  {showSkipConfirm ? "Confirmation" : `Step ${step} of 3`}
                </span>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 shrink-0"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 bg-slate-50/70 dark:bg-gray-950 custom-scrollbar overscroll-contain">
            {!showSkipConfirm && (
              <div className="flex gap-2 mb-2">
                {[1, 2, 3].map(s => (
                  <div key={s} className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'bg-primary shadow-[0_0_10px_rgba(47,125,109,0.4)]' : 'bg-gray-200 dark:bg-gray-800'}`} />
                ))}
              </div>
            )}

            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step + (showSkipConfirm ? '-skip' : '')}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Footer Actions */}
          {!showSkipConfirm && (
            <div className="px-6 py-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex flex-col-reverse sm:flex-row justify-end items-center gap-3 shrink-0 shadow-lg">
              {step === 1 ? (
                <Button
                  outline
                  className="w-full sm:w-auto px-6 py-3 text-xs font-black uppercase tracking-wider text-gray-400 hover:text-rose-500 transition-colors border-transparent"
                  onClick={() => setShowSkipConfirm(true)}
                >
                  Skip Feedback
                </Button>
              ) : (
                <Button
                  outline
                  className="w-full sm:w-auto px-6 py-3 text-xs font-black uppercase tracking-wider text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors border-transparent"
                  onClick={() => setStep(step - 1)}
                  disabled={isLoading}
                >
                  Back
                </Button>
              )}
              
              <div className="w-full sm:w-auto">
                {step < 3 ? (
                  <Button
                    onClick={handleNextStep}
                    className="w-full sm:w-auto px-8 py-3.5 text-xs font-black uppercase tracking-wider text-white bg-primary hover:bg-primary-dark rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    Next Step <ArrowRight size={15} strokeWidth={2.5} />
                  </Button>
                ) : (
                  <Button 
                    onClick={onSubmit} 
                    isLoading={isLoading} 
                    className="w-full sm:w-auto px-8 py-3.5 text-xs font-black uppercase tracking-wider text-white bg-primary hover:bg-primary-dark rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    Submit Review
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Media Preview Overlay Component */}
      <MediaPreviewOverlay 
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        images={[...images, ...videos]}
        currentIndex={previewIndex}
        onNavigate={(index) => setPreviewIndex(index)}
        title="Review Media Attachments"
      />
    </>
  );
}


'use client';

import React, { useState } from 'react';
import Modal from './Modal';
import Heading from '../common/Heading';
import Button from '../common/Button';
import { Star, Upload, X, Check, Camera, MessageSquare, List, SkipForward, Sparkles, Target, MessageCircle, MapPin, BadgeDollarSign, Play, ChevronDown, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResponsiveToast } from '../common/ResponsiveToast';
import { useRouter } from 'next/navigation';
import validator from 'validator';
import { cn } from '@/utils/helper';
import { ArrowRight, ArrowLeft, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useEdgeStore } from '@/lib/edgestore';
import SafeImage from '../common/SafeImage';

interface ReviewModalProps {
  reservation: any;
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { id: 'cleanliness', label: 'Cleanliness', icon: Sparkles, tooltip: 'How tidy and hygienic was the boarding house?' },
  { id: 'accuracy', label: 'Accuracy', icon: Target, tooltip: 'Did the room accurately match the photos and description?' },
  { id: 'communication', label: 'Communication', icon: MessageCircle, tooltip: 'Was the landlord responsive and transparent?' },
  { id: 'location', label: 'Location', icon: MapPin, tooltip: 'Was the surrounding neighborhood accessible and safe?' },
  { id: 'value', label: 'Value', icon: BadgeDollarSign, tooltip: 'Was the stay worth the overall price paid?' },
];

// Sub-component for Media Preview Gallery
const MediaPreviewGallery = ({ 
  media, 
  initialIndex, 
  isOpen, 
  onClose 
}: { 
  media: { url: string; type: 'image' | 'video' }[]; 
  initialIndex: number; 
  isOpen: boolean; 
  onClose: () => void;
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  React.useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  if (!isOpen || media.length === 0) return null;

  const currentItem = media[currentIndex];

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[20000] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 sm:p-10"
        onClick={onClose}
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-[20010] border border-white/10"
        >
          <X size={24} />
        </button>

        <div className="relative w-full h-full max-w-5xl flex items-center justify-center group">
          {/* Navigation Buttons */}
          {media.length > 1 && (
            <>
              <button 
                onClick={handlePrev}
                className="absolute left-0 sm:-left-16 p-4 rounded-full bg-white/5 hover:bg-white/15 text-white transition-all border border-white/10 z-[20010] opacity-0 group-hover:opacity-100 sm:opacity-100"
              >
                <ChevronLeft size={32} strokeWidth={2.5} />
              </button>
              <button 
                onClick={handleNext}
                className="absolute right-0 sm:-right-16 p-4 rounded-full bg-white/5 hover:bg-white/15 text-white transition-all border border-white/10 z-[20010] opacity-0 group-hover:opacity-100 sm:opacity-100"
              >
                <ChevronRight size={32} strokeWidth={2.5} />
              </button>
            </>
          )}

          {/* Media Content */}
          <motion.div 
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {currentItem.type === 'image' ? (
              <SafeImage 
                src={currentItem.url} 
                alt="Preview" 
                priority={true}
              />
            ) : (
              <video 
                src={currentItem.url} 
                controls 
                autoPlay
                className="max-w-full max-h-full rounded-2xl shadow-2xl"
              />
            )}
          </motion.div>

          {/* Counter Badge */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/10">
            {currentIndex + 1} / {media.length}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

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
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (images.length + videos.length + files.length > 10) {
      rToast.error({ title: "Limit Reached", description: "You can only upload up to 10 media items in total." });
      return;
    }

    const imageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const videoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    
    const maxImageSize = 5 * 1024 * 1024; // 5MB
    const maxVideoSize = 25 * 1024 * 1024; // 25MB

    const filesToAdd = Array.from(files).slice(0, 10 - (images.length + videos.length));

    filesToAdd.forEach(async (file) => {
      const isImage = imageTypes.includes(file.type);
      const isVideo = videoTypes.includes(file.type);

      if (!isImage && !isVideo) {
        rToast.error({ title: "Unsupported Format", description: `${file.name} is not a supported format.` });
        return;
      }

      const limit = isImage ? maxImageSize : maxVideoSize;
      if (file.size > limit) {
        rToast.error({ title: "File Too Large", description: `${file.name} is too large. Max ${isImage ? '5MB' : '25MB'}.` });
        return;
      }

      try {
        rToast.loading({ title: "Uploading", description: `Uploading ${file.name}...` });
        const res = await edgestore.reviewMedia.upload({ file });
        
        if (isImage) {
          setImages(prev => [...prev, res.url]);
        } else {
          setVideos(prev => [...prev, res.url]);
        }
        rToast.success({ title: "Upload Success", description: `${file.name} uploaded!` });
      } catch (error) {
        rToast.error({ title: "Upload Failed", description: `Failed to upload ${file.name}` });
      }
    });
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
    if (step === 2 && comment.trim().length < 10) {
      rToast.error({ title: "More Detail Needed", description: "Please provide a little more detail. Write at least 10 characters." });
      return;
    }
    setStep(step + 1);
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
          className="flex flex-col items-center justify-center text-center space-y-6 pt-10"
        >
          <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shadow-inner">
            <AlertCircle size={40} strokeWidth={2.5} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Are you sure?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium max-w-[250px]">
              By skipping, you won't be able to provide feedback for this stay later.
            </p>
          </div>
          <div className="flex flex-col w-full gap-3 pt-4">
            <Button 
              onClick={onConfirmSkip} 
              isLoading={isLoading}
              className="w-full flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white shadow-xl shadow-amber-500/20 py-4 font-black uppercase tracking-widest text-sm"
            >
              <CheckCircle size={22} strokeWidth={2.5} className="mr-3" /> Yes, skip it
            </Button>
            <Button 
              outline 
              onClick={() => setShowSkipConfirm(false)}
              disabled={isLoading}
              className="w-full flex items-center justify-center py-4 font-black uppercase tracking-widest text-sm border-gray-200 dark:border-gray-700"
            >
              <XCircle size={22} strokeWidth={2.5} className="mr-3" /> No, go back
            </Button>
          </div>
        </motion.div>
      );
    }

    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-primary/10 to-transparent p-4 rounded-3xl border border-primary/10 flex items-center justify-between">
               <div className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-3">
                 <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
                    <List size={16} strokeWidth={3} /> 
                 </div>
                 Rate categories
               </div>
            </div>
            
            <div className="space-y-4">
              {CATEGORIES.map((cat: any) => {
                const Icon = cat.icon;
                const isExpanded = expandedCategory === cat.id;
                
                return (
                <motion.div 
                  key={cat.id}
                  layout
                  className="relative flex flex-col group bg-white dark:bg-gray-900 p-4 sm:p-5 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                    {/* Left: Icon, Label, and Dropdown Trigger */}
                    <div className="flex items-center justify-between sm:justify-start gap-3 flex-1 min-w-0 relative group/tooltip">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 text-gray-400 group-hover:text-primary group-hover:bg-primary/10 transition-colors shadow-sm">
                          <Icon className="w-4.5 h-4.5 sm:w-5 sm:h-5" strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest truncate">{cat.label}</span>
                      </div>
                      
                      {/* Desktop Tooltip */}
                      <div className="hidden sm:block absolute left-6 bottom-[120%] opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-300 z-[100] w-48 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-bold p-3 rounded-2xl shadow-xl translate-y-2 group-hover/tooltip:translate-y-0 pointer-events-none">
                        {cat.tooltip}
                      </div>

                      {/* Mobile Dropdown Trigger */}
                      <button 
                        onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                        className="sm:hidden w-8 h-8 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-400 active:bg-primary active:text-white transition-all shadow-sm"
                      >
                         <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {/* Desktop/Compact Stars Row */}
                    <div className="flex gap-1.5 sm:gap-2 bg-gray-50 dark:bg-gray-800/50 p-2 sm:p-3 rounded-[1.25rem] w-full justify-center sm:w-fit sm:justify-start shrink-0">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <motion.button
                          key={star}
                          whileTap={{ scale: 0.9 }}
                          whileHover={{ scale: 1.15, rotate: 5 }}
                          onClick={() => handleRatingChange(cat.id, star)}
                          className="relative p-0.5 transition-transform"
                        >
                          <Star 
                            className={cn(
                              "w-6 h-6 sm:w-7 sm:h-7 transition-colors duration-300",
                              ratings[cat.id] >= star 
                                ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" 
                                : "fill-transparent text-gray-300 dark:text-gray-600"
                            )} 
                          />
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Mobile Expanded Description */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="sm:hidden overflow-hidden"
                      >
                        <div className="mt-4 p-3 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/10 flex items-start gap-3">
                           <Info size={14} className="text-primary mt-0.5 shrink-0" />
                           <p className="text-[10px] font-bold text-primary leading-relaxed">
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
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-primary/10 to-transparent p-4 rounded-3xl border border-primary/10">
               <div className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-3">
                 <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
                    <MessageSquare size={16} strokeWidth={3} /> 
                 </div>
                 Overall Experience
               </div>
            </div>
            <div className="relative group">
              <div className="absolute top-5 left-5 text-gray-400 group-focus-within:text-primary transition-colors">
                <MessageSquare size={20} />
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about the room, the environment, and the landlord..."
                className="w-full h-56 pl-14 pr-6 py-5 rounded-[2rem] border-2 border-transparent bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-950 focus:border-primary/30 outline-none font-medium text-sm transition-all shadow-inner focus:shadow-2xl focus:shadow-primary/10 resize-none text-gray-900 dark:text-white"
              />
              <div className="absolute bottom-6 right-6 px-3 py-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 text-[10px] font-black tracking-widest text-gray-400 group-focus-within:text-primary transition-colors">
                {comment.length} CHARS
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
             <div className="bg-gradient-to-r from-primary/10 to-transparent p-4 rounded-3xl border border-primary/10 flex justify-between items-center">
               <div className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-3">
                 <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Camera size={16} strokeWidth={3} />
                 </div>
                 Add photos & videos
               </div>
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Optional</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <AnimatePresence>
                {/* Images Preview */}
                {images.map((img, index) => (
                  <motion.div 
                    key={`img-${index}`} 
                    initial={{ scale: 0.8, opacity: 0, rotate: -5 }} 
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0.8, opacity: 0, rotate: 10 }}
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
                    <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-2 py-0.5 rounded-lg text-[8px] font-black text-primary uppercase shadow-sm">Photo</div>
                  </motion.div>
                ))}

                {/* Videos Preview */}
                {videos.map((vid, index) => (
                  <motion.div 
                    key={`vid-${index}`} 
                    initial={{ scale: 0.8, opacity: 0, rotate: -5 }} 
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0.8, opacity: 0, rotate: 10 }}
                    className="aspect-square rounded-[2rem] overflow-hidden relative group border-2 border-emerald-500/20 shadow-xl shadow-emerald-500/10 bg-black cursor-pointer"
                    onClick={() => openPreview(images.length + index)}
                  >
                    <video src={vid} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all">
                       <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white">
                          <Play size={20} fill="white" />
                       </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeVideo(index); }}
                      className="absolute top-3 right-3 bg-rose-500/90 backdrop-blur-md text-white p-2 rounded-xl opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:bg-rose-600 hover:scale-110 shadow-lg z-10"
                    >
                      <X size={14} strokeWidth={3} />
                    </button>
                    <div className="absolute bottom-3 left-3 bg-emerald-500/90 backdrop-blur-md px-2 py-0.5 rounded-lg text-[8px] font-black text-white uppercase shadow-sm">Video</div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {images.length + videos.length < 10 && (
                <label className="aspect-square rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-primary/5 hover:border-primary/40 transition-all group shadow-sm hover:shadow-inner bg-gray-50/50 dark:bg-gray-900/50">
                  <div className="w-12 h-12 rounded-[1.25rem] bg-white dark:bg-gray-800 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 group-hover:-translate-y-1 transition-all shadow-sm">
                    <Upload size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover:text-primary">Add Proof</span>
                    <span className="text-[7px] font-bold text-gray-400 opacity-50">IMAGE OR VIDEO</span>
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
      <Modal isOpen={isOpen} onClose={onClose} width="md" hasFixedFooter={true} closeOnOutsideClick={false}>
        <div className="flex flex-col min-h-[85vh] max-h-[85vh] sm:min-h-0 sm:h-auto sm:max-h-[70vh] overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4 ml-4">
               <div className="flex flex-col">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                     {showSkipConfirm ? "Confirm Skip" : step === 1 ? "Rate Your Stay" : step === 2 ? "Share Details" : "Visual Proof"}
                  </h2>
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{showSkipConfirm ? "Final check before skipping" : `Step ${step} of 3`}</span>
               </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors group"
            >
              <X className="text-xl text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 bg-gray-50/50 dark:bg-gray-900/50 custom-scrollbar">
            {!showSkipConfirm && (
              <div className="flex gap-1 mb-2">
                {[1,2,3].map(s => (
                  <div key={s} className={`flex-1 h-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-primary shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-gray-200 dark:bg-gray-800'}`} />
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
        </div>

        {/* Footer Actions */}
        {!showSkipConfirm && (
          <div className="p-4 sm:p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-t border-gray-100 dark:border-gray-700 flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
            {step === 1 ? (
              <Button
                outline
                className="w-full sm:w-auto px-8 py-3 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-gray-400 hover:text-red-500 transition-colors border-transparent"
                onClick={() => setShowSkipConfirm(true)}
              >
                Skip Review
              </Button>
            ) : (
              <Button
                outline
                className="w-full sm:w-auto px-8 py-3 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors border-transparent"
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
                  className="w-full px-10 py-4 text-[10px] sm:text-xs font-black uppercase tracking-widest text-white bg-emerald-500 hover:bg-emerald-500 border-emerald-500 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Next Step <ArrowRight size={14} strokeWidth={3} />
                </Button>
              ) : (
                <Button 
                  onClick={onSubmit} 
                  isLoading={isLoading} 
                  className="w-full px-10 py-4 text-[10px] sm:text-xs font-black uppercase tracking-widest text-white bg-primary rounded-2xl hover:bg-primary-dark shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Submit Review
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Media Preview Modal */}
      <MediaPreviewGallery 
        media={allMedia}
        initialIndex={previewIndex}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </>
  );
}

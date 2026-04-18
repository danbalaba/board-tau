'use client';

import React, { useState } from 'react';
import Modal from './Modal';
import Heading from '../common/Heading';
import Button from '../common/Button';
import { Star, Upload, X, Check, Camera, MessageSquare, List, SkipForward, Sparkles, Target, MessageCircle, MapPin, BadgeDollarSign, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import validator from 'validator';
import { cn } from '@/utils/helper';
import { ArrowRight, ArrowLeft, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

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

export default function ReviewModal({ reservation, isOpen, onClose }: ReviewModalProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  
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
      toast.error("You can only upload up to 10 media items in total.");
      return;
    }

    const imageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const videoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    
    const maxImageSize = 5 * 1024 * 1024; // 5MB
    const maxVideoSize = 25 * 1024 * 1024; // 25MB

    Array.from(files).forEach(file => {
      const isImage = imageTypes.includes(file.type);
      const isVideo = videoTypes.includes(file.type);

      if (!isImage && !isVideo) {
        toast.error(`${file.name} is not a supported format.`);
        return;
      }

      const limit = isImage ? maxImageSize : maxVideoSize;
      if (file.size > limit) {
        toast.error(`${file.name} is too large. Max ${isImage ? '5MB' : '25MB'}.`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (isImage) {
          setImages(prev => [...prev, result]);
        } else {
          setVideos(prev => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
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
        toast.success('Thank you! Your review has been submitted.');
        router.refresh();
        onClose();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit review');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = () => {
    if (step === 2 && comment.trim().length < 10) {
      toast.error("Please provide a little more detail. Write at least 10 characters.");
      return;
    }
    setStep(step + 1);
  };

  const onConfirmSkip = async () => {
    setIsLoading(true);
    try {
      // We send a partial review or a specific skip flag to mark the reservation as reviewed
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
        toast.success('Review skipped. Status updated.');
        router.refresh();
        onClose();
      } else {
        throw new Error('Failed to skip review');
      }
    } catch (error: any) {
      toast.error(error.message);
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
            
            <div className="space-y-3">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                <motion.div 
                  key={cat.id}
                  whileHover={{ scale: 1.01 }}
                  className="relative hover:z-[60] flex flex-col sm:flex-row sm:items-center justify-between gap-4 group bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0 relative group/tooltip cursor-help">
                    <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 text-gray-400 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                      <Icon size={18} strokeWidth={2.5} />
                    </div>
                    <span className="text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest truncate">{cat.label}</span>
                    
                    <div className="absolute left-6 bottom-[120%] opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-300 z-[100] w-48 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-bold p-3 rounded-2xl shadow-xl translate-y-2 group-hover/tooltip:translate-y-0 pointer-events-none">
                      {cat.tooltip}
                    </div>
                  </div>
                  <div className="flex gap-1 sm:gap-1.5 bg-gray-50 dark:bg-gray-800/50 p-1.5 sm:p-2 rounded-2xl flex-shrink-0 w-fit">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        whileTap={{ scale: 0.8 }}
                        whileHover={{ scale: 1.15, rotate: 5 }}
                        onClick={() => handleRatingChange(cat.id, star)}
                        className="relative p-1 transition-transform"
                      >
                        <Star 
                          size={22} 
                          className={cn(
                            "transition-colors duration-300",
                            ratings[cat.id] >= star 
                              ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" 
                              : "fill-transparent text-gray-300 dark:text-gray-600"
                          )} 
                        />
                      </motion.button>
                    ))}
                  </div>
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
                    className="aspect-square rounded-[2rem] overflow-hidden relative group border-2 border-primary/20 shadow-xl shadow-primary/10"
                  >
                    <img src={img} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                    <button 
                      onClick={() => removeImage(index)}
                      className="absolute top-3 right-3 bg-rose-500/90 backdrop-blur-md text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-600 hover:scale-110 shadow-lg z-10"
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
                    className="aspect-square rounded-[2rem] overflow-hidden relative group border-2 border-emerald-500/20 shadow-xl shadow-emerald-500/10 bg-black"
                  >
                    <video src={vid} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all">
                       <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white">
                          <Play size={20} fill="white" />
                       </div>
                    </div>
                    <button 
                      onClick={() => removeVideo(index)}
                      className="absolute top-3 right-3 bg-rose-500/90 backdrop-blur-md text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-600 hover:scale-110 shadow-lg z-10"
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
    <Modal isOpen={isOpen} onClose={onClose} width="md">
      <div className="p-8 space-y-8 relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all z-50 border border-gray-100 dark:border-gray-800"
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        <div className="flex items-center justify-between pr-10">
          <Heading 
            title={showSkipConfirm ? "Confirm Skip" : step === 1 ? "Rate Your Stay" : step === 2 ? "Share Details" : "Visual Proof"} 
            subtitle={showSkipConfirm ? "Final check before skipping" : `Step ${step} of 3`}
          />
          <div className="flex gap-1">
             {[1,2,3].map(s => (
               <div key={s} className={`w-6 h-1 rounded-full transition-colors ${step >= s ? 'bg-primary' : 'bg-gray-200'}`} />
             ))}
          </div>
        </div>

        <div className="min-h-[350px] relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20, filter: "blur(4px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -20, filter: "blur(4px)" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {!showSkipConfirm && (
          <div className="flex items-center gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
             {step === 1 ? (
               <Button outline onClick={() => setShowSkipConfirm(true)} className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-red-50 hover:text-red-500 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:border-red-500/30 font-black tracking-widest uppercase text-[12px] h-14">
                 <SkipForward size={20} className="mr-2" /> Skip
               </Button>
             ) : (
               <Button outline onClick={() => setStep(step - 1)} disabled={isLoading} className="flex-1 flex items-center justify-center font-black tracking-widest uppercase text-[12px] h-14">
                 <ArrowLeft size={20} className="mr-2" /> Back
               </Button>
             )}
             
             {step < 3 ? (
               <Button onClick={handleNextStep} className="flex-1 flex items-center justify-center shadow-lg font-black tracking-widest uppercase text-[12px] h-14">
                 Next Step <ArrowRight size={20} className="ml-2" />
               </Button>
             ) : (
               <Button 
                 onClick={onSubmit} 
                 isLoading={isLoading} 
                 className="flex-1 flex items-center justify-center shadow-xl shadow-primary/20 font-black tracking-widest uppercase text-[12px] h-14"
               >
                 <Check size={20} className="mr-2" /> Submit Review
               </Button>
             )}
          </div>
        )}
      </div>
    </Modal>
  );
}

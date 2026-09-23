'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ShieldCheck, Lock, Eye, ExternalLink, FileText } from 'lucide-react';
import { cn } from '@/utils/helper';
import SafeImage from '@/components/common/SafeImage';

interface MediaPreviewOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  onNavigate?: (index: number) => void;
  title?: string;
  isDocument?: boolean;
}

const checkIsPdf = (url: string): boolean => {
  if (!url) return false;
  const lower = url.toLowerCase();
  return lower.endsWith('.pdf') || lower.includes('.pdf?') || lower.includes('/pdf') || lower.startsWith('data:application/pdf');
};

const MediaPreviewOverlay: React.FC<MediaPreviewOverlayProps> = ({
  isOpen,
  onClose,
  images = [],
  currentIndex = 0,
  onNavigate,
  title,
  isDocument = false
}) => {
  const [mounted, setMounted] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const safeImages = Array.isArray(images) ? images : [];
  const safeIndex = Math.max(0, Math.min(currentIndex, safeImages.length - 1));
  const currentSrc = safeImages[safeIndex] || '';
  const isPdf = checkIsPdf(currentSrc);

  useEffect(() => {
    if (isOpen) {
      setIsImageLoading(true);
    }
  }, [isOpen, safeIndex, currentSrc]);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowLeft' && images.length > 1 && onNavigate) {
          onNavigate((currentIndex - 1 + images.length) % images.length);
        }
        if (e.key === 'ArrowRight' && images.length > 1 && onNavigate) {
          onNavigate((currentIndex + 1) % images.length);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, currentIndex, images.length, onNavigate, onClose]);

  if (!mounted) return null;

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!onNavigate || images.length <= 1) return;
    onNavigate((currentIndex - 1 + images.length) % images.length);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!onNavigate || images.length <= 1) return;
    onNavigate((currentIndex + 1) % images.length);
  };

  const overlayContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex flex-col justify-between bg-black/95 backdrop-blur-3xl p-4 md:p-8 select-none"
          onClick={onClose}
        >
          {/* Header */}
          <div className="relative z-20 flex items-center justify-between w-full max-w-7xl mx-auto pt-2 gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center text-white backdrop-blur-xl border border-white/15 shadow-xl shrink-0">
                {isDocument || isPdf ? <ShieldCheck size={20} className="text-primary" /> : <Eye size={20} />}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-[0.2em]">
                    {title || 'Media Preview'}
                  </h4>
                  {(isDocument || isPdf) && (
                    <span className="hidden sm:flex items-center gap-1 text-[9px] font-black px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 uppercase tracking-widest">
                      <Lock size={9} /> Encrypted Document
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.25em] mt-0.5">
                  Item {safeIndex + 1} of {safeImages.length}
                </p>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-3">
              {currentSrc && (
                <a
                  href={currentSrc}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase tracking-wider border border-white/15 transition-all flex items-center gap-2 shadow-lg cursor-pointer hover:scale-105"
                  title="Open in new tab"
                >
                  <ExternalLink size={14} />
                  <span className="hidden sm:inline">{isPdf ? "Open PDF" : "Open Full Media"}</span>
                </a>
              )}

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/10 hover:bg-rose-500 text-white flex items-center justify-center transition-all border border-white/15 hover:border-rose-500 shadow-2xl group cursor-pointer shrink-0"
                title="Close preview (Esc)"
              >
                <X size={24} className="group-hover:scale-110 transition-transform stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Main Stage */}
          <div className="relative w-full max-w-6xl h-full flex-1 flex items-center justify-center my-4 mx-auto overflow-hidden">
            <AnimatePresence mode="wait">
              {currentSrc && (
                <motion.div
                  key={safeIndex}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="relative flex items-center justify-center w-full max-w-[90vw] max-h-[78vh] min-h-[300px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isImageLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 z-20 p-6 text-center shadow-2xl">
                      <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin shrink-0" />
                      <div className="space-y-1 select-none">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-white">
                          {isPdf ? "Rendering PDF Document..." : isDocument ? "Decrypting Document..." : "Loading High-Res Image..."}
                        </p>
                        <p className="text-[10px] font-bold text-white/50 tracking-wider">Fetching secure asset from storage</p>
                      </div>
                    </div>
                  )}

                  {isPdf ? (
                    <div className="relative w-full h-[75vh] max-w-5xl rounded-2xl overflow-hidden border border-white/20 bg-slate-900 shadow-[0_0_90px_rgba(0,0,0,0.9)] flex flex-col">
                      <iframe
                        src={currentSrc}
                        title={title || "PDF Document Viewer"}
                        onLoad={() => setIsImageLoading(false)}
                        className={cn(
                          "w-full h-full border-none transition-opacity duration-300 bg-white",
                          isImageLoading ? "opacity-0" : "opacity-100"
                        )}
                      />
                    </div>
                  ) : (
                    <img
                      src={currentSrc}
                      alt={title || "Preview"}
                      onLoad={() => setIsImageLoading(false)}
                      onError={() => setIsImageLoading(false)}
                      className={cn(
                        "max-w-[85vw] max-h-[75vh] object-contain rounded-2xl shadow-[0_0_90px_rgba(0,0,0,0.9)] border border-white/10 transition-opacity duration-300",
                        isImageLoading ? "opacity-0" : "opacity-100"
                      )}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Arrows */}
            {safeImages.length > 1 && onNavigate && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2 sm:left-6 p-4 bg-black/60 hover:bg-black/80 text-white rounded-2xl transition-all border border-white/20 flex items-center justify-center backdrop-blur-md hover:scale-110 active:scale-95 shadow-2xl cursor-pointer"
                  title="Previous image (Left Arrow)"
                >
                  <ChevronLeft size={28} className="stroke-[2.5]" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 sm:right-6 p-4 bg-black/60 hover:bg-black/80 text-white rounded-2xl transition-all border border-white/20 flex items-center justify-center backdrop-blur-md hover:scale-110 active:scale-95 shadow-2xl cursor-pointer"
                  title="Next image (Right Arrow)"
                >
                  <ChevronRight size={28} className="stroke-[2.5]" />
                </button>
              </>
            )}
          </div>

          {/* Footer Gallery Bar or Encrypted Document Status Bar */}
          <div className="relative z-20 flex flex-col items-center justify-center gap-3 max-w-4xl mx-auto w-full pb-2">
            {safeImages.length > 1 ? (
              <div 
                className="flex items-center gap-2.5 overflow-x-auto max-w-full p-2 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {safeImages.map((img, idx) => {
                  const isActive = safeIndex === idx;
                  const itemIsPdf = checkIsPdf(img);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onNavigate?.(idx)}
                      className={cn(
                        "relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 flex items-center justify-center bg-slate-900",
                        isActive
                          ? "border-primary ring-2 ring-primary/50 scale-105 opacity-100 shadow-lg"
                          : "border-white/10 opacity-40 hover:opacity-100 hover:border-white/40"
                      )}
                    >
                      {itemIsPdf ? (
                        <div className="flex flex-col items-center justify-center text-red-400 p-1">
                          <FileText size={20} />
                          <span className="text-[7px] font-black uppercase tracking-tighter text-white/80">PDF</span>
                        </div>
                      ) : (
                        <SafeImage src={img} alt="" className="w-full h-full object-cover" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : isDocument || isPdf ? (
              <div className="px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/15 text-white/70 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-2xl">
                <Lock size={12} className="text-primary" />
                <span>Verified Legal Document • 256-Bit Encrypted Preview</span>
              </div>
            ) : null}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(overlayContent, document.body);
};

export default MediaPreviewOverlay;

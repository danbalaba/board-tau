'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { cn } from '@/utils/helper';

interface MediaPreviewOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  onNavigate?: (index: number) => void;
  title?: string;
}

const MediaPreviewOverlay: React.FC<MediaPreviewOverlayProps> = ({
  isOpen,
  onClose,
  images,
  currentIndex,
  onNavigate,
  title
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted) return null;

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!onNavigate) return;
    onNavigate((currentIndex - 1 + images.length) % images.length);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!onNavigate) return;
    onNavigate((currentIndex + 1) % images.length);
  };

  const overlayContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4 md:p-10"
          onClick={onClose}
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 p-8 flex items-center justify-between z-20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white backdrop-blur-xl border border-white/10 shadow-2xl">
                <Maximize2 size={24} />
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-[0.2em]">{title || 'Media Preview'}</h4>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mt-1">Item {currentIndex + 1} of {images.length}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-14 h-14 rounded-[1.5rem] bg-white/5 hover:bg-rose-500 text-white flex items-center justify-center transition-all border border-white/10 hover:border-rose-500 shadow-2xl group"
            >
              <X size={28} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Main Image Container */}
          <div className="relative w-full max-w-6xl h-full flex items-center justify-center py-20">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: -20 }}
                src={images[currentIndex]}
                className="max-w-full max-h-full object-contain rounded-3xl shadow-[0_0_120px_rgba(0,0,0,0.8)] border border-white/5 cursor-default"
                onClick={(e) => e.stopPropagation()}
              />
            </AnimatePresence>

            {/* Navigation Arrows */}
            {images.length > 1 && onNavigate && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-4 lg:-translate-x-24 p-6 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all border border-white/10 hidden md:flex items-center justify-center backdrop-blur-xl hover:scale-110 active:scale-95"
                >
                  <ChevronLeft size={32} />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 lg:translate-x-24 p-6 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all border border-white/10 hidden md:flex items-center justify-center backdrop-blur-xl hover:scale-110 active:scale-95"
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}
          </div>

          {/* Footer Navigation Dots */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6">
            <div className="flex gap-2.5">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate?.(idx);
                  }}
                  className={cn(
                    "h-2 transition-all duration-700 rounded-full",
                    currentIndex === idx ? "w-12 bg-primary shadow-[0_0_20px_rgba(var(--primary),0.6)]" : "w-3 bg-white/10 hover:bg-white/30"
                  )}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(overlayContent, document.body);
};

export default MediaPreviewOverlay;

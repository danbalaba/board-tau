'use client';

import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Skeleton from './Skeleton';
import { IconPhotoOff } from '@tabler/icons-react';
import { useTheme } from 'next-themes';

interface SafeImageProps extends Omit<ImageProps, 'onLoadingComplete' | 'onError'> {
  fallbackSrc?: string;
  containerClassName?: string;
  showSkeleton?: boolean;
  showSpinner?: boolean;
  loaderText?: string;
}

// Global in-memory cache for loaded image URLs to prevent skeleton re-triggering across re-renders
const globalLoadedImages = new Set<string>();

/**
 * SafeImage Component
 * 1. Shows a Shimmering Skeleton + Centered Loader Spinner while loading (unless showSkeleton=false)
 * 2. Gently fades in the image once ready
 * 3. Handles broken links by showing a fallback placeholder
 */
const SafeImage = ({
  src,
  alt,
  className,
  containerClassName,
  showSkeleton = true,
  showSpinner = true,
  loaderText,
  fallbackSrc = '/images/dark_placeholder.png', // Default local fallback
  fill = true, // We default to fill for modern responsive layouts
  priority = false,
  ...props
}: SafeImageProps) => {
  // Extract string URL if src happens to be passed as an object { url: string } or { src: string }
  const cleanSrc = typeof src === 'string' 
    ? src.trim() 
    : (src && typeof src === 'object' 
        ? (typeof (src as any).url === 'string' ? (src as any).url.trim() : (typeof (src as any).src === 'string' ? (src as any).src.trim() : '')) 
        : '');

  const [isLoading, setIsLoading] = useState(() => Boolean(cleanSrc));
  const [hasError, setHasError] = useState(false);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const imgRef = React.useRef<HTMLImageElement>(null);

  // Check cache and image load status after mount / src change
  useEffect(() => {
    setHasError(false);
    if (!cleanSrc) {
      setIsLoading(false);
      return;
    }
    if (globalLoadedImages.has(cleanSrc)) {
      setIsLoading(false);
      return;
    }
    if (imgRef.current?.complete && imgRef.current?.naturalWidth > 0) {
      globalLoadedImages.add(cleanSrc);
      setIsLoading(false);
      return;
    }
    if (typeof window !== 'undefined') {
      const testImg = new window.Image();
      testImg.src = cleanSrc;
      if (testImg.complete && testImg.naturalWidth > 0) {
        globalLoadedImages.add(cleanSrc);
        setIsLoading(false);
        return;
      }
    }
    setIsLoading(true);
  }, [cleanSrc]);

  // Check if image is already loaded (e.g. from cache)
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current?.naturalWidth > 0) {
      if (cleanSrc) globalLoadedImages.add(cleanSrc);
      setIsLoading(false);
    }
  }, [cleanSrc]);

  const defaultDarkFallback = '/images/dark_placeholder.png';
  const defaultLightFallback = '/images/white_placeholder.png';
  const isDefaultFallback = !fallbackSrc || fallbackSrc === defaultDarkFallback || fallbackSrc === defaultLightFallback;

  const resolvedFallbackSrc = isDefaultFallback
    ? (mounted && resolvedTheme === 'light' ? defaultLightFallback : defaultDarkFallback)
    : fallbackSrc;

  const finalSrc = hasError || !cleanSrc ? resolvedFallbackSrc : cleanSrc;

  return (
    <div className={cn("relative overflow-hidden", containerClassName || "w-full h-full")}>
      <AnimatePresence>
        {isLoading && showSkeleton && (
          <motion.div
            key="skeleton"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-10 overflow-hidden flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900/80 backdrop-blur-[1px]"
          >
            <Skeleton className="w-full h-full rounded-none absolute inset-0" />
            {showSpinner && (
              <div className="relative z-20 flex flex-col items-center justify-center gap-2 p-3 text-center select-none pointer-events-none">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin shrink-0 shadow-sm" />
                {loaderText && (
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 animate-pulse">
                    {loaderText}
                  </span>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Image
        {...props}
        ref={imgRef}
        src={finalSrc}
        alt={alt || "BoardTAU - Boarding House near Tarlac Agricultural University (TAU) Camiling Tarlac"}
        fill={fill}
        priority={priority}
        unoptimized={true}
        className={cn(
          "object-cover transition-opacity duration-200 ease-in-out",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        onLoad={() => {
          if (cleanSrc) globalLoadedImages.add(cleanSrc);
          setIsLoading(false);
        }}
        onError={() => {
          if (!hasError) setHasError(true);
          setIsLoading(false);
        }}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
};

export default SafeImage;

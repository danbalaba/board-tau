'use client';

import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Skeleton from './Skeleton';
import { IconPhotoOff } from '@tabler/icons-react';

interface SafeImageProps extends Omit<ImageProps, 'onLoadingComplete' | 'onError'> {
  fallbackSrc?: string;
  containerClassName?: string;
}

/**
 * SafeImage Component
 * 1. Shows a Shimmering Skeleton while loading
 * 2. Gently fades in the image once ready
 * 3. Handles broken links by showing a fallback placeholder
 */
const SafeImage = ({
  src,
  alt,
  className,
  containerClassName,
  fallbackSrc = '/images/placeholder-listing.jpg', // Default fallback
  fill = true, // We default to fill for modern responsive layouts
  priority = false,
  ...props
}: SafeImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);

  // Update internal state if src prop changes
  useEffect(() => {
    setImgSrc(src);
    setError(false);
    setIsLoading(true);
  }, [src]);

  return (
    <div className={cn("relative overflow-hidden", containerClassName || "w-full h-full")}>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="skeleton"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-10"
          >
            <Skeleton className="w-full h-full rounded-none" />
          </motion.div>
        )}
      </AnimatePresence>

      {error ? (
        <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100 dark:bg-gray-800 text-gray-400 gap-2">
          <IconPhotoOff size={24} stroke={1.5} />
          <span className="text-[10px] font-medium uppercase tracking-widest">Image Unavailable</span>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ 
            opacity: isLoading ? 0 : 1,
            scale: isLoading ? 1.05 : 1
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full h-full"
        >
          <Image
            {...props}
            src={imgSrc || fallbackSrc}
            alt={alt || "BoardTAU Listing"}
            fill={fill}
            priority={priority}
            className={cn(
              "object-cover transition-all duration-300",
              className
            )}
            onLoadingComplete={() => setIsLoading(false)}
            onError={() => {
              setError(true);
              setIsLoading(false);
            }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </motion.div>
      )}
    </div>
  );
};

export default SafeImage;

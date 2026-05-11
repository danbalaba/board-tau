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
  fallbackSrc = '/images/dark_placeholder.png', // Default local fallback
  fill = true, // We default to fill for modern responsive layouts
  priority = false,
  ...props
}: SafeImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const imgRef = React.useRef<HTMLImageElement>(null);

  // Update internal state if src prop changes
  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  // Check if image is already loaded (e.g. from cache)
  useEffect(() => {
    if (imgRef.current?.complete) {
      setIsLoading(false);
    }
  }, [src]);

  const resolvedFallbackSrc = mounted && resolvedTheme === 'light' ? '/images/white_placeholder.png' : '/images/dark_placeholder.png';

  const finalSrc = hasError || !src ? resolvedFallbackSrc : src;

  return (
    <div className={cn("relative overflow-hidden", containerClassName || "w-full h-full")}>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="skeleton"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-10"
          >
            <Skeleton className="w-full h-full rounded-none" />
          </motion.div>
        )}
      </AnimatePresence>

      <Image
        {...props}
        ref={imgRef}
        src={finalSrc}
        alt={alt || "BoardTAU Listing"}
        fill={fill}
        priority={priority}
        unoptimized={true}
        className={cn(
          "object-cover transition-opacity duration-200 ease-in-out",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        onLoad={() => {
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

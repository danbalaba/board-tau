"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion, HTMLMotionProps } from "framer-motion";

interface ThemeAwareImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  darkPlaceholder?: string;
  lightPlaceholder?: string;
  alt: string;
  isMotion?: boolean;
  motionProps?: HTMLMotionProps<"img">;
}

export const ThemeAwareImage: React.FC<ThemeAwareImageProps> = ({
  src,
  darkPlaceholder = "/images/dark_placeholder.png",
  lightPlaceholder = "/images/white_placeholder.png",
  alt,
  isMotion = false,
  motionProps = {},
  className,
  ...props
}) => {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset error state if the src prop changes
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const currentTheme = theme === 'system' ? systemTheme : theme;
  const placeholderUrl = currentTheme === 'light' ? lightPlaceholder : darkPlaceholder;

  // Determine final source
  const isPlaceholderSrc = src === "/images/placeholder.jpg" || !src;
  const finalSrc = (hasError || isPlaceholderSrc) ? placeholderUrl : src;

  if (!mounted) {
    // Avoid hydration mismatch by rendering default dark placeholder initially
    const initialSrc = isPlaceholderSrc ? darkPlaceholder : src;
    if (isMotion) {
      return <motion.img src={initialSrc} alt={alt} className={className} {...motionProps} />;
    }
    return <img src={initialSrc} alt={alt} className={className} {...props} />;
  }

  if (isMotion) {
    return (
      <motion.img
        src={finalSrc}
        alt={alt}
        className={className}
        onError={() => setHasError(true)}
        {...motionProps}
      />
    );
  }

  return (
    <img
      src={finalSrc}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      {...props}
    />
  );
};

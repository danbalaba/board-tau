'use client';

import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface SkeletonProps extends HTMLMotionProps<"div"> {
  variant?: 'rect' | 'circle' | 'text';
}

export default function Skeleton({ className, variant = 'rect', ...props }: SkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={cn(
        "relative overflow-hidden bg-gray-200 dark:bg-gray-800",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 dark:before:via-white/10 before:to-transparent",
        variant === 'rect' && "rounded-2xl",
        variant === 'circle' && "rounded-full",
        variant === 'text' && "rounded-lg h-4",
        className
      )}
      {...props}
    />
  );
}

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface LandlordSectionContainerProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
  delay?: number;
}

export default function LandlordSectionContainer({
  children,
  className,
  animate = true,
  delay = 0,
}: LandlordSectionContainerProps) {
  const content = (
    <div className={cn(
      "bg-white dark:bg-gray-950 p-6 md:p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-300",
      className
    )}>
      {children}
    </div>
  );

  if (!animate) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      {content}
    </motion.div>
  );
}

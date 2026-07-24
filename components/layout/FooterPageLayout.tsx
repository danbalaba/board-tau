'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';

interface FooterPageLayoutProps {
  title?: string;
  description?: string;
  lastUpdated?: string;
  children: ReactNode;
  wide?: boolean;
}

export default function FooterPageLayout({
  title,
  description,
  lastUpdated,
  children,
  wide = false,
}: FooterPageLayoutProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? theme === 'dark' : false;
  const maxWidthClass = wide ? 'max-w-7xl' : 'max-w-5xl';

  return (
    <div className={`min-h-screen bg-transparent transition-colors duration-300`}>
      {/* Main content container automatically gets top padding so it doesn't collide with the navbar */}

      {/* Content Area wrapped in a premium card */}
      <div className={`container mx-auto px-6 md:px-10 lg:px-20 ${maxWidthClass} pt-32 pb-12 mb-20`}>
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`bg-white dark:bg-slate-800/30 rounded-3xl border border-neutral-200/60 dark:border-slate-800 shadow-xl dark:shadow-2xl p-8 md:p-12 transition-all duration-300`}
        >
          <div className={`prose prose-lg max-w-none ${isDark ? 'prose-invert prose-p:text-slate-300 prose-headings:text-white prose-a:text-[#2f7d6d] hover:prose-a:text-[#1e5146]' : 'prose-p:text-gray-700 prose-headings:text-gray-900 prose-a:text-[#2f7d6d] hover:prose-a:text-[#1e5146]'}`}>
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

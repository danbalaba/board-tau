'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

interface FooterPageLayoutProps {
  title: string;
  description?: string;
  lastUpdated?: string;
  children: ReactNode;
}

export default function FooterPageLayout({
  title,
  description,
  lastUpdated,
  children,
}: FooterPageLayoutProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? theme === 'dark' : false;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900 text-slate-300' : 'bg-white text-[#222222]'}`}>
      {/* Simple Header */}
      <div className={`pt-24 pb-8 ${isDark ? 'border-slate-800' : 'border-[#dddddd]'}`}>
        <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-5xl">
          <h1 className={`text-3xl md:text-4xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-[#222222]'}`}>
            {title}
          </h1>
          {description && (
            <p className={`text-base md:text-lg ${isDark ? 'text-slate-400' : 'text-[#717171]'}`}>
              {description}
            </p>
          )}
          {lastUpdated && (
            <p className={`mt-4 text-sm font-medium ${isDark ? 'text-[#717171]' : 'text-[#717171]'}`}>
              Last updated: {lastUpdated}
            </p>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="container mx-auto px-6 md:px-10 lg:px-20 max-w-5xl py-8 mb-20">
        <div className={`prose prose-lg max-w-none ${isDark ? 'prose-invert prose-p:text-slate-300 prose-headings:text-white prose-a:text-white hover:prose-a:text-slate-400' : 'prose-p:text-[#222222] prose-headings:text-[#222222] prose-a:text-black hover:prose-a:text-gray-600'}`}>
          {children}
        </div>
      </div>
    </div>
  );
}

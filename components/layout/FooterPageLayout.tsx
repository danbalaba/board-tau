'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

interface FooterPageLayoutProps {
  title: string;
  description: string;
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

  // Use a default styling before mounting to avoid hydration mismatch, then apply theme
  const isDark = mounted ? theme === 'dark' : false;

  return (
    <div className={`min-h-screen ${mounted ? (isDark ? 'bg-[#0f0f0f] text-gray-200' : 'bg-gray-50 text-gray-800') : 'bg-gray-50 text-gray-800'}`}>
      <div className={`pt-20 pb-16 ${mounted ? (isDark ? 'bg-gradient-to-b from-gray-900 to-[#0f0f0f] border-b border-gray-800' : 'bg-white border-b border-gray-200 shadow-sm') : 'bg-white border-b border-gray-200 shadow-sm'}`}>
        <div className="container mx-auto px-4 max-w-4xl pt-8 pb-4">
          <h1 className={`text-4xl md:text-5xl font-extrabold tracking-tight mb-4 ${mounted ? (isDark ? 'text-white' : 'text-gray-900') : 'text-gray-900'}`}>
            {title}
          </h1>
          <p className={`text-lg md:text-xl font-medium max-w-2xl ${mounted ? (isDark ? 'text-gray-400' : 'text-gray-500') : 'text-gray-500'}`}>
            {description}
          </p>
          {lastUpdated && (
            <p className={`mt-6 text-sm font-semibold tracking-wider uppercase ${mounted ? (isDark ? 'text-gray-500' : 'text-gray-400') : 'text-gray-400'}`}>
              Last updated: {lastUpdated}
            </p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl py-12">
        <div className={`space-y-6 text-base md:text-lg leading-relaxed ${mounted ? (isDark ? 'text-gray-300' : 'text-gray-700') : 'text-gray-700'}`}>
          {children}
        </div>
      </div>
    </div>
  );
}

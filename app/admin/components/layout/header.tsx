'use client';

import React, { useState, useEffect } from 'react';
import { SidebarTrigger } from '../ui/sidebar';
import SearchInput from '../search-input';
import { UserNav } from './user-nav';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { NotificationCenter } from '../../features/notifications/components/notification-center';
import Skeleton from '@/components/common/Skeleton';

export default function Header() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 1000); // 1s delay for skeleton visibility
    return () => clearTimeout(timer);
  }, []);

  return (
    <header className="sticky top-0 w-full bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 h-20 flex items-center justify-between px-6 z-50">
      <div className='flex items-center gap-4'>
        <div className="flex items-center gap-3">
          <SidebarTrigger className='-ml-1 hover:bg-primary/10 transition-colors rounded-xl p-2 h-9 w-9 text-gray-500' />
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 hidden md:block mx-1" />
        </div>
        <div className='hidden md:flex relative'>
          {!mounted ? (
            <Skeleton className="h-10 w-[240px] lg:w-[320px] rounded-2xl" />
          ) : (
            <SearchInput />
          )}
        </div>
      </div>

      <div className='flex items-center gap-2'>
        <NotificationCenter />
        
        <ThemeToggle />
        
        <div className="w-[1px] h-6 bg-gray-200 dark:bg-gray-800 mx-2" />
        
        {!mounted ? (
          <Skeleton className="h-9 w-9 rounded-full" />
        ) : (
          <UserNav />
        )}
      </div>
    </header>
  );
}

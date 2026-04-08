'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  IconSettings, 
  IconUserCircle as IconUser, 
  IconChartLine, 
  IconMail, 
  IconCreditCard, 
  IconShield, 
  IconSun, 
  IconMoon, 
  IconBell as IconBellTabler, 
  IconMenu2, 
  IconSearch,
  IconCommand,
  IconX
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useKBar } from 'kbar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/admin/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/app/admin/components/ui/sidebar';
import { cn } from '@/lib/utils';
import * as z from 'zod';
import { toast } from 'sonner';

// Feature Components
import { LandlordSettingsModalHub } from '@/app/landlord/features/settings-hub/components/landlord-settings-modal-hub';
import { LandlordTopbarUserMenu } from '@/app/landlord/features/layout/components/landlord-topbar-user-menu';
import { NotificationsDropdown } from '@/app/landlord/features/notifications';
import { useLandlordProfileStore } from '../../settings-hub/hooks/use-landlord-profile-store';
import ViewProfileModal from '@/app/landlord/components/modals/ViewProfileModal';

interface LandlordTopbarProps {
  user: any;
}

export default function LandlordTopbar({ user: initialUser }: LandlordTopbarProps) {
  const storeUser = useLandlordProfileStore((state: any) => state.user);
  const user = storeUser || initialUser;

  // Refactored Modal State
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isViewProfileModalOpen, setIsViewProfileModalOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    setMounted(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchExpanded(true);
      }
      if (e.key === 'Escape') {
        setIsSearchExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) searchInputRef.current.focus();
  }, [isSearchExpanded]);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const handleOpenSettings = (tab?: string) => {
    setIsSettingsModalOpen(true);
  };

  const mockSuggestions = [
    { label: 'Properties', category: 'Management', icon: IconChartLine, action: () => router.push('/landlord/properties') },
    { label: 'Payments', category: 'Finance', icon: IconCreditCard, action: () => handleOpenSettings() },
    { label: 'Profile Settings', category: 'Account', icon: IconUser, action: () => handleOpenSettings() },
    { label: 'Inquiries', category: 'Tenants', icon: IconMail, action: () => router.push('/landlord/inquiries') },
    { label: 'Security & Privacy', category: 'Account', icon: IconShield, action: () => handleOpenSettings() },
    { label: 'Settings', category: 'System', icon: IconSettings, action: () => handleOpenSettings() },
  ];

  const filteredSuggestions = mockSuggestions.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    const schema = z.string().min(3, "Search term must be at least 3 characters");
    const result = schema.safeParse(searchQuery);
    if (!result.success) {
      toast.error(result.error?.issues?.[0]?.message);
      return;
    }
    setIsSearching(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSearching(false);
    
    const exactMatch = mockSuggestions.find(item => item.label.toLowerCase() === searchQuery.toLowerCase());
    if (exactMatch && exactMatch.action) {
      setIsSearchExpanded(false);
      exactMatch.action();
      return;
    }
    if (filteredSuggestions.length > 0) {
      setIsSearchExpanded(false);
      filteredSuggestions[0].action();
      return;
    }
    toast.info(`No results found for "${searchQuery}"`);
  };

  const pathname = usePathname();
  const kbar = useKBar();
  const isKBarPage = pathname === '/landlord' || pathname === '/landlord/analytics';

  return (
    <>
      <header className="sticky top-0 w-full bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 h-16 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-3">
            <SidebarTrigger className='-ml-1 hover:bg-primary/10 transition-colors rounded-xl p-2 h-10 w-10 text-gray-500' />
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 hidden md:block mx-1" />
          </div>
        </div>

        {/* Center - Search (Only on KBar enabled pages) */}
        <div className="flex-1 max-w-xl px-8 hidden md:block relative">
          <AnimatePresence>
            {isKBarPage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="relative cursor-pointer group"
                onClick={() => kbar.query.toggle()}
              >
                <div 
                  className={cn(
                    "flex items-center h-10 px-4 rounded-2xl border transition-all duration-300 w-[320px] bg-gray-100/50 dark:bg-gray-800/50 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-primary/20",
                  )}
                >
                  <IconSearch size={18} className="text-gray-400 group-hover:text-primary transition-colors" />
                  <span className="ml-3 text-sm font-medium text-gray-400 group-hover:text-gray-500 transition-colors flex-1">
                    Search everything...
                  </span>
                  <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                    <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px] font-black">⌘</kbd>
                    <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px] font-black">K</kbd>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2">
          {/* Notifications */}
          <NotificationsDropdown />

          {/* Theme Toggle */}
          <button onClick={() => setTheme(isDark ? 'light' : 'dark')} className="p-2.5 text-gray-500 hover:text-amber-400 rounded-xl transition-all">
            {mounted && isDark ? <IconSun size={22} /> : <IconMoon size={22} />}
          </button>

          <div className="w-[1px] h-6 bg-gray-200 dark:bg-gray-800 mx-2" />

          {/* New Modular User Menu */}
          <LandlordTopbarUserMenu 
            user={user} 
            onOpenSettings={handleOpenSettings} 
            onViewProfile={() => setIsViewProfileModalOpen(true)}
          />
        </div>
      </header>

      {/* Unified Modal Hub */}
      <LandlordSettingsModalHub 
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)} 
      />

      {/* View Profile Modal - Exactly from refactor branch */}
      <ViewProfileModal 
        isOpen={isViewProfileModalOpen} 
        onClose={() => setIsViewProfileModalOpen(false)} 
        user={user} 
      />
    </>
  );
}

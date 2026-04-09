'use client';

import React, { useState, useEffect } from 'react';
import { 
  IconSun, 
  IconMoon, 
  IconSearch,
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useKBar } from 'kbar';
import { SidebarTrigger } from '@/app/admin/components/ui/sidebar';
import { cn } from '@/lib/utils';

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

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'notifications' | 'payment' | 'security' | undefined>(undefined);
  const [modalMode, setModalMode] = useState<'account' | 'security' | 'all'>('all');
  const [isViewProfileModalOpen, setIsViewProfileModalOpen] = useState(false);
  
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const handleOpenSettings = (tab?: string) => {
    setIsSettingsModalOpen(true);
  };

  const pathname = usePathname();
  const kbar = useKBar();
  
  // Show search bar on all landlord management pages
  const isKBarPage = pathname.startsWith('/landlord');

  return (
    <>
      <header className="sticky top-0 w-full bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 h-16 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <SidebarTrigger className='-ml-1 hover:bg-primary/10 transition-colors rounded-xl p-2 h-9 w-9 text-gray-500' />
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 hidden md:block mx-1" />
          </div>

          {/* Left-aligned Search (Only on KBar enabled pages) */}
          <div className="hidden md:block relative">
            <AnimatePresence>
              {isKBarPage && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="relative cursor-pointer group"
                  onClick={() => kbar.query.toggle()}
                >
                  <div 
                    className={cn(
                      "flex items-center h-10 px-4 rounded-2xl border transition-all duration-500 w-[240px] lg:w-[320px]",
                      "bg-gray-100/40 dark:bg-white/[0.03] border-transparent",
                      "hover:bg-primary/5 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 group-active:scale-95"
                    )}
                  >
                    <div className="flex items-center justify-center w-5 h-5 rounded-lg bg-primary/10 text-primary mr-3 group-hover:scale-110 transition-transform">
                      <IconSearch size={14} strokeWidth={2.5} />
                    </div>
                    <span className="text-[13px] font-semibold text-gray-400 group-hover:text-primary/70 transition-colors flex-1">
                      Search...
                    </span>
                    <div className="flex items-center gap-1 opacity-20 group-hover:opacity-100 transition-all">
                      <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded-md text-[9px] font-black border border-gray-200 dark:border-gray-700 shadow-sm">⌘</kbd>
                      <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded-md text-[9px] font-black border border-gray-200 dark:border-gray-700 shadow-sm">K</kbd>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Notifications */}
          <NotificationsDropdown />

          {/* Theme Toggle */}
          <button onClick={() => setTheme(isDark ? 'light' : 'dark')} className="p-2 text-gray-500 hover:text-amber-400 rounded-xl transition-all">
            {mounted && isDark ? <IconSun size={19} /> : <IconMoon size={19} />}
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
        defaultTab={selectedTab}
        mode={modalMode}
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

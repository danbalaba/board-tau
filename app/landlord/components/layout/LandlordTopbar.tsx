'use client';

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { FaBell, FaSearch, FaUserCircle } from 'react-icons/fa';
import { IconSettings, IconUserCircle as IconUser, IconLogout, IconChartLine, IconMail, IconCreditCard, IconShield, IconSun, IconMoon, IconBell as IconBellTabler, IconMenu2, IconBell } from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';
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
import { ProfileSettingsModal } from '@/app/landlord/components/modals/ProfileSettingsModal';
import { AccountSettingsModal } from '@/app/landlord/components/modals/AccountSettingsModal';
import { NotificationsModal } from '@/app/landlord/components/modals/NotificationsModal';
import { NotificationsListModal } from '@/app/landlord/components/modals/NotificationsListModal';
import { PaymentSettingsModal } from '@/app/landlord/components/modals/PaymentSettingsModal';
import { SecuritySettingsModal } from '@/app/landlord/components/modals/SecuritySettingsModal';
import { PerformanceModal } from '@/app/landlord/components/modals/PerformanceModal';

interface LandlordTopbarProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
  };
}

export default function LandlordTopbar({ user }: LandlordTopbarProps) {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isNotificationsListModalOpen, setIsNotificationsListModalOpen] = useState(false);
  const [isPaymentSettingsModalOpen, setIsPaymentSettingsModalOpen] = useState(false);
  const [isSecuritySettingsModalOpen, setIsSecuritySettingsModalOpen] = useState(false);
  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSearchBarOpen, setIsSearchBarOpen] = useState(false);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Handle initial mount to avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  const isDark = theme === "dark";

  // Initialize dark mode state
  React.useEffect(() => {
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const handleThemeToggle = () => {
    const root = document.documentElement;
    const newDarkMode = !isDarkMode;
    
    if (newDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    setIsDarkMode(newDarkMode);
    localStorage.setItem('theme-mode', newDarkMode ? 'dark' : 'light');
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-6 z-50 shadow-sm">
        {/* Left side - Logo */}
        <div className="flex items-center gap-4">
          <SidebarTrigger className='-ml-1' />
          <Link href="/landlord" className="flex items-center gap-3">
            <div className="h-[35px] w-[150px] relative">
              {/* Show fallback logo during SSR */}
              {!mounted ? (
                <Image
                  src="/images/TauBOARD-Light.png"
                  alt="BoardTAU Logo"
                  fill
                  sizes="150px"
                  priority
                  unoptimized
                />
              ) : (
                <Image
                  src={isDark ? "/images/TauBOARD-Dark.png" : "/images/TauBOARD-Light.png"}
                  alt="BoardTAU Logo"
                  fill
                  sizes="150px"
                  priority
                  unoptimized
                />
              )}
            </div>
          </Link>
        </div>

        {/* Right side - Search, Notifications, Theme, Settings & User */}
        <div className="flex items-center gap-4">
          {/* Search bar */}
          <div className="relative group">
            <button 
              className="p-3 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl group"
              title="Search"
              onClick={() => setIsSearchBarOpen(!isSearchBarOpen)}
            >
              <FaSearch 
                size={20} 
                className="group-hover:scale-110 transition-transform duration-300"
              />
            </button>
            {/* Search dropdown that appears on click */}
            <div className={`absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 transform -translate-y-2 ${isSearchBarOpen ? 'opacity-100 translate-y-0' : 'opacity-0 hidden'}`}>
              <div className="p-4">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search properties, inquiries, bookings..."
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    autoFocus
                    onBlur={() => setTimeout(() => setIsSearchBarOpen(false), 200)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setIsSearchBarOpen(false);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative p-3 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl group" title="Notifications">
                <div className="relative">
                  <IconBellTabler 
                    size={24} 
                    className="group-hover:rotate-15 group-hover:scale-110 transition-all duration-300"
                  />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></span>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75"></span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-80 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700'
              side='bottom'
              align='end'
              sideOffset={8}
            >
              <DropdownMenuLabel className='p-4'>
                <p className='font-bold text-gray-900 dark:text-white'>Notifications</p>
                <p className='text-sm text-gray-500 dark:text-gray-400'>You have 2 unread notifications</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem 
                  onClick={() => setIsNotificationsListModalOpen(true)}
                  className='hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer'
                >
                  <IconBell className='mr-2 h-4 w-4 text-blue-500' />
                  <span>View All Notifications</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setIsNotificationsModalOpen(true)}
                  className='hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer'
                >
                  <IconSettings className='mr-2 h-4 w-4 text-purple-500' />
                  <span>Notification Settings</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <div className='p-4 text-xs text-gray-500 dark:text-gray-400 text-center'>
                <p>Last updated 2 minutes ago</p>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <button
            onClick={handleThemeToggle}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg group"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? (
              <IconSun 
                size={20} 
                className="group-hover:rotate-180 transition-transform duration-300"
              />
            ) : (
              <IconMoon 
                size={20} 
                className="group-hover:rotate-180 transition-transform duration-300"
              />
            )}
          </button>

          {/* Settings Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className='p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg group'>
                <IconSettings 
                  size={24} 
                  className="group-hover:rotate-90 transition-transform duration-300"
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-64 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700'
              side='bottom'
              align='end'
              sideOffset={8}
            >
              <DropdownMenuLabel className='p-4'>
                <p className='font-bold text-gray-900 dark:text-white'>Settings</p>
                <p className='text-sm text-gray-500 dark:text-gray-400'>Manage your account settings</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem 
                  onClick={() => setIsNotificationsModalOpen(true)}
                  className='hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer'
                >
                  <IconMail className='mr-2 h-4 w-4' />
                  <span>Notifications</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setIsPaymentSettingsModalOpen(true)}
                  className='hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer'
                >
                  <IconCreditCard className='mr-2 h-4 w-4' />
                  <span>Payment Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setIsSecuritySettingsModalOpen(true)}
                  className='hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer'
                >
                  <IconShield className='mr-2 h-4 w-4' />
                  <span>Security</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setIsPerformanceModalOpen(true)}
                  className='hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer'
                >
                  <IconChartLine className='mr-2 h-4 w-4' />
                  <span>Performance</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className='flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group'>
                <div className='w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300'>
                  {user.image ? (
                    <img
                      src={user.image}
                      alt="User profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <IconUser className='text-white size-5' />
                  )}
                </div>
                <div className='text-left hidden md:block'>
                  <p className='text-sm font-medium text-gray-900 dark:text-white'>
                    {user.name || user.email}
                  </p>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    {user.role === 'landlord' ? 'Landlord' : 'User'}
                  </p>
                </div>
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-64 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700'
              side='bottom'
              align='end'
              sideOffset={8}
            >
              <DropdownMenuLabel className='p-4'>
                <div className='flex items-center gap-3'>
                  <div className='w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30'>
                    {user.image ? (
                      <img
                        src={user.image}
                        alt="User profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <IconUser className='text-white size-6' />
                    )}
                  </div>
                  <div>
                    <p className='font-bold text-gray-900 dark:text-white'>
                      {user.name || 'Landlord'}
                    </p>
                    <p className='text-sm text-gray-500 dark:text-gray-400'>
                      {user.email || 'landlord@example.com'}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem 
                  onClick={() => setIsProfileModalOpen(true)}
                  className='hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer'
                >
                  <IconUser className='mr-2 h-4 w-4' />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setIsAccountModalOpen(true)}
                  className='hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer'
                >
                  <IconSettings className='mr-2 h-4 w-4' />
                  <span>Account Settings</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => signOut()}
                className='text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer'
              >
                <IconLogout className='mr-2 h-4 w-4' />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Modals */}
      <ProfileSettingsModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
      />
      <AccountSettingsModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />
      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
      />
      <NotificationsListModal
        isOpen={isNotificationsListModalOpen}
        onClose={() => setIsNotificationsListModalOpen(false)}
      />
      <PaymentSettingsModal
        isOpen={isPaymentSettingsModalOpen}
        onClose={() => setIsPaymentSettingsModalOpen(false)}
      />
      <SecuritySettingsModal
        isOpen={isSecuritySettingsModalOpen}
        onClose={() => setIsSecuritySettingsModalOpen(false)}
      />
      <PerformanceModal
        isOpen={isPerformanceModalOpen}
        onClose={() => setIsPerformanceModalOpen(false)}
      />
    </>
  );
}

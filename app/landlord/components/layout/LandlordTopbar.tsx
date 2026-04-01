'use client';

import React, { useState, useEffect, useRef } from 'react';
import { signOut } from 'next-auth/react';
import {
  IconSettings,
  IconUserCircle as IconUser,
  IconLogout,
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
  IconX,
  IconNotification
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/app/admin/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import { useKBar } from 'kbar';
import { SidebarTrigger } from '@/app/admin/components/ui/sidebar';
import Avatar from "@/components/common/Avatar";
import { ProfileSettingsModal } from '../modals/ProfileSettingsModal';
import { AccountSettingsModal } from '../modals/AccountSettingsModal';
import { NotificationsModal } from '../modals/NotificationsModal';
import { PaymentSettingsModal } from '../modals/PaymentSettingsModal';
import { SecuritySettingsModal } from '../modals/SecuritySettingsModal';
import { PerformanceModal } from '../modals/PerformanceModal';
import { NotificationsListModal } from '../modals/NotificationsListModal';


interface LandlordTopbarProps {
  user: any;
}

export default function LandlordTopbar({ user }: LandlordTopbarProps) {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isNotificationsListModalOpen, setIsNotificationsListModalOpen] = useState(false);
  const [isPaymentSettingsModalOpen, setIsPaymentSettingsModalOpen] = useState(false);
  const [isSecuritySettingsModalOpen, setIsSecuritySettingsModalOpen] = useState(false);
  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);


  const { query } = useKBar();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === "dark";

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 h-16 flex items-center justify-between px-6 z-50 transition-all duration-300">
        {/* Left side - Logo & Sidebar Trigger */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className='-ml-1 hover:bg-primary/10 transition-colors rounded-xl p-2' />
            <Link href="/landlord" className="flex items-center gap-3 group">
              <motion.div
                className="h-[35px] w-[150px] relative"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {!mounted ? (
                  <Image
                    src="/images/TauBOARD-Light.png"
                    alt="BoardTAU Logo"
                    fill
                    sizes="150px"
                    priority
                    unoptimized
                    className="object-contain"
                  />
                ) : (
                  <Image
                    src={isDark ? "/images/TauBOARD-Dark.png" : "/images/TauBOARD-Light.png"}
                    alt="BoardTAU Logo"
                    fill
                    sizes="150px"
                    priority
                    unoptimized
                    className="object-contain"
                  />
                )}
              </motion.div>
            </Link>
          </div>
        </div>

        {/* Center - Search Bar Trigger */}
        <div className="flex-1 max-w-xl px-8 hidden md:block relative">
            <button
              onClick={() => query.toggle()}
              className="w-full max-w-[280px] group flex items-center h-10 px-4 rounded-2xl border border-transparent bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
            >
              <IconSearch size={18} className="text-gray-400 group-hover:text-primary transition-colors duration-300 mr-3" />
              <span className="text-sm font-medium text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300 transition-colors">Search everything...</span>
              <div className="ml-auto flex items-center gap-0.5 px-1.5 py-0.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                <IconCommand size={10} className="text-gray-400" />
                <span className="text-[10px] font-black text-gray-400">K</span>
              </div>
            </button>
        </div>

        {/* Right side - Actions & User */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative p-2.5 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 rounded-xl transition-all duration-300 group">
                <IconBellTabler
                  size={22}
                  className="group-hover:rotate-12 transition-transform duration-300"
                />
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-4 ring-white dark:ring-gray-900"></span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-ping opacity-75"></span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-80 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-2 backdrop-blur-xl bg-white/95 dark:bg-gray-900/95'
              side='bottom'
              align='end'
              sideOffset={12}
            >
              <div className="px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-black text-gray-900 dark:text-white text-sm tracking-tight">Notifications</h3>
                  <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase tracking-wider">2 New</span>
                </div>
                <p className="text-xs font-medium text-gray-500">Stay updated with your properties</p>
              </div>
              <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800" />
              <DropdownMenuGroup className="py-1">
                <DropdownMenuItem
                  onClick={() => setIsNotificationsListModalOpen(true)}
                  className='rounded-xl flex items-center gap-3 p-3 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border-transparent hover:border-primary/20 border'
                >
                  <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                    <IconMail size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">View All Inboxes</p>
                    <p className="text-[10px] text-gray-500 font-medium">Check your messages</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsNotificationsModalOpen(true)}
                  className='rounded-xl flex items-center gap-3 p-3 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border-transparent hover:border-primary/20 border mt-1'
                >
                  <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                    <IconSettings size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Config Settings</p>
                    <p className="text-[10px] text-gray-500 font-medium">Manage alerts & sounds</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800" />
              <div className="p-2">
                <button className="w-full py-2 text-xs font-black text-primary hover:bg-primary/5 rounded-xl transition-colors tracking-widest uppercase">
                  Mark all as read
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle Button with Hydration Guard */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all duration-300 group"
          >
            {!mounted ? (
              <div className="w-[22px] h-[22px]" />
            ) : isDark ? (
              <IconSun size={22} className="group-hover:rotate-45 transition-transform duration-500" />
            ) : (
              <IconMoon size={22} className="group-hover:-rotate-45 transition-transform duration-500" />
            )}
          </button>

          <div className="w-[1px] h-6 bg-gray-200 dark:bg-gray-800 mx-2" />

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className='flex items-center gap-3 p-1.5 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group'>
                <div className='relative'>
                  <div className='w-9 h-9 rounded-full flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300 overflow-hidden ring-2 ring-primary/20'>
                    <Avatar
                      src={user.image}
                      alt={user.name || "User"}
                    />
                  </div>
                  <div className='absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full' />
                </div>
                <div className='text-left hidden lg:block'>
                  <p className='text-sm font-black text-gray-900 dark:text-white tracking-tight leading-none mb-0.5'>
                    {user.name || "Landlord User"}
                  </p>
                  <p className='text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest'>
                    {user.role} Account
                  </p>
                </div>
                <IconMenu2 size={16} className="text-gray-400 ml-1 group-hover:text-primary transition-colors" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-72 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-2 backdrop-blur-xl bg-white/95 dark:bg-gray-900/95'
              side='bottom'
              align='end'
              sideOffset={12}
            >
              <DropdownMenuLabel className='p-4'>
                <div className='flex items-center gap-4'>
                  <div className='w-14 h-14 rounded-full flex items-center justify-center p-0.5 bg-gradient-to-br from-primary to-purple-500'>
                    <div className="w-full h-full bg-white dark:bg-gray-950 rounded-full flex items-center justify-center overflow-hidden">
                      <Avatar
                        src={user.image}
                        alt={user.name || "User"}
                      />
                    </div>
                  </div>
                  <div>
                    <h4 className='font-black text-gray-900 dark:text-white tracking-tight'>
                      {user.name || 'Tenant Landlord'}
                    </h4>
                    <p className='text-xs font-medium text-gray-500 truncate max-w-[160px]'>
                      {user.email}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800" />
              <DropdownMenuGroup className="p-1">
                <DropdownMenuItem
                  onClick={() => setIsProfileModalOpen(true)}
                  className='rounded-xl flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group border border-transparent hover:border-primary/10'
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                    <IconUser size={18} />
                  </div>
                  <span className="font-bold text-sm">Profile Details</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsAccountModalOpen(true)}
                  className='rounded-xl flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group border border-transparent hover:border-primary/10 mt-1'
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center group-hover:bg-gray-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-gray-900 transition-colors">
                    <IconSettings size={18} />
                  </div>
                  <span className="font-bold text-sm">Account Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsSecuritySettingsModalOpen(true)}
                  className='rounded-xl flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group border border-transparent hover:border-primary/10 mt-1'
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <IconShield size={18} />
                  </div>
                  <span className="font-bold text-sm">Security & Privacy</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800" />
              <div className="p-1">
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className='rounded-xl flex items-center gap-3 p-3 cursor-pointer text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-black text-sm uppercase tracking-widest'
                >
                  <IconLogout size={18} />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </div>
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

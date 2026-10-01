'use client';

import React, { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useLoadingStore } from '@/hooks/use-loading-store';
import ConfirmModal from '@/components/common/ConfirmModal';
import Modal from '@/components/modals/Modal';
import { motion } from 'framer-motion';
import { 
  Settings, 
  LogOut, 
  ChevronRight, 
  ChevronDown, 
  Sparkles, 
  ShieldCheck, 
  User 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/admin/components/ui/dropdown-menu';
import Skeleton from '@/components/common/Skeleton';
import Avatar from '@/components/common/Avatar';
import { cn } from '@/lib/utils';

interface LandlordTopbarUserMenuProps {
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
    profileImage?: string | null;
    role: string;
  } | null;
  onOpenSettings: (tab?: 'profile' | 'security', mode?: 'account' | 'security' | 'all') => void;
  isLoading?: boolean;
}

export function LandlordTopbarUserMenu({ user, onOpenSettings, isLoading }: LandlordTopbarUserMenuProps) {
  const { isLoggingOut, setIsLoggingOut } = useLoadingStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    setShowLogoutConfirm(false);
    
    // Premium 2.5s delay for cinematic cleanup
    setTimeout(() => {
      signOut({ callbackUrl: '/' });
    }, 2500);
  };

  if (isLoading || !user) {
    return (
      <div className='flex items-center gap-3 p-1.5'>
        <Skeleton variant="circle" className="w-9 h-9" />
        <div className='text-left hidden lg:flex flex-col gap-1.5'>
          <Skeleton className="w-24 h-3.5" />
          <Skeleton className="w-16 h-2.5" />
        </div>
      </div>
    );
  }

  const avatarSrc = user.image || (user as any).profileImage;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button className='flex items-center gap-3 p-1.5 pl-2 pr-3 rounded-2xl border border-transparent hover:border-gray-200/80 dark:hover:border-gray-800 hover:bg-gray-100/60 dark:hover:bg-gray-800/60 transition-all duration-300 group outline-none cursor-pointer active:scale-95'>
          <div className='relative'>
            <div className='w-9 h-9 rounded-full flex items-center justify-center shadow-md shadow-primary/20 group-hover:scale-105 transition-transform duration-300 overflow-hidden ring-2 ring-primary/30 dark:ring-primary/50'>
              <Avatar src={avatarSrc} alt={user.name || "User"} />
            </div>
            <span className='absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full animate-pulse' />
          </div>
          <div className='text-left hidden lg:block min-w-0'>
            <p className='text-xs font-black text-gray-900 dark:text-white tracking-tight leading-none mb-1 truncate max-w-[140px]'>
              {user.name || "Landlord User"}
            </p>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <p className='text-[9px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest truncate'>
                {user.role} ACCOUNT
              </p>
            </div>
          </div>
          <ChevronDown size={14} className="text-gray-400 ml-0.5 group-hover:text-primary group-hover:translate-y-0.5 transition-all hidden lg:block" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className='w-80 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800/80 p-3 backdrop-blur-2xl bg-white/95 dark:bg-[#111827]/95 overflow-hidden z-[100]'
        side='bottom'
        align='end'
        sideOffset={12}
      >
        {/* User Profile Header Card */}
        <div className='p-4 rounded-[2rem] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:to-transparent border border-primary/20 shadow-xs mb-2 relative overflow-hidden'>
          <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
            <Sparkles size={60} className="text-primary" />
          </div>

          <div className='flex items-center gap-3.5 relative z-10'>
            <div className='relative shrink-0'>
              <div className='w-13 h-13 rounded-2xl flex items-center justify-center p-0.5 bg-gradient-to-br from-primary via-emerald-500 to-teal-400 shadow-md shadow-primary/20'>
                <div className="w-full h-full bg-white dark:bg-gray-950 rounded-[14px] flex items-center justify-center overflow-hidden">
                  <Avatar src={avatarSrc} alt={user.name || "User"} />
                </div>
              </div>
              <span className='absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-gray-950 rounded-full shadow-sm' />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className='font-black text-sm text-gray-900 dark:text-white tracking-tight leading-snug truncate'>
                {user.name || 'Landlord User'}
              </h4>
              <p className='text-[11px] font-medium text-gray-500 dark:text-gray-400 truncate mt-0.5 mb-1.5'>
                {user.email}
              </p>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/15 text-primary border border-primary/20 text-[9px] font-black uppercase tracking-wider">
                <ShieldCheck size={11} className="shrink-0" />
                <span>Verified Landlord</span>
              </div>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800/80 my-2 mx-2" />

        {/* Action Items */}
        <DropdownMenuGroup className="p-1 space-y-1">
          <DropdownMenuItem 
            onClick={() => onOpenSettings('profile')}
            className='rounded-2xl flex items-center justify-between p-3 cursor-pointer bg-transparent hover:bg-primary/10 dark:hover:bg-primary/20 text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-all duration-300 group border border-transparent hover:border-primary/20 outline-none select-none'
          >
            <div className='flex items-center gap-3.5'>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shrink-0">
                <Settings size={19} />
              </div>
              <div>
                <span className="font-black text-xs uppercase tracking-wider block text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                  Settings
                </span>
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 block leading-tight">
                  Profile & Security
                </span>
              </div>
            </div>
            <ChevronRight size={15} className="text-gray-400 group-hover:text-primary opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800/80 my-2 mx-2" />

        {/* Log Out Action */}
        <div className="p-1">
          <DropdownMenuItem 
            onClick={() => setShowLogoutConfirm(true)}
            className='rounded-2xl flex items-center justify-between p-3 cursor-pointer bg-red-500/10 dark:bg-red-500/15 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-white text-red-600 dark:text-red-400 transition-all duration-300 group border border-red-500/20 active:scale-95 outline-none select-none shadow-xs'
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-red-500/20 group-hover:bg-white/20 transition-colors">
                <LogOut size={16} className="group-hover:rotate-12 transition-transform" />
              </div>
              <span className="font-black text-xs uppercase tracking-widest">Log Out</span>
            </div>
            <ChevronRight size={15} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
      
      {/* Logout Confirmation Modal */}
      <Modal 
        isOpen={showLogoutConfirm} 
        onClose={() => setShowLogoutConfirm(false)}
        width="xs"
      >
        <ConfirmModal
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={handleLogout}
          title="Sign Out Dashboard?"
          message={`Ready to leave the dashboard, ${user.name || 'Landlord'}? We'll make sure your property data is synced and secure.`}
          confirmLabel="Logout"
          cancelLabel="Stay"
          isLoading={isLoggingOut}
          variant="danger"
        />
      </Modal>
    </DropdownMenu>
  );
}


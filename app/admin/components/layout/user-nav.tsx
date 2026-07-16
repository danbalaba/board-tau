'use client';

import React, { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  IconLogout, 
  IconMenu2,
  IconSettingsFilled,
  IconChevronRight,
  IconUser
} from '@tabler/icons-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { UserAvatarProfile } from "../user-avatar-profile";
import ConfirmModal from '@/components/common/ConfirmModal';
import Modal from '@/components/modals/Modal';
import UltimateLogoutOverlay from "@/components/navbar/UltimateLogoutOverlay";

export function UserNav() {
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Mock user data for admin
  const user = {
    id: '1',
    name: 'Admin User',
    email: 'admin@boardtau.com',
    image: '/admin-avatar.png'
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setShowLogoutConfirm(false);
    
    // Premium 2.5s delay for cinematic cleanup
    setTimeout(() => {
      signOut({ callbackUrl: '/' });
    }, 2500);
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className='flex items-center gap-3 p-1.5 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group focus:outline-none'>
          <div className='relative'>
            <div className='w-9 h-9 rounded-full flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300 overflow-hidden ring-2 ring-primary/20'>
              <UserAvatarProfile user={user} className="w-full h-full object-cover" />
            </div>
            <div className='absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full' />
          </div>
          <div className='text-left hidden lg:block'>
            <p className='text-sm font-black text-gray-900 dark:text-white tracking-tight leading-none mb-0.5'>
              {user.name || "Admin User"}
            </p>
            <p className='text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest'>
              Admin Account
            </p>
          </div>
          <IconMenu2 size={14} className="text-gray-400 ml-1 group-hover:text-primary transition-colors" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className='w-72 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-2 backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 z-[100]'
        side='bottom'
        align='end'
        sideOffset={12}
      >
        <DropdownMenuLabel className='p-4'>
          <div className='flex items-center gap-4'>
            <div className='w-14 h-14 rounded-full flex items-center justify-center p-0.5 bg-gradient-to-br from-primary to-purple-500'>
              <div className="w-full h-full bg-white dark:bg-gray-950 rounded-full flex items-center justify-center overflow-hidden">
                <UserAvatarProfile user={user} className="w-full h-full object-cover" />
              </div>
            </div>
            <div>
              <h4 className='font-black text-gray-900 dark:text-white tracking-tight'>
                {user.name || 'Admin User'}
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
            onClick={() => router.push('/admin/profile')}
            className='rounded-xl flex items-center justify-between p-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 focus:bg-gray-50 dark:focus:bg-gray-800/50 transition-all group mt-1'
          >
            <div className='flex items-center gap-3'>
              <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 group-hover:bg-primary/10 group-hover:text-primary flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <IconUser size={20} />
              </div>
              <span className="font-bold text-sm text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">Profile</span>
            </div>
            <IconChevronRight size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => router.push('/admin/settings')}
            className='rounded-xl flex items-center justify-between p-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 focus:bg-gray-50 dark:focus:bg-gray-800/50 transition-all group mt-1'
          >
            <div className='flex items-center gap-3'>
              <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 group-hover:bg-primary/10 group-hover:text-primary flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <IconSettingsFilled size={20} />
              </div>
              <span className="font-bold text-sm text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">Settings</span>
            </div>
            <IconChevronRight size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800" />
        <div className="p-1">
          <DropdownMenuItem 
            onClick={() => setShowLogoutConfirm(true)}
            className='rounded-xl flex items-center gap-3 p-3 cursor-pointer text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 focus:bg-red-50 dark:focus:bg-red-900/20 transition-all font-black text-sm uppercase tracking-widest'
          >
            <IconLogout size={18} />
            <span>Log Out</span>
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
          message={`Ready to leave the dashboard, ${user.name}? We'll make sure your admin data is synced and secure.`}
          confirmLabel="Logout"
          cancelLabel="Stay"
          isLoading={isLoggingOut}
          variant="danger"
        />
      </Modal>

      {/* Ultimate Cinematic Logout */}
      {isLoggingOut && <UltimateLogoutOverlay userName={user.name} />}
    </DropdownMenu>
  );
}

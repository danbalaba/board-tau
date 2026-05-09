'use client';

import React from 'react';
import { signOut } from 'next-auth/react';
import { 
  IconLogout, 
  IconMenu2,
  IconSettingsFilled,
  IconChevronRight
} from '@tabler/icons-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/admin/components/ui/dropdown-menu';
import Skeleton from '@/components/common/Skeleton';
import Avatar from '@/components/common/Avatar';

interface LandlordTopbarUserMenuProps {
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
    profileImage?: string | null;
    role: string;
  } | null;
  onOpenSettings: (tab?: 'profile' | 'notifications' | 'payment' | 'security', mode?: 'account' | 'security' | 'all') => void;
  isLoading?: boolean;
}

export function LandlordTopbarUserMenu({ user, onOpenSettings, isLoading }: LandlordTopbarUserMenuProps) {
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className='flex items-center gap-3 p-1.5 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group'>
          <div className='relative'>
            <div className='w-9 h-9 rounded-full flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300 overflow-hidden ring-2 ring-primary/20'>
              <Avatar src={user.image || (user as any).profileImage} alt={user.name || "User"} />
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
          <IconMenu2 size={14} className="text-gray-400 ml-1 group-hover:text-primary transition-colors" />
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
                <Avatar src={user.image || (user as any).profileImage} alt={user.name || "User"} />
              </div>
            </div>
            <div>
              <h4 className='font-black text-gray-900 dark:text-white tracking-tight'>
                {user.name || 'Landlord User'}
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
            onClick={() => onOpenSettings('profile')}
            className='rounded-xl flex items-center justify-between p-2.5 cursor-pointer hover:bg-violet-50/50 dark:hover:bg-violet-500/10 transition-all group mt-1'
          >
            <div className='flex items-center gap-3'>
              <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <IconSettingsFilled size={20} />
              </div>
              <span className="font-bold text-sm text-gray-700 dark:text-gray-300 group-hover:text-violet-600 transition-colors">Settings Hub</span>
            </div>
            <IconChevronRight size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800" />
        <div className="p-1">
          <DropdownMenuItem 
            onClick={() => signOut({ callbackUrl: '/' })}
            className='rounded-xl flex items-center gap-3 p-3 cursor-pointer text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-black text-sm uppercase tracking-widest'
          >
            <IconLogout size={18} />
            <span>Log Out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

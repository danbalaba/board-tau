'use client';

import React from 'react';
import { signOut } from 'next-auth/react';
import { 
  IconSettings, 
  IconUserCircle as IconUser, 
  IconLogout, 
  IconShield, 
  IconMenu2
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
import Avatar from '@/components/common/Avatar';

interface LandlordTopbarUserMenuProps {
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
  };
  onOpenSettings: (tab?: string) => void;
}

export function LandlordTopbarUserMenu({ user, onOpenSettings }: LandlordTopbarUserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className='flex items-center gap-3 p-1.5 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group'>
          <div className='relative'>
            <div className='w-9 h-9 rounded-full flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300 overflow-hidden ring-2 ring-primary/20'>
              <Avatar src={user.image} alt={user.name || "User"} />
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
                <Avatar src={user.image} alt={user.name || "User"} />
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
            onClick={() => onOpenSettings('profile')}
            className='rounded-xl flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group border border-transparent hover:border-primary/10'
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
              <IconUser size={18} />
            </div>
            <span className="font-bold text-sm">Profile Details</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onOpenSettings()}
            className='rounded-xl flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group border border-transparent hover:border-primary/10 mt-1'
          >
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center group-hover:bg-gray-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-gray-900 transition-colors">
              <IconSettings size={18} />
            </div>
            <span className="font-bold text-sm">Account Hub</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onOpenSettings('security')}
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
  );
}

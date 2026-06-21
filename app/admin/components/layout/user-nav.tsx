'use client';
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "../ui/dropdown-menu";
import { UserAvatarProfile } from "../user-avatar-profile";
import { IconMenu2 } from '@tabler/icons-react';

import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import React, { useState } from "react";
import UltimateLogoutOverlay from "@/components/navbar/UltimateLogoutOverlay";

export function UserNav() {
  // Mock user data for admin
  const user = {
    id: '1',
    name: 'Admin User',
    email: 'admin@boardtau.com',
    image: '/admin-avatar.png'
  };

  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    // Give time for the animation sequence to play out
    setTimeout(() => {
      signOut({ callbackUrl: '/' });
    }, 2500);
  };
  if (user) {
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
          className='w-56'
          align='end'
          sideOffset={10}
          forceMount
        >
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col space-y-1'>
              <p className='text-sm leading-none font-medium'>
                {user.name}
              </p>
              <p className='text-muted-foreground text-xs leading-none'>
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => router.push('/admin/profile')}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>New Team</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
        {isLoggingOut && <UltimateLogoutOverlay userName={user.name} />}
      </DropdownMenu>
    );
  }
}

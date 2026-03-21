'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
  SidebarTrigger,
} from '@/app/admin/components/ui/sidebar';
import {
  IconHome,
  IconBuilding,
  IconMail,
  IconCalendarCheck,
  IconStar,
  IconChartLine,
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
import { IconUserCircle, IconLogout, IconSettings } from '@tabler/icons-react';
import { signOut } from 'next-auth/react';

const navItems = [
  {
    href: '/landlord',
    label: 'Dashboard',
    icon: IconHome,
  },
  {
    href: '/landlord/properties',
    label: 'Properties',
    icon: IconBuilding,
  },
  {
    href: '/landlord/inquiries',
    label: 'Inquiries',
    icon: IconMail,
  },
  {
    href: '/landlord/reservations',
    label: 'Reservations',
    icon: IconCalendarCheck,
  },
  {
    href: '/landlord/bookings',
    label: 'Bookings',
    icon: IconCalendarCheck,
  },
  {
    href: '/landlord/reviews',
    label: 'Reviews',
    icon: IconStar,
  },
  {
    href: '/landlord/analytics',
    label: 'Analytics',
    icon: IconChartLine,
  },
];

export default function LandlordSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Handle initial mount to avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === "dark";

  // Show fallback logo during SSR
  if (!mounted) {
    return (
      <Sidebar
        variant='sidebar'
        collapsible='offcanvas'
        className='transition-all duration-500 ease-in-out bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg'
      >
        <SidebarHeader className='p-4 border-b border-gray-200 dark:border-gray-700'>
          <Link href="/landlord" className="flex items-center gap-3">
            <div className="h-[35px] w-[150px] relative">
              <Image
                src="/images/TauBOARD-Light.png"
                alt="BoardTAU Logo"
                fill
                sizes="150px"
                priority
                unoptimized
              />
            </div>
          </Link>
        </SidebarHeader>
        <SidebarContent className='overflow-x-hidden'>
          <SidebarGroup>
            <SidebarMenu className='space-y-2'>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href} className='group/menu-item'>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.label}
                    className='relative overflow-hidden transition-all duration-300 ease-in-out group-hover/menu-item:scale-[1.02] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  >
                    <Link href={item.href}>
                      <item.icon 
                        data-slot="sidebar-menu-button-icon" 
                        className='transition-all duration-300 text-gray-500 dark:text-gray-400 group-hover/menu-item:text-blue-600 dark:group-hover/menu-item:text-blue-400'
                      />
                      <span className='font-medium transition-all duration-300 text-gray-700 dark:text-gray-300'>
                        {item.label}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className='p-4 border-t border-gray-200 dark:border-gray-700'>
          <div className='text-xs text-gray-500 dark:text-gray-400 text-center'>
            <p className='animate-pulse'>Landlord Portal v2.0</p>
            <p className='mt-1 opacity-75'>2026 © BoardTAU</p>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    );
  }

  return (
    <Sidebar
      variant='sidebar'
      collapsible='offcanvas'
      className='transition-all duration-500 ease-in-out bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg'
    >
      <SidebarHeader className='p-4 border-b border-gray-200 dark:border-gray-700'>
        <Link href="/landlord" className="flex items-center gap-3">
          <div className="h-[35px] w-[150px] relative">
            <Image
              src={isDark ? "/images/TauBOARD-Dark.png" : "/images/TauBOARD-Light.png"}
              alt="BoardTAU Logo"
              fill
              sizes="150px"
              priority
              unoptimized
            />
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className='overflow-x-hidden'>
        <SidebarGroup>
          <SidebarMenu className='space-y-2'>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/landlord' && pathname.startsWith(item.href));

              return (
                <SidebarMenuItem key={item.href} className='group/menu-item'>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.label}
                    isActive={isActive}
                    className={`
                      relative overflow-hidden
                      transition-all duration-300 ease-in-out
                      group-hover/menu-item:scale-[1.02]
                      ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/40'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <Link href={item.href} className='relative'>
                      <Icon 
                        data-slot="sidebar-menu-button-icon" 
                        className={`
                          transition-all duration-300 ease-in-out
                          ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover/menu-item:text-blue-600 dark:group-hover/menu-item:text-blue-400'}
                          ${!isActive ? 'group-hover/menu-item:rotate-5' : ''}
                        `}
                      />
                      <span className={`
                        font-medium transition-all duration-300 ease-in-out
                        ${isActive ? 'text-white' : 'text-gray-700 dark:text-gray-300'}
                      `}>
                        {item.label}
                      </span>
                      {isActive && (
                        <div className='absolute left-0 top-0 bottom-0 w-1 bg-white/30 animate-pulse' />
                      )}
                      {/* Animated background effect on hover */}
                      <div className={`
                        absolute inset-0 bg-gradient-to-r from-blue-500/20 to-transparent
                        transition-all duration-300 ease-in-out
                        ${!isActive ? 'opacity-0 group-hover/menu-item:opacity-100' : ''}
                      `} />
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className='p-4 border-t border-gray-200 dark:border-gray-700'>
        <div className='text-xs text-gray-500 dark:text-gray-400 text-center'>
          <p className='animate-pulse'>Landlord Portal v2.0</p>
          <p className='mt-1 opacity-75'>2026 © BoardTAU</p>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

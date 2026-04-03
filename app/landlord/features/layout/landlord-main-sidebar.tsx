'use client';

import React, { useState, useEffect } from 'react';
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
} from '@/app/admin/components/ui/sidebar';
import {
  IconBuilding,
  IconStar,
  IconChartBar,
  IconLayoutDashboard,
  IconMessage,
  IconCalendarStats,
  IconCalendarCheck,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const navItems = [
  {
    href: '/landlord',
    label: 'Dashboard',
    icon: IconLayoutDashboard,
  },
  {
    href: '/landlord/properties',
    label: 'Properties',
    icon: IconBuilding,
  },
  {
    href: '/landlord/inquiries',
    label: 'Inquiries',
    icon: IconMessage,
  },
  {
    href: '/landlord/reservations',
    label: 'Reservations',
    icon: IconCalendarCheck,
  },
  {
    href: '/landlord/bookings',
    label: 'Bookings',
    icon: IconCalendarStats,
  },
  {
    href: '/landlord/reviews',
    label: 'Reviews',
    icon: IconStar,
  },
  {
    href: '/landlord/analytics',
    label: 'Analytics',
    icon: IconChartBar,
  },
];

export default function LandlordMainSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === "dark";

  return (
    <Sidebar
      variant='sidebar'
      collapsible='offcanvas'
      className='border-r border-gray-200/50 dark:border-gray-800/50 bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl transition-all duration-300'
    >
      <SidebarHeader className='p-6 mb-2'>
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.5 }}
        >
          <Link href="/landlord" className="flex items-center gap-3 group">
            <div className="h-[35px] w-[140px] relative transition-transform duration-300 group-hover:scale-105">
              {!mounted ? (
                <Image
                  src="/images/TauBOARD-Light.png"
                  alt="BoardTAU Logo"
                  fill
                  sizes="140px"
                  priority
                  unoptimized
                  className="object-contain"
                />
              ) : (
                <Image
                  src={isDark ? "/images/TauBOARD-Dark.png" : "/images/TauBOARD-Light.png"}
                  alt="BoardTAU Logo"
                  fill
                  sizes="140px"
                  priority
                  unoptimized
                  className="object-contain"
                />
              )}
            </div>
          </Link>
        </motion.div>
      </SidebarHeader>

      <SidebarContent className='px-4'>
        <SidebarGroup>
          <SidebarMenu className='gap-2'>
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/landlord' && pathname.startsWith(item.href));

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.label}
                    isActive={isActive}
                    className={cn(
                      "group relative h-11 px-4 rounded-xl transition-all duration-300",
                      isActive 
                        ? "bg-primary text-white shadow-lg shadow-primary/25 translate-x-1" 
                        : "text-gray-500 dark:text-gray-400 hover:bg-primary/5 dark:hover:bg-primary/10 hover:text-primary dark:hover:text-primary"
                    )}
                  >
                    <Link href={item.href} className="flex items-center gap-3 w-full">
                      <Icon 
                        size={20}
                        className={cn(
                          "transition-transform duration-300",
                          isActive ? "text-white" : "group-hover:scale-110"
                        )}
                      />
                      <span className={cn(
                        "font-black text-xs uppercase tracking-[0.05em] transition-all duration-300",
                        isActive ? "opacity-100" : "opacity-80 group-hover:opacity-100"
                      )}>
                        {item.label}
                      </span>
                      
                      {isActive && (
                        <motion.div
                          layoutId="active-nav-indicator"
                          className="absolute left-0 w-1 h-5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className='p-6 mt-auto border-t border-gray-100/50 dark:border-gray-800/50'>
        <div className="flex flex-col gap-4">
          <div className="bg-gradient-to-br from-primary/10 to-transparent p-4 rounded-2xl border border-primary/10">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Status</p>
            <div className="flex items-center gap-2 text-emerald-500">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold">System Online</span>
            </div>
          </div>
          
          <div className='flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-gray-400'>
             <span>v3.0.0</span>
             <span>© 2026 TAU</span>
          </div>
        </div>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}

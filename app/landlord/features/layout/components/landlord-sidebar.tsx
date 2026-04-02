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
  IconHome,
  IconBuilding,
  IconMail,
  IconCalendarCheck,
  IconStar,
  IconChartBar,
  IconLayoutDashboard,
  IconHistory,
  IconMessage,
  IconCalendarStats,
  IconBook,
  IconBriefcase,
  IconUsers,
  IconSettings
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
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

export default function LandlordSidebar() {
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
      <SidebarHeader className='p-8 mb-4'>
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.5, ease: "easeOut" }}
           className="flex flex-col items-center justify-center gap-4"
        >
          <Link href="/landlord" className="flex flex-col items-center gap-3 group">
            <div className="h-[40px] w-[160px] relative transition-all duration-500 group-hover:scale-110 group-hover:filter group-hover:drop-shadow-[0_0_15px_rgba(var(--primary),0.3)]">
              {!mounted ? (
                <Image
                  src="/images/TauBOARD-Light.png"
                  alt="BoardTAU Logo"
                  fill
                  sizes="160px"
                  priority
                  unoptimized
                  className="object-contain"
                />
              ) : (
                <Image
                  src={isDark ? "/images/TauBOARD-Dark.png" : "/images/TauBOARD-Light.png"}
                  alt="BoardTAU Logo"
                  fill
                  sizes="160px"
                  priority
                  unoptimized
                  className="object-contain"
                />
              )}
            </div>
            <div className="h-1 w-12 bg-gradient-to-r from-transparent via-primary/40 to-transparent rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
          </Link>
        </motion.div>
      </SidebarHeader>

      <SidebarContent className='px-5'>
        <SidebarGroup>
          <SidebarMenu className='gap-2.5'>
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
                      "group relative h-12 px-5 rounded-2xl transition-all duration-500 border border-transparent",
                      isActive 
                        ? "bg-gradient-to-r from-primary to-primary-hover text-white shadow-xl shadow-primary/30 translate-x-1 border-white/10" 
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-primary dark:hover:text-primary-hover hover:translate-x-1 hover:border-gray-100 dark:hover:border-white/5"
                    )}
                  >
                    <Link href={item.href} className="flex items-center gap-4 w-full">
                      <div className={cn(
                        "p-2 rounded-xl transition-all duration-500",
                        isActive ? "bg-white/20" : "bg-gray-100/50 dark:bg-white/5 group-hover:bg-primary/10"
                      )}>
                        <Icon 
                          size={18}
                          className={cn(
                            "transition-all duration-500",
                            isActive ? "text-white scale-110" : "group-hover:scale-110 group-hover:rotate-3"
                          )}
                        />
                      </div>
                      <span className={cn(
                        "font-black text-[11px] uppercase tracking-[0.08em] transition-all duration-300",
                        isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"
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

      <SidebarFooter className='p-8 mt-auto border-t border-gray-100/50 dark:border-gray-800/50 bg-gray-50/30 dark:bg-white/5'>
        <div className="flex flex-col gap-5">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm group/status cursor-default">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none">System Status</p>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-tight">Cloud Online</span>
              <span className="text-[10px] font-medium text-gray-400">v3.4.2</span>
            </div>
          </div>
          
          <div className='flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400/80 px-1'>
             <div className="flex items-center gap-1.5 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all cursor-default">
               <div className="w-4 h-4 bg-primary rounded-md flex items-center justify-center text-[8px] text-white">T</div>
               <span>TAU Board</span>
             </div>
             <span className="opacity-50">© 2026</span>
          </div>
        </div>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}

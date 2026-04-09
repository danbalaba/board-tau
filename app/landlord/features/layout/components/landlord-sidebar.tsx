'use client';
 
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
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
  IconLogout,
  IconCloudCheck,
  IconServer,
  IconCircleLetterT,
  IconDeviceFloppy // Corrected import
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/app/admin/components/ui/tooltip';

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
      collapsible='icon'
      className='border-r border-gray-200/50 dark:border-gray-800/50 bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl transition-all duration-300'
    >
      <SidebarHeader className={cn('pt-8 px-8 pb-4 mb-4 transition-all duration-300', state === 'collapsed' && 'p-2 mb-2')}>
        {state === 'collapsed' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center w-full"
          >
            <Link href="/landlord" className="p-2 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary border border-primary/10 shadow-lg shadow-primary/5 hover:scale-110 hover:shadow-primary/10 hover:bg-primary/10 transition-all duration-500 cursor-pointer group/logo relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover/logo:opacity-100 transition-opacity" />
              <IconHome 
                size={22} 
                stroke={2.5} 
                data-slot="sidebar-menu-button-icon"
                className="group-hover/logo:rotate-12 transition-transform duration-500 relative z-10"
              />
            </Link>
          </motion.div>
        ) : (
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
        )}
      </SidebarHeader>

      <SidebarContent className={cn('px-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]', state === 'collapsed' && 'px-0')}>
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
                      "group relative h-12 rounded-2xl transition-all duration-500 border border-transparent",
                      state === 'collapsed' ? "px-0 justify-center mx-auto w-9" : "px-5 w-full",
                      isActive 
                        ? "bg-gradient-to-r from-primary to-primary-hover text-white shadow-xl shadow-primary/30 translate-x-1 border-white/10" 
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-primary dark:hover:text-primary-hover hover:translate-x-1 hover:border-gray-100 dark:hover:border-white/5"
                    )}
                  >
                    <Link href={item.href} className={cn("flex items-center w-full", state === 'collapsed' ? "justify-center" : "gap-4")}>
                      <div className={cn(
                        "p-2 rounded-xl transition-all duration-500 shrink-0",
                        isActive ? "bg-white/20" : "bg-gray-100/50 dark:bg-white/5 group-hover:bg-primary/10",
                        state === 'collapsed' && "p-1.5"
                      )}>
                        <Icon 
                          size={18}
                          data-slot="sidebar-menu-button-icon"
                          className={cn(
                            "transition-all duration-500",
                            isActive ? "text-white scale-110" : "group-hover:scale-110 group-hover:rotate-3"
                          )}
                        />
                      </div>
                      
                      {state !== 'collapsed' && (
                        <span className={cn(
                          "font-black text-[11px] uppercase tracking-[0.08em] transition-all duration-300",
                          isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                        )}>
                          {item.label}
                        </span>
                      )}
                      
                      {isActive && state !== 'collapsed' && (
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

      <SidebarFooter className={cn(
        'p-8 mt-auto border-t border-gray-100/50 dark:border-gray-800/50 bg-gray-50/30 dark:bg-white/5 transition-all duration-300',
        state === 'collapsed' && 'p-2'
      )}>
        {state === 'collapsed' ? (
          <div className="flex flex-col items-center gap-5">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="bg-white dark:bg-gray-900 p-2.5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:border-emerald-500/30 group/status">
                    <IconCloudCheck size={20} className="text-emerald-500 group-hover/status:scale-110 transition-transform" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">System Online</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-sm hover:scale-110 hover:bg-primary hover:text-white transition-all duration-500 cursor-pointer relative group/brand overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent opacity-0 group-hover/brand:opacity-100 transition-opacity" />
                    <IconCircleLetterT size={24} stroke={2.5} className="relative z-10" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
                  <p className="text-[10px] font-black uppercase tracking-widest">BoardTAU © 2026</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm group/status cursor-default">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <IconServer size={14} className="text-gray-400 dark:text-gray-500" />
                  <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none">System Status</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-tight">Cloud Online</span>
                <span className="text-[10px] font-medium text-gray-400">v3.4.2</span>
              </div>
            </div>
            
            <div className='flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400/80 px-1'>
               <div className="flex items-center gap-1.5 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-default group/brand">
                 <IconCircleLetterT size={16} stroke={3} className="text-primary group-hover/brand:scale-110 transition-transform" />
                 <span>TAU Board</span>
               </div>
               <span className="opacity-50">© 2026</span>
            </div>
          </div>
        )}
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}

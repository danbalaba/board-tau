'use client';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "../ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar
} from "../ui/sidebar";
import { navItems } from "../../config/nav-config";
import { useFilteredNavItems } from "../../hooks/use-nav";
import {
  IconChevronRight,
  IconLogout,
} from '@tabler/icons-react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Icons } from '../icons';
import { OrgSwitcher } from '../org-switcher';
import { signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavItem } from '@/types';
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useTheme } from "next-themes";
import UltimateLogoutOverlay from "@/components/navbar/UltimateLogoutOverlay";
import Skeleton from '@/components/common/Skeleton';

export default function AppSidebar() {
  const { state } = useSidebar();
  const pathname = usePathname();
  const filteredItems = useFilteredNavItems(navItems);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      signOut({ callbackUrl: '/' });
    }, 2500);
  };

  const user = { name: 'Admin User' };

  return (
    <>
      <Sidebar
        collapsible='icon'
        variant='sidebar'
        className={cn(
          'border-r border-gray-200/50 dark:border-gray-800/50 bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl',
          mounted && 'transition-all duration-500 ease-in-out'
        )}
      >
        <SidebarHeader className={cn(
          'pt-8 px-8 pb-4 mb-4 overflow-hidden',
          mounted && 'transition-all duration-500 ease-in-out',
          state === 'collapsed' && 'pt-4 px-2 pb-2 mb-2'
        )}>
          {!mounted ? (
            <div className="flex flex-col items-center justify-center gap-4">
              <Skeleton className="h-[40px] w-[140px] rounded-xl" />
            </div>
          ) : state === 'collapsed' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center w-full"
            >
              <OrgSwitcher />
            </motion.div>
          ) : (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="flex flex-col items-center justify-center gap-4"
            >
              <Link href="/admin" className="flex flex-col items-center gap-3">
                <div className="h-[40px] w-[160px] relative transition-all duration-500">
                  <Image
                    src={isDark ? "/images/TauBOARD-Dark.png" : "/images/TauBOARD-Light.png"}
                    alt="BoardTAU Logo"
                    fill
                    sizes="160px"
                    priority
                    unoptimized
                    className="object-contain"
                  />
                </div>
              </Link>
            </motion.div>
          )}
        </SidebarHeader>

        <SidebarContent className={cn(
          'px-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]',
          mounted && 'transition-all duration-500 ease-in-out',
          state === 'collapsed' && 'px-0'
        )}>
          <SidebarGroup>
            <SidebarGroupLabel className="font-extrabold uppercase tracking-widest text-[10px] text-gray-400 mb-2">Overview</SidebarGroupLabel>
            <SidebarMenu className="gap-2.5">
              {!mounted ? (
                [...Array(8)].map((_, i) => (
                  <SidebarMenuItem key={i}>
                    <div className="px-2 w-full">
                      <Skeleton className="h-12 w-full rounded-2xl" />
                    </div>
                  </SidebarMenuItem>
                ))
              ) : (
                filteredItems.map((item) => (
                  <SidebarItem key={item.title} item={item} pathname={pathname} state={state} onLogout={handleLogout} />
                ))
              )}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

      <SidebarRail />
      </Sidebar>
      {isLoggingOut && <UltimateLogoutOverlay userName={user.name} />}
    </>
  );
}

function SidebarItem({ item, pathname, state, onLogout }: { item: NavItem; pathname: string; state: string; onLogout: () => void }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const Icon = item.icon ? Icons[item.icon] : Icons.logo;

  // Update isOpen when pathname changes if item or its children are active
  React.useEffect(() => {
    const isChildActive = item.items?.some(sub => sub.url === pathname);
    if (isChildActive || item.url === pathname) {
      setIsOpen(true);
    }
  }, [pathname, item.items, item.url]);

  const isMainActive = pathname === item.url || item.items?.some(sub => sub.url === pathname);

  if (item.items && item.items.length > 0) {
    return (
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className='group/collapsible'
      >
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <button
              style={{ appearance: 'none', WebkitAppearance: 'none', border: 'none', outline: 'none', boxShadow: 'none' }}
              className={cn(
                "group relative flex items-center w-full h-12 rounded-2xl transition-all duration-500 cursor-pointer",
                state === 'collapsed' ? "px-0 justify-center mx-auto w-9" : "px-5",
                isMainActive
                  ? "bg-gradient-to-r from-primary to-primary-hover text-white shadow-xl shadow-primary/30 translate-x-1"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-primary dark:hover:text-primary-hover hover:translate-x-1"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-all duration-500 shrink-0",
                isMainActive ? "bg-white/20" : "bg-gray-100/50 dark:bg-white/5 group-hover:bg-primary/10",
                state === 'collapsed' && "p-1.5"
              )}>
                {item.icon && <Icon size={18} className={cn("transition-all duration-500", isMainActive ? "text-white scale-110" : "group-hover:scale-110")} />}
              </div>
              <AnimatePresence mode="wait">
                {state !== 'collapsed' && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="font-black text-[11px] uppercase tracking-[0.08em] whitespace-nowrap overflow-hidden ml-2 flex-1 text-left"
                  >
                    {item.title}
                  </motion.span>
                )}
              </AnimatePresence>
              {state !== 'collapsed' && (
                <IconChevronRight
                  className={cn(
                    'transition-transform duration-300 w-4 h-4 shrink-0',
                    isOpen && 'rotate-90',
                    isMainActive ? "text-white/70" : "text-gray-400"
                  )}
                />
              )}
              {isMainActive && state !== 'collapsed' && (
                <motion.div
                  layoutId="active-nav-indicator-collapsible"
                  className="absolute left-0 w-1 h-5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </button>
          </CollapsibleTrigger>
          <AnimatePresence initial={false}>
            {isOpen && state !== 'collapsed' && (
              <CollapsibleContent forceMount asChild>
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden bg-gray-50/50 dark:bg-white/[0.02] rounded-xl mt-1 py-1"
                >
                  <SidebarMenuSub className="border-none pl-10 pr-2 space-y-1">
                    {item.items.map((subItem) => {
                      const isSubActive = pathname === subItem.url;
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isSubActive}
                            className={cn(
                              "min-h-9 h-auto py-2 rounded-lg transition-all duration-300 w-full",
                              subItem.url === '#logout' 
                                ? "text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                : isSubActive
                                  ? "bg-primary/10 text-primary font-bold shadow-sm"
                                  : "text-gray-500 hover:text-primary hover:bg-gray-100/50 dark:hover:bg-white/5"
                            )}
                          >
                            {subItem.url === '#logout' ? (
                              <button
                                onClick={onLogout}
                                className="w-full text-left"
                              >
                                <span className="text-[11px] font-bold uppercase tracking-[0.08em] block whitespace-nowrap overflow-hidden text-ellipsis leading-snug">{subItem.title}</span>
                              </button>
                            ) : (
                              <Link href={subItem.url} className="w-full">
                                <span className="text-[11px] font-bold uppercase tracking-[0.08em] block whitespace-nowrap overflow-hidden text-ellipsis leading-snug">{subItem.title}</span>
                              </Link>
                            )}
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </motion.div>
              </CollapsibleContent>
            )}
          </AnimatePresence>
        </SidebarMenuItem>
      </Collapsible>
    );
  }

  return (
    <SidebarMenuItem>
      <Link 
        href={item.url}
        className={cn(
          "group relative flex items-center h-12 rounded-2xl transition-all duration-500 cursor-pointer outline-none ring-0",
          state === 'collapsed' ? "px-0 justify-center mx-auto w-9 min-h-9 py-0" : "px-5 w-full",
          isMainActive
            ? "bg-gradient-to-r from-primary to-primary-hover text-white shadow-xl shadow-primary/30 translate-x-1"
            : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-primary dark:hover:text-primary-hover hover:translate-x-1"
        )}
      >
        <div className={cn(
          "flex items-center w-full",
          state === 'collapsed' ? "justify-center" : "gap-4"
        )}>
          <div className={cn(
            "p-2 rounded-xl transition-all duration-500 shrink-0",
            isMainActive ? "bg-white/20" : "bg-gray-100/50 dark:bg-white/5 group-hover:bg-primary/10",
            state === 'collapsed' && "p-1.5"
          )}>
            <Icon size={18} className={cn("transition-all duration-500", isMainActive ? "text-white scale-110" : "group-hover:scale-110 group-hover:rotate-3")} />
          </div>
          <AnimatePresence mode="wait">
            {state !== 'collapsed' && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "font-black text-[11px] uppercase tracking-[0.08em] transition-all duration-300 whitespace-nowrap overflow-hidden flex-1",
                  isMainActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                )}
              >
                {item.title}
              </motion.span>
            )}
          </AnimatePresence>
          {isMainActive && state !== 'collapsed' && (
            <motion.div
              layoutId="active-nav-indicator"
              className="absolute left-0 w-1 h-5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </div>
      </Link>
    </SidebarMenuItem>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Ellipsis, LogOut } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';

import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { CollapseMenuButton } from './collapse-menu-button';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '../ui/tooltip';
import { navItems } from '../../config/nav-config';
import { useFilteredNavItems } from '../../hooks/use-nav';
import { Icons } from '../icons';
import { NavItem } from '@/types';
import ConfirmModal from '@/components/common/ConfirmModal';
import Modal from '@/components/modals/Modal';
import UltimateLogoutOverlay from "@/components/navbar/UltimateLogoutOverlay";
import { getAdminDisplayName } from '@/app/admin/lib/utils';

interface MenuProps {
  isOpen: boolean | undefined;
  onItemClick?: () => void;
}

interface MenuItemGroup {
  groupLabel?: string;
  menus: NavItem[];
}

export function AppMenu({ isOpen, onItemClick }: MenuProps) {
  const pathname = usePathname();
  const filteredItems = useFilteredNavItems(navItems);
  const { data: session } = useSession();
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const displayName = getAdminDisplayName(session?.user?.name, session?.user?.role);

  const handleLogout = () => {
    setIsLoggingOut(true);
    setShowLogoutConfirm(false);

    setTimeout(() => {
      signOut({ callbackUrl: '/' });
    }, 2500);
  };

  // Group items matching Salimi's structured layout
  const menuGroups = React.useMemo<MenuItemGroup[]>(() => {
    const groups: MenuItemGroup[] = [];

    const overviewItems = filteredItems.filter(item => item.title === 'Dashboard');
    if (overviewItems.length > 0) {
      groups.push({
        groupLabel: 'Overview',
        menus: overviewItems,
      });
    }

    const managementItems = filteredItems.filter(item => item.title === 'User Directory');
    if (managementItems.length > 0) {
      groups.push({
        groupLabel: 'Management',
        menus: managementItems,
      });
    }

    const moderationItems = filteredItems.filter(item => item.title === 'Content Moderation');
    if (moderationItems.length > 0) {
      groups.push({
        groupLabel: 'Moderation',
        menus: moderationItems,
      });
    }

    const systemItems = filteredItems.filter(
      item => item.title === 'System Monitoring' || item.title === 'Platform Configuration'
    );
    if (systemItems.length > 0) {
      groups.push({
        groupLabel: 'System',
        menus: systemItems,
      });
    }

    // Catch any remaining items
    const groupedTitles = new Set([
      ...overviewItems.map(i => i.title),
      ...managementItems.map(i => i.title),
      ...moderationItems.map(i => i.title),
      ...systemItems.map(i => i.title),
    ]);
    const others = filteredItems.filter(item => !groupedTitles.has(item.title));
    if (others.length > 0) {
      groups.push({
        groupLabel: 'General',
        menus: others,
      });
    }

    return groups;
  }, [filteredItems]);

  return (
    <ScrollArea className="[&>div>div[style]]:!block flex-1">
      <nav className="mt-8 h-full w-full">
        <ul className="flex flex-col min-h-[calc(100vh-48px-36px-16px-32px)] lg:min-h-[calc(100vh-32px-40px-32px)] items-start space-y-1 px-2">
          {menuGroups.map(({ groupLabel, menus }, index) => (
            <li className={cn("w-full", groupLabel ? "pt-5" : "")} key={index}>
              {(isOpen && groupLabel) || isOpen === undefined ? (
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-4 pb-2 max-w-[248px] truncate">
                  {groupLabel}
                </p>
              ) : !isOpen && isOpen !== undefined && groupLabel ? (
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger className="w-full">
                      <div className="w-full flex justify-center items-center">
                        <Ellipsis className="h-5 w-5 text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-primary transition-colors" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{groupLabel}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <p className="pb-2"></p>
              )}
              {menus.map((item, itemIndex) => {
                const Icon = item.icon ? Icons[item.icon] : Icons.logo;
                const hasSubmenus = Boolean(item.items && item.items.length > 0);
                const isActive =
                  pathname === item.url ||
                  (hasSubmenus &&
                    Boolean(
                      item.items?.some(
                        (sub) => pathname === sub.url || pathname.startsWith(sub.url + '/')
                      )
                    ));

                if (!hasSubmenus) {
                  return (
                    <div className="w-full" key={itemIndex}>
                      <TooltipProvider disableHoverableContent>
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              className={cn(
                                "w-full justify-start h-10 mb-1 transition-colors",
                                isActive
                                  ? "bg-primary text-white shadow-xs shadow-primary/20 hover:bg-primary/90 hover:text-white font-medium"
                                  : "text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10"
                              )}
                              asChild
                            >
                              <Link href={item.url} onClick={onItemClick}>
                                <span
                                  className={cn(
                                    isOpen === false ? "" : "mr-4",
                                    isActive ? "text-white" : "text-slate-500 dark:text-slate-400 group-hover:text-primary"
                                  )}
                                >
                                  <Icon size={18} />
                                </span>
                                <p
                                  className={cn(
                                    "max-w-[200px] truncate",
                                    isOpen === false
                                      ? "-translate-x-96 opacity-0"
                                      : "translate-x-0 opacity-100"
                                  )}
                                >
                                  {item.title}
                                </p>
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          {isOpen === false && (
                            <TooltipContent side="right">
                              {item.title}
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  );
                }

                // Submenu / Collapsible item
                const submenus = (item.items || []).map(sub => ({
                  href: sub.url,
                  label: sub.title,
                }));

                return (
                  <div className="w-full" key={itemIndex}>
                    <CollapseMenuButton
                      icon={Icon}
                      label={item.title}
                      active={isActive}
                      submenus={submenus}
                      isOpen={isOpen}
                    />
                  </div>
                );
              })}
            </li>
          ))}
          <li className="w-full grow flex items-end">
            <TooltipProvider disableHoverableContent>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => {
                      onItemClick?.();
                      setShowLogoutConfirm(true);
                    }}
                    variant="outline"
                    className="w-full justify-center h-10 mt-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/30 dark:hover:text-red-400 dark:hover:border-red-900/50 text-slate-700 dark:text-slate-300 shadow-xs transition-all"
                  >
                    <span className={cn(isOpen === false ? "" : "mr-4", "text-slate-500 dark:text-slate-400 group-hover:text-red-500")}>
                      <LogOut size={18} />
                    </span>
                    <p
                      className={cn(
                        "whitespace-nowrap font-medium text-sm",
                        isOpen === false ? "opacity-0 hidden" : "opacity-100"
                      )}
                    >
                      Sign out
                    </p>
                  </Button>
                </TooltipTrigger>
                {isOpen === false && (
                  <TooltipContent side="right">
                    <p>Sign out</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </li>
        </ul>
      </nav>

      {/* Logout Confirmation Modal */}
      <Modal 
        isOpen={showLogoutConfirm} 
        onClose={() => setShowLogoutConfirm(false)}
        width="xs"
        fullOnMobile={false}
      >
        <ConfirmModal
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={handleLogout}
          title="Sign Out Dashboard?"
          message={`Ready to leave the dashboard, ${displayName}? We'll make sure your admin data is synced and secure.`}
          confirmLabel="Logout"
          cancelLabel="Stay"
          isLoading={isLoggingOut}
          variant="danger"
        />
      </Modal>

      {/* Ultimate Cinematic Logout */}
      {isLoggingOut && <UltimateLogoutOverlay userName={displayName} />}
    </ScrollArea>
  );
}

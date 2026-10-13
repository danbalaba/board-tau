'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
import { KerbyMascot } from '@/components/modals/search-modal/KerbyMascot';
import { getAdminTips } from '../../config/admin-tips';

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
  const [tipIndex, setTipIndex] = React.useState(0);

  const activeRole = session?.user?.role;
  const currentPool = React.useMemo(() => getAdminTips(activeRole, pathname || ''), [activeRole, pathname]);

  React.useEffect(() => {
    setTipIndex(0);
  }, [pathname, activeRole]);

  React.useEffect(() => {
    if (!currentPool || currentPool.length === 0) return;
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % currentPool.length);
    }, 22000);
    return () => clearInterval(interval);
  }, [currentPool]);

  const activeTip = currentPool[tipIndex % currentPool.length] || currentPool[0];
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
      <TooltipProvider delayDuration={100} skipDelayDuration={100} disableHoverableContent>
        <nav className="mt-8 h-full w-full">
          <ul className="flex flex-col min-h-[calc(100vh-48px-36px-16px-32px)] lg:min-h-[calc(100vh-32px-40px-32px)] items-start space-y-1.5 px-2">
            {menuGroups.map(({ groupLabel, menus }, index) => (
              <li className={cn("w-full", groupLabel ? "pt-5" : "")} key={index}>
                {(isOpen && groupLabel) || isOpen === undefined ? (
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3.5 pb-2.5 max-w-[248px] truncate">
                    {groupLabel}
                  </p>
                ) : !isOpen && isOpen !== undefined && groupLabel ? (
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger className="w-full" asChild>
                      <div className="w-full flex justify-center items-center py-1 cursor-default">
                        <Ellipsis className="h-5 w-5 text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-primary transition-colors" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{groupLabel}</p>
                    </TooltipContent>
                  </Tooltip>
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
                      <div className="w-full flex justify-center" key={itemIndex}>
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              className={cn(
                                "w-full h-11 mb-1.5 transition-all rounded-xl",
                                isOpen === false ? "justify-center px-0" : "justify-start px-3.5",
                                isActive
                                  ? "bg-primary text-white shadow-xs shadow-primary/25 hover:bg-primary/90 hover:text-white font-semibold"
                                  : "text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 font-medium"
                              )}
                              asChild
                            >
                              <Link 
                                href={item.url} 
                                onClick={(e) => {
                                  onItemClick?.();
                                  (e.currentTarget as HTMLElement)?.blur();
                                }}
                                className={cn("flex items-center", isOpen === false ? "justify-center w-full" : "w-full")}
                              >
                                <span
                                  className={cn(
                                    isOpen === false ? "flex items-center justify-center shrink-0" : "mr-3.5 shrink-0",
                                    isActive ? "text-white" : "text-slate-500 dark:text-slate-400 group-hover:text-primary"
                                  )}
                                >
                                  <Icon size={20} />
                                </span>
                                {isOpen ? (
                                  <p className="max-w-[200px] truncate text-sm font-semibold translate-x-0 opacity-100">
                                    {item.title}
                                  </p>
                                ) : null}
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          {isOpen === false && (
                            <TooltipContent side="right">
                              {item.title}
                            </TooltipContent>
                          )}
                        </Tooltip>
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

            {/* Bottom Footer Section: Dynamic Kerby Mascot Tips + Sign Out Button */}
            <li className="w-full grow flex flex-col justify-end pt-6 pb-2">
              {/* Kerby Admin Assistant Card (Role-Aware) */}
              {activeTip && (
                <div className="w-full mb-3">
                  {isOpen ? (
                    <KerbyMascot
                      variant="sidebar"
                      pose={activeTip.pose}
                      outfitMode="casual"
                      guideTitle={activeRole === 'SUPER_ADMIN' ? 'Kerby Super Admin' : 'Kerby Admin Guide'}
                      guideType="admin"
                      customAssetSrc={activeTip.asset}
                      speechText={activeTip.speech}
                      badgeLabel={activeTip.badge}
                      onNextTip={() => setTipIndex((prev) => (prev + 1) % currentPool.length)}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full my-2">
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                          <div className="w-11 h-11 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-xs hover:scale-110 transition-all duration-300 cursor-pointer relative group/brand overflow-visible">
                            <Image
                              src={activeTip.asset || "/assets/mascot/kerby-casual-waving.png"}
                              alt="Kerby Admin Assistant"
                              width={26}
                              height={26}
                              className="object-contain drop-shadow-xs group-hover:scale-110 transition-transform"
                              unoptimized
                            />
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 animate-pulse" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                          <p className="text-[10px] font-black uppercase tracking-wider text-primary">
                            {activeRole === 'SUPER_ADMIN' ? 'Kerby Super Admin Guide' : 'Kerby Admin Guide'}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-[200px] mt-1 line-clamp-3">
                            {activeTip.speech}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  )}
                </div>
              )}

              {/* Sign Out Button */}
              <div className="w-full flex justify-center">
                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={(e) => {
                        onItemClick?.();
                        (e.currentTarget as HTMLElement)?.blur();
                        setShowLogoutConfirm(true);
                      }}
                      variant="outline"
                      className={cn(
                        "w-full h-11 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/30 dark:hover:text-red-400 dark:hover:border-red-900/50 text-slate-700 dark:text-slate-300 shadow-xs transition-all rounded-xl",
                        isOpen === false ? "justify-center px-0" : "justify-center px-4"
                      )}
                    >
                      <span
                        className={cn(
                          isOpen === false ? "flex items-center justify-center shrink-0 mr-0" : "mr-3 shrink-0",
                          "text-slate-500 dark:text-slate-400 group-hover:text-red-500"
                        )}
                      >
                        <LogOut size={20} />
                      </span>
                      {isOpen ? (
                        <p className="whitespace-nowrap font-semibold text-sm">
                          Sign out
                        </p>
                      ) : null}
                    </Button>
                  </TooltipTrigger>
                  {isOpen === false && (
                    <TooltipContent side="right">
                      <p>Sign out</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </div>
            </li>
          </ul>
        </nav>
      </TooltipProvider>

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

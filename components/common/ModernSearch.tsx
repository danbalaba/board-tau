'use client';

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  KBarProvider,
  KBarPortal,
  KBarPositioner,
  KBarAnimator,
  KBarSearch,
  KBarResults,
  useMatches,
  Action,
  useRegisterActions,
  useKBar,
} from 'kbar';
import { useRouter, usePathname } from 'next/navigation';
import {
  IconLayoutDashboard,
  IconBuilding,
  IconMessage,
  IconCalendarCheck,
  IconCalendarStats,
  IconStar,
  IconChartBar,
  IconUser,
  IconSettings,
  IconShield,
  IconCreditCard,
  IconBell,
  IconSearch,
  IconCommand,
  IconChevronRight,
  IconUsers,
  IconCalendar
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { searchLandlordData } from '@/services/landlord/search';
import debounce from 'lodash.debounce';

export const ModernSearch = ({ children }: { children: React.ReactNode }) => {
  return (
    <KBarProvider>
      <KBarContent>{children}</KBarContent>
    </KBarProvider>
  );
};

const KBarContent = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { query } = useKBar();
  const search = useKBar((state) => state.searchQuery);

  const staticActions = useMemo<Action[]>(() => [
    {
      id: "dashboard",
      name: "Dashboard",
      shortcut: ["d", "h"],
      keywords: "home dashboard main overview",
      section: "Navigation",
      perform: () => router.push("/landlord"),
      icon: <IconLayoutDashboard size={20} />,
      subtitle: "Overview of your rental empire"
    },
    {
      id: "properties",
      name: "Properties",
      shortcut: ["p", "l"],
      keywords: "listings houses apartments rentals properties buildings",
      section: "Management",
      perform: () => router.push("/landlord/properties"),
      icon: <IconBuilding size={20} />,
      subtitle: "Manage your active listings and portfolios"
    },
    {
      id: "inquiries",
      name: "Inquiries",
      shortcut: ["i", "m"],
      keywords: "messages inquiries chats potential tenants questions",
      section: "Management",
      perform: () => router.push("/landlord/inquiries"),
      icon: <IconMessage size={20} />,
      subtitle: "Respond to potential tenants"
    },
    {
      id: "reservations",
      name: "Reservations",
      shortcut: ["r", "e"],
      keywords: "reservations pending bookings schedule",
      section: "Management",
      perform: () => router.push("/landlord/reservations"),
      icon: <IconCalendarCheck size={20} />,
      subtitle: "Approve or decline new booking requests"
    },
    {
      id: "bookings",
      name: "Bookings",
      shortcut: ["b", "o"],
      keywords: "bookings history active reservations schedule",
      section: "Management",
      perform: () => router.push("/landlord/bookings"),
      icon: <IconCalendarStats size={20} />,
      subtitle: "View all confirmed rental bookings"
    },
    {
      id: "reviews",
      name: "Reviews",
      shortcut: ["r", "v"],
      keywords: "reviews feedback ratings testimonials",
      section: "Analytics",
      perform: () => router.push("/landlord/reviews"),
      icon: <IconStar size={20} />,
      subtitle: "What your tenants are saying about you"
    },
    {
      id: "analytics",
      name: "Analytics",
      shortcut: ["a", "n"],
      keywords: "analytics stats statistics revenue performance",
      section: "Analytics",
      perform: () => router.push("/landlord/analytics"),
      icon: <IconChartBar size={20} />,
      subtitle: "In-depth insights into your business"
    },
    {
      id: "create-property",
      name: "Create New Property",
      shortcut: ["c", "p"],
      keywords: "add new listing property create",
      section: "Management",
      perform: () => router.push("/landlord/properties?action=create"),
      icon: <IconBuilding size={20} className="text-emerald-500" />,
      subtitle: "List a new room or apartment"
    },
    {
      id: "tenants",
      name: "Tenants",
      shortcut: ["t", "e"],
      keywords: "tenants residents roommates users",
      section: "Management",
      perform: () => router.push("/landlord/tenants"),
      icon: <IconUsers size={20} />,
      subtitle: "View and manage your current residents"
    },
    {
      id: "account",
      name: "Account Settings",
      shortcut: ["a", "s"],
      keywords: "settings configuration account system preferences",
      section: "Account Settings",
      perform: () => router.push("/landlord/settings"),
      icon: <IconSettings size={20} />,
      subtitle: "Tweak your dashboard experience"
    }
  ], [router]);

  useRegisterActions(staticActions, [staticActions]);

  const [dynamicResults, setDynamicResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const isDashboardOrAnalytics = useMemo(() => 
    pathname === '/landlord' || pathname === '/landlord/analytics', 
  [pathname]);

  const currentSection = useMemo(() => {
    if (pathname.includes('/landlord/properties')) return 'properties';
    if (pathname.includes('/landlord/inquiries')) return 'inquiries';
    if (pathname.includes('/landlord/reservations')) return 'reservations';
    if (pathname.includes('/landlord/bookings')) return 'bookings';
    if (pathname.includes('/landlord/tenants')) return 'tenants';
    if (pathname.includes('/landlord/reviews')) return 'reviews';
    return undefined;
  }, [pathname]);

  const placeholder = useMemo(() => {
    if (currentSection) {
      const name = currentSection.charAt(0).toUpperCase() + currentSection.slice(1);
      return `Search inside ${name}...`;
    }
    return "What are you looking for today?...";
  }, [currentSection]);

  const fetchResults = useCallback(
    debounce(async (q: string, section?: string) => {
      if (!q || q.length < 2) {
        setDynamicResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const results = await searchLandlordData(q, section);
        setDynamicResults(results);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (isDashboardOrAnalytics) return;
    fetchResults(search, currentSection);
  }, [search, currentSection, fetchResults, isDashboardOrAnalytics]);

  useRegisterActions(
    dynamicResults.map((res: any) => ({
      id: res.id,
      name: res.name,
      section: res.section,
      subtitle: res.subtitle,
      perform: () => router.push(res.perform),
      icon: res.icon === 'building' ? <IconBuilding size={20} /> : res.icon === 'message' ? <IconMessage size={20} /> : res.icon === 'calendar-stats' ? <IconCalendarStats size={20} /> : res.icon === 'users' ? <IconUsers size={20} /> : res.icon === 'star' ? <IconStar size={20} /> : <IconCalendar size={20} />
    })),
    [dynamicResults, router]
  );

  return (
    <>
      {isDashboardOrAnalytics && (
        <KBarPortal>
          <KBarPositioner className="bg-white/40 dark:bg-black/40 backdrop-blur-sm z-[100000]">
            <KBarAnimator className="w-full max-w-[600px] bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-800/50 rounded-3xl shadow-2xl overflow-hidden glassmorphism transform transition-all">
              <div className="relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-primary">
                  {isSearching ? (
                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  ) : (
                    <IconSearch size={22} className="opacity-70" />
                  )}
                </div>
                <KBarSearch
                  className="w-full h-16 pl-16 pr-6 bg-transparent text-lg font-bold text-gray-900 dark:text-white outline-none placeholder:text-gray-400 placeholder:font-medium"
                  placeholder={placeholder}
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-1 rounded-xl border border-gray-200/50 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-800/50 shadow-sm leading-none">
                  <IconCommand size={10} className="text-gray-400 font-black" />
                  <span className="text-[10px] font-black text-gray-400">ESC</span>
                </div>
              </div>

              <div className="max-h-[450px] overflow-auto pb-4 custom-scrollbar">
                <RenderResults />
              </div>

              <div className="px-6 py-4 border-t border-gray-100/50 dark:border-gray-800/50 bg-gray-50/30 dark:bg-gray-800/20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[10px] font-black text-gray-400 shadow-sm">↵</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Select</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[10px] font-black text-gray-400 shadow-sm">↑↓</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Navigate</span>
                  </div>
                </div>
                <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">BoardTAU Commander</span>
              </div>
            </KBarAnimator>
          </KBarPositioner>
        </KBarPortal>
      )}
      {children}
    </>
  );
};

function RenderResults() {
  const { results, rootActionId } = useMatches();

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) =>
        typeof item === "string" ? (
          <div className="px-6 py-3 mt-2 first:mt-0">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-80">{item}</h4>
          </div>
        ) : (
          <ResultItem item={item} active={active} />
        )
      }
    />
  );
}

const ResultItem = React.forwardRef(({ item, active }: { item: Action, active: boolean }, ref: React.Ref<HTMLDivElement>) => {
  return (
    <div
      ref={ref}
      className={cn(
        "px-6 py-3 cursor-pointer flex items-center justify-between transition-all duration-300 relative group",
        active ? "bg-primary/5 dark:bg-primary/10" : "hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
      )}
    >
      <div className="flex items-center gap-4 relative z-10">
        <div className={cn(
          "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500",
          active
            ? "bg-primary text-white shadow-lg shadow-primary/30 rotate-3 scale-110"
            : "bg-gray-100 dark:bg-gray-800 text-gray-500 group-hover:text-primary group-hover:bg-primary/10"
        )}>
          {item.icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className={cn(
              "font-black text-sm transition-colors",
              active ? "text-primary dark:text-primary-foreground" : "text-gray-900 dark:text-white"
            )}>
              {item.name}
            </h3>
            {item.shortcut && item.shortcut.length > 0 && (
              <div className="flex gap-1">
                {item.shortcut.map((s) => (
                  <kbd key={s} className="px-1.5 py-0.5 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[9px] font-black text-gray-400 uppercase">
                    {s}
                  </kbd>
                ))}
              </div>
            )}
          </div>
          {item.subtitle && (
            <p className="text-[11px] font-medium text-gray-500 mt-0.5 line-clamp-1">{item.subtitle}</p>
          )}
        </div>
      </div>

      {active && (
        <motion.div
          layoutId="hbar"
          className="absolute left-0 w-1 h-2/3 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}

      <div className={cn(
        "transition-all duration-300 transform",
        active ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
      )}>
        <IconChevronRight size={18} className="text-primary" />
      </div>
    </div>
  );
});

ResultItem.displayName = 'ResultItem';

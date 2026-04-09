'use client';

import {
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarProvider,
  KBarSearch,
  KBarResults,
  useMatches,
  useRegisterActions,
} from 'kbar';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState, useEffect, ReactNode } from 'react';
import { 
  IconLayoutDashboard, 
  IconBuilding, 
  IconMessage, 
  IconCalendarCheck, 
  IconCalendarStats, 
  IconStar, 
  IconChartBar, 
  IconSettings, 
  IconUser, 
  IconPlus, 
  IconSearch, 
  IconChevronRight, 
  IconBolt, 
  IconPointFilled
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { getAllLandlordProperties } from '@/services/landlord/properties';
import { getLandlordInquiries } from '@/services/landlord/inquiries';
import { getLandlordBookings } from '@/services/landlord/bookings';
import { getLandlordReviews } from '@/services/landlord/reviews';
import { getLandlordTenants } from '@/services/landlord/tenants';
import { cn } from '@/lib/utils';
import { Badge } from '@/app/admin/components/ui/badge';

// --- Improved Content Fetching (react-query) ---
const useLandlordSearchData = () => {
  const propertiesQuery = useQuery({
    queryKey: ['landlord-search-properties'],
    queryFn: () => getAllLandlordProperties(),
    staleTime: 60000,
  });

  const inquiriesQuery = useQuery({
    queryKey: ['landlord-search-inquiries'],
    queryFn: () => getLandlordInquiries({ cursor: undefined }),
    staleTime: 60000,
  });

  const bookingsQuery = useQuery({
    queryKey: ['landlord-search-bookings'],
    queryFn: () => getLandlordBookings({ cursor: undefined }),
    staleTime: 60000,
  });

  const reviewsQuery = useQuery({
    queryKey: ['landlord-search-reviews'],
    queryFn: () => getLandlordReviews({ cursor: undefined }),
    staleTime: 60000,
  });

  const tenantsQuery = useQuery({
    queryKey: ['landlord-search-tenants'],
    queryFn: () => getLandlordTenants({ cursor: undefined }),
    staleTime: 60000,
  });

  return {
    properties: propertiesQuery.data || [],
    inquiries: inquiriesQuery.data?.inquiries || [],
    bookings: bookingsQuery.data?.bookings || [],
    reviews: reviewsQuery.data?.reviews || [],
    tenants: tenantsQuery.data?.tenants || [],
  };
};

// --- Custom Result Item ---
const ResultItem = ({ action, active }: { action: any; active: boolean }) => {
  return (
    <div
      className={cn(
        "group mx-3 my-1 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-300 flex items-center justify-between relative overflow-hidden",
        active 
          ? "bg-primary/10 text-primary border-primary/20 shadow-sm z-10" 
          : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
      )}
    >
      {active && (
        <motion.div 
          layoutId="active-indicator"
          className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-full shadow-[0_0_10px_rgba(47,125,109,0.5)]"
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
        />
      )}
      
      <div className="flex items-center gap-4 relative z-10 w-full ml-1">
        <div className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0",
          active ? "bg-primary text-white scale-110 shadow-lg shadow-primary/25" : "bg-gray-100 dark:bg-gray-900 group-hover:bg-primary/10"
        )}>
          {action.icon}
        </div>
        <div className="flex flex-col min-w-0 flex-1 justify-center">
          <div className="flex items-center gap-2 truncate leading-none mb-1">
            <span className={cn(
              "text-[13px] font-bold tracking-tight truncate",
              active ? "text-primary" : "text-gray-900 dark:text-white"
            )}>
              {action.name}
            </span>
            {action.section && !active && (
              <Badge variant="outline" className="text-[9px] px-1.5 h-4 uppercase opacity-50 shrink-0 border-current">
                {action.section}
              </Badge>
            )}
          </div>
          {action.subtitle && (
            <div className={cn(
              "text-[11px] font-medium truncate flex items-center gap-1.5 leading-none",
              active ? "text-primary/70" : "text-gray-500"
            )}>
              {action.subtitle.split(' • ').map((part: string, i: number, arr: any[]) => (
                <React.Fragment key={i}>
                  {part.includes('★') ? (
                    <div className="flex items-center gap-0.5">
                      <IconStar size={10} className={cn("fill-current", active ? "text-primary" : "text-amber-500")} />
                      <span>{part.replace('★', '')}</span>
                    </div>
                  ) : (
                    <span>{part}</span>
                  )}
                  {i < arr.length - 1 && (
                    <IconPointFilled size={6} className="opacity-30" />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <IconChevronRight 
            size={14} 
            className={cn(
              "transition-all duration-300 shrink-0",
              active ? "translate-x-0 text-primary opacity-100" : "-translate-x-2 text-gray-300 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
            )}
          />
        </div>
      </div>
    </div>
  );
};

// --- Custom Result Renderer ---
const RenderResults = () => {
  const { results } = useMatches();

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) =>
        typeof item === "string" ? (
          <div className="px-6 py-2 mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-primary/50 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/30" />
            {item}
          </div>
        ) : (
          <ResultItem action={item} active={active} />
        )
      }
    />
  );
};

// -- Dynamic Actions Sub-component --
const DynamicActionRegistry = () => {
  const router = useRouter();
  const { properties, inquiries, bookings, reviews, tenants } = useLandlordSearchData();

  const dynamicActions = useMemo(() => {
    const list: any[] = [];

    properties.forEach((p: any) => {
      list.push({
        id: `property-${p.id}`,
        name: p.title,
        subtitle: `₱${p.price.toLocaleString()} • ${p.region || 'Unknown Location'}`,
        keywords: `property listing ${p.title}`,
        section: 'Properties',
        perform: () => router.push(`/landlord/properties?id=${p.id}`),
        icon: <IconBuilding size={18} />
      });
    });

    inquiries.forEach((inq: any) => {
      list.push({
        id: `inquiry-${inq.id}`,
        name: inq.user?.name || 'Guest User',
        subtitle: `${inq.listing?.title || 'Property'} • ${inq.status}`,
        keywords: 'inquiry message guest chat',
        section: 'Recent Inquiries',
        perform: () => router.push(`/landlord/inquiries?id=${inq.id}`),
        icon: <IconMessage size={18} />
      });
    });

    bookings.forEach((bk: any) => {
      list.push({
        id: `booking-${bk.id}`,
        name: bk.user?.name || 'Guest User',
        subtitle: `${bk.listing?.title || 'Property'} • ${bk.status}`,
        keywords: 'booking reservation scheduled',
        section: 'Active Bookings',
        perform: () => router.push(`/landlord/bookings?id=${bk.id}`),
        icon: <IconCalendarStats size={18} />
      });
    });

    reviews.forEach((rev: any) => {
      list.push({
        id: `review-${rev.id}`,
        name: `Review by ${rev.user?.name || 'Guest'}`,
        subtitle: `${rev.rating}★ • ${rev.listing?.title || 'Property'}`,
        keywords: 'review rating star feedback',
        section: 'Reviews',
        perform: () => router.push(`/landlord/reviews?id=${rev.id}`),
        icon: <IconStar size={18} />
      });
    });

    tenants.forEach((t: any) => {
      list.push({
        id: `tenant-${t.id}`,
        name: t.user?.name || 'Tenant',
        subtitle: t.user?.email || 'Active Tenant',
        keywords: 'tenant user profile resident',
        section: 'Tenants',
        perform: () => router.push(`/landlord/tenants?id=${t.id}`),
        icon: <IconUser size={18} />
      });
    });

    return list;
  }, [properties, inquiries, bookings, reviews, tenants, router]);

  useRegisterActions(dynamicActions, [dynamicActions]);
  return null;
};

// --- Main Provider Wrapper ---
export default function LandlordKBar({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const staticActions = useMemo(() => [
    {
      id: "dashboard-section",
      name: "Dashboard Section",
      keywords: "home dashboard section overview",
      section: "Quick Links",
      perform: () => router.push("/landlord"),
      icon: <IconLayoutDashboard size={20} />,
    },
    {
      id: "properties-section",
      name: "Properties Section",
      keywords: "properties section listings",
      section: "Quick Links",
      perform: () => router.push("/landlord/properties"),
      icon: <IconBuilding size={20} />,
    },
    {
      id: "add-property-section",
      name: "Add Property Section",
      keywords: "add property section create",
      section: "Quick Links",
      perform: () => router.push("/landlord/properties/create"),
      icon: <IconPlus size={20} />,
    },
    {
      id: "booking-section",
      name: "Booking Section",
      keywords: "booking section manage",
      section: "Quick Links",
      perform: () => router.push("/landlord/bookings"),
      icon: <IconCalendarStats size={20} />,
    },
    {
      id: "reservations-section",
      name: "Reservations Section",
      keywords: "reservations section pending",
      section: "Quick Links",
      perform: () => router.push("/landlord/reservations"),
      icon: <IconCalendarCheck size={20} />,
    },
    {
      id: "inquiries-section",
      name: "Inquiries Section",
      keywords: "inquiries section messages",
      section: "Quick Links",
      perform: () => router.push("/landlord/inquiries"),
      icon: <IconMessage size={20} />,
    },
    {
      id: "reviews-section",
      name: "Reviews Section",
      keywords: "reviews section feedback",
      section: "Quick Links",
      perform: () => router.push("/landlord/reviews"),
      icon: <IconStar size={20} />,
    },
    {
      id: "analytics-section",
      name: "Analytics Section",
      keywords: "analytics section stats",
      section: "Quick Links",
      perform: () => router.push("/landlord/analytics"),
      icon: <IconChartBar size={20} />,
    },
    {
      id: "settings",
      name: "Account Settings",
      keywords: "settings account profile",
      section: "System",
      perform: () => router.push("/landlord/settings"),
      icon: <IconSettings size={20} />,
    },
  ], [router]);

  if (!mounted) return <>{children}</>;

  return (
    <KBarProvider actions={staticActions}>
      <DynamicActionRegistry />
      <KBarContent>{children}</KBarContent>
    </KBarProvider>
  );
}

const KBarContent = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <KBarPortal>
        <KBarPositioner className="fixed inset-0 z-[100000] p-4 bg-gray-950/40 backdrop-blur-md">
          <KBarAnimator className="w-full max-w-2xl bg-white/90 dark:bg-gray-950/90 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 dark:border-white/5 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="relative border-b border-gray-100 dark:border-gray-800/50">
              <div className="flex items-center px-8 py-6">
                <div className="mr-4 flex items-center justify-center w-10 h-10 rounded-2xl bg-primary/10 text-primary shadow-sm shadow-primary/20">
                  <IconSearch size={20} strokeWidth={2.5} />
                </div>
                <KBarSearch 
                  className="w-full bg-transparent border-none text-lg font-bold outline-none focus:ring-0 placeholder:text-gray-400 dark:placeholder:text-gray-600" 
                  placeholder="What can I help you find?" 
                />
                <div className="flex items-center gap-2 ml-4">
                  <Badge variant="outline" className="h-7 px-2 font-black border-primary/20 bg-primary/5 text-primary tracking-tighter">
                    ESC
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto [&::-webkit-scrollbar]:hidden">
              <RenderResults />
            </div>

            <div className="px-8 py-4 bg-gray-50/50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-gray-800/50 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <kbd className="p-1 px-1.5 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 shadow-sm">⏎</kbd>
                  <span>Select</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <kbd className="p-1 px-1.5 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 shadow-sm">↑↓</kbd>
                  <span>Navigate</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">
                <IconBolt size={14} className="animate-pulse" />
                Quick Search
              </div>
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </>
  );
};

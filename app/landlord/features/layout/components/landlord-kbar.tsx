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
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Badge } from '@/app/admin/components/ui/badge';

import Skeleton from '@/components/common/Skeleton';

// --- Improved Content Fetching (react-query over API routes) ---
const useLandlordSearchData = () => {
  const propertiesQuery = useQuery({
    queryKey: ['landlord-search-properties'],
    queryFn: async () => {
      const res = await fetch('/api/landlord/properties');
      if (!res.ok) return [];
      const json = await res.json();
      return json.data?.listings || json.data || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const inquiriesQuery = useQuery({
    queryKey: ['landlord-search-inquiries'],
    queryFn: async () => {
      const res = await fetch('/api/landlord/inquiries');
      if (!res.ok) return { inquiries: [] };
      const json = await res.json();
      return json.data || { inquiries: [] };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const bookingsQuery = useQuery({
    queryKey: ['landlord-search-bookings'],
    queryFn: async () => {
      const res = await fetch('/api/landlord/bookings');
      if (!res.ok) return { bookings: [] };
      const json = await res.json();
      return json.data || { bookings: [] };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const reviewsQuery = useQuery({
    queryKey: ['landlord-search-reviews'],
    queryFn: async () => {
      const res = await fetch('/api/landlord/reviews');
      if (!res.ok) return { reviews: [] };
      const json = await res.json();
      return json.data || { reviews: [] };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const tenantsQuery = useQuery({
    queryKey: ['landlord-search-tenants'],
    queryFn: async () => {
      const res = await fetch('/api/landlord/tenants');
      if (!res.ok) return { tenants: [] };
      const json = await res.json();
      return json.data || { tenants: [] };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const isLoading = propertiesQuery.isLoading || inquiriesQuery.isLoading || bookingsQuery.isLoading || reviewsQuery.isLoading || tenantsQuery.isLoading;

  return {
    properties: propertiesQuery.data || [],
    inquiries: inquiriesQuery.data?.inquiries || [],
    bookings: bookingsQuery.data?.bookings || [],
    reviews: reviewsQuery.data?.reviews || [],
    tenants: tenantsQuery.data?.tenants || [],
    isLoading,
  };
};

// --- Custom Result Item ---
const ResultItem = React.forwardRef<
  HTMLDivElement,
  { action: any; active: boolean }
>(({ action, active }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "group relative mx-3 my-1 px-4 py-3 rounded-2xl cursor-pointer border transition-all duration-150 ease-out flex items-center justify-between overflow-hidden",
        active 
          ? "bg-[#2f7d6d]/10 dark:bg-emerald-500/15 border-[#2f7d6d]/25 dark:border-emerald-500/30 text-slate-900 dark:text-white shadow-xs z-10" 
          : "border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/50"
      )}
    >
      {/* Smooth Indicator Pill (fades & scales without layout thrashing) */}
      <div 
        className={cn(
          "absolute left-0.5 top-2.5 bottom-2.5 w-1 bg-[#2f7d6d] dark:bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(47,125,109,0.5)] transition-all duration-150 ease-out pointer-events-none",
          active ? "opacity-100 scale-y-100" : "opacity-0 scale-y-50"
        )}
      />
      
      <div className="flex items-center gap-4 relative z-10 w-full ml-1">
        {/* Action Icon Box */}
        <div className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 ease-out flex-shrink-0",
          active 
            ? "bg-[#2f7d6d] text-white shadow-md shadow-[#2f7d6d]/25 dark:bg-emerald-500 dark:text-slate-950 scale-[1.03]" 
            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 scale-100 group-hover:bg-[#2f7d6d]/10 group-hover:text-[#2f7d6d]"
        )}>
          {action.icon}
        </div>
        
        <div className="flex flex-col min-w-0 flex-1 justify-center">
          <div className="flex items-center gap-2 truncate leading-none mb-1">
            <span className={cn(
              "text-sm font-bold tracking-tight truncate transition-colors duration-150",
              active 
                ? "text-[#2f7d6d] dark:text-emerald-300 font-extrabold" 
                : "text-slate-900 dark:text-slate-100"
            )}>
              {action.name}
            </span>
            {action.section && !active && (
              <Badge variant="outline" className="text-[9px] px-2 py-0.5 uppercase tracking-widest shrink-0 font-bold border-[#2f7d6d]/30 bg-[#2f7d6d]/10 text-[#2f7d6d] dark:text-emerald-400">
                {action.section}
              </Badge>
            )}
          </div>
          {action.subtitle && (
            <div className={cn(
              "text-xs font-semibold truncate flex items-center gap-1.5 leading-tight mt-0.5 transition-colors duration-150",
              active ? "text-[#2f7d6d]/80 dark:text-emerald-400/80" : "text-slate-500 dark:text-slate-400"
            )}>
              {typeof action.subtitle === 'string' && action.subtitle.split(' • ').map((part: string, i: number, arr: any[]) => (
                <React.Fragment key={i}>
                  {part.includes('★') ? (
                    <div className="flex items-center gap-0.5">
                      <IconStar size={11} className={cn("fill-current", active ? "text-[#2f7d6d] dark:text-emerald-400" : "text-amber-500")} />
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
            size={16} 
            className={cn(
              "transition-all duration-150 ease-out shrink-0",
              active 
                ? "translate-x-0 text-[#2f7d6d] dark:text-emerald-400 opacity-100" 
                : "-translate-x-1.5 text-slate-400 dark:text-slate-500 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
            )}
          />
        </div>
      </div>
    </div>
  );
});
ResultItem.displayName = 'ResultItem';

// --- Custom Result Renderer ---
const RenderResults = () => {
  const { results } = useMatches();
  const { isLoading } = useLandlordSearchData();

  return (
    <>
      {isLoading && results.length === 0 && (
        <div className="p-4 space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <Skeleton className="w-9 h-9 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-2 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}
      <KBarResults
        items={results}
        maxHeight={440}
        onRender={({ item, active }) =>
          typeof item === "string" ? (
            <div className="px-6 py-2.5 mt-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-[#2f7d6d] dark:text-emerald-400 flex items-center gap-2 select-none">
              <span className="w-2 h-2 rounded-full bg-[#2f7d6d] dark:bg-emerald-400" />
              {item}
            </div>
          ) : (
            <ResultItem action={item} active={active} />
          )
        }
      />
    </>
  );
};

// -- Dynamic Actions Sub-component --
const DynamicActionRegistry = () => {
  const router = useRouter();
  const { properties, inquiries, bookings, reviews, tenants } = useLandlordSearchData();

  const dynamicActions = useMemo(() => {
    const list: any[] = [];

    (Array.isArray(properties) ? properties : []).forEach((p: any) => {
      list.push({
        id: `property-${p.id}`,
        name: p.title,
        subtitle: `₱${(p.price || 0).toLocaleString()} • ${p.region || 'Unknown Location'}`,
        keywords: `property listing ${p.title}`,
        section: 'Properties',
        perform: () => router.push(`/landlord/properties?id=${p.id}`),
        icon: <IconBuilding size={18} />
      });
    });

    (Array.isArray(inquiries) ? inquiries : []).forEach((inq: any) => {
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

    (Array.isArray(bookings) ? bookings : []).forEach((bk: any) => {
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

    (Array.isArray(reviews) ? reviews : []).forEach((rev: any) => {
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

    (Array.isArray(tenants) ? tenants : []).forEach((t: any) => {
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
      keywords: "home dashboard section overview stats kerby landlord analytics",
      section: "Quick Links",
      perform: () => router.push("/landlord"),
      icon: <IconLayoutDashboard size={20} />,
    },
    {
      id: "properties-section",
      name: "Properties Section",
      keywords: "properties listings units rooms boarding houses manage properties",
      section: "Quick Links",
      perform: () => router.push("/landlord/properties"),
      icon: <IconBuilding size={20} />,
    },
    {
      id: "add-property-section",
      name: "Add Property Section",
      keywords: "add property new listing upload unit create accommodation boarding house",
      section: "Quick Links",
      perform: () => router.push("/landlord/properties/create"),
      icon: <IconPlus size={20} />,
    },
    {
      id: "booking-section",
      name: "Booking Section",
      keywords: "booking manage scheduled check-in check-out tenants clients reservations",
      section: "Quick Links",
      perform: () => router.push("/landlord/bookings"),
      icon: <IconCalendarStats size={20} />,
    },
    {
      id: "reservations-section",
      name: "Reservations Section",
      keywords: "reservations pending requests approve reject clients visits",
      section: "Quick Links",
      perform: () => router.push("/landlord/reservations"),
      icon: <IconCalendarCheck size={20} />,
    },
    {
      id: "inquiries-section",
      name: "Inquiries Section",
      keywords: "inquiries messages chat questions prospective students tenants inbox",
      section: "Quick Links",
      perform: () => router.push("/landlord/inquiries"),
      icon: <IconMessage size={20} />,
    },
    {
      id: "reviews-section",
      name: "Reviews Section",
      keywords: "reviews ratings stars feedback testimonials student feedback",
      section: "Quick Links",
      perform: () => router.push("/landlord/reviews"),
      icon: <IconStar size={20} />,
    },
    {
      id: "analytics-section",
      name: "Analytics Section",
      keywords: "analytics stats revenue earnings occupancy performance reports",
      section: "Quick Links",
      perform: () => router.push("/landlord/analytics"),
      icon: <IconChartBar size={20} />,
    },
    {
      id: "settings",
      name: "Account Settings",
      keywords: "settings profile account security password preferences config",
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
          <KBarAnimator className="w-full max-w-2xl bg-white/95 dark:bg-gray-950/95 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 dark:border-white/5 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="relative border-b border-gray-100 dark:border-gray-800/50">
              <div className="flex items-center px-8 py-6">
                <div className="mr-4 flex items-center justify-center w-10 h-10 rounded-2xl bg-[#2f7d6d]/10 text-[#2f7d6d] shadow-sm shadow-[#2f7d6d]/20">
                  <IconSearch size={20} strokeWidth={2.5} />
                </div>
                <KBarSearch 
                  className="w-full bg-transparent border-none text-lg font-bold outline-none focus:ring-0 placeholder:text-gray-400 dark:placeholder:text-gray-600" 
                  placeholder="What can I help you find?" 
                />
                <div className="flex items-center gap-2 ml-4">
                  <Badge variant="outline" className="h-7 px-2 font-black border-[#2f7d6d]/20 bg-[#2f7d6d]/5 text-[#2f7d6d] tracking-tighter">
                    ESC
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="relative">
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
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#2f7d6d]/70 dark:text-emerald-400/80">
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

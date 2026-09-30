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
  IconDeviceFloppy,
  IconBed
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/app/admin/components/ui/tooltip';
import Skeleton from '@/components/common/Skeleton';
import { KerbyMascot } from '@/components/modals/search-modal/KerbyMascot';
import { useKerby } from '@/lib/context/KerbyContext';

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
    href: '/landlord/rooms',
    label: 'Rooms',
    icon: IconBed,
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

const LANDLORD_TIPS: Record<string, Array<{ speech: string; asset: string; pose: string; badge: string }>> = {
  properties: [
    {
      speech: "Host Tip: Detailed property descriptions with nearby TAU landmarks attract up to 40% more student views!",
      asset: "/assets/mascot/kerby-landlord-blueprint.png",
      pose: "pointing",
      badge: "Property Listing Tip",
    },
    {
      speech: "Host Tip: High-quality photos of your facade & common areas build instant trust with student boarders.",
      asset: "/assets/mascot/kerby-editor-basics.png",
      pose: "pointing",
      badge: "Photo Quality Tip",
    },
    {
      speech: "Host Tip: Keep your property address and walking distance to campus gates accurate on the map!",
      asset: "/assets/mascot/kerby-desktop-location.png",
      pose: "studying",
      badge: "Location Accuracy",
    },
    {
      speech: "Host Tip: Specify water, electricity, and WiFi inclusion rules clearly to prevent tenant misunderstandings.",
      asset: "/assets/mascot/kerby-editor-rules.png",
      pose: "pointing",
      badge: "Utility Inclusion Tip",
    },
  ],
  rooms: [
    {
      speech: "Host Tip: Group beds into clear Solo Room or Bedspace listings so students can filter easily!",
      asset: "/assets/mascot/kerby-editor-rooms.png",
      pose: "excited",
      badge: "Room Layout Tip",
    },
    {
      speech: "Host Tip: Keep available slot counts updated in real time so boarders don't apply to full rooms.",
      asset: "/assets/mascot/kerby-halfbody-keys.png",
      pose: "pointing",
      badge: "Slot Management",
    },
    {
      speech: "Host Tip: Highlighting aircon, study desks, and private CR amenities increases solo room bookings!",
      asset: "/assets/mascot/kerby-desktop-compliance.png",
      pose: "excited",
      badge: "In-Unit Amenities",
    },
    {
      speech: "Host Tip: Mention gender policies (e.g. Female Only) early to help students find suitable accommodation.",
      asset: "/assets/mascot/kerby-mobile-role.png",
      pose: "studying",
      badge: "House Rules Tip",
    },
  ],
  inquiries: [
    {
      speech: "Host Tip: Replying within 15 minutes doubles your reservation conversion rate!",
      asset: "/assets/mascot/kerby-phone-contact.png",
      pose: "pointing",
      badge: "Fast Response Tip",
    },
    {
      speech: "Host Tip: Friendly, polite answers to student questions create a welcoming first impression.",
      asset: "/assets/mascot/kerby-casual-loving.png",
      pose: "loving",
      badge: "Hospitality Tip",
    },
    {
      speech: "Host Tip: Direct inquiring students to submit an online reservation once they select a room.",
      asset: "/assets/mascot/kerby-mobile-contact.png",
      pose: "pointing",
      badge: "Booking Flow Tip",
    },
  ],
  reservations: [
    {
      speech: "Host Tip: Review and confirm student reservation holds promptly to lock in upcoming term bookings!",
      asset: "/assets/mascot/kerby-halfbody-keys.png",
      pose: "waving",
      badge: "Reservation Hold",
    },
    {
      speech: "Host Tip: Verify payment receipts quickly so student boarders receive their official booking receipt.",
      asset: "/assets/mascot/kerby-landlord-checklist.png",
      pose: "studying",
      badge: "Payment Verification",
    },
    {
      speech: "Host Tip: Send clear move-in instructions once a student's reservation deposit is approved.",
      asset: "/assets/mascot/kerby-desktop-welcome.png",
      pose: "excited",
      badge: "Move-In Readiness",
    },
  ],
  bookings: [
    {
      speech: "Host Tip: Track active tenancy contract start & end dates to prepare for semester turnovers.",
      asset: "/assets/mascot/kerby-halfbody-revenue.png",
      pose: "excited",
      badge: "Contract Tracking",
    },
    {
      speech: "Host Tip: Send friendly reminders 3 days before monthly rental payments are due.",
      asset: "/assets/mascot/kerby-landlord-verified.png",
      pose: "pointing",
      badge: "Rental Collection",
    },
    {
      speech: "Host Tip: Keep record of tenant emergency contact details for a safe, worry-free boarding house.",
      asset: "/assets/mascot/kerby-401-security.png",
      pose: "studying",
      badge: "Tenant Safety",
    },
  ],
  reviews: [
    {
      speech: "Host Tip: Outstanding tenant reviews build top reputation across the TAU student community!",
      asset: "/assets/mascot/kerby-halfbody-rating.png",
      pose: "loving",
      badge: "Reputation Builder",
    },
    {
      speech: "Host Tip: Thank student boarders for positive feedback and respond constructively to suggestions.",
      asset: "/assets/mascot/kerby-desktop-review.png",
      pose: "waving",
      badge: "Review Engagement",
    },
    {
      speech: "Host Tip: Maintaining a 4.5+ star rating boosts your property to the top of TAU search results!",
      asset: "/assets/mascot/kerby-halfbody-celebrate-popper.png",
      pose: "excited",
      badge: "Top Rated Host",
    },
  ],
  analytics: [
    {
      speech: "Host Tip: Monitor listing page views and peak inquiry times to adjust your seasonal pricing!",
      asset: "/assets/mascot/kerby-admin-audit-specs.png",
      pose: "studying",
      badge: "Analytics Insights",
    },
    {
      speech: "Host Tip: Properties with complete amenity tags receive 3x higher conversion rates!",
      asset: "/assets/mascot/kerby-halfbody-pointing.png",
      pose: "pointing",
      badge: "Conversion Strategy",
    },
    {
      speech: "Host Tip: Track your monthly revenue growth to plan property improvements & room upgrades.",
      asset: "/assets/mascot/kerby-halfbody-revenue.png",
      pose: "excited",
      badge: "Financial Growth",
    },
  ],
  default: [
    {
      speech: "Mabuhay Host! Kerby is here to help you manage your TAU listings smoothly.",
      asset: "/assets/mascot/kerby-casual-waving.png",
      pose: "waving",
      badge: "Host Assistant",
    },
    {
      speech: "Host Tip: Keep your contact number and chat availability active during enrolment season!",
      asset: "/assets/mascot/kerby-phone-contact.png",
      pose: "pointing",
      badge: "Peak Season Tip",
    },
    {
      speech: "Host Tip: Clear house rules and transparent pricing make student onboarding seamless.",
      asset: "/assets/mascot/kerby-editor-rules.png",
      pose: "studying",
      badge: "Host Best Practice",
    },
  ]
};

const getCategoryKey = (path: string): string => {
  if (path.startsWith('/landlord/properties')) return 'properties';
  if (path.startsWith('/landlord/rooms')) return 'rooms';
  if (path.startsWith('/landlord/inquiries')) return 'inquiries';
  if (path.startsWith('/landlord/reservations')) return 'reservations';
  if (path.startsWith('/landlord/bookings')) return 'bookings';
  if (path.startsWith('/landlord/reviews')) return 'reviews';
  if (path.startsWith('/landlord/analytics')) return 'analytics';
  return 'default';
};

export default function LandlordSidebar() {
  const pathname = (typeof usePathname === 'function' ? usePathname() : "") || "";
  const isDashboardPage = pathname === '/landlord';
  const { state } = useSidebar();
  const { theme } = useTheme();
  const { kerbyState } = useKerby();
  const [mounted, setMounted] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  const categoryKey = getCategoryKey(pathname);
  const currentPool = LANDLORD_TIPS[categoryKey] || LANDLORD_TIPS.default;

  useEffect(() => {
    setTipIndex(0);
  }, [categoryKey]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % currentPool.length);
    }, 22000); // Rotates every 22 seconds for comfortable reading

    return () => clearInterval(interval);
  }, [currentPool]);

  const activeTip = currentPool[tipIndex % currentPool.length];

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 1000); // 1s delay for skeleton visibility
    return () => clearTimeout(timer);
  }, []);

  const isDark = theme === "dark";

  return (
    <Sidebar
      variant='sidebar'
      collapsible='icon'
      className={cn(
        'border-r border-gray-200/50 dark:border-gray-800/50 bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl',
        mounted && 'transition-[width,padding] duration-500 ease-in-out'
      )}
    >
      <SidebarHeader className={cn(
        'pt-8 px-8 pb-4 mb-4 overflow-hidden',
        mounted && 'transition-[padding] duration-500 ease-in-out',
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
            <Link href="/landlord" className="p-2 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary border border-primary/10 shadow-lg shadow-primary/5 transition-all duration-500 cursor-pointer relative overflow-hidden">
              <IconHome
                size={22}
                stroke={2.5}
                data-slot="sidebar-menu-button-icon"
                className="relative z-10"
              />
            </Link>
          </motion.div>
        ) : (
          <motion.div
             layout
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.5, ease: "easeInOut" }}
             className="flex flex-col items-center justify-center gap-4"
          >
            <Link href="/landlord" className="flex flex-col items-center gap-3">
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
        mounted && 'transition-[padding] duration-500 ease-in-out',
        state === 'collapsed' && 'px-0'
      )}>
        <SidebarGroup>
          <SidebarMenu className='gap-2.5'>
            {!mounted ? (
              [...Array(8)].map((_, i) => (
                <SidebarMenuItem key={i}>
                  <div className="px-2 w-full">
                    <Skeleton className="h-12 w-full rounded-2xl" />
                  </div>
                </SidebarMenuItem>
              ))
            ) : (
              navItems.map((item, index) => {
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

                        <AnimatePresence mode="wait">
                          {state !== 'collapsed' && (
                            <motion.span
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              transition={{ duration: 0.3 }}
                              className={cn(
                                "font-black text-[11px] uppercase tracking-[0.08em] transition-all duration-300 whitespace-nowrap overflow-hidden",
                                isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                              )}
                            >
                              {item.label}
                            </motion.span>
                          )}
                        </AnimatePresence>

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
              })
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className={cn(
        'p-4 mt-auto border-t border-gray-100/50 dark:border-gray-800/50 bg-transparent overflow-visible z-50',
        mounted && 'transition-[padding] duration-500 ease-in-out',
        state === 'collapsed' && 'p-2',
        isDashboardPage && 'hidden'
      )}>
        {!mounted ? (
          <div className="flex flex-col gap-5">
            <Skeleton className="h-[68px] w-full rounded-2xl" />
          </div>
        ) : state === 'collapsed' ? (
          <div className="flex flex-col items-center justify-center w-full">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-sm hover:scale-110 transition-all duration-500 cursor-pointer relative group/brand overflow-visible">
                    <Image
                      src="/assets/mascot/kerby-casual-waving.png"
                      alt="Kerby Mascot"
                      width={26}
                      height={26}
                      className="object-contain drop-shadow-md group-hover:scale-110 transition-transform"
                      unoptimized
                    />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-950 animate-pulse" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">Kerby Host Assistant</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ) : isDashboardPage ? null : (
          <div className="relative flex flex-col items-center justify-end w-full overflow-visible">
            {/* Mascot in Sidebar with Dynamic 10s Rotating Tips & Assets */}
            <div className="w-full flex flex-col items-center overflow-visible">
              <KerbyMascot 
                pose={(kerbyState?.pose as any) || (activeTip.pose as any)}
                outfitMode="casual"
                customAssetSrc={activeTip.asset}
                speechText={kerbyState?.speech || activeTip.speech}
                badgeLabel={kerbyState?.badge || activeTip.badge}
                transparentBg={true}
                bubblePosition="top"
              />
            </div>
          </div>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

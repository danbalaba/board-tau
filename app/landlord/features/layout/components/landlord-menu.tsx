'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  Building2,
  BedDouble,
  Mail,
  CalendarCheck,
  CalendarDays,
  Star,
  BarChart3,
  LogOut,
  Ellipsis,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/app/admin/components/ui/button';
import { ScrollArea } from '@/app/admin/components/ui/scroll-area';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/app/admin/components/ui/tooltip';
import ConfirmModal from '@/components/common/ConfirmModal';
import Modal from '@/components/modals/Modal';
import { useLoadingStore } from '@/hooks/use-loading-store';
import { KerbyMascot } from '@/components/modals/search-modal/KerbyMascot';
import { useKerby } from '@/lib/context/KerbyContext';

interface LandlordMenuProps {
  isOpen: boolean | undefined;
  onItemClick?: () => void;
}

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface NavGroup {
  groupLabel: string;
  menus: NavItem[];
}

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
  ],
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

const navGroups: NavGroup[] = [
  {
    groupLabel: 'Overview',
    menus: [
      {
        title: 'Dashboard',
        url: '/landlord',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    groupLabel: 'Accommodation',
    menus: [
      {
        title: 'Properties',
        url: '/landlord/properties',
        icon: Building2,
      },
      {
        title: 'Rooms',
        url: '/landlord/rooms',
        icon: BedDouble,
      },
    ],
  },
  {
    groupLabel: 'Tenancy & Guests',
    menus: [
      {
        title: 'Inquiries',
        url: '/landlord/inquiries',
        icon: Mail,
      },
      {
        title: 'Reservations',
        url: '/landlord/reservations',
        icon: CalendarCheck,
      },
      {
        title: 'Bookings',
        url: '/landlord/bookings',
        icon: CalendarDays,
      },
      {
        title: 'Reviews',
        url: '/landlord/reviews',
        icon: Star,
      },
    ],
  },
  {
    groupLabel: 'Performance',
    menus: [
      {
        title: 'Analytics',
        url: '/landlord/analytics',
        icon: BarChart3,
      },
    ],
  },
];

export function LandlordMenu({ isOpen, onItemClick }: LandlordMenuProps) {
  const pathname = usePathname() || '';
  const { data: session } = useSession();
  const { kerbyState } = useKerby();
  const { isLoggingOut, setIsLoggingOut } = useLoadingStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  const isDashboardPage = pathname === '/landlord';
  const categoryKey = getCategoryKey(pathname);
  const currentPool = LANDLORD_TIPS[categoryKey] || LANDLORD_TIPS.default;

  useEffect(() => {
    setTipIndex(0);
  }, [categoryKey]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % currentPool.length);
    }, 22000); // 22s rotation for comfortable reading

    return () => clearInterval(interval);
  }, [currentPool]);

  const activeTip = currentPool[tipIndex % currentPool.length];
  const userName = session?.user?.name || 'Host';

  const handleLogout = () => {
    setIsLoggingOut(true);
    setShowLogoutConfirm(false);

    setTimeout(() => {
      signOut({ callbackUrl: '/' });
    }, 2500);
  };

  return (
    <ScrollArea className="[&>div>div[style]]:!block flex-1">
      <nav className="mt-8 h-full w-full">
        <ul className="flex flex-col min-h-[calc(100vh-48px-36px-16px-32px)] lg:min-h-[calc(100vh-32px-40px-32px)] items-start space-y-1.5 px-2">
          {navGroups.map(({ groupLabel, menus }, index) => (
            <li className={cn("w-full", groupLabel ? "pt-5" : "")} key={index}>
              {(isOpen && groupLabel) || isOpen === undefined ? (
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3.5 pb-2.5 max-w-[248px] truncate">
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
                const Icon = item.icon;
                const isActive =
                  item.url === '/landlord'
                    ? pathname === '/landlord'
                    : pathname === item.url || pathname.startsWith(item.url + '/');

                return (
                  <div className="w-full" key={itemIndex}>
                    <TooltipProvider disableHoverableContent>
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
                            <Link href={item.url} onClick={onItemClick}>
                              <span
                                className={cn(
                                  isOpen === false ? "" : "mr-3.5",
                                  isActive
                                    ? "text-white"
                                    : "text-slate-500 dark:text-slate-400 group-hover:text-primary"
                                )}
                              >
                                <Icon size={20} />
                              </span>
                              <p
                                className={cn(
                                  "max-w-[200px] truncate text-sm font-semibold",
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
              })}
            </li>
          ))}

          {/* Bottom Footer Section: Kerby Mascot Tips + Sign Out Button */}
          <li className="w-full grow flex flex-col justify-end pt-6 pb-2">
            {/* Kerby Host Assistant Card / Collapsed Icon (Hidden on Dashboard page) */}
            {!isDashboardPage && (
              <div className="w-full mb-3">
                {isOpen ? (
                  <KerbyMascot
                    variant="sidebar"
                    pose={(kerbyState?.pose as any) || (activeTip.pose as any)}
                    outfitMode="casual"
                    customAssetSrc={activeTip.asset}
                    speechText={kerbyState?.speech || activeTip.speech}
                    badgeLabel={kerbyState?.badge || activeTip.badge}
                    onNextTip={() => setTipIndex((prev) => (prev + 1) % currentPool.length)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center w-full my-2">
                    <TooltipProvider>
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                          <div className="w-11 h-11 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-xs hover:scale-110 transition-all duration-300 cursor-pointer relative group/brand overflow-visible">
                            <Image
                              src="/assets/mascot/kerby-casual-waving.png"
                              alt="Kerby Mascot"
                              width={26}
                              height={26}
                              className="object-contain drop-shadow-xs group-hover:scale-110 transition-transform"
                              unoptimized
                            />
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 animate-pulse" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                          <p className="text-[10px] font-black uppercase tracking-wider text-primary">Kerby Host Assistant</p>
                          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-[200px] mt-1 line-clamp-3">
                            {kerbyState?.speech || activeTip.speech}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </div>
            )}

            {/* Sign Out Button */}
            <TooltipProvider disableHoverableContent>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => {
                      onItemClick?.();
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
                        isOpen === false ? "" : "mr-3",
                        "text-slate-500 dark:text-slate-400 group-hover:text-red-500"
                      )}
                    >
                      <LogOut size={20} />
                    </span>
                    <p
                      className={cn(
                        "whitespace-nowrap font-semibold text-sm",
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
          message={`Ready to leave the host portal, ${userName}? We'll make sure your property listings and bookings are synced and secure.`}
          confirmLabel="Logout"
          cancelLabel="Stay"
          isLoading={isLoggingOut}
          variant="danger"
        />
      </Modal>
    </ScrollArea>
  );
}

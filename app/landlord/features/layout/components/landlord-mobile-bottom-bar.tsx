"use client";

import React, { useState, useEffect } from "react";
import { LayoutDashboard, Building2, ClipboardList, MessageSquare, Menu } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useMenuPanel } from "@/hooks/use-menu-panel";
import { useNotifications } from "@/app/landlord/features/notifications/hooks/use-notifications";
import { useMessagingHub } from "@/app/landlord/features/messaging-hub/hooks/use-messaging-hub";

export default function LandlordMobileBottomBar() {
  const router = useRouter();
  const pathname = (typeof usePathname === "function" ? usePathname() : "") || "";
  const { onOpen: openMenuPanel } = useMenuPanel();
  const { unreadCount: unreadNotifCount } = useNotifications();
  const { conversations } = useMessagingHub();

  const totalUnreadMessages = conversations
    ? conversations.filter((c) => !c.isArchived).reduce((acc, c) => acc + (c.unreadCount || 0), 0)
    : 0;

  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | "">("");
  const lastYRef = React.useRef(0);
  const [isErrorPage, setIsErrorPage] = useState(false);

  useEffect(() => {
    const checkErrorPage = () => {
      const hasErrorEl = !!document.querySelector('[data-error-page="true"]');
      setIsErrorPage(hasErrorEl);
    };
    checkErrorPage();
    const timer = setTimeout(checkErrorPage, 60);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Robust capture-phase scroll listener supporting Landlord #scroll-container viewport
  useEffect(() => {
    const handleScroll = (e?: Event) => {
      const scrollContainer = document.getElementById("scroll-container");
      const target = e?.target as Element | null;
      
      let currentY = 0;
      if (target && target.nodeType === 1 && typeof target.scrollTop === 'number') {
        currentY = target.scrollTop;
      } else if (scrollContainer) {
        currentY = scrollContainer.scrollTop;
      } else {
        currentY = Math.max(
          window.scrollY || 0,
          document.documentElement.scrollTop || 0,
          document.body.scrollTop || 0
        );
      }

      if (currentY <= 15) {
        setScrollDirection("");
      } else if (currentY > lastYRef.current + 8) {
        setScrollDirection("down");
      } else if (currentY < lastYRef.current - 8) {
        setScrollDirection("up");
      }

      lastYRef.current = currentY;
    };

    // Use capture phase (true) so element scroll events on #scroll-container are intercepted
    window.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    document.addEventListener("scroll", handleScroll, { capture: true, passive: true });

    const scrollContainer = document.getElementById("scroll-container");
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener("scroll", handleScroll, { capture: true } as any);
      document.removeEventListener("scroll", handleScroll, { capture: true } as any);
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  if (isErrorPage || pathname.includes("/properties/create") || pathname.includes("/edit")) return null;

  const isHidden = scrollDirection === "down";

  const redirect = (url: string) => {
    router.push(url);
  };

  const isDashboardActive = pathname === "/landlord";
  const isPropertiesActive = pathname.startsWith("/landlord/properties") || pathname.startsWith("/landlord/rooms");
  const isInquiriesActive = pathname.startsWith("/landlord/inquiries") || pathname.startsWith("/landlord/reservations") || pathname.startsWith("/landlord/bookings");
  const isMessagesActive = pathname.startsWith("/landlord/messages");

  return (
    <div
      className={`fixed bottom-4 left-0 right-0 z-40 md:hidden transition-all duration-300 ease-in-out px-4 pointer-events-none ${
        isHidden ? "translate-y-28 opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <div className="max-w-md mx-auto pointer-events-auto bg-white/60 dark:bg-slate-900/65 backdrop-blur-3xl border border-white/50 dark:border-white/20 ring-1 ring-white/30 dark:ring-white/10 shadow-[0_16px_45px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_55px_rgba(0,0,0,0.65)] rounded-[32px] px-3.5 py-2.5 flex items-center justify-around font-sans">
        <div className="flex items-center justify-around w-full gap-1.5">
          {/* Dashboard */}
          <button
            type="button"
            onClick={() => redirect("/landlord")}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-full transition-all duration-300 ${
              isDashboardActive
                ? "bg-[#2f7d6d] text-white shadow-lg shadow-[#2f7d6d]/40 border border-emerald-400/30 font-extrabold scale-105 backdrop-blur-xl"
                : "text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/20 dark:hover:bg-white/10"
            }`}
          >
            <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
            {isDashboardActive && (
              <span className="text-xs sm:text-sm font-extrabold whitespace-nowrap">Dashboard</span>
            )}
          </button>

          {/* Properties */}
          <button
            type="button"
            onClick={() => redirect("/landlord/properties")}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-full transition-all duration-300 ${
              isPropertiesActive
                ? "bg-[#2f7d6d] text-white shadow-lg shadow-[#2f7d6d]/40 border border-emerald-400/30 font-extrabold scale-105 backdrop-blur-xl"
                : "text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/20 dark:hover:bg-white/10"
            }`}
          >
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
            {isPropertiesActive && (
              <span className="text-xs sm:text-sm font-extrabold whitespace-nowrap">Properties</span>
            )}
          </button>

          {/* Inquiries */}
          <button
            type="button"
            onClick={() => redirect("/landlord/inquiries")}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-full transition-all duration-300 ${
              isInquiriesActive
                ? "bg-[#2f7d6d] text-white shadow-lg shadow-[#2f7d6d]/40 border border-emerald-400/30 font-extrabold scale-105 backdrop-blur-xl"
                : "text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/20 dark:hover:bg-white/10"
            }`}
          >
            <div className="relative">
              <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 px-1 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
                  {unreadNotifCount > 9 ? "9+" : unreadNotifCount}
                </span>
              )}
            </div>
            {isInquiriesActive && (
              <span className="text-xs sm:text-sm font-extrabold whitespace-nowrap">Inquiries</span>
            )}
          </button>

          {/* Messages */}
          <button
            type="button"
            onClick={() => redirect("/landlord/messages")}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-full transition-all duration-300 ${
              isMessagesActive
                ? "bg-[#2f7d6d] text-white shadow-lg shadow-[#2f7d6d]/40 border border-emerald-400/30 font-extrabold scale-105 backdrop-blur-xl"
                : "text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/20 dark:hover:bg-white/10"
            }`}
          >
            <div className="relative">
              <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
              {totalUnreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 px-1 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
                  {totalUnreadMessages > 9 ? "9+" : totalUnreadMessages}
                </span>
              )}
            </div>
            {isMessagesActive && (
              <span className="text-xs sm:text-sm font-extrabold whitespace-nowrap">Messages</span>
            )}
          </button>

          {/* Menu Drawer */}
          <button
            type="button"
            onClick={openMenuPanel}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-full transition-all duration-300 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/20 dark:hover:bg-white/10"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 text-[#2f7d6d] dark:text-emerald-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

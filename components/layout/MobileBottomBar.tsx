"use client";

import React, { useState, useEffect } from "react";
import { Heart, CalendarCheck, Home, LogIn, UserPlus, Bell, ClipboardList } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { User } from "next-auth";
import Modal from "@/components/modals/Modal";
import AuthModal from "@/components/modals/AuthModal";
import { useNotification } from "@/context/NotificationContext";
import { useScrollDirection } from "@/hooks/use-scroll-direction";

interface MobileBottomBarProps {
  user?: (User & { id: string; role?: string });
}

const MobileBottomBar: React.FC<MobileBottomBarProps> = ({ user }) => {
  const router = useRouter();
  const scrollDirection = useScrollDirection();
  const pathname = (typeof usePathname === 'function' ? usePathname() : "") || "";
  const isMessages = pathname.startsWith('/messages');
  const isBecomeAHost = pathname.startsWith('/become-a-host');

  const { unreadStats } = useNotification();

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

  if (isErrorPage || isBecomeAHost) return null;

  const isHidden = !isMessages && scrollDirection === "down";

  const redirect = (url: string) => {
    router.push(url);
  };

  const isHomeActive = pathname === '/';
  const isFavoritesActive = pathname.startsWith('/favorites');
  const isInquiriesActive = pathname.startsWith('/inquiries');
  const isReservationsActive = pathname.startsWith('/reservations');
  const isNotificationsActive = pathname.startsWith('/notifications');

  return (
    <div
      className={`fixed bottom-4 left-0 right-0 z-40 md:hidden transition-all duration-300 ease-in-out px-4 pointer-events-none ${
        isHidden ? "translate-y-28 opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <div className="max-w-md mx-auto pointer-events-auto bg-white/60 dark:bg-slate-900/65 backdrop-blur-3xl border border-white/50 dark:border-white/20 ring-1 ring-white/30 dark:ring-white/10 shadow-[0_16px_45px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_55px_rgba(0,0,0,0.65)] rounded-[32px] px-3.5 py-2.5 flex items-center justify-around font-sans">
        {/* Not logged in */}
        {!user ? (
          <div className="flex items-center justify-between w-full px-2 py-1 gap-3">
            <Modal>
              <Modal.Trigger name="Login">
                <button
                  type="button"
                  className="flex-1 flex items-center justify-center gap-2 bg-[#2f7d6d] hover:bg-[#256659] text-white px-5 py-3 rounded-full font-extrabold text-xs sm:text-sm shadow-lg shadow-[#2f7d6d]/40 border border-emerald-400/30 transition-all uppercase tracking-wider backdrop-blur-xl"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </button>
              </Modal.Trigger>

              <Modal.Trigger name="Sign up">
                <button
                  type="button"
                  className="flex-1 flex items-center justify-center gap-2 bg-white/40 dark:bg-white/10 hover:bg-white/60 dark:hover:bg-white/20 border border-white/40 dark:border-white/20 text-slate-900 dark:text-white px-5 py-3 rounded-full font-extrabold text-xs sm:text-sm backdrop-blur-xl transition-all uppercase tracking-wider shadow-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Signup</span>
                </button>
              </Modal.Trigger>

              <Modal.Window name="Login" size="sm" closeOnOutsideClick={false}>
                <AuthModal name="Login" />
              </Modal.Window>

              <Modal.Window name="Sign up" size="sm" closeOnOutsideClick={false}>
                <AuthModal name="Sign up" />
              </Modal.Window>
            </Modal>
          </div>
        ) : (
          <div className="flex items-center justify-around w-full gap-1.5">
            {/* Home */}
            <button
              type="button"
              onClick={() => redirect("/")}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-full transition-all duration-300 ${
                isHomeActive
                  ? "bg-[#2f7d6d] text-white shadow-lg shadow-[#2f7d6d]/40 border border-emerald-400/30 font-extrabold scale-105 backdrop-blur-xl"
                  : "text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/20 dark:hover:bg-white/10"
              }`}
            >
              <Home className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
              {isHomeActive && (
                <span className="text-xs sm:text-sm font-extrabold whitespace-nowrap">Home</span>
              )}
            </button>

            {/* Favorites */}
            <button
              type="button"
              onClick={() => redirect("/favorites")}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-full transition-all duration-300 ${
                isFavoritesActive
                  ? "bg-[#2f7d6d] text-white shadow-lg shadow-[#2f7d6d]/40 border border-emerald-400/30 font-extrabold scale-105 backdrop-blur-xl"
                  : "text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/20 dark:hover:bg-white/10"
              }`}
            >
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
              {isFavoritesActive && (
                <span className="text-xs sm:text-sm font-extrabold whitespace-nowrap">Favorites</span>
              )}
            </button>

            {/* Inquiry */}
            <button
              type="button"
              onClick={() => redirect("/inquiries")}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-full transition-all duration-300 ${
                isInquiriesActive
                  ? "bg-[#2f7d6d] text-white shadow-lg shadow-[#2f7d6d]/40 border border-emerald-400/30 font-extrabold scale-105 backdrop-blur-xl"
                  : "text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/20 dark:hover:bg-white/10"
              }`}
            >
              <div className="relative">
                <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                {unreadStats && (unreadStats.byType["inquiry"] || 0) > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                )}
              </div>
              {isInquiriesActive && (
                <span className="text-xs sm:text-sm font-extrabold whitespace-nowrap">Inquiry</span>
              )}
            </button>

            {/* Reservation */}
            <button
              type="button"
              onClick={() => redirect("/reservations")}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-full transition-all duration-300 ${
                isReservationsActive
                  ? "bg-[#2f7d6d] text-white shadow-lg shadow-[#2f7d6d]/40 border border-emerald-400/30 font-extrabold scale-105 backdrop-blur-xl"
                  : "text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/20 dark:hover:bg-white/10"
              }`}
            >
              <div className="relative">
                <CalendarCheck className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                {unreadStats && (unreadStats.byType["reservation"] || 0) > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                )}
              </div>
              {isReservationsActive && (
                <span className="text-xs sm:text-sm font-extrabold whitespace-nowrap">Reservations</span>
              )}
            </button>

            {/* Notifications */}
            <button
              type="button"
              onClick={() => redirect("/notifications")}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-full transition-all duration-300 ${
                isNotificationsActive
                  ? "bg-[#2f7d6d] text-white shadow-lg shadow-[#2f7d6d]/40 border border-emerald-400/30 font-extrabold scale-105 backdrop-blur-xl"
                  : "text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/20 dark:hover:bg-white/10"
              }`}
            >
              <div className="relative">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                {unreadStats && unreadStats.total > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 px-1 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
                    {unreadStats.total > 9 ? "9+" : unreadStats.total}
                  </span>
                )}
              </div>
              {isNotificationsActive && (
                <span className="text-xs sm:text-sm font-extrabold whitespace-nowrap">Notifications</span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileBottomBar;

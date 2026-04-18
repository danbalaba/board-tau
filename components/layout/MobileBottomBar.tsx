"use client";

import React, { useState, useEffect } from "react";
import { Heart, CalendarCheck, Home, User as UserIcon, MessageCircle, Star, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { User } from "next-auth";
import { getUnreadNotificationStats } from "@/services/notification";

import Modal from "@/components/modals/Modal";
import AuthModal from "@/components/modals/AuthModal";
import HostApplicationModal from "@/components/modals/HostApplicationModal";
import Menu from "@/components/common/Menu";
import Avatar from "@/components/common/Avatar";


interface MobileBottomBarProps {
  user?: (User & { id: string; role?: string });
}

const MobileBottomBar: React.FC<MobileBottomBarProps> = ({ user }) => {
  const router = useRouter();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | "">("");
  const [lastY, setLastY] = useState(0);
  const [unreadStats, setUnreadStats] = useState<{ total: number; byType: Record<string, number> } | null>(null);

  // Implement scroll direction tracking
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      if (currentY === 0) {
        setScrollDirection("");
      } else if (currentY > lastY) {
        setScrollDirection("down");
      } else {
        setScrollDirection("up");
      }

      setLastY(currentY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastY]);

  const isHidden = scrollDirection === "down";

  const redirect = (url: string) => {
    router.push(url);
  };

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const stats = await getUnreadNotificationStats();
      if (stats) setUnreadStats(stats);
    };
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 md:hidden transition-transform duration-300 ease-in-out ${
        isHidden ? "translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200 dark:border-gray-700 shadow-2xl rounded-t-2xl px-4 py-3 pb-6">
        {/* Safe area padding */}
        <div className="flex items-center justify-between w-full pb-1">
          {/* Not logged in */}
          {!user ? (
            <>
              <Modal>
                <Modal.Trigger name="Login">
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-3 rounded-xl font-semibold transition-colors"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>Login</span>
                  </button>
                </Modal.Trigger>

                <Modal.Trigger name="Sign up">
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-xl font-semibold transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Signup</span>
                  </button>
                </Modal.Trigger>

                <Modal.Window name="Login" size="sm">
                  <AuthModal name="Login" />
                </Modal.Window>

                <Modal.Window name="Sign up" size="sm">
                  <AuthModal name="Sign up" />
                </Modal.Window>
              </Modal>
            </>
          ) : (
            <>
              {/* Home */}
              <button
                type="button"
                onClick={() => redirect("/")}
                className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-full"
              >
                <Home className="w-6 h-6 sm:w-7 sm:h-7 text-gray-600 dark:text-gray-400" />
                <span className="text-[11px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 leading-tight">
                  Home
                </span>
              </button>

              {/* Favorites */}
              <button
                type="button"
                onClick={() => redirect("/favorites")}
                className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-full"
              >
                <Heart className="w-6 h-6 sm:w-7 sm:h-7 text-gray-600 dark:text-gray-400" />
                <span className="text-[11px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 leading-tight">
                  Favorites
                </span>
              </button>

              {/* Inquiry */}
              <button
                type="button"
                onClick={() => redirect("/inquiries")}
                className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-full"
              >
                <div className="relative">
                  <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-gray-600 dark:text-gray-400" />
                  {unreadStats && (unreadStats.byType["inquiry"] || 0) > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-white dark:border-gray-900" />
                  )}
                </div>
                <span className="text-[11px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 leading-tight">
                  Inquiry
                </span>
              </button>

              {/* Reservation */}
              <button
                type="button"
                onClick={() => redirect("/reservations")}
                className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-full"
              >
                <div className="relative">
                  <CalendarCheck className="w-6 h-6 sm:w-7 sm:h-7 text-gray-600 dark:text-gray-400" />
                  {unreadStats && (unreadStats.byType["reservation"] || 0) > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-white dark:border-gray-900" />
                  )}
                </div>
                <span className="text-[11px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 leading-tight">
                  Reservation
                </span>
              </button>

              {/* Reviews */}
              <button
                type="button"
                onClick={() => redirect("/my-reviews")}
                className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-full"
              >
                <div className="relative">
                  <Star className="w-6 h-6 sm:w-7 sm:h-7 text-gray-600 dark:text-gray-400" />
                  {unreadStats && (unreadStats.byType["review"] || 0) > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-white dark:border-gray-900" />
                  )}
                </div>
                <span className="text-[11px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 leading-tight">
                  Reviews
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileBottomBar;

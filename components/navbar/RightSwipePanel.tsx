"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, CalendarCheck, Home, User as UserIcon, LogOut, MessageCircle, Star, UserPlus, ClipboardList, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { User } from "next-auth";
import { getUnreadNotificationStats } from "@/services/notification";

import Modal from "@/components/modals/Modal";
import AuthModal from "@/components/modals/AuthModal";
import HostApplicationModal from "@/components/modals/HostApplicationModal";
import ConfirmModal from "@/components/common/ConfirmModal";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useMenuPanel } from "@/hooks/use-menu-panel";
import { useLoadingStore } from "@/hooks/use-loading-store";


interface RightSwipePanelProps {
  user?: (User & { id: string; role?: string });
}

const RightSwipePanel: React.FC<RightSwipePanelProps> = ({ user }) => {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useMenuPanel();
  const [unreadStats, setUnreadStats] = useState<{ total: number; byType: Record<string, number> } | null>(null);
  const { isLoggingOut, setIsLoggingOut } = useLoadingStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isInteractable, setIsInteractable] = useState(false);

  // Interaction shield: Prevent accidental clicks during the opening animation
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsInteractable(true), 500);
      return () => clearTimeout(timer);
    } else {
      setIsInteractable(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!user?.id) return;
    const fetchStats = async () => {
      const stats = await getUnreadNotificationStats();
      if (stats) setUnreadStats(stats);
    };
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const redirect = (url: string) => {
    onClose();
    router.push(url);
  };

  const handleLogoutClick = () => {
    onClose();
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    setIsLoggingOut(true);
    setShowLogoutConfirm(false);
    
    setTimeout(() => {
      signOut({ callbackUrl: "/" });
    }, 2500);
  };

  // Close panel when user navigates
  useEffect(() => {
    const handleRouteChange = () => {
      onClose();
    };
    window.addEventListener("popstate", handleRouteChange);
    return () => window.removeEventListener("popstate", handleRouteChange);
  }, []);

  return (
    <Modal>
      {/* Overlay */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black z-40 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Panel Container */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 h-full w-[85%] bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl z-50 md:hidden shadow-[-10px_0_30px_rgba(0,0,0,0.1)] dark:shadow-[-10px_0_30px_rgba(0,0,0,0.5)] border-l border-white/20 dark:border-white/5 overflow-hidden"
          >
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
              className={`h-full flex flex-col ${isInteractable ? "pointer-events-auto" : "pointer-events-none"}`}
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="w-12" />
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white opacity-80">
                  Navigation
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-2xl bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-600 shadow-sm"
                >
                  <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Panel Content */}
              <div className="flex flex-col h-[calc(100%-64px)]">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <ThemeToggle />
                </div>

                <div className="flex-1 overflow-y-auto">
                  <div className="p-4 pb-0">
                    <button
                      type="button"
                      onClick={() => redirect("/")}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white"
                    >
                      <Home className="text-sm" />
                      <span className="font-semibold">Home</span>
                    </button>
                    <hr className="mt-2 border-gray-100 dark:border-gray-800" />
                  </div>

                  {!user ? (
                    <div className="flex flex-col gap-3 p-4">
                      <Modal.Trigger name="Login" onClick={onClose}>
                        <button className="flex items-center gap-3 w-full bg-primary hover:bg-primary-hover text-white px-4 py-3 rounded-xl font-semibold transition-colors">
                          <LogIn className="text-sm" />
                          <span>Login</span>
                        </button>
                      </Modal.Trigger>

                      <Modal.Trigger name="Sign up" onClick={onClose}>
                        <button className="flex items-center gap-3 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-xl font-semibold transition-colors">
                          <UserPlus className="text-sm" />
                          <span>Signup</span>
                        </button>
                      </Modal.Trigger>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1 p-4">
                      <button onClick={() => redirect("/favorites")} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white">
                        <Heart className="text-sm" />
                        <span>My favorites</span>
                      </button>
                      <button onClick={() => redirect("/reservations")} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white">
                        <div className="relative">
                          <CalendarCheck className="text-sm" />
                          {unreadStats && (unreadStats.byType["reservation"] || 0) > 0 && (
                            <span className="absolute -top-1 -right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                          )}
                        </div>
                        <span>My reservations</span>
                      </button>
                      <button onClick={() => redirect("/inquiries")} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white">
                        <div className="relative">
                          <ClipboardList className="text-sm" />
                          {unreadStats && (unreadStats.byType["inquiry"] || 0) > 0 && (
                            <span className="absolute -top-1 -right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                          )}
                        </div>
                        <span>My inquiries</span>
                      </button>
                      <button onClick={() => redirect("/my-reviews")} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white">
                        <div className="relative">
                          <Star className="text-sm" />
                          {unreadStats && (unreadStats.byType["review"] || 0) > 0 && (
                            <span className="absolute -top-1 -right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                          )}
                        </div>
                        <span>My reviews</span>
                      </button>
                      <button onClick={() => redirect(user?.role === 'LANDLORD' ? '/landlord/messages' : '/messages')} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white">
                        <div className="relative">
                          <MessageCircle className="text-sm" />
                          {unreadStats && (unreadStats.byType["message"] || 0) > 0 && (
                            <span className="absolute -top-1 -right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                          )}
                        </div>
                        <span>My messages</span>
                      </button>
                      <Modal.Trigger name="host-application">
                        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white">
                          <Home className="text-sm" />
                          <span>Become a host</span>
                        </button>
                      </Modal.Trigger>
                      <button onClick={() => redirect("/profile")} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white">
                        <UserIcon className="text-sm" />
                        <span>My profile</span>
                      </button>
                      <hr className="my-2" />
                      <button onClick={handleLogoutClick} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white">
                        <LogOut className="text-sm" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Windows */}
      <Modal.Window name="Login" size="sm" closeOnOutsideClick={false}>
        <AuthModal name="Login" />
      </Modal.Window>
      <Modal.Window name="Sign up" size="sm" closeOnOutsideClick={false}>
        <AuthModal name="Sign up" />
      </Modal.Window>
      <Modal.Window name="host-application" size="xl">
        <HostApplicationModal />
      </Modal.Window>

      <Modal isOpen={showLogoutConfirm && !isLoggingOut} onClose={() => setShowLogoutConfirm(false)} width="xs">
        <ConfirmModal
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={handleLogoutConfirm}
          title="Sign Out?"
          message={`Are you sure you want to sign out, ${user?.name || 'User'}?`}
          confirmLabel="Logout"
          cancelLabel="Stay"
          isLoading={isLoggingOut}
          variant="danger"
        />
      </Modal>

      {/* Swipe Trigger */}
      {!isOpen && (
        <div className="fixed top-1/2 -translate-y-1/2 right-0 w-8 h-32 z-40 md:hidden group cursor-pointer flex items-center justify-end" onClick={onOpen}>
          <div className="w-3 h-24 bg-neutral-900 dark:bg-white/20 rounded-l-3xl backdrop-blur-xl border-l border-t border-b border-white/20 group-hover:w-5 group-active:w-6 transition-all duration-500 shadow-[-5px_0_20px_rgba(0,0,0,0.3)] flex items-center justify-center">
            <div className="flex gap-0.5">
              <div className="w-0.5 h-8 bg-white/40 rounded-full" />
              <div className="w-0.5 h-8 bg-white/40 rounded-full" />
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default RightSwipePanel;

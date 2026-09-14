"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Sparkles, X, CheckCheck, Loader2 } from "lucide-react";
import { useNotification } from "@/context/NotificationContext";
import NotificationItem from "./NotificationItem";
import { User } from "next-auth";

interface MobileFloatingNotificationProps {
  user?: User;
}

export default function MobileFloatingNotification({ user }: MobileFloatingNotificationProps) {
  const { notifications, unreadStats, markAsRead, markAllAsRead, loadMore, hasMore, isLoading } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALL" | "UNREAD">("ALL");
  const containerRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when notification dropdown is open to prevent background scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Staggered toggle logic:
  // Open: Bell slides out first (isOpen) -> Panel expands next (panelVisible)
  // Close: Panel collapses first (panelVisible) -> Bell slides back peeked (isOpen)
  const handleToggle = () => {
    if (!isOpen) {
      setIsOpen(true);
      setTimeout(() => {
        setPanelVisible(true);
      }, 150); // Dropdown opens smoothly after bell slides out
    } else {
      setPanelVisible(false);
      setTimeout(() => {
        setIsOpen(false);
      }, 180); // Bell slides back after dropdown finishes shrinking
    }
  };

  const handleClose = () => {
    setPanelVisible(false);
    setTimeout(() => {
      setIsOpen(false);
    }, 180);
  };

  // Click outside listener to collapse dropdown seamlessly
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (isOpen) {
          handleClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Filter notifications based on active tab
  const filteredNotifications = useMemo(() => {
    if (activeTab === "UNREAD") {
      return notifications.filter((n) => !n.isRead);
    }
    return notifications;
  }, [notifications, activeTab]);

  const totalUnread = unreadStats?.total || 0;

  // Don't render if user is not logged in
  if (!user) return null;

  return (
    <div 
      ref={containerRef} 
      className="md:hidden fixed top-[22%] left-0 z-50"
    >
      {/* STABLE CONTAINER PREVENTING ANY POSITION SHIFTING */}
      <div className="relative flex items-start">
        {/* 1. SLIMMER BELL TAB: COMPACT & LEAVES MAXIMUM HORIZONTAL SPACE FOR PANEL */}
        <motion.div
          onClick={handleToggle}
          initial={false}
          animate={isOpen ? { x: 0 } : { x: "-55%" }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          whileTap={{ scale: 0.94 }}
          className={`relative pl-2.5 pr-2.5 py-3 rounded-r-xl backdrop-blur-2xl border-r border-t border-b cursor-pointer transition-colors duration-300 shadow-[4px_0_20px_rgba(0,0,0,0.18)] dark:shadow-[4px_0_20px_rgba(0,0,0,0.6)] flex items-center gap-1.5 shrink-0 z-20 ${
            panelVisible
              ? "bg-[#2f7d6d] text-white border-[#2f7d6d] rounded-r-none border-r-0 shadow-none"
              : isOpen
              ? "bg-[#2f7d6d] text-white border-[#2f7d6d]"
              : totalUnread > 0
              ? "bg-gradient-to-r from-red-500 to-rose-600 text-white border-red-400/50"
              : "bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-white border-white/50 dark:border-white/10"
          }`}
        >
          {/* Bell Icon with Infinite Ringing / Swaying Animation when Unread */}
          <div className="relative">
            <motion.div
              animate={totalUnread > 0 && !isOpen ? {
                rotate: [0, -22, 22, -16, 16, -8, 8, 0],
                scale: [1, 1.1, 1],
              } : { rotate: 0, scale: 1 }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                repeatDelay: 1.2,
                ease: "easeInOut",
              }}
            >
              <Bell className={`w-4.5 h-4.5 ${
                isOpen || panelVisible
                  ? "text-white"
                  : totalUnread > 0
                  ? "text-white drop-shadow-md"
                  : "text-[#2f7d6d] dark:text-emerald-400"
              }`} />
            </motion.div>

            {/* Glowing Unread Counter Badge */}
            {totalUnread > 0 && !isOpen && (
              <span className="absolute -top-2 -right-2.5 min-w-[17px] h-4 px-1 bg-white text-red-600 text-[9px] font-black rounded-full flex items-center justify-center border border-red-500 shadow-md">
                {totalUnread > 9 ? "9+" : totalUnread}
              </span>
            )}
          </div>

          {/* Vertical Edge Grip Indicator */}
          <div className="flex flex-col gap-0.5 opacity-60">
            <div className={`w-0.5 h-3 rounded-full ${isOpen || panelVisible || totalUnread > 0 ? "bg-white" : "bg-slate-400 dark:bg-slate-500"}`} />
            <div className={`w-0.5 h-3 rounded-full ${isOpen || panelVisible || totalUnread > 0 ? "bg-white" : "bg-slate-400 dark:bg-slate-500"}`} />
          </div>
        </motion.div>

        {/* 2. ATTACHED DROPDOWN PANEL: EXPANDED WITH KERBY HEADSHOT AVATAR IN HEADER */}
        <AnimatePresence>
          {panelVisible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: -10, y: -6 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: -10, y: -6 }}
              transition={{ type: "spring", stiffness: 450, damping: 28 }}
              style={{ transformOrigin: "left top" }}
              className="w-[calc(100vw-45px)] max-w-[375px] rounded-r-3xl rounded-b-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-t border-r border-b border-[#2f7d6d]/40 dark:border-white/10 shadow-[10px_20px_50px_rgba(0,0,0,0.25)] dark:shadow-[10px_25px_60px_rgba(0,0,0,0.7)] p-4 sm:p-5 flex flex-col gap-4 max-h-[76vh] overflow-hidden shrink-0 z-10"
            >
              {/* Header with Kerby Mascot Headshot Avatar */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 p-0.5 border border-[#2f7d6d]/30 shrink-0 shadow-sm overflow-hidden flex items-center justify-center">
                    <img 
                      src="/assets/mascot/kerby-headshot.png" 
                      alt="Kerby Mascot Avatar" 
                      className="w-full h-full object-contain scale-110"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-tight truncate">
                      Notifications
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-[#2f7d6d] dark:text-emerald-400 font-bold truncate mt-0.5">
                      {totalUnread > 0 
                        ? `Here are your ${totalUnread} latest updates!` 
                        : "Here are your latest housing & inquiry updates!"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 pl-1">
                  {totalUnread > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="text-[10px] sm:text-[11px] font-extrabold text-[#2f7d6d] dark:text-emerald-400 hover:underline flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#2f7d6d]/10 dark:bg-emerald-500/10 border border-[#2f7d6d]/20 transition-all shrink-0"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Mark read</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleClose}
                    className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors shrink-0"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* ALL / UNREAD Segmented Tab Switcher */}
              <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab("ALL")}
                  className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === "ALL"
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <span>ALL</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-[10px] font-bold">
                    {notifications.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("UNREAD")}
                  className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === "UNREAD"
                      ? "bg-white dark:bg-slate-900 text-[#2f7d6d] dark:text-emerald-400 shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <span>UNREAD</span>
                  {totalUnread > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-red-500 text-white text-[10px] font-bold">
                      {totalUnread}
                    </span>
                  )}
                </button>
              </div>

              {/* Notifications List or Kerby Mascot Empty State (overscroll-contain to prevent background scrolling) */}
              <div className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar pr-1 max-h-[52vh]">
                {filteredNotifications.length > 0 ? (
                  <div className="flex flex-col gap-2.5">
                    {filteredNotifications.map((notif) => (
                      <NotificationItem
                        key={notif.id}
                        notification={notif}
                        onClick={() => {
                          markAsRead(notif.id, notif.type);
                          handleClose();
                        }}
                      />
                    ))}

                    {/* Pagination Button for Mobile */}
                    {hasMore && activeTab === "ALL" && (
                      <div className="pt-1.5 pb-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            loadMore();
                          }}
                          disabled={isLoading}
                          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-[#2f7d6d] dark:text-emerald-400 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 border border-slate-200/80 dark:border-slate-700/60 shadow-sm"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-[#2f7d6d] dark:text-emerald-400" />
                              <span>Loading notifications...</span>
                            </>
                          ) : (
                            <span>See previous notifications</span>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* KERBY MASCOT "ALL CAUGHT UP" ZERO-NOTIFICATION STATE */
                  <div className="flex flex-col items-center justify-center py-6 px-3 text-center gap-3">
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      <img
                        src="/assets/mascot/kerby-notification.png"
                        alt="Kerby mascot holding notification bell"
                        className="w-full h-full object-contain drop-shadow-md"
                      />
                    </div>

                    <div className="p-3.5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex flex-col items-center gap-1.5 shadow-sm">
                      <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>All caught up!</span>
                      </span>
                      <p className="text-xs text-emerald-900/80 dark:text-emerald-200/80 font-medium leading-relaxed">
                        No new notifications right now. Enjoy your day! 🔔✨
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

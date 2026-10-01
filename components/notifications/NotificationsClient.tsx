"use client";

import React, { useState, useMemo } from "react";
import { User } from "next-auth";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  CheckCheck, 
  Sparkles, 
  Loader2, 
  Home, 
  CalendarCheck, 
  Star, 
  MessageCircle, 
  Search, 
  Filter, 
  X,
  RotateCcw,
  Check
} from "lucide-react";
import { useNotification, NotificationItem as NotificationType } from "@/context/NotificationContext";
import NotificationItem from "@/components/navbar/NotificationItem";
import Heading from "@/components/common/Heading";
import ModernSelect from "@/components/common/ModernSelect";
import { UserMobileFilterSheet } from "@/components/common/UserMobileFilterSheet";
import { cn } from "@/utils/helper";
import { isToday } from "date-fns";

interface NotificationsClientProps {
  user?: User & { id: string; role?: string };
}

type CategoryFilter = "ALL" | "UNREAD" | "INQUIRY" | "RESERVATION" | "REVIEW" | "MESSAGE";

const statusOptions = [
  { value: "all", label: "All Statuses", color: "bg-gray-400" },
  { value: "APPROVED", label: "Approved / Confirmed", color: "bg-emerald-500" },
  { value: "PENDING", label: "Pending / Under Review", color: "bg-amber-500" },
  { value: "REJECTED", label: "Rejected / Cancelled", color: "bg-rose-500" },
  { value: "REPLIED", label: "Messages / Responses", color: "bg-purple-500" },
];

const categoryOptions: { value: CategoryFilter; label: string; icon?: React.ReactNode }[] = [
  { value: "ALL", label: "ALL" },
  { value: "UNREAD", label: "UNREAD" },
  { value: "INQUIRY", label: "Inquiries", icon: <Home className="w-3.5 h-3.5" /> },
  { value: "RESERVATION", label: "Reservations", icon: <CalendarCheck className="w-3.5 h-3.5" /> },
  { value: "REVIEW", label: "Reviews", icon: <Star className="w-3.5 h-3.5" /> },
  { value: "MESSAGE", label: "Messages", icon: <MessageCircle className="w-3.5 h-3.5" /> },
];

export default function NotificationsClient({ user }: NotificationsClientProps) {
  const {
    notifications,
    unreadStats,
    markAsRead,
    markAllAsRead,
    loadMore,
    hasMore,
    isLoading,
  } = useNotification();

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Category counts
  const categoryCounts = useMemo(() => {
    return {
      ALL: notifications.length,
      UNREAD: notifications.filter((n) => !n.isRead).length,
      INQUIRY: notifications.filter((n) => n.type.toLowerCase() === "inquiry").length,
      RESERVATION: notifications.filter((n) => n.type.toLowerCase() === "reservation").length,
      REVIEW: notifications.filter((n) => n.type.toLowerCase() === "review").length,
      MESSAGE: notifications.filter((n) => n.type.toLowerCase() === "message").length,
    };
  }, [notifications]);

  // Multi-level filtering: Category + Status + Search Query
  const filteredNotifications = useMemo(() => {
    let list = [...notifications];

    // 1. Category / Type Filter
    if (categoryFilter === "UNREAD") {
      list = list.filter((n) => !n.isRead);
    } else if (categoryFilter !== "ALL") {
      list = list.filter((n) => n.type.toLowerCase() === categoryFilter.toLowerCase());
    }

    // 2. Status Filter
    if (statusFilter !== "all") {
      const s = statusFilter.toLowerCase();
      list = list.filter((n) => {
        const text = (n.title + " " + n.description).toLowerCase();
        if (s === "approved") {
          return text.includes("approved") || text.includes("confirmed") || text.includes("accept");
        }
        if (s === "pending") {
          return text.includes("pending") || text.includes("review") || text.includes("waiting");
        }
        if (s === "rejected") {
          return text.includes("reject") || text.includes("cancel") || text.includes("decline");
        }
        if (s === "replied") {
          return text.includes("message") || text.includes("reply") || text.includes("replied") || text.includes("sent") || text.includes("response");
        }
        return true;
      });
    }

    // 3. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.description.toLowerCase().includes(q)
      );
    }

    return list;
  }, [notifications, categoryFilter, statusFilter, searchQuery]);

  // Group notifications into Today and Earlier
  const { today, earlier } = useMemo(() => {
    const today: NotificationType[] = [];
    const earlier: NotificationType[] = [];

    filteredNotifications.forEach((n) => {
      if (isToday(new Date(n.createdAt))) {
        today.push(n);
      } else {
        earlier.push(n);
      }
    });

    return { today, earlier };
  }, [filteredNotifications]);

  const totalUnread = unreadStats?.total || 0;
  const isFiltered = categoryFilter !== "ALL" || statusFilter !== "all" || searchQuery !== "";

  const handleResetFilters = () => {
    setCategoryFilter("ALL");
    setStatusFilter("all");
    setSearchQuery("");
  };

  return (
    <div className="main-container min-h-[70vh] flex flex-col">
      {/* Standardized Header matching all tenant pages */}
      <Heading
        title="Notifications"
        subtitle="Stay updated on your housing inquiries, reservations, and updates"
        backBtn
        rightAction={
          totalUnread > 0 ? (
            <button
              type="button"
              onClick={markAllAsRead}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-primary dark:text-emerald-400 font-extrabold text-xs sm:text-sm border border-primary/30 transition-all active:scale-95 shadow-xs"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark all as read</span>
            </button>
          ) : undefined
        }
      />

      {/* Search and Responsive Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 mb-6 flex flex-col md:flex-row items-center gap-4 bg-white/50 dark:bg-gray-800/50 p-4 rounded-2xl backdrop-blur-md border border-gray-100 dark:border-gray-700/50 shadow-sm relative z-20"
      >
        {/* Search & Mobile Filter Sheet */}
        <div className="flex items-center gap-2 w-full md:flex-[5]">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search notifications by keyword or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3 border border-transparent rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-all text-sm"
            />
            {searchQuery && (
              <button 
                type="button"
                onClick={() => setSearchQuery("")} 
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Mobile Filter Sheet Drawer */}
          <UserMobileFilterSheet
            activeFilterCount={(statusFilter !== "all" ? 1 : 0) + (categoryFilter !== "ALL" ? 1 : 0)}
            onClearAll={handleResetFilters}
          >
            <div className="space-y-6">
              {/* Category Filter Section */}
              <div className="space-y-2.5">
                <span className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <Filter size={14} className="text-primary" /> Category Filter
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {categoryOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setCategoryFilter(opt.value)}
                      className={cn(
                        "px-3.5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider border transition-all flex items-center justify-between cursor-pointer",
                        categoryFilter === opt.value
                          ? "bg-primary/10 text-primary border-primary/30 font-black shadow-xs"
                          : "bg-gray-50 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border-gray-200/60 dark:border-gray-700/60 hover:bg-gray-100"
                      )}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        {opt.icon}
                        <span className="truncate">{opt.label}</span>
                      </div>
                      {categoryFilter === opt.value && <Check size={14} strokeWidth={3} className="text-primary shrink-0 ml-1" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Filter Section */}
              <div className="space-y-2.5">
                <span className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <Filter size={14} className="text-primary" /> Status Filter
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setStatusFilter(opt.value)}
                      className={cn(
                        "px-3.5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider border transition-all flex items-center justify-between cursor-pointer",
                        statusFilter === opt.value
                          ? "bg-primary/10 text-primary border-primary/30 font-black shadow-xs"
                          : "bg-gray-50 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border-gray-200/60 dark:border-gray-700/60 hover:bg-gray-100"
                      )}
                    >
                      <span className="truncate">{opt.label}</span>
                      {statusFilter === opt.value && <Check size={14} strokeWidth={3} className="text-primary shrink-0 ml-1" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </UserMobileFilterSheet>
        </div>

        {/* Desktop Inline Filters */}
        <div className="hidden md:flex items-center gap-4">
          <ModernSelect
            instanceId="notification-status-select"
            options={statusOptions}
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            icon={<Filter size={18} />}
            className="w-max min-w-[210px]"
          />
        </div>
      </motion.div>

      {/* Category Pills Bar (Horizontal scroll with primary badge styling) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar hide-scrollbar select-none">
        {categoryOptions.map((opt) => {
          const isSelected = categoryFilter === opt.value;
          const count = categoryCounts[opt.value];
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setCategoryFilter(opt.value)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 whitespace-nowrap border cursor-pointer",
                isSelected
                  ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-gray-200/80 dark:border-gray-700/80"
              )}
            >
              {opt.icon}
              <span>{opt.label}</span>
              {count !== undefined && (
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-md text-[10px] font-bold",
                    isSelected
                      ? "bg-white/20 text-white"
                      : opt.value === "UNREAD" && count > 0
                      ? "bg-red-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notifications List Body Container */}
      <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl min-h-[380px] flex flex-col justify-between">
        {filteredNotifications.length > 0 ? (
          <div className="space-y-6">
            {today.length > 0 && (
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 px-1">
                  Today
                </h3>
                <div className="space-y-2">
                  {today.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClick={() => !notification.isRead && markAsRead(notification.id, notification.type)}
                    />
                  ))}
                </div>
              </div>
            )}

            {earlier.length > 0 && (
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 px-1">
                  Earlier
                </h3>
                <div className="space-y-2">
                  {earlier.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClick={() => !notification.isRead && markAsRead(notification.id, notification.type)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Pagination Load More Button */}
            {hasMore && categoryFilter === "ALL" && statusFilter === "all" && !searchQuery && (
              <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={isLoading}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-sm font-bold text-[#2f7d6d] dark:text-emerald-400 rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 border border-slate-200/80 dark:border-slate-700/60 shadow-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#2f7d6d] dark:text-emerald-400" />
                      <span>Loading previous notifications...</span>
                    </>
                  ) : (
                    <span>See previous notifications</span>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center my-auto">
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 mb-4 flex items-center justify-center">
              <img
                src="/assets/mascot/kerby-notification.png"
                alt="Kerby mascot holding notification bell"
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>

            <div className="max-w-md p-4 sm:p-5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex flex-col items-center gap-2 shadow-sm">
              <span className="text-sm font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{isFiltered ? "No matching notifications" : "All caught up!"}</span>
              </span>
              <p className="text-xs sm:text-sm text-emerald-900/80 dark:text-emerald-200/80 font-medium leading-relaxed flex items-center justify-center gap-1.5 flex-wrap">
                <span>
                  {isFiltered
                    ? "No notifications match your current filter or search query."
                    : "You have no notifications right now. Have a great day!"}
                </span>
                {!isFiltered && (
                  <span className="inline-flex items-center gap-1">
                    <Bell className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                  </span>
                )}
              </p>
              {isFiltered && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

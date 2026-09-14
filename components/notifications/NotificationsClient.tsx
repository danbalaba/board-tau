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
  RotateCcw
} from "lucide-react";
import { useNotification, NotificationItem as NotificationType } from "@/context/NotificationContext";
import NotificationItem from "@/components/navbar/NotificationItem";
import Container from "@/components/common/Container";
import ModernSelect from "@/components/common/ModernSelect";
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
    <Container className="py-6 sm:py-10 max-w-4xl mx-auto">
      {/* Page Header with Kerby Headshot Avatar & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 pb-6 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="relative w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 p-1 border border-[#2f7d6d]/30 shrink-0 shadow-sm overflow-hidden flex items-center justify-center">
            <img
              src="/assets/mascot/kerby-headshot.png"
              alt="Kerby Mascot Avatar"
              className="w-full h-full object-contain scale-110"
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-outfit tracking-tight flex items-center gap-2.5">
              <span>Notifications</span>
              {totalUnread > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold shadow-sm animate-pulse">
                  {totalUnread} new
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Stay updated on your housing inquiries, reservations, and updates
            </p>
          </div>
        </div>

        {totalUnread > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2f7d6d]/10 hover:bg-[#2f7d6d]/20 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-[#2f7d6d] dark:text-emerald-400 font-extrabold text-xs sm:text-sm border border-[#2f7d6d]/30 transition-all active:scale-95 shadow-sm self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Search and Status Filter Bar */}
      <div className="mb-6 flex flex-col md:flex-row items-center gap-3 bg-white/60 dark:bg-slate-900/60 p-3 rounded-2xl backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search notifications by keyword or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm border border-transparent rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2f7d6d]/50 shadow-sm transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
          />
          {searchQuery && (
            <button 
              type="button"
              onClick={() => setSearchQuery("")} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Dropdown Filter */}
        <ModernSelect
          instanceId="notification-status-select"
          options={statusOptions}
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
          icon={<Filter size={16} />}
          className="w-full md:w-max min-w-[210px]"
          size="sm"
        />
      </div>

      {/* Category Pills Bar (NO SCROLLBAR: no-scrollbar & hide-scrollbar applied) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar hide-scrollbar select-none">
        {/* ALL */}
        <button
          type="button"
          onClick={() => setCategoryFilter("ALL")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
            categoryFilter === "ALL"
              ? "bg-[#2f7d6d] text-white shadow-md shadow-[#2f7d6d]/30"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-800"
          }`}
        >
          <span>ALL</span>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${categoryFilter === "ALL" ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}>
            {categoryCounts.ALL}
          </span>
        </button>

        {/* UNREAD */}
        <button
          type="button"
          onClick={() => setCategoryFilter("UNREAD")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
            categoryFilter === "UNREAD"
              ? "bg-[#2f7d6d] text-white shadow-md shadow-[#2f7d6d]/30"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-800"
          }`}
        >
          <span>UNREAD</span>
          {categoryCounts.UNREAD > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-red-500 text-white text-[10px] font-bold">
              {categoryCounts.UNREAD}
            </span>
          )}
        </button>

        {/* INQUIRY */}
        <button
          type="button"
          onClick={() => setCategoryFilter("INQUIRY")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
            categoryFilter === "INQUIRY"
              ? "bg-[#2f7d6d] text-white shadow-md shadow-[#2f7d6d]/30"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-800"
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>Inquiries</span>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${categoryFilter === "INQUIRY" ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}>
            {categoryCounts.INQUIRY}
          </span>
        </button>

        {/* RESERVATION */}
        <button
          type="button"
          onClick={() => setCategoryFilter("RESERVATION")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
            categoryFilter === "RESERVATION"
              ? "bg-[#2f7d6d] text-white shadow-md shadow-[#2f7d6d]/30"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-800"
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          <span>Reservations</span>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${categoryFilter === "RESERVATION" ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}>
            {categoryCounts.RESERVATION}
          </span>
        </button>

        {/* REVIEWS */}
        <button
          type="button"
          onClick={() => setCategoryFilter("REVIEW")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
            categoryFilter === "REVIEW"
              ? "bg-[#2f7d6d] text-white shadow-md shadow-[#2f7d6d]/30"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-800"
          }`}
        >
          <Star className="w-3.5 h-3.5" />
          <span>Reviews</span>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${categoryFilter === "REVIEW" ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}>
            {categoryCounts.REVIEW}
          </span>
        </button>

        {/* MESSAGES */}
        <button
          type="button"
          onClick={() => setCategoryFilter("MESSAGE")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
            categoryFilter === "MESSAGE"
              ? "bg-[#2f7d6d] text-white shadow-md shadow-[#2f7d6d]/30"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-800"
          }`}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Messages</span>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${categoryFilter === "MESSAGE" ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}>
            {categoryCounts.MESSAGE}
          </span>
        </button>
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
    </Container>
  );
}

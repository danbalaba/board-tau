"use client";

import React, { useMemo } from "react";
import { Bell, Check, Loader2 } from "lucide-react";
import { useNotification, NotificationItem as NotificationType } from "@/context/NotificationContext";
import Menu from "@/components/common/Menu";
import NotificationItem from "./NotificationItem";
import { isToday } from "date-fns";
import { User } from "next-auth";

interface NotificationBellProps {
  user?: User;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ user }) => {
  const { 
    notifications, 
    unreadStats, 
    markAsRead, 
    markAllAsRead, 
    loadMore, 
    hasMore, 
    isLoading 
  } = useNotification();

  const [filter, setFilter] = React.useState<"all" | "unread">("all");

  const displayedNotifications = useMemo(() => {
    return filter === "unread" 
      ? notifications.filter(n => !n.isRead) 
      : notifications;
  }, [notifications, filter]);

  const { today, earlier } = useMemo(() => {
    const today: NotificationType[] = [];
    const earlier: NotificationType[] = [];

    displayedNotifications.forEach((n) => {
      if (isToday(new Date(n.createdAt))) {
        today.push(n);
      } else {
        earlier.push(n);
      }
    });

    return { today, earlier };
  }, [displayedNotifications]);

  if (!user) return null;

  return (
    <div className="relative z-50">
      <Menu>
        <Menu.Toggle id="notification-menu">
          <button
            type="button"
            className="p-2 md:p-2.5 rounded-full hover:bg-neutral-100 dark:hover:bg-gray-800 transition cursor-pointer text-gray-600 dark:text-gray-300 relative group"
            aria-label="Notifications"
          >
            <Bell size={20} className="group-hover:text-primary dark:group-hover:text-primary-light-color transition-colors" />
            {unreadStats.total > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-600 rounded-full border border-white dark:border-gray-900 animate-pulse"></span>
            )}
          </button>
        </Menu.Toggle>

        <Menu.List className="hidden md:block shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)] rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 w-[360px] md:w-[400px] overflow-hidden !right-0 transform translate-x-1/4 md:translate-x-0 mt-2">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h3>
              {unreadStats.total > 0 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
                  className="p-1.5 text-gray-500 hover:text-primary dark:hover:text-primary-light-color hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition tooltip-trigger"
                  title="Mark all as read"
                >
                  <Check size={18} />
                </button>
              )}
            </div>
            
            {/* Filter Pills */}
            <div className="flex gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); setFilter("all"); }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${filter === "all" ? "bg-primary text-white dark:bg-primary-dark-color" : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"}`}
              >
                All
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setFilter("unread"); }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${filter === "unread" ? "bg-primary text-white dark:bg-primary-dark-color" : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"}`}
              >
                Unread {unreadStats.total > 0 && <span className="ml-1 opacity-80">({unreadStats.total})</span>}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[60vh] overflow-y-auto overscroll-contain custom-scrollbar p-2">
            {displayedNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Bell className="mx-auto mb-3 opacity-20" size={48} />
                <p>No notifications yet</p>
              </div>
            ) : (
              <>
                {today.length > 0 && (
                  <div className="mb-4">
                    <h4 className="px-2 py-1 text-sm font-semibold text-gray-900 dark:text-white mb-1">Today</h4>
                    <div className="space-y-1">
                      {today.map(notification => (
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
                  <div className="mb-2">
                    <h4 className="px-2 py-1 text-sm font-semibold text-gray-900 dark:text-white mb-1">Earlier</h4>
                    <div className="space-y-1">
                      {earlier.map(notification => (
                        <NotificationItem 
                          key={notification.id} 
                          notification={notification} 
                          onClick={() => !notification.isRead && markAsRead(notification.id, notification.type)} 
                        />
                      ))}
                    </div>
                  </div>
                )}

                {hasMore && (
                  <div className="p-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); loadMore(); }}
                      disabled={isLoading}
                      className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={16} className="animate-spin text-gray-500 dark:text-gray-400" />
                          <span>Loading...</span>
                        </>
                      ) : (
                        "See previous notifications"
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </Menu.List>
      </Menu>
    </div>
  );
};

export default NotificationBell;

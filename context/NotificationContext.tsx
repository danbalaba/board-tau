"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { pusherClient } from "@/lib/pusher-client";
import { markNotificationsAsRead as serverMarkAsRead } from "@/services/notification";
import { useResponsiveToast } from "@/components/common/ResponsiveToast";

export type NotificationType = "inquiry" | "reservation" | "review" | "message";

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  description: string;
  link: string;
  isRead: boolean;
  createdAt: string | Date;
}

interface UnreadStats {
  total: number;
  byType: Record<string, number>;
}

interface NotificationContextProps {
  notifications: NotificationItem[];
  unreadStats: UnreadStats;
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  markAsRead: (id: string, type: NotificationType) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const defaultStats: UnreadStats = { total: 0, byType: {} };

const NotificationContext = createContext<NotificationContextProps>({
  notifications: [],
  unreadStats: defaultStats,
  isLoading: false,
  hasMore: false,
  loadMore: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadStats, setUnreadStats] = useState<UnreadStats>(defaultStats);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const isFetchingRef = useRef(false);
  const toast = useResponsiveToast();

  const fetchNotifications = useCallback(async (cursor: string | null = null) => {
    if (isFetchingRef.current || !userId) return;
    
    isFetchingRef.current = true;
    setIsLoading(true);

    try {
      const url = new URL("/api/notifications", window.location.origin);
      url.searchParams.set("limit", "5");
      if (cursor) url.searchParams.set("cursor", cursor);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        
        if (cursor) {
          setNotifications((prev) => {
            const newNotifs = data.notifications.filter(
              (n: NotificationItem) => !prev.some((p) => p.id === n.id)
            );
            return [...prev, ...newNotifs];
          });
        } else {
          setNotifications(data.notifications);
          
          // Old behavior: Notify user of unread status on page refresh/initial load
          if (data.unreadStats?.total > 0 && !cursor) {
            toast.info({
              title: "Unread Notifications",
              description: `You have ${data.unreadStats.total} unread notification(s).`
            });
          }
        }
        
        setUnreadStats(data.unreadStats);
        setNextCursor(data.nextCursor);
        setHasMore(!!data.nextCursor);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [userId]);

  // Initial fetch
  useEffect(() => {
    if (userId) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadStats(defaultStats);
    }
  }, [userId, fetchNotifications]);

  // Pusher Subscription
  useEffect(() => {
    if (!userId) return;

    const channelName = `private-user-${userId}`;
    const channel = pusherClient.subscribe(channelName);

    channel.bind("new-notification", (newNotif: NotificationItem) => {
      setNotifications((prev) => {
        // Prevent duplicates
        if (prev.some((n) => n.id === newNotif.id)) return prev;
        return [newNotif, ...prev];
      });

      setUnreadStats((prev) => {
        const typeStr = newNotif.type.toLowerCase();
        return {
          total: prev.total + 1,
          byType: {
            ...prev.byType,
            [typeStr]: (prev.byType[typeStr] || 0) + 1,
          },
        };
      });

      // Fire a toast for the new notification!
      toast.info({
        title: newNotif.title,
        description: newNotif.description
      });
    });

    return () => {
      channel.unbind("new-notification");
      pusherClient.unsubscribe(channelName);
    };
  }, [userId]);

  const loadMore = async () => {
    if (hasMore && !isLoading && nextCursor) {
      await fetchNotifications(nextCursor);
    }
  };

  const markAsRead = async (id: string, type: NotificationType) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    
    setUnreadStats((prev) => {
      if (prev.total <= 0) return prev;
      const typeStr = type.toLowerCase();
      const currentTypeCount = prev.byType[typeStr] || 0;
      return {
        total: Math.max(0, prev.total - 1),
        byType: {
          ...prev.byType,
          [typeStr]: Math.max(0, currentTypeCount - 1),
        },
      };
    });

    // Call backend API indirectly or create a dedicated endpoint
    // For simplicity, we can just use the existing server action for the type
    // This is sub-optimal for single item, but serverMarkAsRead expects a type
    // In BoardTAU, marking one marks all of that type or we can add a specific action.
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadStats(defaultStats);
    
    try {
      await serverMarkAsRead();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadStats,
        isLoading,
        hasMore,
        loadMore,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

"use client";

import { useEffect } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { pusherClient } from "@/lib/pusher-client";
import { useResponsiveToast } from "@/components/common/ResponsiveToast";
import { getLandlordNotifications, markNotificationAsRead, clearAllNotifications, markAllNotificationsAsRead } from "../actions";

export function useNotifications() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;
  const toast = useResponsiveToast();

  const query = useInfiniteQuery({
    queryKey: ["landlord-notifications"],
    queryFn: ({ pageParam = 0 }) => {
      return getLandlordNotifications(pageParam as number, 5);
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length : undefined;
    },
    initialPageParam: 0,
    staleTime: 10000,
  });

  useEffect(() => {
    if (!userId) return;

    const channelName = `private-user-${userId}`;
    const channel = pusherClient.subscribe(channelName);

    const handleNewNotification = (newNotif: any) => {
      queryClient.invalidateQueries({ queryKey: ["landlord-notifications"] });
      
      toast.info({
        title: newNotif.title,
        description: newNotif.description
      });
    };

    channel.bind("new-notification", handleNewNotification);

    return () => {
      channel.unbind("new-notification", handleNewNotification);
      pusherClient.unsubscribe(channelName);
    };
  }, [userId, queryClient, toast]);

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landlord-notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landlord-notifications"] });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: () => clearAllNotifications(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landlord-notifications"] });
    },
  });

  // Flatten the pages into a single notifications array
  const notifications = query.data?.pages.flatMap((page) => page.notifications) ?? [];
  const unreadCount = query.data?.pages[0]?.unreadCount ?? 0;

  return {
    ...query,
    notifications,
    unreadCount,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    clearAll: clearAllMutation.mutate,
    isClearing: clearAllMutation.isPending,
    isMarkingRead: markAllAsReadMutation.isPending,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}

"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useResponsiveToast } from "@/components/common/ResponsiveToast";
import { pusherClient } from "@/lib/pusher-client";

export interface TenantConversation {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  landlordId: string;
  landlordName: string;
  landlordImage: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isArchived: boolean;
  isPendingArchive?: boolean;
  isPendingUnarchive?: boolean;
  isPlaceholder?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  listingId: string;
  content: string;
  read: boolean;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    image: string;
  };
}

export const useMessages = (initialConversations: TenantConversation[], currentUserId: string) => {
  const queryClient = useQueryClient();
  const toast = useResponsiveToast();
  
  // Local state for UI-only concerns (undo windows, placeholders)
  const [conversations, setConversations] = useState<TenantConversation[]>(initialConversations);
  const [activeConversation, setActiveConversationState] = useState<TenantConversation | null>(null);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);

  // 1. Fetch Conversations Query
  const { data: serverConversations, refetch: refetchConversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const response = await axios.get("/api/tenant/conversations");
      return response.data.data as TenantConversation[];
    },
    initialData: initialConversations,
  });

  // Sync server data to local state while preserving pending undo states
  useEffect(() => {
    if (serverConversations) {
      setConversations((currentConvs) => {
        return serverConversations.map((fetched) => {
          const local = currentConvs.find(
            (c) => c.listingId === fetched.listingId && c.landlordId === fetched.landlordId
          );
          if (local?.isPendingArchive || local?.isPendingUnarchive) {
            return {
              ...fetched,
              isPendingArchive: local.isPendingArchive,
              isPendingUnarchive: local.isPendingUnarchive,
              isArchived: local.isArchived,
            };
          }
          return fetched;
        });
      });
    }
  }, [serverConversations]);

  // 2. Fetch Messages Query
  const { data: serverMessages, isLoading: isMessagesLoading } = useQuery({
    queryKey: ["messages", activeConversation?.listingId, activeConversation?.landlordId],
    queryFn: async () => {
      if (!activeConversation) return [];
      const response = await axios.get(
        `/api/messages?listingId=${activeConversation.listingId}&otherUserId=${activeConversation.landlordId}`
      );
      return response.data.messages.reverse() as Message[];
    },
    enabled: !!activeConversation,
  });

  // Sync server messages to local state for optimistic UI and Pusher
  useEffect(() => {
    if (serverMessages) {
      setLocalMessages(serverMessages);
    }
  }, [serverMessages]);

  const setActiveConversation = useCallback((conv: TenantConversation | null) => {
    if (conv) {
      setConversations((prev) => prev.filter((c) => !c.isPlaceholder || c.id === conv.id));
    } else {
      setConversations((prev) => prev.filter((c) => !c.isPlaceholder));
    }
    setActiveConversationState(conv);
  }, []);

  // 3. Mutations
  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!activeConversation) throw new Error("No active conversation");
      const response = await axios.post("/api/messages", {
        listingId: activeConversation.listingId,
        receiverId: activeConversation.landlordId,
        content: content.trim(),
      });
      return response.data.message;
    },
    onSuccess: (newMessage) => {
      setLocalMessages((prev) => {
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
      if (activeConversation?.isPlaceholder) {
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      }
    },
    onError: () => toast.error("Failed to send message"),
  });

  const markReadMutation = useMutation({
    mutationFn: async ({ listingId, landlordId }: { listingId: string; landlordId: string }) => {
      await axios.put("/api/messages/mark-read", { listingId, otherUserId: landlordId });
    },
    onSuccess: (_, { listingId, landlordId }) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.listingId === listingId && conv.landlordId === landlordId
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async ({ listingId, otherUserId, isArchived }: { listingId: string; otherUserId: string; isArchived: boolean }) => {
      await axios.put("/api/tenant/conversations/archive", { listingId, otherUserId, isArchived });
    },
    onError: () => toast.error("Failed to update archive status"),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!activeConversation) return;
      await axios.delete(`/api/messages?listingId=${activeConversation.listingId}&otherUserId=${activeConversation.landlordId}`);
    },
    onSuccess: () => {
      toast.success("Conversation history deleted");
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setActiveConversationState(null);
      setLocalMessages([]);
    },
    onError: () => toast.error("Failed to delete history"),
  });

  // Actions
  const sendMessage = (content: string) => sendMutation.mutate(content);

  const archiveConversation = async (listingId: string, otherUserId: string) => {
    archiveMutation.mutate({ listingId, otherUserId, isArchived: true });
    setConversations((prev) =>
      prev.map((conv) =>
        conv.listingId === listingId && conv.landlordId === otherUserId
          ? { ...conv, isPendingArchive: true, isArchived: false }
          : conv
      )
    );
    setActiveConversationState((prev) =>
      prev?.listingId === listingId && prev?.landlordId === otherUserId
        ? { ...prev, isPendingArchive: true, isArchived: false }
        : prev
    );
  };

  const undoArchive = useCallback(async (listingId: string, otherUserId: string) => {
    archiveMutation.mutate({ listingId, otherUserId, isArchived: false });
    setConversations((prev) =>
      prev.map((conv) =>
        conv.listingId === listingId && conv.landlordId === otherUserId
          ? { ...conv, isPendingArchive: false, isArchived: false }
          : conv
      )
    );
    setActiveConversationState((prev) =>
      prev?.listingId === listingId && prev?.landlordId === otherUserId
        ? { ...prev, isPendingArchive: false, isArchived: false }
        : prev
    );
  }, [archiveMutation]);

  const commitArchive = useCallback((listingId: string, otherUserId: string) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.listingId === listingId && conv.landlordId === otherUserId
          ? { ...conv, isArchived: true, isPendingArchive: false }
          : conv
      )
    );
  }, []);

  const unarchiveConversation = async (listingId: string, otherUserId: string) => {
    archiveMutation.mutate({ listingId, otherUserId, isArchived: false });
    setConversations((prev) =>
      prev.map((conv) =>
        conv.listingId === listingId && conv.landlordId === otherUserId
          ? { ...conv, isPendingUnarchive: true, isArchived: true }
          : conv
      )
    );
    setActiveConversationState((prev) =>
      prev?.listingId === listingId && prev?.landlordId === otherUserId
        ? { ...prev, isPendingUnarchive: true, isArchived: true }
        : prev
    );
  };

  const undoUnarchive = useCallback(async (listingId: string, otherUserId: string) => {
    archiveMutation.mutate({ listingId, otherUserId, isArchived: true });
    setConversations((prev) =>
      prev.map((conv) =>
        conv.listingId === listingId && conv.landlordId === otherUserId
          ? { ...conv, isPendingUnarchive: false, isArchived: true }
          : conv
      )
    );
    setActiveConversationState((prev) =>
      prev?.listingId === listingId && prev?.landlordId === otherUserId
        ? { ...prev, isPendingUnarchive: false, isArchived: true }
        : prev
    );
  }, [archiveMutation]);

  const commitUnarchive = useCallback((listingId: string, otherUserId: string) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.listingId === listingId && conv.landlordId === otherUserId
          ? { ...conv, isArchived: false, isPendingUnarchive: false }
          : conv
      )
    );
  }, []);

  const markAsUnread = useCallback(async (listingId: string, otherUserId: string) => {
    try {
      await axios.put("/api/messages/mark-unread", { listingId, otherUserId });
      setConversations((prev) =>
        prev.map((conv) =>
          conv.listingId === listingId && conv.landlordId === otherUserId
            ? { ...conv, unreadCount: conv.unreadCount + 1 }
            : conv
        )
      );
      toast.success("Marked as unread");
    } catch {
      toast.error("Failed to mark as unread");
    }
  }, [toast]);

  // Effects
  useEffect(() => {
    if (activeConversation && activeConversation.unreadCount > 0) {
      markReadMutation.mutate({
        listingId: activeConversation.listingId,
        landlordId: activeConversation.landlordId,
      });
    }
  }, [activeConversation?.listingId, activeConversation?.landlordId, activeConversation?.unreadCount]);

  // Pusher real-time updates
  useEffect(() => {
    if (!activeConversation) return;

    const channelName = `private-chat-${activeConversation.listingId}-${[currentUserId, activeConversation.landlordId].sort().join("-")}`;
    const channel = pusherClient.subscribe(channelName);

    channel.bind("new-message", (newMessage: Message) => {
      setLocalMessages((prev) => {
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });

      setConversations((prev) => {
        const index = prev.findIndex(
          (c) =>
            c.listingId === newMessage.listingId &&
            (c.landlordId === newMessage.senderId || c.landlordId === newMessage.receiverId)
        );

        if (index === -1) {
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
          return prev;
        }

        const updatedConversations = [...prev];
        const conv = updatedConversations[index];

        updatedConversations[index] = {
          ...conv,
          lastMessage: newMessage.content,
          lastMessageTime: newMessage.createdAt,
          unreadCount: newMessage.senderId !== currentUserId ? conv.unreadCount + 1 : conv.unreadCount,
        };

        const item = updatedConversations.splice(index, 1)[0];
        return [item, ...updatedConversations];
      });
    });

    return () => {
      pusherClient.unsubscribe(channelName);
    };
  }, [activeConversation, currentUserId, queryClient]);

  return {
    conversations,
    activeConversation,
    setActiveConversation,
    messages: localMessages,
    isLoading: isMessagesLoading,
    isSending: sendMutation.isPending,
    sendMessage,
    fetchConversations: refetchConversations,
    archiveConversation,
    undoArchive,
    commitArchive,
    unarchiveConversation,
    undoUnarchive,
    commitUnarchive,
    deleteConversation: deleteMutation.mutate,
    markAsUnread,
  };
};

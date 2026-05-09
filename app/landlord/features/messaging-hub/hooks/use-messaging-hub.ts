"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { pusherClient } from "@/lib/pusher-client";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

export interface Conversation {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  tenantId: string;
  tenantName: string;
  tenantImage: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isArchived: boolean;
  isPendingArchive?: boolean;   // DB archived, UI still in "All" during undo window
  isPendingUnarchive?: boolean; // DB unarchived, UI still in "Archived" during undo window
  inquiryId?: string;
  isPlaceholder?: boolean;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  listingId: string;
  read: boolean;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    image: string;
  };
}

export function useMessagingHub(initialConversations: Conversation[] = [], isWindowActive: boolean = true) {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const deepListingId = searchParams.get("listingId");
  const deepTenantId = searchParams.get("tenantId");

  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeConversation, setActiveConversationState] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(initialConversations.length === 0);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Keep a ref to isWindowActive so Pusher callbacks always have the latest value 
  // without needing to re-subscribe to the channel every time the window toggles
  const isWindowActiveRef = useRef(isWindowActive);
  useEffect(() => {
    isWindowActiveRef.current = isWindowActive;
  }, [isWindowActive]);

  // Custom setter to seamlessly purge ghost placeholders when navigating away
  const setActiveConversation = useCallback((conv: Conversation | null) => {
    if (conv) {
      setConversations((prev) => prev.filter(c => !c.isPlaceholder || c.id === conv.id));
    } else {
      setConversations((prev) => prev.filter(c => !c.isPlaceholder));
    }
    setActiveConversationState(conv);
  }, []);

  // 1. Fetch all conversations for the inbox sidebar
  const fetchConversations = useCallback(async () => {
    try {
      const response = await axios.get("/api/landlord/messages");
      if (response.data.success) {
        const fetchedConvs: Conversation[] = response.data.data;
        
        setConversations(currentConvs => {
          // 1. Identify current placeholders
          const placeholders = currentConvs.filter(c => c.isPlaceholder);
          
          // 2. Map fetched conversations and preserve local pending states
          const merged = fetchedConvs.map(fetched => {
            const local = currentConvs.find(c => c.id === fetched.id);
            if (local?.isPendingArchive || local?.isPendingUnarchive) {
              return { 
                ...fetched, 
                isPendingArchive: local.isPendingArchive, 
                isPendingUnarchive: local.isPendingUnarchive,
                isArchived: local.isArchived
              };
            }
            return fetched;
          });

          // 3. Re-inject placeholders that aren't already represented in the DB
          const result = [...merged];
          placeholders.forEach(p => {
            const alreadyExists = merged.some(m => m.listingId === p.listingId && m.tenantId === p.tenantId);
            if (!alreadyExists) {
              result.unshift(p);
            }
          });

          return result;
        });
      }
    } catch (error) {
      console.error("Failed to fetch conversations", error);
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  // 2. Fetch message history for the selected conversation
  const fetchMessages = useCallback(async (listingId: string, tenantId: string) => {
    setIsLoadingMessages(true);
    try {
      const response = await axios.get(`/api/messages?listingId=${listingId}&otherUserId=${tenantId}`);
      if (response.data.ok) {
        setMessages(response.data.messages.reverse());
      }
    } catch (error) {
      console.error("Failed to fetch messages", error);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // 3. Send a message
  const sendMessage = async (content: string) => {
    if (!activeConversation || !content.trim()) return;

    setIsSending(true);
    try {
      const response = await axios.post("/api/landlord/messages", {
        listingId: activeConversation.listingId,
        receiverId: activeConversation.tenantId,
        content,
      });

      if (response.data.success) {
        setMessages((prev) => {
          const exists = prev.some(m => m.id === response.data.data.id);
          if (exists) return prev;
          return [...prev, response.data.data];
        });

        // If this was a placeholder, it's now a real conversation in DB
        if (activeConversation?.isPlaceholder) {
          await fetchConversations();
        }
      }
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  // ── Archive (Phase 1) ────────────────────────────────────────────────────────
  // Updates DB immediately. Locally marks isPendingArchive so conv stays in "All"
  const archiveConversation = useCallback(async () => {
    if (!activeConversation) return;
    try {
      await axios.patch("/api/landlord/messages", {
        listingId: activeConversation.listingId,
        tenantId: activeConversation.tenantId,
        archive: true
      });
      const update = { isPendingArchive: true, isArchived: false };
      setConversations(prev => prev.map(conv =>
        conv.id === activeConversation.id ? { ...conv, ...update } : conv
      ));
      setActiveConversationState(prev =>
        prev?.id === activeConversation.id ? { ...prev, ...update } : prev
      );
    } catch {
      toast.error("Failed to archive");
    }
  }, [activeConversation]);

  // Undo archive: reverts DB + clears pending flag
  const undoArchive = useCallback(async (convId: string, listingId: string, tenantId: string) => {
    try {
      await axios.patch("/api/landlord/messages", { listingId, tenantId, archive: false });
      const update = { isPendingArchive: false, isArchived: false };
      setConversations(prev => prev.map(conv =>
        conv.id === convId ? { ...conv, ...update } : conv
      ));
      setActiveConversationState(prev =>
        prev?.id === convId ? { ...prev, ...update } : prev
      );
    } catch {
      toast.error("Failed to undo archive");
    }
  }, []);

  // Commit archive: DB already done — just update UI to move conv to "Archived"
  const commitArchive = useCallback((convId: string) => {
    setConversations(prev => prev.map(conv =>
      conv.id === convId ? { ...conv, isArchived: true, isPendingArchive: false } : conv
    ));
  }, []);

  // ── Unarchive (Phase 1) ──────────────────────────────────────────────────────
  // Updates DB immediately. Locally marks isPendingUnarchive so conv stays in "Archived"
  const unarchiveConversation = useCallback(async () => {
    if (!activeConversation) return;
    try {
      await axios.patch("/api/landlord/messages", {
        listingId: activeConversation.listingId,
        tenantId: activeConversation.tenantId,
        archive: false
      });
      const update = { isPendingUnarchive: true, isArchived: true };
      setConversations(prev => prev.map(conv =>
        conv.id === activeConversation.id ? { ...conv, ...update } : conv
      ));
      setActiveConversationState(prev =>
        prev?.id === activeConversation.id ? { ...prev, ...update } : prev
      );
    } catch {
      toast.error("Failed to unarchive");
    }
  }, [activeConversation]);

  // Undo unarchive: reverts DB + clears pending flag (conv stays in "Archived")
  const undoUnarchive = useCallback(async (convId: string, listingId: string, tenantId: string) => {
    try {
      await axios.patch("/api/landlord/messages", { listingId, tenantId, archive: true });
      const update = { isPendingUnarchive: false, isArchived: true };
      setConversations(prev => prev.map(conv =>
        conv.id === convId ? { ...conv, ...update } : conv
      ));
      setActiveConversationState(prev =>
        prev?.id === convId ? { ...prev, ...update } : prev
      );
    } catch {
      toast.error("Failed to undo unarchive");
    }
  }, []);

  // Commit unarchive: DB already done — just update UI to move conv to "All"
  const commitUnarchive = useCallback((convId: string) => {
    setConversations(prev => prev.map(conv =>
      conv.id === convId ? { ...conv, isArchived: false, isPendingUnarchive: false } : conv
    ));
  }, []);

  // Delete conversation
  const deleteConversation = async () => {
    if (!activeConversation) return;
    try {
      const response = await axios.delete(`/api/landlord/messages?listingId=${activeConversation.listingId}&tenantId=${activeConversation.tenantId}`);
      if (response.data.success) {
        toast.success("Conversation history deleted");
        fetchConversations();
        setActiveConversationState(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete history");
    }
  };

  // Mark messages as read (clears unread badge)
  const markAsRead = useCallback(async (listingId: string, tenantId: string) => {
    try {
      await axios.put("/api/landlord/messages", { listingId, tenantId });
      // Locally clear unread count
      setConversations(prev => prev.map(conv =>
        conv.listingId === listingId && conv.tenantId === tenantId
          ? { ...conv, unreadCount: 0 }
          : conv
      ));
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  }, []);

  // Mark as unread (uses the isMarkedUnreadByLandlord field)
  const markAsUnread = useCallback(async (listingId: string, tenantId: string) => {
    try {
      await axios.put("/api/messages/mark-unread", { listingId, otherUserId: tenantId });
      setConversations(prev => prev.map(conv =>
        conv.listingId === listingId && conv.tenantId === tenantId
          ? { ...conv, unreadCount: conv.unreadCount + 1 }
          : conv
      ));
      toast.success("Marked as unread");
    } catch (error) {
      console.error("Failed to mark as unread", error);
      toast.error("Failed to mark as unread");
    }
  }, []);

  // Remove auto-fetch on mount if we have initial conversations
  useEffect(() => {
    if (conversations.length === 0) {
      fetchConversations();
    }
  }, [fetchConversations]);

  // Fetch messages - only when the conversation ID changes
  useEffect(() => {
    if (activeConversation?.id) {
      fetchMessages(activeConversation.listingId, activeConversation.tenantId);
    }
  }, [activeConversation?.id, fetchMessages]);

  // Mark as read - only when unreadCount changes OR when the window becomes active
  useEffect(() => {
    if (isWindowActive && activeConversation && activeConversation.unreadCount > 0) {
      markAsRead(activeConversation.listingId, activeConversation.tenantId);
    }
  }, [activeConversation?.id, activeConversation?.unreadCount, isWindowActive, markAsRead]);

  // Real-time Pusher Subscription
  useEffect(() => {
    if (!activeConversation || !session?.user?.id) return;

    const currentUserId = session.user.id;
    const otherUserId = activeConversation.tenantId;
    const listingId = activeConversation.listingId;

    const channelName = `private-chat-${listingId}-${[currentUserId, otherUserId].sort().join("-")}`;
    const channel = pusherClient.subscribe(channelName);

    channel.bind("new-message", (newMessage: Message) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === newMessage.id);
        if (exists) return prev;
        return [...prev, newMessage];
      });

      // If we are currently looking at this conversation AND the window is open, mark the new message as read immediately
      if (isWindowActiveRef.current && 
          activeConversation && 
          newMessage.listingId === activeConversation.listingId && 
          newMessage.senderId === activeConversation.tenantId) {
        markAsRead(activeConversation.listingId, activeConversation.tenantId);
      }

      fetchConversations();
    });

    return () => {
      pusherClient.unsubscribe(channelName);
      channel.unbind_all();
    };
  }, [activeConversation, session?.user?.id, fetchConversations]);

  // Global Real-time Notification Listener (for Badge/Inbox updates)
  useEffect(() => {
    if (!session?.user?.id) return;

    const userChannelName = `private-user-${session.user.id}`;
    const userChannel = pusherClient.subscribe(userChannelName);

    userChannel.bind("message-notification", (data: any) => {
      // Something happened in the messaging world, refresh the inbox
      fetchConversations();

      // If we have an active chat and this notification is for that chat, refresh the messages too
      // (This handles syncing messages sent from other instances/modals)
      if (activeConversation && 
          data.listingId === activeConversation.listingId && 
          (data.senderId === activeConversation.tenantId || data.senderId === session.user.id)) {
        fetchMessages(activeConversation.listingId, activeConversation.tenantId);
      }
    });

    return () => {
      pusherClient.unsubscribe(userChannelName);
      userChannel.unbind_all();
    };
  }, [session?.user?.id, fetchConversations]);

  return {
    conversations,
    activeConversation,
    setActiveConversation,
    messages,
    setMessages,
    isLoadingConversations,
    isLoadingMessages,
    isSending,
    sendMessage,
    archiveConversation,
    undoArchive,
    commitArchive,
    unarchiveConversation,
    undoUnarchive,
    commitUnarchive,
    deleteConversation,
    markAsRead,
    markAsUnread,
    refreshConversations: fetchConversations,
  };
}

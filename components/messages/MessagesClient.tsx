"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMessages, TenantConversation } from "@/hooks/use-messages";
import ConversationsList from "./ConversationsList";
import ChatView from "./ChatView";
import { ChatInfoPanel } from "./ChatInfoPanel";
import { cn } from "@/utils/helper";
import Modal from "@/components/modals/Modal";
import { motion } from "framer-motion";
import Heading from "@/components/common/Heading";
import { useResponsiveToast } from "@/components/common/ResponsiveToast";
import { useNotification } from "@/context/NotificationContext";
import { IconChevronLeft } from "@tabler/icons-react";

interface MessagesClientProps {
  initialConversations: TenantConversation[];
  currentUserId: string;
  currentUserImage?: string | null;
  currentUserName?: string | null;
}

const MessagesClient: React.FC<MessagesClientProps> = ({
  initialConversations,
  currentUserId
}) => {
  const searchParams = useSearchParams();
  const toast = useResponsiveToast();
  const { 
    conversations, 
    activeConversation, 
    setActiveConversation, 
    messages, 
    isLoading, 
    isSending, 
    sendMessage,
    archiveConversation,
    undoArchive,
    commitArchive,
    unarchiveConversation,
    undoUnarchive,
    commitUnarchive,
    markAsUnread,
    deleteConversation
  } = useMessages(initialConversations, currentUserId);
  const { notifications, markAsRead } = useNotification();

  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [showInfo, setShowInfo] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Responsive check for Info Panel (Desktop vs Mobile)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Keep a stable ref to the active conversation so useCallback closures don't go stale
  const activeConvRef = useRef(activeConversation);
  useEffect(() => { activeConvRef.current = activeConversation; }, [activeConversation]);

  // Track if we have already auto-selected from URL to prevent re-opening on close
  const hasAutoSelected = useRef(false);

  // ── Stable callbacks (useCallback prevents ChatView timer from resetting on re-render) ──
  const handleBack = useCallback(() => setMobileView("list"), []);
  const handleToggleInfo = useCallback(() => setShowInfo(prev => !prev), []);

  // Called when the 5s undo timer expires — commits the pending move then closes the panel
  const handleCloseChat = useCallback(() => {
    const conv = activeConvRef.current;
    if (conv?.isPendingArchive) {
      commitArchive(conv.listingId, conv.landlordId);
      toast.success({ title: "Conversation Archived", description: "This chat has been moved to your archive." });
    }
    else if (conv?.isPendingUnarchive) {
      commitUnarchive(conv.listingId, conv.landlordId);
      toast.success({ title: "Conversation Restored", description: "This chat has been moved back to your inbox." });
    }
    setActiveConversation(null);
    setMobileView("list");
    // Ensure we don't re-trigger auto-select after a manual close
    hasAutoSelected.current = true;
  }, [commitArchive, commitUnarchive, setActiveConversation, toast]);

  // Handle URL Deep Linking
  useEffect(() => {
    if (hasAutoSelected.current || conversations.length === 0) return;

    const listingId = searchParams.get("listingId");
    const otherUserId = searchParams.get("otherUserId");

    if (listingId && otherUserId) {
      const match = conversations.find(c => c.listingId === listingId && c.landlordId === otherUserId);
      if (match) {
        setActiveConversation(match);
        hasAutoSelected.current = true;
        setMobileView("chat");
      }
    }
  }, [searchParams, conversations, setActiveConversation]);

  // We no longer auto-select the first conversation on mobile so the user sees their inbox list first.

  // Clear unread notifications from context when a conversation is active
  useEffect(() => {
    if (activeConversation) {
      const relatedNotifications = notifications.filter(
        n => !n.isRead && n.type === "message" && n.link.includes(activeConversation.listingId)
      );
      relatedNotifications.forEach(n => markAsRead(n.id, "message"));
    }
  }, [activeConversation, notifications, markAsRead]);

  // Quick Return to chat via visible floating tab on the right edge
  // Also supporting the original Double Tap on the right edge for additional navigation
  const lastTap = useRef<number>(0);
  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (activeConversation) setMobileView("chat");
    }
    lastTap.current = now;
  };

  return (
    <section className="w-full px-0 md:px-8 lg:px-12 py-0 md:py-4 flex flex-col h-full overflow-hidden">
      <div className="w-full flex h-[calc(100dvh-80px)] fixed inset-0 bottom-[80px] md:relative md:inset-auto md:h-[calc(100vh-120px)] max-h-[900px] md:mt-0 bg-white dark:bg-gray-900 overflow-hidden md:rounded-[2.5rem] md:border border-gray-100 dark:border-gray-800 shadow-glass z-0 md:z-auto">
      {/* Sidebar - Conversations List */}
      <motion.div 
        className={cn(
          "w-full md:w-[380px] h-full md:flex-shrink-0 transition-all z-20 relative min-w-0",
          mobileView === "chat" ? "hidden md:flex" : "flex"
        )}
        drag={isMobile ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.05}
        onDragEnd={(_, info) => {
          if (!isMobile) return;
          // Swipe Left to go to chat
          if (info.offset.x < -40 && activeConversation) {
            setMobileView("chat");
          }
        }}
        style={{ touchAction: 'pan-y' }}
      >
        <ConversationsList 
          conversations={conversations}
          activeId={activeConversation?.id}
          onSelect={(conv) => {
            setActiveConversation(conv);
            setMobileView("chat");
          }}
          isLoading={false}
        />

        {/* Quick-Return Tab (Visible on mobile when viewing list but a chat is active) */}
        {isMobile && activeConversation && mobileView === "list" && (
          <div 
            onClick={() => setMobileView("chat")}
            className="absolute top-1/2 right-0 -translate-y-1/2 bg-white dark:bg-gray-800 shadow-[0_4px_20px_rgba(0,0,0,0.15)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-gray-700 border-r-0 rounded-l-2xl py-3 px-1 z-30 cursor-pointer active:bg-gray-50 flex items-center justify-center animate-pulse-slow"
          >
            <div className="flex flex-col items-center gap-1 opacity-60">
              <div className="w-1 h-6 bg-gray-400 dark:bg-gray-500 rounded-full" />
              <IconChevronLeft className="w-4 h-4 text-gray-500 dark:text-gray-400 rotate-180 -ml-0.5" />
            </div>
          </div>
        )}

        {/* Double Tap Quick-Return Zone (Additional Navigation) */}
        {isMobile && activeConversation && mobileView === "list" && (
          <div 
            onClick={handleDoubleTap}
            className="absolute top-0 right-0 w-12 h-full z-20 cursor-pointer active:bg-primary/10 transition-colors"
            title="Double tap to return to chat"
          />
        )}
      </motion.div>

      {/* Main Chat Area */}
      <motion.div 
        className={cn(
          "flex-1 h-full min-w-0 transition-all relative",
          mobileView === "list" ? "hidden md:flex" : "flex"
        )}
      >
        {/* Native-feeling Edge Swipe Zone to go back */}
        {isMobile && mobileView === "chat" && (
          <motion.div
            className="absolute top-0 left-0 w-6 h-full z-30 touch-pan-y"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.05}
            onDragEnd={(_, info) => {
              if (info.offset.x > 40) {
                setMobileView("list");
              }
            }}
          />
        )}

        <div className="flex-1 h-full min-w-0 flex transition-all">
          <ChatView 
            activeConversation={activeConversation}
            messages={messages}
            currentUserId={currentUserId}
            isLoading={isLoading}
            isSending={isSending}
            onSendMessage={sendMessage}
            onBack={handleBack}
            showInfo={showInfo}
            onToggleInfo={handleToggleInfo}
            onArchive={() => activeConversation && archiveConversation(activeConversation.listingId, activeConversation.landlordId)}
            onUndoArchive={() => { const c = activeConvRef.current; c && undoArchive(c.listingId, c.landlordId); }}
            onUnarchive={() => activeConversation && unarchiveConversation(activeConversation.listingId, activeConversation.landlordId)}
            onUndoUnarchive={() => { const c = activeConvRef.current; c && undoUnarchive(c.listingId, c.landlordId); }}
            onMarkUnread={() => activeConversation && markAsUnread(activeConversation.listingId, activeConversation.landlordId)}
            onDelete={deleteConversation}
            onCloseChat={handleCloseChat}
          />
        </div>

        {/* Desktop Info Sidebar */}
        {showInfo && activeConversation && (
          <div className="hidden lg:block shrink-0 overflow-hidden w-[340px] border-l border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all">
             <ChatInfoPanel 
                activeConversation={activeConversation} 
                activeId={activeConversation.id} 
              />
          </div>
        )}
      </motion.div>

      {/* Mobile Info Modal */}
      <Modal 
        isOpen={isMobile && showInfo && activeConversation !== null} 
        onClose={() => setShowInfo(false)}
        title="Conversation Details"
      >
        <div className="max-h-[80vh] overflow-y-auto p-4 scrollbar-hide">
          {activeConversation && (
             <ChatInfoPanel 
               activeConversation={activeConversation} 
               activeId={activeConversation.id} 
             />
          )}
        </div>
      </Modal>
      </div>
    </section>
  );
};

export default MessagesClient;

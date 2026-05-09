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

  const [mobileView, setMobileView] = useState<"list" | "chat">("chat");
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

  // Auto-select the first conversation on mobile if none is selected
  useEffect(() => {
    if (isMobile && !activeConversation && conversations.length > 0 && !hasAutoSelected.current) {
      setActiveConversation(conversations[0]);
      setMobileView("chat");
    }
  }, [isMobile, activeConversation, conversations, setActiveConversation]);

  // Handle Double Tap for Quick Return
  const lastTap = useRef<number>(0);
  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (activeConversation) setMobileView("chat");
    }
    lastTap.current = now;
  };

  return (
    <section className="main-container py-0 md:py-8 flex flex-col h-full overflow-hidden">
      <div className="hidden md:block">
        <Heading 
          title="Messages" 
          subtitle="Stay connected with your landlords and boarding house owners"
          backBtn 
        />
      </div>
      
      <div className="flex h-[calc(100dvh-80px)] md:h-[calc(100vh-280px)] max-h-[900px] md:mt-8 bg-white dark:bg-gray-900 overflow-hidden md:rounded-[2.5rem] md:border border-gray-100 dark:border-gray-800 shadow-glass relative">
      {/* Sidebar - Conversations List */}
      <motion.div 
        className={cn(
          "w-full md:w-[380px] h-full md:flex-shrink-0 transition-all z-20 relative min-w-0",
          activeConversation && mobileView === "chat" ? "hidden md:flex" : "flex"
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

        {/* Double Tap Quick-Return Zone (The Line) */}
        {isMobile && activeConversation && (
          <div 
            onClick={handleDoubleTap}
            className="absolute top-0 right-0 w-12 h-full z-30 cursor-pointer active:bg-primary/10 transition-colors"
            title="Double tap to return to chat"
          />
        )}
      </motion.div>

      {/* Main Chat Area */}
      <motion.div 
        className="flex-1 h-full min-w-0 flex"
        drag={isMobile ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.05}
        onDragEnd={(_, info) => {
          if (!isMobile) return;
          // Swipe Right to go to list
          if (info.offset.x > 40) {
            setMobileView("list");
          }
        }}
        style={{ touchAction: 'pan-y' }}
      >
        <div className={cn(
          "flex-1 h-full min-w-0 transition-all",
          !activeConversation && mobileView === "list" ? "hidden md:flex" : "flex"
        )}>
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

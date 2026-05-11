"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useMessagingHub } from "./hooks/use-messaging-hub";
import { ConversationsList } from "./components/conversations-list";
import { ChatView } from "./components/chat-view";
import { ChatInfoPanel } from "./components/chat-info-panel";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { cn } from "@/utils/helper";
import { IconX, IconMessage } from "@tabler/icons-react";

/**
 * Landlord Messaging Hub (Inbox)
 * The main entry point for the centralized messaging system.
 * Adopts a 2-column SaaS-style layout for professional communication management.
 */
export default function MessagingHub({ 
  initialConversations,
  initialActiveConversation,
  onClose
}: { 
  initialConversations: any[],
  initialActiveConversation?: any,
  onClose?: () => void
}) {
  const [showInfo, setShowInfo] = useState(false);
  const searchParams = useSearchParams();
  const {
    conversations,
    activeConversation,
    setActiveConversation,
    messages,
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
    markAsUnread
  } = useMessagingHub(initialConversations);

  // Stable ref for callbacks
  const activeConvRef = useRef(activeConversation);
  useEffect(() => {
    activeConvRef.current = activeConversation;
  }, [activeConversation]);

  // Track if we have already auto-selected from URL to prevent re-opening on close
  const hasAutoSelected = useRef(false);

  // Handle initial active conversation if passed from widget expansion
  useEffect(() => {
    if (initialActiveConversation) {
      setActiveConversation(initialActiveConversation);
      hasAutoSelected.current = true;
    }
  }, [initialActiveConversation, setActiveConversation]);

  // Handle URL Deep Linking
  useEffect(() => {
    if (hasAutoSelected.current || conversations.length === 0) return;

    const listingId = searchParams.get("listingId");
    const tenantId = searchParams.get("tenantId");

    if (listingId && tenantId) {
      const match = conversations.find(c => c.listingId === listingId && c.tenantId === tenantId);
      if (match) {
        setActiveConversation(match);
        hasAutoSelected.current = true;
      }
    }
  }, [searchParams, conversations, setActiveConversation]);

  const handleSelect = useCallback((conv: any) => {
    setActiveConversation(conv);
    setShowInfo(false);
  }, [setActiveConversation]);

  const handleToggleInfo = useCallback(() => {
    setShowInfo(prev => !prev);
  }, []);

  const handleCloseChat = useCallback(() => {
    const conv = activeConvRef.current;
    if (conv?.isPendingArchive) {
      commitArchive(conv.id);
    } else if (conv?.isPendingUnarchive) {
      commitUnarchive(conv.id);
    }
    setActiveConversation(null);
    // Ensure we don't re-trigger auto-select after a manual close
    hasAutoSelected.current = true;
  }, [commitArchive, commitUnarchive, setActiveConversation]);

  return (
    <div className="relative w-full h-full max-w-[1600px] flex flex-col items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={cn(
          "flex flex-col w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 mx-auto relative",
          onClose ? "h-[90vh]" : "h-[calc(100vh-100px)]"
        )}
      >
        {/* Pro Header Bar - Only in Overlay Mode */}
        {onClose && (
          <div className="w-full px-8 py-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <IconMessage size={22} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Messaging Hub</h2>
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-0.5">Enterprise Communication</p>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="p-3 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-gray-400 hover:text-rose-500 rounded-2xl transition-all active:scale-90 flex items-center gap-2 group"
            >
              <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all mr-2">Close Hub</span>
              <IconX size={20} strokeWidth={3} />
            </button>
          </div>
        )}

        {/* Main Body: Sidebar + Chat */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Sidebar - 380px fixed width */}
          <div className="w-[380px] shrink-0 border-r border-gray-100 dark:border-gray-800 overflow-hidden">
            <ConversationsList 
              conversations={conversations}
              activeId={activeConversation?.id}
              onSelect={handleSelect}
              isLoading={isLoadingConversations}
            />
          </div>

          {/* Main Chat Area - Flexible width */}
          <div className="flex-1 min-w-0 bg-white dark:bg-gray-900 flex">
            <div className="flex-1 min-w-0">
              <ChatView 
                activeConversation={activeConversation}
                messages={messages}
                isSending={isSending}
                onSendMessage={sendMessage}
                isLoading={isLoadingMessages}
                onToggleInfo={handleToggleInfo}
                showInfo={showInfo}
                onArchive={archiveConversation}
                onUndoArchive={() => {
                  const c = activeConvRef.current;
                  if (c) undoArchive(c.id, c.listingId, c.tenantId);
                }}
                onUnarchive={unarchiveConversation}
                onUndoUnarchive={() => {
                  const c = activeConvRef.current;
                  if (c) undoUnarchive(c.id, c.listingId, c.tenantId);
                }}
                onDelete={deleteConversation}
                onMarkUnread={() => {
                  const c = activeConvRef.current;
                  if (c) markAsUnread(c.listingId, c.tenantId);
                }}
                onCloseChat={handleCloseChat}
              />
            </div>

            {/* Action/Info Sidebar - Flexible width based on showInfo */}
            <AnimatePresence>
              {showInfo && activeConversation && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 340, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="shrink-0 overflow-hidden"
                >
                  <ChatInfoPanel activeConversation={activeConversation} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

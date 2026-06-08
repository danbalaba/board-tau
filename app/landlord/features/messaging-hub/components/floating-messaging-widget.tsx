'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconMessage, 
  IconX, 
  IconChevronLeft,
  IconSearch,
  IconDotsVertical,
  IconSend,
  IconArrowsMaximize
} from '@tabler/icons-react';
import { useMessagingHub } from '../hooks/use-messaging-hub';
import { ConversationsList } from './conversations-list';
import { ChatView } from './chat-view';
import MessagingHub from '../index';
import { cn } from '@/utils/helper';
import { useSession } from 'next-auth/react';
import { createPortal } from 'react-dom';
import { useSearchParams, useRouter } from 'next/navigation';

const FloatingMessagingWidget = () => {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isFullView, setIsFullView] = useState(false);
  const [view, setView] = useState<'list' | 'chat'>('list');
  const [showInfo, setShowInfo] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    markAsUnread,
    refreshConversations
  } = useMessagingHub([], isOpen);

  const lastProcessedLink = useRef<string | null>(null);

  // Handle URL Deep Linking for Messaging Overlay
  useEffect(() => {
    if (!mounted || isLoadingConversations) return;
    
    const currentParams = searchParams.toString();
    if (currentParams === lastProcessedLink.current) return;

    const openChat = searchParams.get('openChat');
    const listingId = searchParams.get('listingId');
    const tenantId = searchParams.get('tenantId');

    if (openChat === 'true') {
      setIsOpen(true);
      
      if (listingId && tenantId) {
        const match = conversations.find(c => c.listingId === listingId && c.tenantId === tenantId);
        if (match) {
          setActiveConversation(match);
          setView('chat');
        } else {
          // If no existing conversation, check if we have enough data to build a placeholder
          const tenantName = searchParams.get('tenantName');
          const tenantImage = searchParams.get('tenantImage');
          const listingTitle = searchParams.get('listingTitle');
          const listingImage = searchParams.get('listingImage');
          
          if (tenantName && listingTitle) {
            const placeholder = {
              id: `${listingId}_${tenantId}`,
              listingId: listingId,
              listingTitle: listingTitle,
              listingImage: listingImage || '',
              tenantId: tenantId,
              tenantName: tenantName,
              tenantImage: tenantImage || '',
              lastMessage: '',
              lastMessageTime: new Date().toISOString(),
              unreadCount: 0,
              isArchived: false,
              isPlaceholder: true
            };
            setActiveConversation(placeholder);
            setView('chat');
          }
        }
      }
      
      // Clean up URL without refreshing to prevent re-triggering on manual refresh
      const params = new URLSearchParams(searchParams.toString());
      params.delete('openChat');
      params.delete('listingId');
      params.delete('tenantId');
      params.delete('tenantName');
      params.delete('tenantImage');
      params.delete('listingTitle');
      params.delete('listingImage');
      const newPath = params.toString() ? `?${params.toString()}` : '';
      lastProcessedLink.current = searchParams.toString(); 
      router.replace(`${window.location.pathname}${newPath}`, { scroll: false });
    }
  }, [searchParams, conversations, mounted, setActiveConversation, router, isLoadingConversations]);
  
  // Handle Instant Client-Side Opening via Custom Event
  useEffect(() => {
    const handleOpenChat = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { listingId, tenantId, tenantName, tenantImage, listingTitle, listingImage } = customEvent.detail;
      
      setIsOpen(true);
      
      const match = conversations.find(c => c.listingId === listingId && c.tenantId === tenantId);
      if (match) {
        setActiveConversation(match);
        setView('chat');
      } else {
        const placeholder = {
          id: `${listingId}_${tenantId}`,
          listingId,
          listingTitle,
          listingImage: listingImage || '',
          tenantId,
          tenantName,
          tenantImage: tenantImage || '',
          lastMessage: '',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0,
          isArchived: false,
          isPlaceholder: true
        };
        setActiveConversation(placeholder);
        setView('chat');
      }
    };

    window.addEventListener('open-landlord-chat', handleOpenChat);
    return () => window.removeEventListener('open-landlord-chat', handleOpenChat);
  }, [conversations, setActiveConversation]);

  const totalUnread = conversations.filter(c => !c.isArchived).reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  const handleSelectConversation = (conv: any) => {
    setActiveConversation(conv);
    setView('chat');
  };

  const handleBackToList = () => {
    setActiveConversation(null);
    setView('list');
  };

  if (!session?.user) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-[380px] sm:w-[420px] h-[600px] max-h-[80vh] bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col"
          >
            {/* Widget Header */}
            <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 shrink-0">
              <div className="flex items-center gap-3">
                {view === 'chat' && (
                  <button 
                    onClick={handleBackToList}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-500"
                  >
                    <IconChevronLeft size={20} />
                  </button>
                )}
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white leading-none">
                    {view === 'list' ? 'Messages' : activeConversation?.tenantName}
                  </h3>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">
                    {view === 'list' ? 'Inbox' : activeConversation?.listingTitle}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => {
                    setIsFullView(true);
                    setIsOpen(false);
                  }}
                  title="Expand to full view"
                  className="p-2 hover:bg-primary/10 text-gray-400 hover:text-primary rounded-xl transition-all"
                >
                  <IconArrowsMaximize size={18} />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-gray-400 hover:text-rose-500 rounded-xl transition-all"
                >
                  <IconX size={20} />
                </button>
              </div>
            </div>

            {/* Widget Body */}
            <div className="flex-1 overflow-hidden relative">
              {view === 'list' ? (
                <ConversationsList 
                  conversations={conversations}
                  activeId={activeConversation?.id}
                  onSelect={handleSelectConversation}
                  isLoading={isLoadingConversations}
                />
              ) : (
                <ChatView 
                  activeConversation={activeConversation}
                  messages={messages}
                  isSending={isSending}
                  onSendMessage={sendMessage}
                  isLoading={isLoadingMessages}
                  onToggleInfo={() => setShowInfo(!showInfo)}
                  showInfo={showInfo}
                  onArchive={archiveConversation}
                  onUndoArchive={() => activeConversation && undoArchive(activeConversation.id, activeConversation.listingId, activeConversation.tenantId)}
                  onUnarchive={unarchiveConversation}
                  onUndoUnarchive={() => activeConversation && undoUnarchive(activeConversation.id, activeConversation.listingId, activeConversation.tenantId)}
                  onDelete={deleteConversation}
                  onMarkUnread={() => activeConversation && markAsUnread(activeConversation.listingId, activeConversation.tenantId)}
                  onCloseChat={handleBackToList}
                  hideInfo={true}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-5 rounded-[2rem] shadow-2xl transition-all duration-500",
          isOpen 
            ? "bg-rose-500 text-white rotate-90" 
            : "bg-primary text-white"
        )}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
            >
              <IconX size={28} strokeWidth={2.5} />
            </motion.div>
          ) : (
            <motion.div
              key="message"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
            >
              <IconMessage size={28} strokeWidth={2.5} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Persistent Unread Badge with Original Rose Styling */}
        {totalUnread > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-[24px] h-[24px] bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900 shadow-lg px-1 z-[101]"
          >
            {totalUnread > 9 ? '9+' : totalUnread}
          </motion.div>
        )}

        {/* Original Pulse effect when unread */}
        {totalUnread > 0 && (
          <span className="absolute inset-0 rounded-[2rem] bg-rose-500 animate-ping opacity-20 pointer-events-none" />
        )}
      </motion.button>

      {/* Full Screen Overlay Portal */}
      {mounted && createPortal(
        <AnimatePresence>
          {isFullView && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-4 md:p-8"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="w-full h-full max-w-[1600px] max-h-[95vh]"
              >
                <MessagingHub 
                  initialConversations={conversations} 
                  initialActiveConversation={activeConversation}
                  onClose={() => setIsFullView(false)} 
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default FloatingMessagingWidget;

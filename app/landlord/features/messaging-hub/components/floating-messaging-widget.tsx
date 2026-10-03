'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconMessage, 
  IconX, 
  IconChevronLeft,
  IconArrowsMaximize,
  IconGripVertical
} from '@tabler/icons-react';
import { useMessagingHub } from '../hooks/use-messaging-hub';
import { ConversationsList } from './conversations-list';
import { ChatView } from './chat-view';
import MessagingHub from '../index';
import { cn } from '@/utils/helper';
import { useSession } from 'next-auth/react';
import { createPortal } from 'react-dom';
import { useSearchParams, useRouter } from 'next/navigation';

export function FloatingMessagingWidget() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isFullView, setIsFullView] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [view, setView] = useState<'list' | 'chat'>('list');
  const [showInfo, setShowInfo] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dragConstraints, setDragConstraints] = useState({ top: -200, bottom: 200 });

  useEffect(() => {
    setMounted(true);

    const updateConstraints = () => {
      if (typeof window !== 'undefined') {
        const halfHeight = window.innerHeight / 2;
        setDragConstraints({
          top: -halfHeight + 80,
          bottom: halfHeight - 120
        });
      }
    };

    updateConstraints();
    window.addEventListener('resize', updateConstraints);
    return () => window.removeEventListener('resize', updateConstraints);
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
    markAsUnread
  } = useMessagingHub([], isOpen || isMobileOpen || isFullView);

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
      setIsMobileOpen(true);
      
      if (listingId && tenantId) {
        const match = conversations.find(c => c.listingId === listingId && c.tenantId === tenantId);
        if (match) {
          setActiveConversation(match);
          setView('chat');
        } else {
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
      setIsMobileOpen(true);
      
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
    <>
      {/* 1. MOBILE PEEKING TAB (left edge anchored, draggable vertically on mobile) */}
      <motion.div
        drag="y"
        dragMomentum={false}
        dragElastic={0.05}
        dragConstraints={dragConstraints}
        className="md:hidden fixed left-0 top-1/2 -translate-y-1/2 z-[100] touch-none cursor-grab active:cursor-grabbing"
      >
        <motion.button
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsMobileOpen(true)}
          className={cn(
            "relative flex items-center gap-1.5 py-3 pl-2 pr-3 rounded-r-2xl shadow-2xl border-y border-r transition-colors duration-300 backdrop-blur-xl group cursor-grab active:cursor-grabbing",
            totalUnread > 0 
              ? "bg-rose-500 text-white border-rose-400/50 shadow-rose-500/30" 
              : "bg-primary text-white border-white/20 shadow-primary/30"
          )}
          title="Drag vertically to reposition. Tap to open Landlord Messages Inbox"
        >
          {/* Vertical Grip Handle Indicator */}
          <IconGripVertical size={14} className="text-white/60 shrink-0 -mr-0.5" />

          <div className="relative">
            <IconMessage size={22} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
            {totalUnread > 0 && (
              <span className="absolute -top-2.5 -right-2.5 min-w-[18px] h-[18px] bg-white text-rose-600 text-[9px] font-black flex items-center justify-center rounded-full border border-rose-500 shadow-md px-1">
                {totalUnread > 9 ? '9+' : totalUnread}
              </span>
            )}
          </div>

          {/* Ambient Glow / Pulse Indicator */}
          {totalUnread > 0 && (
            <span className="absolute inset-0 rounded-r-2xl bg-white/20 animate-pulse pointer-events-none" />
          )}
        </motion.button>
      </motion.div>

      {/* 2. MOBILE FULL SCREEN CHAT OVERLAY PORTAL */}
      {mounted && createPortal(
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ opacity: 0, x: '-100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="md:hidden fixed inset-0 z-[10000] bg-white dark:bg-gray-900 flex flex-col antialiased overflow-hidden"
            >
              {/* Mobile Fullscreen Header */}
              <div className="px-4 py-3.5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between shrink-0 shadow-sm">
                <div className="flex items-center gap-3">
                  {view === 'chat' ? (
                    <button 
                      onClick={handleBackToList}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl transition-colors flex items-center gap-1"
                    >
                      <IconChevronLeft size={20} strokeWidth={2.5} />
                      <span className="text-xs font-black uppercase tracking-wider">Inbox</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <IconMessage size={20} strokeWidth={2.5} />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-gray-900 dark:text-white leading-none">
                          Messages
                        </h3>
                        <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-0.5">
                          Inbox
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 rounded-full transition-all active:scale-90"
                  title="Close Messaging"
                >
                  <IconX size={20} strokeWidth={2.5} />
                </button>
              </div>

              {/* Mobile Fullscreen Content Body */}
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
        </AnimatePresence>,
        document.body
      )}

      {/* 3. DESKTOP FLOATING WIDGET (visible on md: and above) */}
      <div className="hidden md:flex fixed bottom-8 right-8 z-[100] flex-col items-end">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: 'bottom right' }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="mb-4 w-[380px] sm:w-[420px] h-[600px] max-h-[80vh] bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col"
            >
              {/* Desktop Widget Header */}
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

              {/* Desktop Widget Body */}
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

        {/* Floating Toggle Button (Desktop) */}
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

          {totalUnread > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 min-w-[24px] h-[24px] bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900 shadow-lg px-1 z-[101]"
            >
              {totalUnread > 9 ? '9+' : totalUnread}
            </motion.div>
          )}

          {totalUnread > 0 && (
            <span className="absolute inset-0 rounded-[2rem] bg-rose-500 animate-ping opacity-20 pointer-events-none" />
          )}
        </motion.button>
      </div>

      {/* Full Screen Overlay Portal (Desktop expand) */}
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
    </>
  );
}

export default FloatingMessagingWidget;

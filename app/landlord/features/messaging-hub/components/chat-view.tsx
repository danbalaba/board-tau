"use client";

import React, { useRef, useEffect, useState } from "react";
import Avatar from "@/components/common/Avatar";
import { Message, Conversation } from "../hooks/use-messaging-hub";
import { cn } from "@/utils/helper";
import { 
  IconSend, 
  IconUser, 
  IconInfoCircle, 
  IconDotsVertical,
  IconClock,
  IconExternalLink,
  IconArchive,
  IconRefresh,
  IconTrash,
  IconMail
} from "@tabler/icons-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Modal from "@/components/modals/Modal";
import ConfirmModal from "@/components/common/ConfirmModal";

interface ChatViewProps {
  activeConversation: Conversation | null;
  messages: Message[];
  isSending: boolean;
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  onToggleInfo: () => void;
  showInfo: boolean;
  onArchive: () => void;
  onUndoArchive?: () => void;
  onUnarchive: () => void;
  onUndoUnarchive?: () => void;
  onDelete: () => void;
  onMarkUnread?: () => void;
  onCloseChat?: () => void;
  hideInfo?: boolean;
}

export const ChatView: React.FC<ChatViewProps> = ({
  activeConversation,
  messages,
  isSending,
  onSendMessage,
  isLoading,
  onToggleInfo,
  showInfo,
  onArchive,
  onUndoArchive,
  onUnarchive,
  onUndoUnarchive,
  onDelete,
  onMarkUnread,
  onCloseChat,
  hideInfo
}) => {
  const [inputValue, setInputValue] = useState("");
  const [showActions, setShowActions] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  // Unified Undo State
  const [undoState, setUndoState] = useState<{ action: "archived" | "unarchived" | null; timeLeft: number }>({ action: null, timeLeft: 5 });

  // Auto-scroll to bottom when messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Undo Action Banner Timer
  useEffect(() => {
    if (!undoState.action) return;

    const interval = setInterval(() => {
      setUndoState((prev) => ({ ...prev, timeLeft: prev.timeLeft > 0 ? prev.timeLeft - 1 : 0 }));
    }, 1000);

    const timeout = setTimeout(() => {
      setUndoState({ action: null, timeLeft: 5 });
      onCloseChat?.();
    }, 5000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [undoState.action, onCloseChat]);

  // Reset banner when picking a different conversation
  useEffect(() => {
    setUndoState({ action: null, timeLeft: 5 });
  }, [activeConversation?.id]);

  const handleArchive = () => {
    onArchive?.();
    setUndoState({ action: "archived", timeLeft: 5 });
    setShowActions(false);
  };

  const handleUnarchive = () => {
    onUnarchive?.();
    setUndoState({ action: "unarchived", timeLeft: 5 });
    setShowActions(false);
  };

  const handleUndo = () => {
    if (undoState.action === "archived") onUndoArchive?.();
    else if (undoState.action === "unarchived") onUndoUnarchive?.();
    setUndoState({ action: null, timeLeft: 5 });
  };

  const handleSend = () => {
    if (!inputValue.trim() || isSending) return;
    onSendMessage(inputValue);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!activeConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-950/50 p-12 text-center">
        <div className="w-24 h-24 bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 flex items-center justify-center mb-6">
           <IconUser size={40} className="text-gray-200 dark:text-gray-700" />
        </div>
        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Your Conversations</h3>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 max-w-xs">
          Select a tenant from the left to view messages and manage your property inquiries.
        </p>
      </div>
    );
  }

  const isArchived = activeConversation.isArchived;

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#020817] overflow-hidden relative">
      {/* Chat Header */}
      <div className="px-8 py-5 border-b border-gray-100 dark:border-gray-800 flex flex-col backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 sticky top-0 z-20">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <Avatar 
              src={activeConversation.tenantImage} 
              name={activeConversation.tenantName} 
              className="w-12 h-12 rounded-2xl shadow-md"
            />
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white leading-none mb-1">
                {activeConversation.tenantName}
              </h3>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.15em]">
                  Active Inquiry: {activeConversation.listingTitle}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 relative">
            {!hideInfo && (
              <button 
                onClick={onToggleInfo}
                className={cn(
                  "p-3 rounded-2xl transition",
                  showInfo 
                    ? "bg-primary/10 text-primary" 
                    : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-400"
                )}
              >
                <IconInfoCircle size={20} />
              </button>
            )}
            
            <div className="relative">
              <button 
                onClick={() => setShowActions(!showActions)}
                className={cn(
                  "p-3 rounded-2xl transition",
                  showActions 
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-900" 
                    : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-400"
                )}
              >
                <IconDotsVertical size={20} />
              </button>

              <AnimatePresence>
                {showActions && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowActions(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-2 z-20"
                    >
                      {!isArchived ? (
                        <>
                          <button 
                            onClick={handleArchive}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-colors text-sm font-bold text-gray-600 dark:text-gray-300"
                          >
                            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                               <IconArchive size={16} />
                            </div>
                            Archive Chat
                          </button>
                          <button 
                            onClick={() => {
                              if (onMarkUnread) {
                                onMarkUnread();
                                onCloseChat?.();
                              }
                              setShowActions(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-colors text-sm font-bold text-gray-600 dark:text-gray-300"
                          >
                            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                               <IconMail size={16} />
                            </div>
                            Mark as unread
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={handleUnarchive}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-colors text-sm font-bold text-gray-600 dark:text-gray-300"
                          >
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                               <IconRefresh size={16} />
                            </div>
                            Unarchive Chat
                          </button>
                           <button 
                             onClick={() => {
                               setShowDeleteModal(true);
                               setShowActions(false);
                             }}
                             className="w-full flex items-center gap-3 px-4 py-3 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-2xl transition-colors text-sm font-bold text-rose-500"
                           >
                            <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                               <IconTrash size={16} />
                            </div>
                            Delete History
                          </button>
                        </>
                      )}
                      
                      <div className="h-px bg-gray-50 dark:bg-gray-800 my-2 mx-2" />
                      <button 
                        onClick={() => window.location.href = `/landlord/properties?listingId=${activeConversation.listingId}`}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-colors text-sm font-bold text-gray-600 dark:text-gray-300"
                      >
                         <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                            <IconExternalLink size={16} />
                         </div>
                         View Listing
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Undo Banner Integrated into Header */}
        <AnimatePresence>
          {undoState.action && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <IconArchive size={16} />
                  </div>
                  <p className="text-xs font-bold text-amber-800 dark:text-amber-200">
                    This conversation is {undoState.action}.
                  </p>
                </div>
                <button 
                  onClick={handleUndo}
                  className="px-4 py-2 bg-white dark:bg-amber-800/50 text-amber-800 dark:text-amber-100 text-xs font-black uppercase tracking-widest rounded-xl shadow-sm border border-amber-100 dark:border-amber-800 hover:scale-105 active:scale-95 transition-all"
                >
                  Undo ({undoState.timeLeft}s)
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide"
      >
        {isLoading ? (
          <div className="space-y-6">
            <div className="flex flex-col items-start max-w-[70%]">
              <Skeleton width={200} height={40} borderRadius={20} />
              <Skeleton width={60} height={10} className="mt-2" />
            </div>
            <div className="flex flex-col items-end ml-auto max-w-[70%]">
              <Skeleton width={150} height={40} borderRadius={20} />
              <Skeleton width={60} height={10} className="mt-2" />
            </div>
            <div className="flex flex-col items-start max-w-[70%]">
              <Skeleton width={250} height={60} borderRadius={20} />
              <Skeleton width={60} height={10} className="mt-2" />
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
             <IconClock size={40} className="mb-4" />
             <p className="text-sm font-bold italic tracking-wide">No messages shared yet.</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId !== activeConversation.tenantId;
            
            return (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                key={msg.id}
                className={cn(
                  "flex flex-col max-w-[75%] md:max-w-[70%] min-w-0",
                  isMe ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div className={cn(
                  "px-5 py-4 rounded-[2rem] text-sm font-medium shadow-sm transition-all break-all whitespace-pre-wrap overflow-hidden w-fit",
                  isMe 
                    ? "bg-primary text-white rounded-tr-none shadow-primary/10" 
                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none border border-gray-50 dark:border-gray-700/50"
                )}>
                  {msg.content}
                </div>
                <span className="mt-2 text-[9px] font-black uppercase tracking-widest text-gray-400 opacity-60">
                   {format(new Date(msg.createdAt), "hh:mm a")} • {isMe ? "Sent" : "Received"}
                </span>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div className="p-8 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#020817] z-20">
        <div className="relative flex items-end gap-4 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-inner focus-within:border-primary/20 focus-within:bg-white dark:focus-within:bg-gray-900 transition-all">
          <textarea 
            ref={textareaRef}
            rows={1}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${activeConversation.tenantName}...`}
            className="flex-1 bg-transparent border-none outline-none py-3 px-4 text-sm font-medium resize-none max-h-32 min-h-[44px] break-all"
          />
          <button 
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending}
            className={cn(
              "p-4 rounded-full transition-all active:scale-90 disabled:opacity-50",
              inputValue.trim() 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "bg-gray-100 dark:bg-gray-800 text-gray-400"
            )}
          >
            <IconSend size={20} />
          </button>
        </div>
      </div>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => {
            onDelete();
            setShowDeleteModal(false);
          }}
          title="Delete Conversation History"
          message={`Are you sure you want to permanently delete all messages with ${activeConversation.tenantName}? This action is permanent and cannot be undone.`}
          confirmLabel="Delete Permanently"
          variant="danger"
        />
      </Modal>
    </div>
  );
};

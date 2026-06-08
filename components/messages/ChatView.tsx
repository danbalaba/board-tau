"use client";

import React, { useState, useEffect, useRef } from "react";
import { TenantConversation, Message } from "@/hooks/use-messages";
import Avatar from "@/components/common/Avatar";
import { cn } from "@/utils/helper";
import { 
  IconSend, 
  IconInfoCircle, 
  IconChevronLeft, 
  IconMessageCircle2, 
  IconArchive, 
  IconArchiveOff,
  IconDotsVertical,
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
import { useResponsiveToast } from "@/components/common/ResponsiveToast";

interface ChatViewProps {
  activeConversation: TenantConversation | null;
  messages: Message[];
  currentUserId: string;
  isLoading: boolean;
  isSending: boolean;
  onSendMessage: (content: string) => void;
  onBack?: () => void; // For mobile
  showInfo?: boolean;
  onToggleInfo?: () => void;
  onArchive?: () => void;
  onUndoArchive?: () => void;
  onUnarchive?: () => void;
  onUndoUnarchive?: () => void;
  onDelete?: () => void;
  onMarkUnread?: () => void;
  onCloseChat?: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({
  activeConversation,
  messages,
  currentUserId,
  isLoading,
  isSending,
  onSendMessage,
  onBack,
  showInfo,
  onToggleInfo,
  onArchive,
  onUndoArchive,
  onUnarchive,
  onUndoUnarchive,
  onDelete,
  onMarkUnread,
  onCloseChat
}) => {
  const [inputValue, setInputValue] = useState("");
  const [showActions, setShowActions] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toast = useResponsiveToast();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  // Unified Undo State
  const [undoState, setUndoState] = useState<{ action: "archived" | "unarchived" | null; timeLeft: number }>({ action: null, timeLeft: 5 });

  // Auto-scroll to bottom

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
  };

  const handleUnarchive = () => {
    onUnarchive?.();
    setUndoState({ action: "unarchived", timeLeft: 5 });
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
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/30">
        <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-700 flex items-center justify-center text-primary mb-6">
          <IconSend size={32} />
        </div>
        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Your Inbox</h3>
        <p className="text-sm font-medium text-gray-400 max-w-xs text-center">
          Select a conversation from the left to start messaging your host.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="md:hidden p-2 -ml-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <IconChevronLeft size={24} />
          </button>
          
          <Avatar 
            src={activeConversation.landlordImage} 
            name={activeConversation.landlordName} 
            className="w-10 h-10 rounded-xl"
          />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-black text-gray-900 dark:text-white leading-none mb-1 truncate">
              {activeConversation.landlordName}
            </h3>
            <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none truncate">
              Host of {activeConversation.listingTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 relative">
          <button 
             onClick={onToggleInfo}
             className={cn(
               "p-2 rounded-xl transition-colors",
               showInfo ? "bg-primary/10 text-primary" : "text-gray-400 hover:text-gray-900 dark:hover:text-white"
             )}
          >
             <IconInfoCircle size={20} />
          </button>

          <div className="relative">
            <button 
              onClick={() => setShowActions(!showActions)}
              className={cn(
                "p-2 rounded-xl transition-colors",
                showActions 
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white" 
                  : "text-gray-400 hover:text-gray-900 dark:hover:text-white"
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
                    {!activeConversation.isArchived ? (
                      <>
                        <button 
                          onClick={() => {
                            if (onMarkUnread) {
                              onMarkUnread();
                              toast.success("Conversation marked as unread");
                              onCloseChat?.();
                            }
                            setShowActions(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-colors text-sm font-bold text-gray-600 dark:text-gray-300"
                        >
                          <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                             <IconMail size={16} />
                          </div>
                          Mark as unread
                        </button>
                        <button 
                          onClick={() => {
                            handleArchive();
                            setShowActions(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-colors text-sm font-bold text-gray-600 dark:text-gray-300"
                        >
                          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                             <IconArchive size={16} />
                          </div>
                          Archive Chat
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => {
                            handleUnarchive();
                            setShowActions(false);
                          }}
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
            className="overflow-hidden bg-white dark:bg-gray-900 px-6"
          >
            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-2xl flex items-center justify-between shadow-sm">
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
                className="px-4 py-2 bg-white dark:bg-amber-800/50 text-amber-800 dark:text-amber-100 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm border border-amber-100 dark:border-amber-800 hover:scale-105 active:scale-95 transition-all"
              >
                Undo ({undoState.timeLeft}s)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages List */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth"
      >
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className={cn("flex", i % 2 === 0 ? "justify-end" : "justify-start")}>
                <Skeleton 
                  width={i % 2 === 0 ? 200 : 150} 
                  height={40} 
                  borderRadius={16} 
                  enableAnimation={false} 
                />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-60 py-20">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-primary border-2 border-dashed border-gray-200 dark:border-gray-700">
               <IconMessageCircle2 size={24} />
            </div>
            <div className="text-center">
               <p className="text-sm font-black text-gray-900 dark:text-white mb-1">
                 No messages yet
               </p>
               <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                 Send a message to start chatting with {activeConversation.landlordName}
               </p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === currentUserId;
            const showDate = idx === 0 || 
              new Date(messages[idx-1].createdAt).toDateString() !== new Date(msg.createdAt).toDateString();

            return (
              <React.Fragment key={msg.id}>
                {showDate && (
                  <div className="flex justify-center my-6">
                    <span className="px-3 py-1 rounded-full bg-gray-50 dark:bg-gray-800 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {format(new Date(msg.createdAt), "MMMM d, yyyy")}
                    </span>
                  </div>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex flex-col max-w-[75%] md:max-w-[70%] min-w-0 slow-ease-in-out",
                    isMe ? "ml-auto items-end" : "items-start"
                  )}
                >
                  <div className={cn(
                    "px-4 py-2.5 rounded-2xl text-sm font-medium shadow-sm break-all whitespace-pre-wrap overflow-hidden w-fit",
                    isMe 
                      ? "bg-primary text-white rounded-br-none shadow-primary/10" 
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none"
                  )}>
                    {msg.content}
                  </div>
                  <span className="text-[9px] font-bold text-gray-400 mt-1 px-1">
                    {format(new Date(msg.createdAt), "h:mm a")}
                  </span>
                </motion.div>
              </React.Fragment>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 sm:p-6 pt-2">
        {activeConversation.isArchived || activeConversation.isPendingArchive ? (
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-700/20 rounded-[2rem] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <IconArchive size={20} />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs font-black text-amber-900 dark:text-amber-100 uppercase tracking-widest leading-tight">
                  Archived Conversation
                </p>
                <p className="text-[10px] font-bold text-amber-700/70 dark:text-amber-400/50 leading-tight">
                  Unarchive this chat to send a new message.
                </p>
              </div>
            </div>
            <button
              onClick={activeConversation.isPendingArchive ? handleUndo : handleUnarchive}
              className="w-full sm:w-auto px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <IconRefresh size={14} />
              Unarchive Chat
            </button>
          </div>
        ) : (
          <div className="relative bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] p-2 border border-gray-100 dark:border-gray-800 focus-within:border-primary/20 focus-within:bg-white dark:focus-within:bg-gray-800 transition-all flex items-center gap-2">
            <textarea 
              ref={textareaRef}
              rows={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="flex-1 bg-transparent border-none outline-none py-3 px-4 text-sm font-medium resize-none max-h-32 min-h-[44px] break-all text-gray-900 dark:text-white placeholder:text-gray-400"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isSending}
              className={cn(
                "p-3 rounded-full transition-all shrink-0",
                inputValue.trim() && !isSending
                  ? "bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-400"
              )}
            >
              <IconSend size={20} />
            </button>
          </div>
        )}
      </div>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => {
            if (onDelete) {
              onDelete();
            } else {
              toast.info('Delete action called. Database integration pending.', { icon: '🚧' });
            }
            setShowDeleteModal(false);
          }}
          title="Delete Conversation History"
          message={`Are you sure you want to permanently delete all messages with ${activeConversation.landlordName}? This action is permanent and cannot be undone.`}
          confirmLabel="Delete Permanently"
          variant="danger"
        />
      </Modal>
    </div>
  );
};


export default ChatView;

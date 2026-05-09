"use client";

import React, { useState } from "react";
import Avatar from "@/components/common/Avatar";
import { Conversation } from "../hooks/use-messaging-hub";
import { cn } from "@/utils/helper";
import SafeImage from "@/components/common/SafeImage";
import { IconSearch, IconFilter, IconCircleFilled, IconCheck, IconX } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface ConversationsListProps {
  conversations: Conversation[];
  activeId?: string;
  onSelect: (conv: Conversation) => void;
  isLoading: boolean;
}

export const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  activeId,
  onSelect,
  isLoading
}) => {
  const [filter, setFilter] = useState<"all" | "unread" | "archived">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Get unique listings for the filter dropdown
  const uniqueListings = Array.from(new Set(conversations.map(c => c.listingTitle))).sort();

  const unreadCount = conversations.filter(c => c.unreadCount > 0 && !c.isArchived).length;
  const archivedCount = conversations.filter(c => c.isArchived).length;

  const filteredConversations = conversations
    .filter(conv => 
      conv.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.listingTitle.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(conv => {
      if (selectedListing && conv.listingTitle !== selectedListing) return false;
      
      if (filter === "archived") return conv.isArchived;
      if (filter === "unread") return conv.unreadCount > 0 && !conv.isArchived;
      return !conv.isArchived; // "all" only shows non-archived
    });

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800">
      {/* Header & Search */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Messages</h2>
          <div className="relative">
            <button 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={cn(
                "p-2 rounded-xl transition relative",
                selectedListing 
                  ? "bg-primary/10 text-primary" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
              )}
            >
              <IconFilter size={20} />
              {selectedListing && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary border-2 border-white dark:border-gray-900 rounded-full" />
              )}
            </button>

            <AnimatePresence>
              {showFilterDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setShowFilterDropdown(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-2 z-40 origin-top-right"
                  >
                    <div className="px-4 py-2 mb-1">
                       <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Filter by Property</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        setSelectedListing(null);
                        setShowFilterDropdown(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all",
                        !selectedListing ? "bg-primary/5 text-primary" : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                      )}
                    >
                      All Properties
                      {!selectedListing && <IconCheck size={14} />}
                    </button>

                    <div className="h-px bg-gray-50 dark:bg-gray-800 my-1 mx-2" />
                    
                    <div className="max-h-60 overflow-y-auto scrollbar-hide">
                      {uniqueListings.map((listing) => (
                        <button
                          key={listing}
                          onClick={() => {
                            setSelectedListing(listing);
                            setShowFilterDropdown(false);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left",
                            selectedListing === listing ? "bg-primary/5 text-primary" : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                          )}
                        >
                          <span className="truncate pr-2">{listing}</span>
                          {selectedListing === listing && <IconCheck size={14} />}
                        </button>
                      ))}
                    </div>

                    {selectedListing && (
                      <>
                        <div className="h-px bg-gray-50 dark:bg-gray-800 my-1 mx-2" />
                        <button
                          onClick={() => {
                            setSelectedListing(null);
                            setShowFilterDropdown(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all justify-center"
                        >
                          <IconX size={12} /> Clear Filter
                        </button>
                      </>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="relative group">
          <IconSearch 
            size={18} 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" 
          />
          <input 
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-gray-800 rounded-2xl text-sm font-medium outline-none transition-all"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 pt-2 overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => setFilter("all")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap",
              filter === "all" ? "bg-primary/10 text-primary" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            )}
          >
            All
            <span className={cn(
              "px-1.5 py-0.5 rounded-lg text-[10px]",
              filter === "all" ? "bg-primary text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500"
            )}>
              {conversations.filter(c => !c.isArchived).length}
            </span>
          </button>
          
          <button 
            onClick={() => setFilter("unread")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap",
              filter === "unread" ? "bg-primary/10 text-primary" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            )}
          >
            Unread
            <span className={cn(
              "px-1.5 py-0.5 rounded-lg text-[10px]",
              filter === "unread" ? "bg-primary text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500"
            )}>
              {unreadCount}
            </span>
          </button>

          <button 
            onClick={() => setFilter("archived")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap",
              filter === "archived" ? "bg-primary/10 text-primary" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            )}
          >
            Archived
            <span className={cn(
              "px-1.5 py-0.5 rounded-lg text-[10px]",
              filter === "archived" ? "bg-primary text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500"
            )}>
              {archivedCount}
            </span>
          </button>
        </div>
      </div>

      {/* List content */}
      <div className="flex-1 overflow-y-auto px-3 pb-6 space-y-1 scrollbar-hide">
        {isLoading ? (
          <div className="space-y-4 px-3 mt-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton width={48} height={48} borderRadius={16} enableAnimation={false} />
                <div className="flex-1 space-y-2">
                  <Skeleton width="60%" height={12} enableAnimation={false} />
                  <Skeleton width="40%" height={8} enableAnimation={false} />
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="py-20 text-center px-6">
             <p className="text-sm font-bold text-gray-400 italic">
               {searchQuery 
                 ? "No conversations found matching your search." 
                 : filter === "unread" 
                   ? "You're all caught up! No unread messages." 
                   : filter === "archived" 
                     ? "You have no archived conversations." 
                     : "No messages yet."}
             </p>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isActive = activeId === conv.id && !conv.isPendingArchive && !conv.isPendingUnarchive;
            
            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv)}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-[1.5rem] transition-all relative group",
                  isActive 
                    ? "bg-primary/5 dark:bg-primary/10 border border-primary/10" 
                    : conv.isPendingArchive || conv.isPendingUnarchive
                      ? "bg-amber-50/70 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-700/20 opacity-60"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent"
                )}
              >
                {/* Unread Indicator */}
                {conv.unreadCount > 0 && !isActive && (
                  <div className="absolute left-1 top-1/2 -translate-y-1/2">
                    <IconCircleFilled size={8} className="text-primary" />
                  </div>
                )}

                <div className="relative shrink-0">
                  <Avatar 
                    src={conv.tenantImage} 
                    name={conv.tenantName} 
                    className="w-12 h-12 rounded-2xl shadow-sm border border-white dark:border-gray-800" 
                  />
                  <SafeImage 
                    src={conv.listingImage} 
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg border-2 border-white dark:border-gray-900 object-cover shadow-sm"
                    alt=""
                  />
                </div>

                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className={cn(
                      "text-sm font-black truncate leading-none",
                      isActive ? "text-primary" : "text-gray-900 dark:text-gray-100"
                    )}>
                      {conv.tenantName}
                    </h4>
                    {conv.isPendingArchive || conv.isPendingUnarchive ? (
                      <span className="text-[9px] font-black uppercase tracking-widest text-amber-500 shrink-0 px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                        {conv.isPendingArchive ? "Archiving..." : "Restoring..."}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-gray-400 shrink-0">
                        {formatDistanceToNow(new Date(conv.lastMessageTime), { addSuffix: false })}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-[10px] font-black text-primary/60 dark:text-primary/40 uppercase tracking-widest mb-1 truncate">
                    {conv.listingTitle}
                  </p>

                  <p className={cn(
                    "text-xs truncate leading-tight",
                    conv.unreadCount > 0 && !isActive ? "font-bold text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400 font-medium"
                  )}>
                    {conv.isPlaceholder ? "Start a conversation..." : conv.lastMessage}
                  </p>
                </div>

                {/* Hover indicator */}
                {!isActive && !conv.isPendingArchive && !conv.isPendingUnarchive && (
                   <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                   </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

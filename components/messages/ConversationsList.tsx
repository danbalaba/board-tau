"use client";

import React, { useState } from "react";
import Avatar from "@/components/common/Avatar";
import { TenantConversation } from "@/hooks/use-messages";
import { cn } from "@/utils/helper";
import { IconSearch, IconCircleFilled } from "@tabler/icons-react";
import BackButton from "@/components/common/BackButton";
import { formatDistanceToNow } from "date-fns";
import Skeleton from "react-loading-skeleton";
import SafeImage from "@/components/common/SafeImage";
import "react-loading-skeleton/dist/skeleton.css";

interface ConversationsListProps {
  conversations: TenantConversation[];
  activeId?: string;
  onSelect: (conv: TenantConversation) => void;
  isLoading: boolean;
}

const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  activeId,
  onSelect,
  isLoading
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "archived">("all");

  const unreadCount = conversations.filter(c => c.unreadCount > 0 && !c.isArchived).length;
  const archivedCount = conversations.filter(c => c.isArchived).length;

  const filteredConversations = conversations.filter(conv => {
    // 1. Text Search Filter
    const matchesSearch = conv.landlordName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          conv.listingTitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 2. Status Filter
    let matchesStatus = true;
    if (filter === "all") matchesStatus = !conv.isArchived;
    if (filter === "unread") matchesStatus = conv.unreadCount > 0 && !conv.isArchived;
    if (filter === "archived") matchesStatus = conv.isArchived;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col h-full min-w-0 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800">
      {/* Header & Search */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">My Messages</h2>
          <div className="md:hidden">
            <BackButton />
          </div>
        </div>
        
        <div className="relative group">
          <IconSearch 
            size={18} 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" 
          />
          <input 
            type="text"
            placeholder="Search hosts or listings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-gray-800 rounded-2xl text-sm font-medium outline-none transition-all"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 pt-1 overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => setFilter("all")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap",
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
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap",
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
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap",
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
            {[1, 2, 3, 4].map(i => (
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
             <p className="text-sm font-medium text-gray-400 italic">
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
                {conv.unreadCount > 0 && !isActive && (
                  <div className="absolute left-1 top-1/2 -translate-y-1/2">
                    <IconCircleFilled size={8} className="text-primary" />
                  </div>
                )}

                <div className="relative shrink-0">
                  <Avatar 
                    src={conv.landlordImage} 
                    name={conv.landlordName} 
                    className="w-12 h-12 rounded-2xl shadow-sm border border-white dark:border-gray-800" 
                  />
                  <SafeImage 
                    src={conv.listingImage} 
                    containerClassName="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg overflow-hidden z-10 shadow-sm border-2 border-white dark:border-gray-900"
                    className="object-cover"
                    alt=""
                  />
                </div>

                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className={cn(
                      "text-sm font-black truncate leading-none",
                      isActive ? "text-primary" : "text-gray-900 dark:text-gray-100"
                    )}>
                      {conv.landlordName}
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
                  
                  <p className="text-[10px] font-semibold text-primary/60 dark:text-primary/40 uppercase tracking-widest mb-1 truncate">
                    {conv.listingTitle}
                  </p>

                  <p className={cn(
                    "text-xs truncate leading-tight max-w-[180px] sm:max-w-[240px] md:max-w-none",
                    conv.unreadCount > 0 && !isActive ? "font-semibold text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400 font-medium"
                  )}>
                    {conv.isPlaceholder ? "Start a conversation..." : conv.lastMessage}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationsList;

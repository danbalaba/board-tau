'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { useNotificationStore } from '../utils/store';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { cn } from '@/utils/helper';
import { 
  Bell, 
  Mail, 
  Calendar, 
  MessageSquare, 
  Star, 
  ArrowRight, 
  CheckCheck, 
  Settings, 
  Loader2, 
  Inbox 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const MAX_VISIBLE = 5;

const actionRoutes: Record<string, string> = {
  view: '/admin'
};

export function NotificationCenter() {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotificationStore();
  const router = useRouter();
  
  const count = typeof unreadCount === 'function' ? unreadCount() : unreadCount;
  const visibleNotifications = notifications.slice(0, MAX_VISIBLE);
  const isLoading = false;

  const removeEmoji = (text?: string) => {
    if (!text) return '';
    return text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'inquiry': return <Mail size={18} className="text-primary" />;
      case 'reservation': return <Calendar size={18} className="text-emerald-500" />;
      case 'message': return <MessageSquare size={18} className="text-blue-500" />;
      case 'review': return <Star size={18} className="text-amber-500" />;
      default: return <Bell size={18} className="text-primary" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'inquiry': return 'bg-primary/10 border-primary/20';
      case 'reservation': return 'bg-emerald-500/10 border-emerald-500/20';
      case 'message': return 'bg-blue-500/10 border-blue-500/20';
      case 'review': return 'bg-amber-500/10 border-amber-500/20';
      default: return 'bg-primary/10 border-primary/20';
    }
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2.5 text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-primary/10 rounded-2xl transition-all group active:scale-95 outline-none cursor-pointer">
          <Bell size={22} className="group-hover:rotate-12 transition-transform" />
          {count > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1.5 bg-primary text-[10px] font-black text-white rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-900 shadow-md shadow-primary/30 z-10 leading-none"
            >
              {count > 9 ? '9+' : count}
            </motion.span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-96 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800/80 p-2 backdrop-blur-xl bg-white/95 dark:bg-[#111827]/95 overflow-hidden z-[100]"
        align="end"
        sideOffset={12}
      >
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between bg-gray-50/80 dark:bg-gray-800/40 rounded-t-[2rem] mb-2 border-b border-gray-100 dark:border-gray-800/60">
          <div>
            <h3 className="font-black text-lg tracking-tight text-gray-900 dark:text-white uppercase">Notifications</h3>
            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-0.5">
              {count > 0 ? `${count} Unread Alert${count === 1 ? '' : 's'}` : 'All caught up'}
            </p>
          </div>
          <div className="p-2.5 bg-primary/10 text-primary rounded-2xl border border-primary/20 shadow-sm">
             <Bell size={18} />
          </div>
        </div>
        
        {/* Scrollable Notification List */}
        <div className="max-h-[380px] overflow-y-auto px-2 space-y-1.5 scrollbar-hide py-1">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-16 flex flex-col items-center justify-center gap-3 opacity-60"
              >
                 <Loader2 size={32} className="animate-spin text-primary" />
                 <p className="text-[10px] font-black text-primary uppercase tracking-widest">Fetching Updates...</p>
              </motion.div>
            ) : notifications.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="py-14 flex flex-col items-center justify-center text-center px-8"
              >
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4 border border-primary/20 shadow-inner group transition-transform hover:scale-105">
                  <Inbox size={30} />
                </div>
                <h4 className="font-black text-gray-900 dark:text-white text-base mb-1 uppercase tracking-tight">You're All Caught Up!</h4>
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 leading-relaxed max-w-[240px]">
                  You have no pending alerts or system notifications at the moment.
                </p>
              </motion.div>
            ) : (
              <motion.div key="list" className="space-y-1.5">
                <AnimatePresence mode="popLayout">
                  {visibleNotifications.map((notif, idx) => (
                    <motion.div
                      layout
                      key={notif.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 40, filter: 'blur(4px)' }}
                      transition={{ 
                        delay: (idx % 5) * 0.04, 
                        type: "spring", 
                        stiffness: 220, 
                        damping: 22 
                      }}
                    >
                      <DropdownMenuItem 
                        asChild 
                        className="focus:bg-gray-50 dark:focus:bg-gray-800/50 outline-none"
                      >
                        <button 
                          onClick={() => {
                            markAsRead(notif.id);
                            if (notif.actions && notif.actions.length > 0) {
                              const actionRoute = actionRoutes[notif.actions[0].id];
                              if (actionRoute) router.push(actionRoute);
                            }
                          }}
                          className={cn(
                            "flex items-start gap-3.5 p-3.5 rounded-2xl cursor-pointer transition-all border group relative my-0.5 w-full text-left select-none",
                            notif.status === 'unread' 
                              ? "bg-primary/[0.04] dark:bg-primary/[0.08] border-primary/20 hover:border-primary/40 hover:bg-primary/[0.07]" 
                              : "bg-white dark:bg-gray-800/40 border-gray-100 dark:border-gray-800/80 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
                          )}
                        >
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-xs group-hover:scale-105 transition-transform", getBgColor(notif.type || 'default'))}>
                            {getIcon(notif.type || 'default')}
                          </div>
                          <div className="flex-1 min-w-0 pr-3">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <p className="text-xs font-black text-gray-900 dark:text-white leading-snug truncate">
                                {removeEmoji(notif.title)}
                              </p>
                              <span className="text-[9px] font-extrabold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md shrink-0">
                                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                              {removeEmoji(notif.body)}
                            </p>
                          </div>
                          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5">
                            <ArrowRight size={15} className="text-primary" />
                          </div>
                          {notif.status === 'unread' && (
                            <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full shadow-md shadow-primary/50 animate-pulse" />
                          )}
                        </button>
                      </DropdownMenuItem>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DropdownMenuSeparator className="bg-gray-100 dark:border-gray-800/80 my-2 mx-4" />
        
        {/* Footer Actions */}
        <div className="p-3 space-y-2">
           {count > 0 && (
             <button 
              onClick={(e) => {
                e.stopPropagation();
                markAllAsRead();
              }}
              className="w-full h-10 flex items-center justify-center gap-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-black uppercase tracking-wider transition-all border border-primary/20 active:scale-95 cursor-pointer"
             >
               <CheckCheck size={14} />
               <span>Mark All as Read</span>
             </button>
           )}

           <Link 
            href="/admin"
            className="w-full h-11 flex items-center justify-center gap-2 rounded-2xl bg-primary text-white hover:bg-primary/90 text-[10px] font-black uppercase tracking-[0.15em] transition-all shadow-lg shadow-primary/20 active:scale-[0.98] cursor-pointer"
           >
             <Settings size={15} />
             <span>Notification Settings</span>
           </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

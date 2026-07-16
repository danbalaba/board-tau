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
import { cn } from '@/lib/utils';
import { IconBell, IconMail, IconCalendarEvent, IconStar, IconMessage, IconArrowRight, IconChecks } from '@tabler/icons-react';
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

  const getIcon = (type: string) => {
    switch (type) {
      case 'inquiry': return <IconMail size={18} className="text-blue-500" />;
      case 'reservation': return <IconCalendarEvent size={18} className="text-emerald-500" />;
      case 'message': return <IconMessage size={18} className="text-amber-500" />;
      case 'review': return <IconStar size={18} className="text-purple-500" />;
      default: return <IconBell size={18} className="text-gray-500" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'inquiry': return 'bg-blue-50 dark:bg-blue-900/20';
      case 'reservation': return 'bg-emerald-50 dark:bg-emerald-900/20';
      case 'message': return 'bg-amber-50 dark:bg-amber-900/20';
      case 'review': return 'bg-purple-50 dark:bg-purple-900/20';
      default: return 'bg-gray-50 dark:bg-gray-800/20';
    }
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2.5 text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all group active:scale-95 outline-none">
          <IconBell size={22} className="group-hover:rotate-12 transition-transform" />
          {count > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1.5 bg-primary text-[9px] font-black text-white rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-900 shadow-xl shadow-primary/20 z-10"
            >
              {count > 9 ? '9+' : count}
            </motion.span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className='w-96 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-800 p-2 backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 overflow-hidden z-[100]'
        align='end'
        sideOffset={12}
      >
        <div className="px-6 py-5 flex items-center justify-between bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 rounded-t-[1.8rem] mb-2 border-b border-gray-100/50 dark:border-gray-800/50">
          <div>
            <h3 className="font-black text-lg tracking-tight text-gray-900 dark:text-white">Notifications</h3>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-none mt-1">
              {count} Actions Required
            </p>
          </div>
          <div className="p-2.5 bg-primary/10 text-primary rounded-2xl shadow-inner">
             <IconBell size={20} />
          </div>
        </div>
        
        <div className="max-h-[380px] overflow-y-auto px-2 space-y-1 scrollbar-hide py-1">
          <AnimatePresence mode='wait'>
            {isLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-16 flex flex-col items-center justify-center gap-4 opacity-50"
              >
                 <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent shadow-xl"></div>
                 <p className="text-sm font-black text-primary uppercase tracking-widest">Fetching updates...</p>
              </motion.div>
            ) : notifications.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="py-16 flex flex-col items-center justify-center text-center px-12"
              >
                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] flex items-center justify-center mb-5 text-gray-300 dark:text-gray-700 shadow-inner group transition-transform hover:scale-105">
                  <IconBell size={40} className="group-hover:rotate-12 transition-transform" />
                </div>
                <h4 className="font-black text-gray-900 dark:text-white text-lg mb-2">All Caught Up!</h4>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                  You have no pending alerts at the moment. We'll alert you as soon as something new arrives.
                </p>
              </motion.div>
            ) : (
              <motion.div key="list" className="space-y-1">
                <AnimatePresence mode='popLayout'>
                  {visibleNotifications.map((notif, idx) => (
                    <motion.div
                      layout
                      key={notif.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 50, filter: 'blur(8px)' }}
                      transition={{ 
                        delay: (idx % 5) * 0.005, 
                        type: "spring", 
                        stiffness: 150, 
                        damping: 25,
                        opacity: { duration: 0.15 }
                      }}
                    >
                      <DropdownMenuItem 
                        asChild 
                        className="focus:bg-gray-50 dark:focus:bg-gray-800/50"
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
                            "flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-700/50 group relative my-0.5 w-full text-left",
                            notif.status === 'unread' && "bg-primary/[0.03]"
                          )}
                        >
                          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-white dark:border-gray-800 group-hover:scale-110 transition-transform", getBgColor('default'))}>
                            {getIcon('default')}
                          </div>
                          <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-[13px] font-black text-gray-900 dark:text-white leading-none">
                                {notif.title}
                              </p>
                              <span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full shrink-0">
                                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                              {notif.body}
                            </p>
                          </div>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1">
                            <IconArrowRight size={16} className="text-primary" />
                          </div>
                          {notif.status === 'unread' && (
                            <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full shadow-lg shadow-primary/50" />
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

        <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800 my-2 mx-6" />
        
        <div className="p-3 space-y-2">
           {count > 0 && (
             <button 
              onClick={(e) => {
                e.stopPropagation();
                markAllAsRead();
              }}
              className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-primary/5 hover:bg-primary/10 transition-all text-[11px] font-black uppercase tracking-wider text-primary disabled:opacity-50 active:scale-95 border border-primary/10"
             >
               <IconChecks size={16} />
               Mark all as read
             </button>
           )}

           <Link 
            href="/admin"
            className="w-full h-12 flex items-center justify-center gap-2 rounded-[1.2rem] bg-gray-900 dark:bg-gray-100 hover:bg-primary dark:hover:bg-primary transition-all text-[11px] font-black uppercase tracking-[0.15em] text-white dark:text-gray-950 hover:text-white dark:hover:text-white shadow-xl shadow-gray-200 dark:shadow-none active:scale-[0.98]"
           >
             Manage Alerts
           </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

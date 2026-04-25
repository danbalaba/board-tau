'use client';

import { Icons } from '../../../components/icons';
import Link from 'next/link';
import { Button } from '../../../components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Separator } from '../../../components/ui/separator';
import { NotificationCard } from '../../../components/ui/notification-card';
import { useNotificationStore } from '../utils/store';
import { useRouter } from 'next/navigation';

import { motion, AnimatePresence } from 'framer-motion';

const MAX_VISIBLE = 5;

const actionRoutes: Record<string, string> = {
  view: '/admin'
};

export function NotificationCenter() {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotificationStore();
  const router = useRouter();
  const count = unreadCount();
  const visibleNotifications = notifications.slice(0, MAX_VISIBLE);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='ghost' size='icon' className='relative h-9 w-9 overflow-visible'>
          <motion.div
            animate={count > 0 ? {
              rotate: [0, -15, 15, -15, 15, 0],
              transition: {
                repeat: Infinity,
                repeatDelay: 2,
                duration: 0.5,
                ease: "easeInOut"
              }
            } : {}}
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
          >
            <Icons.notification className='h-5 w-5' />
          </motion.div>
          
          <AnimatePresence>
            {count > 0 && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className='bg-destructive text-destructive-foreground absolute top-1 right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-[10px] font-bold border-2 border-background dark:border-[#1e293b]'
              >
                {count > 9 ? '9+' : count}
              </motion.span>
            )}
          </AnimatePresence>
          <span className='sr-only'>Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align='end'
        sideOffset={8}
        className='w-[calc(100vw-2rem)] p-0 sm:w-[380px]'
      >
        {/* Header */}
        <div className='flex items-center justify-between px-4 py-3 bg-white dark:bg-[#1e293b] rounded-t-xl'>
          <div className='flex items-center gap-1'>
            <h4 className='text-sm font-semibold text-zinc-900 dark:text-slate-100'>Notifications</h4>
          </div>
          <div className='flex items-center gap-2'>
            {count > 0 && (
              <span className='bg-zinc-100 dark:bg-slate-700 text-zinc-500 dark:text-slate-300 rounded-full px-2 py-0.5 text-xs font-medium'>
                {count} new
              </span>
            )}
            {count > 0 && (
              <Button
                variant='ghost'
                size='sm'
                className='text-zinc-500 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-slate-100 h-auto px-2 py-1 text-xs'
                onClick={markAllAsRead}
              >
                Mark all as read
              </Button>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className='h-px bg-zinc-200 dark:bg-slate-700/60' />

        <ScrollArea className='h-[400px] bg-white dark:bg-[#1e293b] rounded-b-xl'>
          {notifications.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12'>
              <Icons.notification className='text-zinc-300 dark:text-slate-600 mb-2 h-8 w-8' />
              <p className='text-zinc-400 dark:text-slate-500 text-sm'>No notifications yet</p>
            </div>
          ) : (
            <div className='flex flex-col gap-1 p-2'>
              {visibleNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  id={notification.id}
                  title={notification.title}
                  body={notification.body}
                  status={notification.status}
                  createdAt={notification.createdAt}
                  actions={notification.actions}
                  onMarkAsRead={markAsRead}
                  onAction={(notifId, actionId) => {
                    const route = actionRoutes[actionId];
                    if (route) {
                      markAsRead(notifId);
                      router.push(route);
                    }
                  }}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

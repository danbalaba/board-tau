'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/app/admin/components/ui/modal';
import { Button } from '@/app/admin/components/ui/button';
import {
  IconBell,
  IconMail,
  IconCalendar,
  IconStar,
  IconCheck,
  IconX,
  IconFilter,
  IconChecks,
  IconTrash,
  IconCircleFilled
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/admin/components/ui/tabs';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'inquiry' | 'review' | 'payment';
  time: string;
  read: boolean;
  priority?: 'high' | 'medium' | 'low';
}

export function NotificationsListModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'New Booking Request',
      message: 'Alex Johnson requested a booking for Apartment #3 (April 12-15)',
      type: 'booking',
      time: '2 hours ago',
      read: false,
      priority: 'high',
    },
    {
      id: '2',
      title: 'New Guest Inquiry',
      message: 'Sarah Smith is asking about pet policies for the Loft Unit.',
      type: 'inquiry',
      time: '5 hours ago',
      read: false,
      priority: 'medium',
    },
    {
      id: '3',
      title: 'Settled: Payout Received',
      message: 'Monthly payout of ₱12,500.00 has been transferred to your account.',
      type: 'payment',
      time: '1 day ago',
      read: true,
    },
    {
      id: '4',
      title: '5-Star Review!',
      message: 'Marc gave you a perfect review: "Amazing place, very responsive landlord!"',
      type: 'review',
      time: '2 days ago',
      read: true,
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (isOpen) {
      // Mark all notifications as read when modal opens
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  }, [isOpen]);

  const handleClearAll = async () => {
    setIsLoading(true);
    const clearToast = toast.loading('Clearing all notifications...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    setNotifications([]);
    setIsLoading(false);
    toast.success('Notification center cleared', { id: clearToast });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    const readToast = toast.loading('Updating notification status...');
    setTimeout(() => {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All marked as read', { id: readToast });
    }, 500);
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !n.read;
    return n.type === activeTab;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <IconCalendar size={20} className="text-blue-500" />;
      case 'inquiry':
        return <IconMail size={20} className="text-emerald-500" />;
      case 'review':
        return <IconStar size={20} className="text-amber-500" />;
      case 'payment':
        return <IconCheck size={20} className="text-purple-500" />;
      default:
        return <IconBell size={20} className="text-gray-500" />;
    }
  };

  return (
    <Modal
      title="Notification Center"
      description="Stay updated with your latest property activities"
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-md"
    >
      <div className="flex flex-col space-y-6 h-full max-h-[75vh] p-1">
        {/* Tabs Section */}
        <div className="px-0.5">
          <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100/50 dark:bg-gray-800/50 rounded-2xl p-1.5 h-12">
              <TabsTrigger value="all" className="rounded-xl text-[10px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">All</TabsTrigger>
              <TabsTrigger value="unread" className="rounded-xl text-[10px] font-black uppercase tracking-widest relative transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">
                Unread
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                )}
              </TabsTrigger>
              <TabsTrigger value="booking" className="rounded-xl text-[10px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">Events</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* List Section */}
        <div className="flex-1 overflow-y-auto px-0.5 custom-scrollbar space-y-4 pb-4 pr-1">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-20 px-8">
              <div className="w-20 h-20 bg-gray-50/50 dark:bg-gray-800/30 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-gray-100 dark:border-gray-800 shadow-inner">
                <IconBell className="w-10 h-10 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">No notifications found</p>
              <p className="text-[11px] text-gray-500 mt-2 font-medium">We'll alert you when something important happens on your account.</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "p-5 rounded-[24px] border transition-all duration-300 group relative",
                  notification.read 
                    ? "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5" 
                    : "bg-primary/[0.03] dark:bg-primary/[0.08] border-primary/20 shadow-lg shadow-primary/[0.02] ring-1 ring-primary/5 hover:bg-primary/[0.05] dark:hover:bg-primary/[0.12]"
                )}
              >
                {!notification.read && (
                  <div className="absolute top-6 right-6">
                    <IconCircleFilled size={8} className="text-primary animate-pulse" />
                  </div>
                )}
                <div className="flex items-start gap-5">
                  <div className={cn(
                    "flex-shrink-0 w-12 h-12 rounded-[18px] flex items-center justify-center transform transition-all group-hover:scale-110 group-hover:rotate-3 shadow-sm",
                    notification.read ? "bg-gray-50 dark:bg-gray-800 text-gray-400 border border-gray-100 dark:border-gray-800" : "bg-white dark:bg-gray-900 shadow-md border border-primary/10"
                  )}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <h4 className={cn(
                        "text-sm font-black tracking-tight truncate",
                        notification.read ? "text-gray-900 dark:text-white" : "text-primary"
                      )}>
                        {notification.title}
                      </h4>
                      <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-md">{notification.time}</span>
                    </div>
                    <p className="text-[11px] leading-[1.6] text-gray-600 dark:text-gray-400 font-medium line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      {notification.priority === 'high' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-red-500/10 text-red-500 text-[9px] font-black uppercase tracking-widest border border-red-500/20">
                          Urgent Activity
                        </span>
                      )}
                      {!notification.read && (
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          className="text-[9px] font-black text-primary uppercase tracking-[0.1em] flex items-center gap-1.5 hover:gap-2.5 transition-all bg-primary/5 py-1 px-2 rounded-lg"
                        >
                          Acknowledge <IconCheck size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Section */}
        <div className="flex gap-3 pt-6 border-t border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm -mx-1 px-1 mt-2 pb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            disabled={notifications.filter(n => !n.read).length === 0}
            className="flex-1 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-all border border-transparent hover:border-primary/10"
          >
            <IconChecks className="w-4 h-4 mr-2" /> Mark All Read
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            disabled={notifications.length === 0 || isLoading}
            className="flex-1 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all border border-transparent hover:border-red-500/10"
          >
            <IconTrash className="w-4 h-4 mr-2" /> Clear Center
          </Button>
        </div>
      </div>
    </Modal>
  );
}

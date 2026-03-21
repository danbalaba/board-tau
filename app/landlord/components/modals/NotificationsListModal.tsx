'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/app/admin/components/ui/modal';
import { Button } from '@/app/admin/components/ui/button';
import { Card } from '@/app/admin/components/ui/card';
import {
  IconBell,
  IconMail,
  IconCalendar,
  IconStar,
  IconCheck,
  IconX,
} from '@tabler/icons-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'inquiry' | 'review' | 'payment';
  time: string;
  read: boolean;
}

export function NotificationsListModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'New Booking',
      message: 'You have a new booking for Apartment #3',
      type: 'booking',
      time: '2 hours ago',
      read: false,
    },
    {
      id: '2',
      title: 'New Inquiry',
      message: 'Someone is interested in your property',
      type: 'inquiry',
      time: '5 hours ago',
      read: false,
    },
    {
      id: '3',
      title: 'Payment Received',
      message: 'Payment of $1,200 has been received',
      type: 'payment',
      time: '1 day ago',
      read: true,
    },
    {
      id: '4',
      title: 'New Review',
      message: 'You received a 5-star review!',
      type: 'review',
      time: '2 days ago',
      read: true,
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Mark all notifications as read when modal opens
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  }, [isOpen]);

  const handleClearAll = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setNotifications([]);
    setIsLoading(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <IconCalendar className="w-5 h-5 text-blue-500" />;
      case 'inquiry':
        return <IconMail className="w-5 h-5 text-green-500" />;
      case 'review':
        return <IconStar className="w-5 h-5 text-yellow-500" />;
      case 'payment':
        return <IconCheck className="w-5 h-5 text-purple-500" />;
      default:
        return <IconBell className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <Modal
      title="Notifications"
      description={`You have ${notifications.filter(n => !n.read).length} unread notification${notifications.filter(n => !n.read).length !== 1 ? 's' : ''}`}
      isOpen={isOpen}
      onClose={onClose}
      className="sm:max-w-md"
    >
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <IconBell className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-lg font-medium">No notifications</p>
            <p className="text-sm mt-2">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`
                  p-4 cursor-pointer transition-all duration-200 hover:shadow-lg
                  ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : ''}
                `}
                onClick={() => console.log('Notification clicked:', notification.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-semibold truncate ${!notification.read ? 'text-blue-900 dark:text-blue-100' : ''}`}>
                      {notification.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      {notification.time}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {notifications.length > 0 && (
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Clearing...' : 'Clear All'}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}

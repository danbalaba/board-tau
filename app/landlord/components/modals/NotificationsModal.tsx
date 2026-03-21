'use client';

import React from 'react';
import { Modal } from '@/app/admin/components/ui/modal';
import { Button } from '@/app/admin/components/ui/button';
import { Label } from '@/app/admin/components/ui/label';
import { Switch } from '@/app/admin/components/ui/switch';
import {
  IconMail,
  IconBell,
  IconNotification,
  IconGavel
} from '@tabler/icons-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    onClose();
  };

  return (
    <Modal
      title="Notifications Settings"
      description="Manage your notification preferences"
      isOpen={isOpen}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Notifications */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Email Notifications
          </h3>
          
          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center gap-3">
              <IconMail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <Label htmlFor="emailNotifications">New Booking Alerts</Label>
            </div>
            <Switch id="emailNotifications" defaultChecked />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center gap-3">
              <IconMail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <Label htmlFor="emailReviews">Review Notifications</Label>
            </div>
            <Switch id="emailReviews" defaultChecked />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center gap-3">
              <IconMail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <Label htmlFor="emailMessages">Message Notifications</Label>
            </div>
            <Switch id="emailMessages" defaultChecked />
          </div>
        </div>

        {/* Push Notifications */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Push Notifications
          </h3>
          
          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center gap-3">
              <IconBell className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <Label htmlFor="pushAlerts">Booking Alerts</Label>
            </div>
            <Switch id="pushAlerts" defaultChecked />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center gap-3">
              <IconBell className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <Label htmlFor="pushMessages">Message Alerts</Label>
            </div>
            <Switch id="pushMessages" defaultChecked />
          </div>
        </div>

        {/* SMS Notifications */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            SMS Notifications
          </h3>
          
          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center gap-3">
              <IconNotification className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <Label htmlFor="smsAlerts">Urgent Booking Alerts</Label>
            </div>
            <Switch id="smsAlerts" />
          </div>
        </div>

        {/* Save Button */}
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <IconGavel className="w-4 h-4" />
              Save Changes
            </div>
          )}
        </Button>
      </form>
    </Modal>
  );
}

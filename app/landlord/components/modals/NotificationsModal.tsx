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
  IconGavel,
  IconSpeakerphone,
  IconDeviceMobile,
  IconAppWindow,
  IconSettings,
  IconCheck
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const saveToast = toast.loading('Updating notification preferences...');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    toast.success('Preferences updated successfully', { id: saveToast });
    onClose();
  };

  return (
    <Modal
      title="Notification Preferences"
      description="Tailor how you receive updates and alerts"
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-md"
    >
      <div className="max-h-[75vh] overflow-y-auto custom-scrollbar pr-1 -mr-1">
        <form onSubmit={handleSubmit} className="space-y-8 p-1 py-1">
          {/* Activity Notifications */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <IconSpeakerphone size={18} />
              </div>
              <div className="flex flex-col">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">
                  Activity Awareness
                </h3>
                <p className="text-[9px] text-gray-500 font-medium leading-none">Choose what triggers a notification</p>
              </div>
            </div>
            
            <div className="space-y-4 pl-0.5">
              <div className="flex items-center justify-between group transition-all">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotifications" className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors tracking-tight">Booking Requests</Label>
                  <p className="text-[10px] text-gray-500 font-medium max-w-[220px] leading-tight">Get real-time alerts when a new tenant requests to book a room</p>
                </div>
                <Switch id="emailNotifications" defaultChecked />
              </div>

              <div className="flex items-center justify-between group transition-all">
                <div className="space-y-0.5">
                  <Label htmlFor="emailReviews" className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors tracking-tight">Property Reviews</Label>
                  <p className="text-[10px] text-gray-500 font-medium max-w-[220px] leading-tight">Instant updates when guests leave new ratings and feedback</p>
                </div>
                <Switch id="emailReviews" defaultChecked />
              </div>

              <div className="flex items-center justify-between group transition-all">
                <div className="space-y-0.5">
                  <Label htmlFor="emailMessages" className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors tracking-tight">Platform Messages</Label>
                  <p className="text-[10px] text-gray-500 font-medium max-w-[220px] leading-tight">Stay connected with direct inquiries from potential tenants</p>
                </div>
                <Switch id="emailMessages" defaultChecked />
              </div>
            </div>
          </div>

          {/* Global Channels */}
          <div className="space-y-5 pt-6 border-t border-gray-100 dark:border-gray-800/50">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center">
                <IconAppWindow size={18} />
              </div>
              <div className="flex flex-col">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">
                  Delivery Channels
                </h3>
                <p className="text-[9px] text-gray-500 font-medium leading-none">Configure your notification endpoints</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3 mt-1 px-0.5">
               <div className="p-3 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20 flex items-center justify-between transition-all hover:bg-white dark:hover:bg-gray-800/40 hover:border-primary/20 group">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 bg-white dark:bg-gray-900 rounded-lg shadow-sm text-blue-500 flex items-center justify-center border border-gray-100/50 dark:border-gray-800 group-hover:scale-105 transition-transform">
                        <IconMail size={16} />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-xs font-bold tracking-tight leading-none mb-0.5">Email Digest</span>
                        <span className="text-[9px] text-gray-400 font-medium">Daily summary of activities</span>
                     </div>
                  </div>
                  <Switch defaultChecked />
               </div>

               <div className="p-3 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20 flex items-center justify-between transition-all hover:bg-white dark:hover:bg-gray-800/40 hover:border-primary/20 group">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 bg-white dark:bg-gray-900 rounded-lg shadow-sm text-amber-500 flex items-center justify-center border border-gray-100/50 dark:border-gray-800 group-hover:scale-105 transition-transform">
                        <IconBell size={16} />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-xs font-bold tracking-tight leading-none mb-0.5">Push Desktop</span>
                        <span className="text-[9px] text-gray-400 font-medium">Real-time browser popups</span>
                     </div>
                  </div>
                  <Switch defaultChecked />
               </div>

               <div className="p-3 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20 flex items-center justify-between transition-all hover:bg-white dark:hover:bg-gray-800/40 hover:border-primary/20 group">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 bg-white dark:bg-gray-900 rounded-lg shadow-sm text-emerald-500 flex items-center justify-center border border-gray-100/50 dark:border-gray-800 group-hover:scale-105 transition-transform">
                        <IconDeviceMobile size={16} />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-xs font-bold tracking-tight leading-none mb-0.5">SMS Mobile</span>
                        <span className="text-[9px] text-gray-400 font-medium">Urgent carrier-rate alerts</span>
                     </div>
                  </div>
                  <Switch />
               </div>
            </div>
          </div>

          {/* Action Button Section with Clean Backdrop */}
          <div className="pt-4 sticky bottom-0 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 -mx-1 px-1 mt-4">
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full h-12 rounded-2xl bg-primary hover:opacity-95 text-white transition-all font-black uppercase tracking-[0.15em] text-[10px] shadow-none"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <IconCheck className="w-4 h-4" />
                  Save Preferences
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

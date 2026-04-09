'use client';

import React from 'react';
import { Bell, LucideLoader2 } from 'lucide-react';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';

export function LandlordSettingsNotificationsTab() {
  const { success } = useResponsiveToast();
  const [isUpdating, setIsUpdating] = React.useState<string | null>(null);

  const handleToggle = (title: string) => {
    setIsUpdating(title);
    // Simulate real-time API call
    setTimeout(() => {
      setIsUpdating(null);
      success(`${title} updated successfully`);
    }, 600);
  };

  return (
    <div className="space-y-12 pb-8">
      <div className="flex flex-col items-center text-center">
        <div className="p-4 bg-primary/10 rounded-[2rem] text-primary mb-5 shadow-inner">
          <Bell size={40} />
        </div>
        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
          Notification Center
        </h2>
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1">
          Stay updated with your properties
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3 px-1 mb-2">
          <div className="w-6 h-1 bg-primary rounded-full" />
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Communication Preferences</h4>
        </div>

        <div className="grid gap-4">
          {[
            { title: 'Email Notifications', desc: 'Critical alerts sent to your verified email address', checked: true },
            { title: 'SMS Direct Alerts', desc: 'Instant mobile updates for arrivals and payments', checked: false },
            { title: 'Inquiry Signals', desc: 'Real-time alerts when potential tenants reach out', checked: true },
            { title: 'Financial Updates', desc: 'Consolidated reports and verification notifications', checked: true },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-6 bg-white/40 dark:bg-gray-800/20 rounded-[2rem] border border-gray-100 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-800/40 transition-all group">
              <div className="flex-1">
                <h3 className="font-black text-gray-900 dark:text-white text-sm uppercase tracking-wider mb-0.5">{item.title}</h3>
                <p className="text-xs font-medium text-gray-500">{item.desc}</p>
              </div>
              <div className="flex items-center gap-3 ml-4">
                {isUpdating === item.title && (
                  <LucideLoader2 size={16} className="animate-spin text-primary" />
                )}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    defaultChecked={item.checked} 
                    className="sr-only peer" 
                    onChange={() => handleToggle(item.title)}
                    disabled={isUpdating !== null}
                  />
                  <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary shadow-sm"></div>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

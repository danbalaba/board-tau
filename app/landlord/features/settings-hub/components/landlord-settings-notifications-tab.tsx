'use client';

import React from 'react';
import { IconBell, IconLoader2, IconMail, IconDeviceMobile, IconMessageDots, IconChartBar } from '@tabler/icons-react';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';
import { cn } from '@/utils/helper';

export function LandlordSettingsNotificationsTab() {
  const { success } = useResponsiveToast();
  const [isUpdating, setIsUpdating] = React.useState<string | null>(null);

  const handleToggle = (title: string) => {
    setIsUpdating(title);
    setTimeout(() => {
      setIsUpdating(null);
      success(`${title} updated successfully`);
    }, 600);
  };

  const notificationItems = [
    { title: 'Email Notifications', desc: 'Critical alerts sent to your verified email address', checked: true, icon: IconMail, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'SMS Direct Alerts', desc: 'Instant mobile updates for arrivals and payments', checked: false, icon: IconDeviceMobile, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'Inquiry Signals', desc: 'Real-time alerts when potential tenants reach out', checked: true, icon: IconMessageDots, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'Financial Updates', desc: 'Consolidated reports and verification notifications', checked: true, icon: IconChartBar, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="space-y-8">

      <div className="space-y-6">
        <div className="flex items-center gap-3 px-1 mb-2">
          <div className="w-6 h-1 bg-primary rounded-full" />
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Communication Preferences</h4>
        </div>

        <div className="grid gap-4">
          {notificationItems.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-6 bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:shadow-primary/5 transition-all group">
              <div className="flex items-center gap-5">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform", item.bg)}>
                  <item.icon size={22} className={item.color} />
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-gray-900 dark:text-white text-sm uppercase tracking-wider mb-0.5">{item.title}</h3>
                  <p className="text-xs font-medium text-gray-500">{item.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 ml-4">
                {isUpdating === item.title && (
                  <IconLoader2 size={16} className="animate-spin text-primary" />
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

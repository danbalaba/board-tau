'use client';

import React from 'react';
import { Bell, Save } from 'lucide-react';

export default function SettingsNotificationsSection() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
          <Bell size={24} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">
          Notification Preferences
        </h2>
      </div>

      <div className="space-y-4">
        {[
          { title: 'Email Notifications', desc: 'Receive notifications via email', checked: true },
          { title: 'SMS Notifications', desc: 'Receive notifications via SMS', checked: false },
          { title: 'New Inquiry Alerts', desc: 'Get notified when you receive a new inquiry', checked: true },
          { title: 'Booking Confirmation', desc: 'Get notified when a booking is confirmed', checked: true },
          { title: 'Payment Reminders', desc: 'Get notified about upcoming payments', checked: true },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800/50 rounded-[1.5rem] border border-gray-100 dark:border-gray-800">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked={item.checked} className="sr-only peer" />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <button className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-hover transition-all shadow-md active:scale-95 text-sm uppercase tracking-wider">
          <Save size={16} />
          Save Preferences
        </button>
      </div>
    </div>
  );
}

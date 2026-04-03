'use client';

import React from 'react';
import { Lock } from 'lucide-react';

export default function SettingsSecuritySection() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
          <Lock size={24} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">
          Security Settings
        </h2>
      </div>

      <div className="space-y-4">
        {[
          { title: 'Two-Factor Authentication', desc: 'Add an extra layer of security to your account.' },
          { title: 'Change Password', desc: 'Regularly update your password to stay safe.' },
          { title: 'Account Activity', desc: 'Monitor your recent login activity and locations.' },
        ].map((item) => (
          <div key={item.title} className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-0.5 text-base">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
            <button className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-5 py-2.5 rounded-lg font-bold transition-all text-sm">
              Manage
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

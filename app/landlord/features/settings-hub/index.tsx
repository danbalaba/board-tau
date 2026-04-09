'use client';

import React from 'react';
import { User, Bell, Lock, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helper';
import { useLandlordSettings } from './hooks/use-landlord-settings';
import { LandlordSettingsNotificationsTab } from './components/landlord-settings-notifications-tab';
import { LandlordSettingsPaymentTab } from './components/landlord-settings-payment-tab';
import { LandlordSettingsSecurityTab } from './components/landlord-settings-security-tab';

interface LandlordSettingsHubProps {
  initialTab?: 'notifications' | 'payment' | 'security';
  mode?: 'account' | 'security' | 'all';
}

export default function LandlordSettingsHub({ mode = 'all' }: LandlordSettingsHubProps) {
  // Logic remains for mode-based display
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Premium Header - Matching ViewProfileModal reference */}
      <div className="relative h-32 w-full bg-gradient-to-br from-primary/10 via-primary/5 to-purple-500/10 rounded-3xl overflow-hidden border border-primary/5">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-950 shadow-xl flex items-center justify-center mb-3 border border-gray-100 dark:border-gray-800">
            {mode === 'security' ? <Lock size={24} className="text-primary" /> : <User size={24} className="text-primary" />}
          </div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
            {mode === 'security' ? 'Security & Privacy' : 'Settings'}
          </h1>
          <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1.5">
            {mode === 'security' ? 'Manage your credentials & protection' : 'Manage your preferences & account'}
          </p>
        </div>
      </div>

      {/* Unified Single-Page Scrollable Content */}
      <div className="pt-6">
        <main className="w-full max-w-4xl mx-auto">
          <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 md:p-10 shadow-xl shadow-gray-100/20 dark:shadow-none space-y-20">
            {/* Render based on mode but in a single unified view */}
            {(mode === 'account' || mode === 'all') && (
              <>
                <section id="notifications">
                  <LandlordSettingsNotificationsTab />
                </section>
                
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent" />
                
                <section id="payment">
                  <LandlordSettingsPaymentTab />
                </section>
              </>
            )}

            {(mode === 'security' || mode === 'all') && (
              <>
                {mode === 'all' && <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent" />}
                <section id="security">
                  <LandlordSettingsSecurityTab />
                </section>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

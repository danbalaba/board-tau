'use client';

import React, { useState } from 'react';
import { 
  IconUser, 
  IconBell, 
  IconShieldLock, 
  IconCreditCard,
  IconFingerprint,
  IconShieldCheck,
  IconChevronRight
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helper';
import { useLandlordSettings } from './hooks/use-landlord-settings';
import { LandlordSettingsNotificationsTab } from './components/landlord-settings-notifications-tab';
import { LandlordSettingsPaymentTab } from './components/landlord-settings-payment-tab';
import { LandlordSettingsSecurityTab } from './components/landlord-settings-security-tab';
import { LandlordSettingsProfileTab } from './components/landlord-settings-profile-tab';

interface LandlordSettingsHubProps {
  initialTab?: 'profile' | 'notifications' | 'payment' | 'security';
  mode?: 'account' | 'security' | 'all';
}

type TabType = 'profile' | 'notifications' | 'payment' | 'security';

export default function LandlordSettingsHub({ mode = 'all' }: LandlordSettingsHubProps) {
  const {
    activeTab,
    setActiveTab,
    isLoading,
    formData,
    setFormData,
    handleImageChange,
    handleSubmit,
    errors,
    isUploading,
    uploadProgress,
    getSafeImageSrc
  } = useLandlordSettings();

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: IconUser, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { id: 'security', label: 'Security', icon: IconShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 'notifications', label: 'Alerts', icon: IconBell, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { id: 'payment', label: 'Payouts', icon: IconCreditCard, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  ] as const;

  const currentTab = tabs.find(t => t.id === activeTab) || tabs[0];

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">
      {/* Side Navigation Hub */}
      <aside className="w-full lg:w-72 shrink-0 space-y-2">
        <div className="mb-8 px-4">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Settings Hub</h2>
          <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mt-1">Configure your environment</p>
        </div>

        <nav className="space-y-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                  isActive 
                    ? "bg-white dark:bg-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700" 
                    : "hover:bg-gray-100/50 dark:hover:bg-white/5"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                  />
                )}
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                    isActive ? tab.bg : "bg-gray-100 dark:bg-gray-800 group-hover:scale-110"
                  )}>
                    <Icon size={20} className={cn(isActive ? tab.color : "text-gray-400")} />
                  </div>
                  <span className={cn(
                    "text-xs font-black uppercase tracking-widest transition-colors",
                    isActive ? "text-gray-900 dark:text-white" : "text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white"
                  )}>
                    {tab.label}
                  </span>
                </div>

                <IconChevronRight 
                  size={14} 
                  className={cn(
                    "transition-all duration-300",
                    isActive ? "text-primary translate-x-0" : "text-gray-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                  )} 
                />
              </button>
            );
          })}
        </nav>

        {/* System Info Card */}
        <div className="mt-12 p-6 rounded-3xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <IconFingerprint size={16} className="text-primary" />
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Account ID</span>
          </div>
          <p className="text-[10px] font-mono text-gray-500 dark:text-gray-400 break-all bg-white dark:bg-gray-950 p-2 rounded-lg border border-gray-100 dark:border-gray-800 shadow-inner">
            {formData.email.split('@')[0].toUpperCase()}
          </p>
        </div>
      </aside>

      {/* Main Content Hub */}
      <main className="flex-1 min-w-0">
        <div className="bg-white dark:bg-gray-950/50 backdrop-blur-xl rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-2xl shadow-gray-200/20 dark:shadow-none overflow-hidden h-full flex flex-col">
          {/* Section Header */}
          <header className="p-8 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
            <div className="flex items-center gap-6">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl", currentTab.bg)}>
                <currentTab.icon size={28} className={currentTab.color} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{currentTab.label}</h2>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1">
                  Manage your {currentTab.label.toLowerCase()} preferences
                </p>
              </div>
            </div>
          </header>

          {/* Tab Content */}
          <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {activeTab === 'profile' && (
                  <LandlordSettingsProfileTab 
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    isUploading={isUploading}
                    uploadProgress={uploadProgress}
                    handleImageChange={handleImageChange}
                    handleSubmit={handleSubmit}
                    isLoading={isLoading}
                    getSafeImageSrc={getSafeImageSrc}
                  />
                )}
                {activeTab === 'notifications' && <LandlordSettingsNotificationsTab />}
                {activeTab === 'payment' && <LandlordSettingsPaymentTab />}
                {activeTab === 'security' && <LandlordSettingsSecurityTab />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

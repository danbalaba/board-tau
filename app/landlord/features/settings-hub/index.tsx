'use client';

import React from 'react';
import { 
  User, 
  ShieldCheck, 
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLandlordSettings } from './hooks/use-landlord-settings';
import { LandlordSettingsSecurityTab } from './components/landlord-settings-security-tab';
import { LandlordSettingsProfileTab } from './components/landlord-settings-profile-tab';

interface LandlordSettingsHubProps {
  initialTab?: 'profile' | 'security';
  mode?: 'account' | 'security' | 'all';
}

type TabType = 'profile' | 'security';

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
    { id: 'profile', label: 'My Profile', icon: User, color: 'text-primary', bg: 'bg-primary/10' },
    { id: 'security', label: 'Security', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ] as const;

  const currentTab = tabs.find(t => t.id === activeTab) || tabs[0];

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[500px]">
      {/* Side Navigation Hub */}
      <aside className="w-full lg:w-64 shrink-0 space-y-2">
        <div className="mb-4 px-2">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider">Account Settings</h3>
          <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Manage your profile details & preferences</p>
        </div>

        <nav className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={cn(
                  "flex-1 lg:w-full flex items-center justify-between p-3 sm:p-3.5 rounded-xl sm:rounded-2xl transition-all duration-200 group relative cursor-pointer select-none whitespace-nowrap",
                  isActive 
                    ? "bg-primary text-white shadow-md shadow-primary/20" 
                    : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 shrink-0",
                    isActive ? "bg-white/20 text-white" : `${tab.bg} ${tab.color}`
                  )}>
                    <Icon size={16} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider">
                    {tab.label}
                  </span>
                </div>

                <ChevronRight 
                  size={14} 
                  className={cn(
                    "hidden lg:block transition-all",
                    isActive ? "text-white translate-x-0" : "text-gray-300 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0"
                  )} 
                />
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xs overflow-hidden h-full flex flex-col">
          {/* Section Header */}
          <header className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800/80 bg-slate-50/50 dark:bg-gray-950/40">
            <div className="flex items-center gap-4">
              <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shadow-xs shrink-0", currentTab.bg)}>
                <currentTab.icon size={22} className={currentTab.color} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white tracking-tight">{currentTab.label}</h3>
                <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Update your {currentTab.label.toLowerCase()} details
                </p>
              </div>
            </div>
          </header>

          {/* Tab Content */}
          <div className="flex-1 p-4 sm:p-7 overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
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
                {activeTab === 'security' && <LandlordSettingsSecurityTab />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}



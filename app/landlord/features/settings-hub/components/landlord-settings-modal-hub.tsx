'use client';

import React from 'react';
import Modal from '@/components/modals/Modal';
import { Settings, User, ShieldCheck, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLandlordSettings } from '../hooks/use-landlord-settings';
import { LandlordSettingsProfileTab } from './landlord-settings-profile-tab';
import { LandlordSettingsSecurityTab } from './landlord-settings-security-tab';

interface LandlordSettingsModalHubProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'profile' | 'security';
  mode?: 'account' | 'security' | 'all';
}

type TabType = 'profile' | 'security';

export function LandlordSettingsModalHub({
  isOpen,
  onClose,
  defaultTab = 'profile',
  mode = 'all'
}: LandlordSettingsModalHubProps) {
  const safeInitialTab = (defaultTab === 'security' ? 'security' : 'profile') as TabType;
  const [isSecurityDirty, setIsSecurityDirty] = React.useState(false);

  const {
    activeTab,
    setActiveTab,
    isLoading,
    isUploading,
    isDirty: isProfileDirty,
    formData,
    setFormData,
    handleImageChange,
    handleSubmit,
    errors,
    uploadProgress,
    getSafeImageSrc
  } = useLandlordSettings(safeInitialTab);

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'security', label: 'Security', icon: ShieldCheck },
  ] as const;

  if (!isOpen) return null;

  const showSaveButton = activeTab === 'profile' 
    ? (isProfileDirty || isLoading || isUploading)
    : isSecurityDirty;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      width="xl"
      hasFixedFooter={true}
      fullOnMobile={true}
      closeOnOutsideClick={false}
      noPadding={true}
    >
      <div className="flex flex-col h-full sm:h-auto max-h-full sm:max-h-[90vh] overflow-hidden bg-white dark:bg-gray-900 rounded-none sm:rounded-3xl">
        
        {/* Top Header Bar - Mobile Collision Proof */}
        <div className="px-3.5 sm:px-8 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1 pr-2">
            <div className="p-2 bg-primary/10 text-primary rounded-xl shrink-0">
              <Settings size={18} className="sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                  Settings
                </h2>
                <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 shadow-2xs shrink-0">
                  Landlord Portal
                </span>
              </div>
              <p className="text-[10px] sm:text-xs font-bold text-gray-400 dark:text-gray-500 truncate max-w-[150px] sm:max-w-md mt-0.5 leading-tight">
                Manage your personal profile and account security details
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer shrink-0"
              title="Close"
            >
              <X size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Pill Navigation Tabs Bar */}
        <div className="px-3.5 sm:px-8 py-2.5 bg-slate-50/80 dark:bg-gray-950/80 border-b border-gray-100 dark:border-gray-800 shrink-0 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as TabType)}
                className={cn(
                  "relative flex items-center gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer select-none",
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <Icon size={16} className="shrink-0" />
                <span>{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="settings-tab-active-glow"
                    className="absolute inset-0 rounded-xl sm:rounded-2xl bg-white/10 pointer-events-none"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-7 bg-slate-50/50 dark:bg-gray-950/60 custom-scrollbar overscroll-contain">
          {isLoading ? (
            <div className="h-64 sm:h-80 flex flex-col items-center justify-center gap-3 py-12">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin shadow-lg" />
              <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-gray-400">Loading Account Details...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
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
                    hideSubmitButton={true}
                  />
                )}
                {activeTab === 'security' && (
                  <LandlordSettingsSecurityTab 
                    hideSubmitButton={true} 
                    onDirtyChange={setIsSecurityDirty}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Action Footer Bar */}
        <div className="px-3.5 sm:px-8 py-3 sm:py-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0 shadow-lg">
          <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold text-gray-500 dark:text-gray-400">
            <ShieldCheck size={16} className="text-primary shrink-0" />
            <span>Your information is protected with end-to-end security</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {showSaveButton ? (
              activeTab === 'profile' ? (
                <button
                  type="submit"
                  form="landlord-profile-form"
                  disabled={isLoading}
                  className="w-full sm:w-auto h-10 sm:h-11 px-6 text-[11px] sm:text-xs font-black uppercase tracking-wider text-white bg-primary hover:bg-primary/90 rounded-xl sm:rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  <span>{isLoading ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              ) : (
                <button
                  type="submit"
                  form="landlord-security-form"
                  className="w-full sm:w-auto h-10 sm:h-11 px-6 text-[11px] sm:text-xs font-black uppercase tracking-wider text-white bg-primary hover:bg-primary/90 rounded-xl sm:rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <Save size={16} />
                  <span>Save New Password</span>
                </button>
              )
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto h-10 sm:h-11 px-6 text-[11px] sm:text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl sm:rounded-2xl transition-all cursor-pointer"
              >
                Close
              </button>
            )}
          </div>
        </div>

      </div>
    </Modal>
  );
}




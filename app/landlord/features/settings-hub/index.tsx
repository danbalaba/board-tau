'use client';

import React from 'react';
import { User, Bell, Lock, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helper';
import { useLandlordSettings } from './hooks/use-landlord-settings';
import { LandlordSettingsProfileTab } from './components/landlord-settings-profile-tab';
import { LandlordSettingsNotificationsTab } from './components/landlord-settings-notifications-tab';
import { LandlordSettingsPaymentTab } from './components/landlord-settings-payment-tab';
import { LandlordSettingsSecurityTab } from './components/landlord-settings-security-tab';

export default function LandlordSettingsHub() {
  const {
    activeTab,
    setActiveTab,
    isLoading,
    formData,
    setFormData,
    handleInputChange,
    handleImageChange,
    handleSubmit,
    getSafeImageSrc
  } = useLandlordSettings();

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'payment', label: 'Payment Settings', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary/10 to-transparent p-6 rounded-2xl border border-primary/10 shadow-sm"
      >
        <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <span className="p-2 bg-primary/20 rounded-xl text-primary">
            <Lock size={22} />
          </span>
          Account Settings Hub
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm font-medium">
          Centralized management for your profile, security, and financial preferences
        </p>
      </motion.div>

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8">
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 p-4 shadow-xl shadow-gray-100/50 dark:shadow-none sticky top-24">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300",
                      isActive
                        ? "bg-primary text-white shadow-md shadow-primary/20"
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary transition-all"
                    )}
                  >
                    <Icon size={18} className={isActive ? "text-white" : "text-primary"} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Dynamic Content Area */}
        <main className="lg:col-span-9">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 shadow-sm"
            >
              {activeTab === 'profile' && (
                <LandlordSettingsProfileTab 
                  formData={formData} 
                  setFormData={setFormData}
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
        </main>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaLock,
  FaBell,
  FaCreditCard,
  FaSave,
} from 'react-icons/fa';
import { User, Mail, Phone, MapPin, Lock, Bell, CreditCard, Save, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helper';
import Input from '@/components/inputs/Input';
import Textarea from '@/components/inputs/Textarea';

export default function LandlordSettingsClient() {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'payment' | 'security'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: 'John Landlord',
    email: 'john.landlord@example.com',
    phone: '+63 912 345 6789',
    address: '123 Main Street, Tarlac City, Philippines',
    bio: 'Experienced property manager with 5+ years in the boarding house business.',
    profileImage: null as File | null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({
        ...prev,
        profileImage: e.target.files![0],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Updating settings:', formData);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert('Settings updated successfully!');
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Failed to update settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
          Account Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm font-medium">
          Personalize your landlord profile and notification preferences
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

        {/* Content Area */}
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
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-5">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <User size={18} />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white">
                      Profile Information
                    </h2>
                  </div>

                  {/* Profile Image Section */}
                  <div className="flex flex-col md:flex-row items-center gap-6 bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl border border-gray-100 dark:border-gray-800">
                    <div className="relative group">
                      <div className="w-24 h-24 bg-white dark:bg-gray-700 rounded-3xl overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl overflow-hidden">
                        {formData.profileImage ? (
                          <img
                            src={URL.createObjectURL(formData.profileImage)}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-primary/30">
                            <User size={48} />
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-2 -right-2 p-1.5 bg-primary text-white rounded-xl shadow-lg border-2 border-white dark:border-gray-900">
                        <FaSave size={12} />
                      </div>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h4 className="font-bold text-gray-900 dark:text-white mb-2">Your Avatar</h4>
                      <p className="text-gray-500 text-sm mb-4">PNG, JPG or GIF. Max 2MB.</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="profile-image-upload"
                      />
                      <label
                        htmlFor="profile-image-upload"
                        className="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer shadow-sm active:scale-95"
                      >
                        Upload New Photo
                      </label>
                    </div>
                  </div>

                  {/* Basic Fields Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Input
                      id="name"
                      label="Full Name"
                      placeholder="Your display name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      icon={User}
                      useStaticLabel
                    />

                    <Input
                      id="email"
                      label="Email Address"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      icon={Mail}
                      useStaticLabel
                    />

                    <Input
                      id="phone"
                      label="Phone Number"
                      type="tel"
                      placeholder="+63"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      icon={Phone}
                      useStaticLabel
                    />

                    <Input
                      id="address"
                      label="Business Address"
                      placeholder="Primary location"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      icon={MapPin}
                      useStaticLabel
                    />
                  </div>

                  <Textarea
                    id="bio"
                    label="About Yourself"
                    placeholder="Tell us about your property management experience..."
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    required
                  />

                  {/* Submit Section */}
                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full md:w-auto flex items-center justify-center gap-3 bg-primary text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-[0.98]"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'notifications' && (
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
              )}

              {activeTab === 'payment' && (
                <div className="space-y-8">
                  <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                      <CreditCard size={24} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                      Payment Settings
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { name: 'Stripe', desc: 'Accept credit card payments worldwide.' },
                      { name: 'PayMongo', desc: 'GCash, Maya, and local card payments.' },
                      { name: 'Bank Transfer', desc: 'Direct deposit to your local bank account.' },
                    ].map((gate) => (
                      <div key={gate.name} className="p-8 bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
                        <div>
                          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">{gate.name}</h3>
                          <p className="text-sm text-gray-500 mb-8">{gate.desc}</p>
                        </div>
                        <button className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-900 text-primary border border-primary/20 hover:bg-primary hover:text-white px-4 py-2.5 rounded-lg font-bold transition-all shadow-sm text-sm">
                          Configure {gate.name}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
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
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { User, Mail, Phone, MapPin, Save } from 'lucide-react';
import { FaSave } from 'react-icons/fa';
import Input from '@/components/inputs/Input';
import Textarea from '@/components/inputs/Textarea';

interface LandlordSettingsProfileTabProps {
  formData: any;
  setFormData: (data: any) => void;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  getSafeImageSrc: (url: string) => string;
}

export function LandlordSettingsProfileTab({
  formData,
  setFormData,
  handleImageChange,
  handleSubmit,
  isLoading,
  getSafeImageSrc
}: LandlordSettingsProfileTabProps) {
  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      {/* Centered Avatar Section - Matching ViewProfileModal */}
      <div className="flex flex-col items-center text-center">
        <div className="relative group mb-6">
          <div className="w-32 h-32 p-1.5 rounded-full bg-white dark:bg-gray-950 shadow-2xl relative z-10 border border-gray-100/50 dark:border-gray-800/50">
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-gray-950 shadow-sm transition-transform duration-500 group-hover:scale-105">
              {(formData.profileImage || formData.currentImageUrl) ? (
                <img
                  src={formData.profileImage ? URL.createObjectURL(formData.profileImage) : getSafeImageSrc(formData.currentImageUrl)}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary text-4xl font-black">
                  {formData.name?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            {/* Label Trigger Overlay */}
            <label
              htmlFor="profile-image-upload"
              className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex flex-col items-center justify-center text-white z-20"
            >
              <User size={24} className="mb-1" />
              <span className="text-[10px] font-black uppercase tracking-widest">Change</span>
            </label>
          </div>
          <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30 border-2 border-white dark:border-gray-900 z-30">
            <User size={18} className="text-white" />
          </div>
        </div>

        <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
          {formData.name || 'Set Your Name'}
        </h3>
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1">
          {formData.email}
        </p>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
          id="profile-image-upload"
        />
      </div>

      {/* Modern Credentials Grid */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2 px-1">
          <div className="w-6 h-1 bg-primary rounded-full" />
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Detailed Credentials</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group transition-all">
            <Input
              id="name"
              name="name"
              label="Full Name"
              placeholder="Your display name"
              value={formData.name}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, name: e.target.value }))}
              icon={User}
              useStaticLabel
            />
          </div>

          <div className="group transition-all opacity-80">
            <Input
              id="email"
              name="email"
              label="Email Address"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, email: e.target.value }))}
              icon={Mail}
              useStaticLabel
              disabled
            />
          </div>

          <div className="group transition-all">
            <Input
              id="phone"
              name="phone"
              label="Phone Number"
              type="tel"
              placeholder="+63"
              value={formData.phone}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, phone: e.target.value }))}
              icon={Phone}
              useStaticLabel
            />
          </div>

          <div className="group transition-all">
            <Input
              id="address"
              name="address"
              label="Business Address"
              placeholder="Primary location"
              value={formData.address}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, address: e.target.value }))}
              icon={MapPin}
              useStaticLabel
            />
          </div>
        </div>

        <div className="pt-4">
          <Textarea
            id="bio"
            name="bio"
            label="Professional Bio"
            placeholder="Tell us about your property management experience..."
            value={formData.bio}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, bio: e.target.value }))}
            rows={4}
            required
          />
        </div>
      </div>

      {/* Submit Section - Enhanced */}
      <div className="flex justify-center pt-8 border-t border-gray-100 dark:border-gray-800">
        <button
          type="submit"
          disabled={isLoading}
          className="group relative overflow-hidden flex items-center justify-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:shadow-2xl hover:shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <div className="relative flex items-center gap-3">
            {isLoading ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <Save size={18} className="text-primary group-hover:rotate-12 transition-transform" />
            )}
            <span>{isLoading ? 'Processing...' : 'Sync Profile Changes'}</span>
          </div>
        </button>
      </div>
    </form>
  );
}

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
                src={getSafeImageSrc(URL.createObjectURL(formData.profileImage))}
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
          onChange={(e) => setFormData((prev: any) => ({ ...prev, name: e.target.value }))}
          icon={User}
          useStaticLabel
        />

        <Input
          id="email"
          label="Email Address"
          type="email"
          placeholder="your@email.com"
          value={formData.email}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, email: e.target.value }))}
          icon={Mail}
          useStaticLabel
        />

        <Input
          id="phone"
          label="Phone Number"
          type="tel"
          placeholder="+63"
          value={formData.phone}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, phone: e.target.value }))}
          icon={Phone}
          useStaticLabel
        />

        <Input
          id="address"
          label="Business Address"
          placeholder="Primary location"
          value={formData.address}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, address: e.target.value }))}
          icon={MapPin}
          useStaticLabel
        />
      </div>

      <Textarea
        id="bio"
        label="About Yourself"
        placeholder="Tell us about your property management experience..."
        value={formData.bio}
        onChange={(e) => setFormData((prev: any) => ({ ...prev, bio: e.target.value }))}
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
  );
}

'use client';

import React from 'react';
import { User, Mail, Phone, MapPin, Save, Navigation, Search } from 'lucide-react';
import dynamic from 'next/dynamic';
import Input from '@/components/inputs/Input';
import Textarea from '@/components/inputs/Textarea';
import { geocodeAddress, reverseGeocode } from '@/services/geocoding';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';

const Map = dynamic(() => import('@/components/common/Map'), { ssr: false });
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { TAU_COORDINATES } from '@/utils/constants';
import SafeImage from '@/components/common/SafeImage';

interface LandlordSettingsProfileTabProps {
  formData: any;
  setFormData: (data: any) => void;
  errors: any;
  isUploading: boolean;
  uploadProgress: number;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  getSafeImageSrc: (url: string) => string;
}

export function LandlordSettingsProfileTab({
  formData,
  setFormData,
  errors,
  isUploading,
  uploadProgress,
  handleImageChange,
  handleSubmit,
  isLoading,
  getSafeImageSrc
}: LandlordSettingsProfileTabProps) {
  const [isSearching, setIsSearching] = React.useState(false);
  const { success, error } = useResponsiveToast();

  const handleMapClick = async (lat: number, lng: number) => {
    setFormData((prev: any) => ({ ...prev, latlng: [lat, lng] }));
    
    setIsSearching(true);
    try {
      const addressInfo = await reverseGeocode(lat, lng);
      if (addressInfo) {
        setFormData((prev: any) => ({
          ...prev,
          address: addressInfo.address,
          city: addressInfo.city,
          region: addressInfo.province
        }));
        success('Address auto-filled from map pin!');
      } else {
        error('Could not resolve address for this location.');
      }
    } catch (err) {
      console.error('Reverse geocoding error:', err);
      error('Failed to get address from map.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddressSearch = async () => {
    if (formData.address && formData.address.length > 5) {
      setIsSearching(true);
      try {
        const addressInfo = await geocodeAddress(formData.address);
        if (addressInfo) {
          setFormData((prev: any) => ({
            ...prev,
            latlng: [addressInfo.coordinates[0], addressInfo.coordinates[1]],
            address: addressInfo.address,
            city: addressInfo.city,
            region: addressInfo.province
          }));
          success('Location pinned!');
        } else {
          error('Address not found');
        }
      } catch (err) {
        console.error('Geocoding error:', err);
        error('Search failed');
      } finally {
        setIsSearching(false);
      }
    } else {
      error('Enter a valid address');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-12 pb-10">
      {/* Centered Avatar Section */}
      <div className="flex flex-col items-center text-center">
        <div className="relative group mb-6">
          <div className="w-32 h-32 p-1.5 rounded-full bg-white dark:bg-gray-950 shadow-2xl relative z-10 border border-gray-100/50 dark:border-gray-800/50">
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-gray-950 shadow-sm transition-transform duration-500 group-hover:scale-105">
              {(formData.profileImage || formData.currentImageUrl) ? (
                <SafeImage
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
              {/* Modern Liquid Fill Upload Overlay (Matching User Side) */}
              <AnimatePresence>
                {isUploading && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 overflow-hidden"
                  >
                    {/* Background Blur */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />
                    
                    {/* Rising Liquid Overlay */}
                    <motion.div 
                      className="absolute bottom-0 left-0 right-0 bg-primary/40 backdrop-blur-none border-t border-white/20"
                      initial={{ height: "0%" }}
                      animate={{ height: `${uploadProgress}%` }}
                      transition={{ type: "spring", damping: 20, stiffness: 60 }}
                    >
                       {/* Subtle Wave Effect */}
                       <motion.div 
                        animate={{ 
                          x: [-20, 0, -20],
                        }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 2, 
                          ease: "easeInOut" 
                        }}
                        className="absolute -top-4 left-0 w-[200%] h-8 bg-primary/30 blur-sm rounded-[100%]"
                       />
                    </motion.div>

                    {/* Accurate Center Progress */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                      <div className="relative w-16 h-16 flex items-center justify-center">
                         <svg className="w-full h-full -rotate-90">
                            <circle
                              cx="32"
                              cy="32"
                              r="28"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="transparent"
                              className="text-white/10"
                            />
                            <motion.circle
                              cx="32"
                              cy="32"
                              r="28"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="transparent"
                              strokeDasharray="175.929"
                              initial={{ strokeDashoffset: 175.929 }}
                              animate={{ strokeDashoffset: 175.929 - (175.929 * uploadProgress) / 100 }}
                              className="text-primary"
                            />
                         </svg>
                         <span className="absolute text-xs font-black tracking-tighter">
                            {Math.round(uploadProgress)}%
                         </span>
                      </div>
                      <p className="text-[8px] font-black uppercase tracking-widest mt-2 opacity-80">Uploading...</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <label
                htmlFor="profile-image-upload"
                className={cn(
                  "absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex flex-col items-center justify-center text-white z-20",
                  isUploading && "pointer-events-none"
                )}
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

      {/* Basic Info Grid */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2 px-1">
          <div className="w-6 h-1 bg-primary rounded-full" />
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Account Credentials</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            id="name"
            name="name"
            label="Full Name"
            placeholder="Your display name"
            value={formData.name}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, name: e.target.value }))}
            errors={errors}
            icon={User}
            useStaticLabel
          />

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

          <Input
            id="phone"
            name="phone"
            label="Phone Number"
            type="tel"
            placeholder="+63"
            value={formData.phone}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, phone: e.target.value }))}
            errors={errors}
            icon={Phone}
            useStaticLabel
          />

          <Input
            id="city"
            name="city"
            label="City"
            placeholder="e.g. Tarlac City"
            value={formData.city}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, city: e.target.value }))}
            icon={MapPin}
            useStaticLabel
          />

          <Input
            id="region"
            name="region"
            label="Region / Province"
            placeholder="e.g. Tarlac"
            value={formData.region}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, region: e.target.value }))}
            icon={Navigation}
            useStaticLabel
          />

          <div className="flex items-end gap-3 md:col-span-2">
            <div className="flex-1">
              <Input
                id="address"
                name="address"
                label="Business Address"
                placeholder="Search or type address..."
                value={formData.address}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, address: e.target.value }))}
                errors={errors}
                icon={MapPin}
                useStaticLabel
              />
            </div>
            <button
              type="button"
              onClick={handleAddressSearch}
              disabled={isSearching}
              className="h-[58px] px-6 bg-primary text-white rounded-2xl hover:bg-primary/90 transition-all flex items-center justify-center shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50"
            >
              {isSearching ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <Search size={18} />}
            </button>
          </div>
        </div>

        {/* Interactive Map Section */}
        <div className="space-y-4 pt-6">
          <div className="flex items-center justify-between px-1">
             <div className="flex items-center gap-3">
              <div className="w-6 h-1 bg-primary rounded-full" />
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Business Location Pin</h4>
            </div>
            <div className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-widest animate-pulse">
              <Navigation size={12} />
              <span>Click Map to Sync Address</span>
            </div>
          </div>
          
          <div className="h-[300px] rounded-[2.5rem] overflow-hidden border-2 border-gray-100 dark:border-gray-800 shadow-inner relative group">
            <Map
              center={formData.latlng || TAU_COORDINATES}
              onLocationSelect={handleMapClick}
              onClick={handleMapClick}
            />
            {isSearching && (
              <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-3">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Resolving Address...</span>
              </div>
            )}
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
            errors={errors}
            rows={3}
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

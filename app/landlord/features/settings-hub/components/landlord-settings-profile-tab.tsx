'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { User, Mail, Phone, MapPin, Save, Navigation, Search, Maximize2, X, Check, Sparkles } from 'lucide-react';
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
  hideSubmitButton?: boolean;
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
  getSafeImageSrc,
  hideSubmitButton
}: LandlordSettingsProfileTabProps) {
  const [mounted, setMounted] = React.useState(false);
  const [isSearching, setIsSearching] = React.useState(false);
  const [isFullscreenMapOpen, setIsFullscreenMapOpen] = React.useState(false);
  const { success, error } = useResponsiveToast();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const mapCenter = formData.latlng || TAU_COORDINATES;
  const currentLat = mapCenter?.[0] || TAU_COORDINATES[0];
  const currentLng = mapCenter?.[1] || TAU_COORDINATES[1];

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
    const searchQuery = formData.address || (formData.city ? `${formData.city}, ${formData.region || 'Tarlac'}` : '');
    if (searchQuery && searchQuery.trim().length > 2) {
      setIsSearching(true);
      try {
        const addressInfo = await geocodeAddress(searchQuery);
        if (addressInfo && addressInfo.coordinates) {
          setFormData((prev: any) => ({
            ...prev,
            latlng: [addressInfo.coordinates[0], addressInfo.coordinates[1]],
            address: prev.address || addressInfo.address,
            city: prev.city || addressInfo.city,
            region: prev.region || addressInfo.province
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
      error('Enter a valid address or city');
    }
  };

  return (
    <form id="landlord-profile-form" onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
        
        {/* Left Column: Avatar Header + Personal Info + Bio */}
        <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
          
          {/* Compact Profile Header Card */}
          <div className="p-3.5 sm:p-4 bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xs flex items-center gap-4">
            <div className="relative group shrink-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-primary/30 shadow-xs relative">
                {(formData.profileImage || formData.currentImageUrl) ? (
                  <SafeImage
                    src={formData.profileImage ? URL.createObjectURL(formData.profileImage) : getSafeImageSrc(formData.currentImageUrl)}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-xl font-black">
                    {formData.name?.charAt(0) || 'U'}
                  </div>
                )}

                {/* Upload Overlay */}
                <AnimatePresence>
                  {isUploading && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-20 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />
                      <motion.div 
                        className="absolute bottom-0 left-0 right-0 bg-primary/40"
                        initial={{ height: "0%" }}
                        animate={{ height: `${uploadProgress}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center text-white text-[9px] font-black">
                        {Math.round(uploadProgress)}%
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <label
                  htmlFor="profile-image-upload"
                  className={cn(
                    "absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center text-white z-20",
                    isUploading && "pointer-events-none"
                  )}
                >
                  <User size={18} />
                </label>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-xs sm:text-base font-black text-gray-900 dark:text-white truncate leading-tight">
                {formData.name || 'Landlord Name'}
              </h3>
              <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 truncate mt-0.5">
                {formData.email}
              </p>
              <label
                htmlFor="profile-image-upload"
                className="inline-flex items-center gap-1 mt-1 text-[10px] font-black uppercase tracking-wider text-primary hover:underline cursor-pointer"
              >
                <span>Change Photo</span>
              </label>
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="profile-image-upload"
            />
          </div>

          {/* Personal Details & Bio Card */}
          <div className="p-3.5 sm:p-5 bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xs space-y-3 flex-1 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-1 h-4 bg-primary rounded-full" />
              <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">Personal Information</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Input
                id="name"
                name="name"
                label="Full Name"
                placeholder="Your full name"
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
                placeholder="e.g. 0917 123 4567 or +63 917 123 4567"
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
                errors={errors}
                icon={MapPin}
                useStaticLabel
              />

              <div className="sm:col-span-2">
                <Input
                  id="region"
                  name="region"
                  label="Province / Region"
                  placeholder="e.g. Tarlac"
                  value={formData.region}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, region: e.target.value }))}
                  errors={errors}
                  icon={Navigation}
                  useStaticLabel
                />
              </div>

              <div className="flex items-end gap-2 sm:col-span-2">
                <div className="flex-1">
                  <Input
                    id="address"
                    name="address"
                    label="Property / Business Address"
                    placeholder="Type your address..."
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
                  className="h-[50px] px-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center shadow-xs active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer"
                  title="Search location"
                >
                  {isSearching ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <Search size={16} />}
                </button>
              </div>
            </div>

            <div className="pt-1">
              <Textarea
                id="bio"
                name="bio"
                label="Landlord Bio"
                placeholder="Tell tenants a little bit about yourself and your properties..."
                value={formData.bio}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, bio: e.target.value }))}
                errors={errors}
                rows={2}
                required
              />
            </div>
          </div>

        </div>

        {/* Right Column: Interactive Map Section */}
        <div className="lg:col-span-5 p-3.5 sm:p-5 bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xs space-y-3 flex flex-col justify-between h-full min-h-[360px] lg:min-h-0">
          <div className="space-y-3 flex-1 flex flex-col">
            <div className="flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-primary rounded-full" />
                <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">Map Pin Location</h4>
              </div>
              <div className="flex items-center gap-1 text-[9px] font-black text-primary uppercase tracking-wider">
                <Navigation size={11} />
                <span>Click Map to Pin</span>
              </div>
            </div>

            <div className="flex-1 min-h-[260px] sm:min-h-[320px] rounded-xl sm:rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-inner relative group">
              <Map
                center={mapCenter}
                onLocationSelect={handleMapClick}
                onClick={handleMapClick}
                title="Landlord Address"
                imageSrc={formData.currentImageUrl || undefined}
              />
              
              {/* ⤢ Top Right Expand Icon Button */}
              <button
                type="button"
                onClick={() => setIsFullscreenMapOpen(true)}
                title="Expand Map"
                className="absolute top-3 right-3 z-[400] p-2 bg-white/90 dark:bg-gray-900/90 hover:bg-primary hover:text-white dark:hover:bg-primary backdrop-blur-md text-gray-700 dark:text-gray-200 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md transition-all hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center"
              >
                <Maximize2 size={15} />
              </button>

              {/* Bottom Left Coordinates Badge */}
              <div className="absolute bottom-3 left-3 z-[400] max-w-[calc(100%-60px)] truncate bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md text-[9px] font-black text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <div className={cn("w-2 h-2 rounded-full shrink-0", mapCenter && mapCenter.length === 2 && mapCenter[0] !== 0 ? "bg-primary animate-pulse" : "bg-amber-500")} />
                <span className="truncate">
                  {mapCenter && mapCenter.length === 2 && mapCenter[0] !== 0
                    ? `Lat: ${currentLat.toFixed(4)}, Lng: ${currentLng.toFixed(4)}`
                    : "No pin set"}
                </span>
              </div>

              {isSearching && (
                <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-2">
                  <div className="animate-spin h-7 w-7 border-3 border-primary border-t-transparent rounded-full" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">Finding address...</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between shrink-0 pt-1">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 leading-tight">
              Click anywhere on the map to pin location.
            </p>
            <button
              type="button"
              onClick={() => setIsFullscreenMapOpen(true)}
              className="text-primary hover:underline font-extrabold flex items-center gap-1 text-[10px] uppercase tracking-wider shrink-0 cursor-pointer"
            >
              <Sparkles size={12} />
              <span>Fullscreen Map</span>
            </button>
          </div>
        </div>

      </div>

      {/* Submit Section (Only when not hidden by modal footer) */}
      {!hideSubmitButton && (
        <div className="flex justify-end pt-3 border-t border-gray-100 dark:border-gray-800">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto h-11 px-6 text-xs font-black uppercase tracking-wider text-white bg-primary hover:bg-primary/90 rounded-xl sm:rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95"
          >
            {isLoading ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <Save size={16} className="text-white" />
            )}
            <span>{isLoading ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      )}

      {/* 🌐 PRECISION MAP LOCATION MODAL (Portaled directly to document.body) */}
      {mounted && createPortal(
        <AnimatePresence>
          {isFullscreenMapOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[99999] bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 md:p-8"
              onClick={() => setIsFullscreenMapOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 10 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-5xl h-full sm:h-[85vh] min-h-screen sm:min-h-[550px] bg-white dark:bg-gray-900 border-0 sm:border border-gray-200 dark:border-gray-800 rounded-none sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
              >
                {/* 1. Integrated Header */}
                <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 sm:p-3 bg-primary/10 rounded-xl sm:rounded-2xl text-primary shadow-xs shrink-0">
                      <MapPin size={20} className="sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">
                        Precision Map Location Pinning
                      </h3>
                      <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 mt-0.5">
                        Click anywhere on the map to set your location coordinates
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsFullscreenMapOpen(false)}
                    className="p-2 sm:p-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-all shrink-0 cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* 2. Map Canvas Filling Middle Space */}
                <div className="flex-1 w-full relative bg-gray-100 dark:bg-gray-950 overflow-hidden">
                  <Map
                    center={mapCenter}
                    onLocationSelect={handleMapClick}
                    onClick={handleMapClick}
                    title="Landlord Address"
                    imageSrc={formData.currentImageUrl || undefined}
                  />

                  {/* Bottom Left Coordinates Badge inside Map */}
                  <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-[400] max-w-[calc(100%-40px)] truncate bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl text-[10px] sm:text-xs font-black text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
                    <span className="truncate">Lat: {currentLat.toFixed(6)}, Lng: {currentLng.toFixed(6)}</span>
                  </div>
                </div>

                {/* 3. Integrated Footer */}
                <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/80 flex flex-col md:flex-row items-center justify-between gap-3 shrink-0">
                  <div className="w-full md:w-auto px-3.5 py-1.5 sm:px-4 sm:py-2 bg-primary/10 border border-primary/20 rounded-xl sm:rounded-2xl text-primary text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2">
                    <Check size={14} className="sm:w-4 sm:h-4" />
                    <span>Selected: {currentLat.toFixed(6)}, {currentLng.toFixed(6)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsFullscreenMapOpen(false);
                      success('Location pin confirmed!');
                    }}
                    className="w-full md:w-auto px-6 py-2.5 sm:px-8 sm:py-3 bg-primary hover:bg-primary/90 text-white rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Check size={14} className="sm:w-4 sm:h-4" />
                    <span>Confirm Pin Location</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </form>
  );
}


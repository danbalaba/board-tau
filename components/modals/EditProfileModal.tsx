"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { UserProfile } from "@/services/user/profile";
import Button from "@/components/common/Button";
import Input from "@/components/inputs/Input";
import Textarea from "@/components/inputs/Textarea";
import { useResponsiveToast } from "@/components/common/ResponsiveToast";
import { CheckCircle, User, Phone, Mail, MapPin, Globe, Search, Navigation } from "lucide-react";
import { sanitizeInput } from "@/lib/validators";
import { editProfileResolver, EditProfileFormValues } from "./hooks/use-edit-profile-validation";
import Modal from "./Modal";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { geocodeAddress, reverseGeocode } from "@/services/geocoding";
import { TAU_COORDINATES } from "@/utils/constants";

const Map = dynamic(() => import('@/components/common/Map'), { ssr: false });


interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdate: (data: Partial<UserProfile>) => Promise<void>;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdate,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  // Local-only state: coordinates never saved to DB — purely for dynamic map centering
  const [mapCenter, setMapCenter] = useState<[number, number]>(TAU_COORDINATES);
  const { success, error } = useResponsiveToast();
  
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<EditProfileFormValues>({
    defaultValues: {
      name: profile.name ?? '',
      phoneNumber: profile.phoneNumber ?? '',
      city: profile.city ?? '',
      region: profile.region ?? '',
      address: profile.address ?? '',
      bio: profile.bio ?? '',
    },
    resolver: editProfileResolver,
    mode: 'onChange',
  });

  const address = watch("address");



  const handleAddressSearch = async () => {
    if (address && address.length > 5) {
      setIsSearching(true);
      try {
        const addressInfo = await geocodeAddress(address);
        if (addressInfo) {
          setValue("address", addressInfo.address);
          setValue("city", addressInfo.city);
          setValue("region", addressInfo.province);
          // Update map center in local state only — never persisted to DB
          setMapCenter([addressInfo.coordinates[0], addressInfo.coordinates[1]]);
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

  // Reverse geocode when user clicks/pins a location on the map
  const handleMapClick = async (lat: number, lng: number) => {
    setMapCenter([lat, lng]);
    setIsReverseGeocoding(true);
    try {
      const addressInfo = await reverseGeocode(lat, lng);
      if (addressInfo) {
        setValue("address", addressInfo.address, { shouldValidate: true });
        setValue("city", addressInfo.city, { shouldValidate: true });
        setValue("region", addressInfo.province, { shouldValidate: true });
        success('Address auto-filled from map pin!');
      } else {
        error('Could not resolve address for this location.');
      }
    } catch (err) {
      console.error('Reverse geocoding error:', err);
      error('Failed to get address from map.');
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  const onSubmit = async (data: EditProfileFormValues) => {
    setIsLoading(true);
    try {
      const sanitizedData = {
        ...data,
        name: sanitizeInput(data.name || ""),
        phoneNumber: sanitizeInput(data.phoneNumber || ""),
        bio: sanitizeInput(data.bio || ""),
        address: sanitizeInput(data.address || ""),
      };

      await onUpdate(sanitizedData);
      success("Profile updated successfully");
      onClose();
    } catch (err) {
      error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset({
      name: profile.name ?? '',
      phoneNumber: profile.phoneNumber ?? '',
      city: profile.city ?? '',
      region: profile.region ?? '',
      address: profile.address ?? '',
      bio: profile.bio ?? '',
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} width="md" title="Edit My Account">
      <div className="p-1">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-6 bg-gray-50/50 dark:bg-gray-900/40 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {/* Full Name */}
            <div className="relative group">
              <Input
                id="name"
                label="Full Name"
                icon={User as any}
                register={register as any}
                errors={errors as any}
                watch={watch as any}
                {...register("name")}
                useStaticLabel={false}
              />
            </div>

            {/* Verification Details */}
            <div className="space-y-2 px-1">
              <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                Verification Details
              </label>
              <div className="flex items-center justify-between px-4 py-4 bg-gray-100/50 dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700 opacity-60 cursor-not-allowed group transition-all">
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white tracking-tight">{profile.email}</span>
                </div>
                {profile.emailVerified && (
                  <div className="flex items-center gap-1.5 bg-green-500/10 px-2.5 py-1.5 rounded-xl border border-green-500/20">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase">OFFICIAL</span>
                  </div>
                )}
              </div>
            </div>

            {/* Phone Number */}
            <div className="relative group">
              <Input
                id="phoneNumber"
                label="Phone Number"
                icon={Phone as any}
                register={register as any}
                errors={errors as any}
                watch={watch as any}
                {...register("phoneNumber")}
                useStaticLabel={false}
              />
            </div>

            {/* City & Region Row */}
            <div className="grid grid-cols-2 gap-4 relative group">
              <Input
                id="city"
                label="City"
                icon={MapPin as any}
                register={register as any}
                errors={errors as any}
                watch={watch as any}
                {...register("city")}
                useStaticLabel={false}
              />
              <Input
                id="region"
                label="Region"
                icon={Globe as any}
                register={register as any}
                errors={errors as any}
                watch={watch as any}
                {...register("region")}
                useStaticLabel={false}
              />
            </div>

            {/* Home Address Search */}
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Input
                  id="address"
                  label="Home Address"
                  icon={MapPin as any}
                  register={register as any}
                  errors={errors as any}
                  watch={watch as any}
                  {...register("address", { required: false })}
                  useStaticLabel={false}
                />
              </div>
              <button
                type="button"
                onClick={handleAddressSearch}
                disabled={isSearching}
                className="h-[52px] px-4 bg-primary text-white rounded-2xl hover:bg-primary/90 transition-all flex items-center justify-center shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50 mb-[2px]"
              >
                {isSearching ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <Search size={18} />}
              </button>
            </div>


            {/* Map — Dynamic, privacy-safe: coordinates stay in local state only */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                  Location Reference
                </label>
                <div className="flex items-center gap-1.5 text-[9px] font-black text-primary uppercase tracking-widest animate-pulse">
                  <Navigation size={10} />
                  <span>Search to Update Map</span>
                </div>
              </div>
              <div className="h-[180px] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-inner relative">
                <Map
                  center={mapCenter}
                  readonly={false}
                  scrollWheelZoom={false}
                  onLocationSelect={handleMapClick}
                />
                {isReverseGeocoding && (
                  <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-2">
                    <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Resolving Address...</span>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-gray-400 text-center">
                📍 Map updates when you search an address. Your exact pin is never stored.
              </p>
            </div>

            <div className="w-full space-y-2">
              <Textarea
                id="bio"
                label="Member Bio"
                register={register as any}
                errors={errors as any}
                watch={watch as any}
                placeholder="Tell us a bit about yourself..."
                rows={4}
                required={false}
                className="w-full text-sm font-medium rounded-2xl bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 focus:border-primary transition-all duration-300"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              outline={true}
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 h-12 rounded-2xl font-medium border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-[2] h-12 rounded-2xl font-medium shadow-xl shadow-primary/20 bg-primary dark:bg-primary text-white hover:opacity-90 active:scale-[0.98] transition-all"
              isLoading={isLoading}
            >
              Change Profile
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditProfileModal;

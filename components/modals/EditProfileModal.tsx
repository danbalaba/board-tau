"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { UserProfile } from "@/services/user/profile";
import Button from "@/components/common/Button";
import ModalInput from "@/components/inputs/ModalInput";
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

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleCancel} 
      width="md" 
      title="Edit My Account"
      closeOnOutsideClick={false}
      hasFixedFooter={true}
    >
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col h-[90vh] md:h-[80vh] p-3 md:p-6 overflow-hidden"
      >
        {/* Profile Badge Header */}
        <div className="flex flex-col items-center justify-center mb-8 pt-2">
          <div className="w-20 h-20 bg-primary/10 dark:bg-primary/20 rounded-[2rem] flex items-center justify-center mb-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <User className="w-10 h-10 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-1">
              Account Management
            </p>
            <h4 className="text-xs font-medium text-gray-400 dark:text-gray-500 px-6 leading-relaxed">
              Update your public presence and contact details for the BoardTAU community.
            </h4>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Scrollable fields area */}
          <div className="flex-1 space-y-5 md:space-y-6 bg-gray-50/30 dark:bg-white/[0.02] backdrop-blur-md px-3 md:px-6 pt-4 md:pt-6 pb-4 md:pb-6 rounded-3xl md:rounded-[2rem] border border-gray-100/50 dark:border-white/[0.05] shadow-inner overflow-y-auto custom-scrollbar min-h-0 mb-3 md:mb-4">
            {/* Full Name */}
            <motion.div variants={itemVariants} className="relative group">
              <ModalInput
                id="name"
                label="Full Name"
                icon={User as any}
                register={register as any}
                errors={errors as any}
                watch={watch as any}
                placeholder="e.g. Juan Dela Cruz"
                {...register("name")}
              />
            </motion.div>

            {/* Verification Details */}
            <motion.div variants={itemVariants} className="space-y-2 px-1">
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
            </motion.div>

            {/* Phone Number */}
            <motion.div variants={itemVariants} className="relative group">
              <ModalInput
                id="phoneNumber"
                label="Phone Number"
                icon={Phone as any}
                register={register as any}
                errors={errors as any}
                watch={watch as any}
                placeholder="e.g. 09171234567"
                {...register("phoneNumber")}
              />
            </motion.div>

            {/* City & Region Row */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 relative group">
              <ModalInput
                id="city"
                label="City"
                icon={MapPin as any}
                register={register as any}
                errors={errors as any}
                watch={watch as any}
                placeholder="e.g. Camiling"
                {...register("city")}
              />
              <ModalInput
                id="region"
                label="Region"
                icon={Globe as any}
                register={register as any}
                errors={errors as any}
                watch={watch as any}
                placeholder="e.g. Tarlac"
                {...register("region")}
              />
            </motion.div>

            {/* Home Address Search */}
            <motion.div variants={itemVariants} className="flex items-end gap-3">
              <div className="flex-1">
                <ModalInput
                  id="address"
                  label="Home Address"
                  icon={MapPin as any}
                  register={register as any}
                  errors={errors as any}
                  watch={watch as any}
                  placeholder="e.g. 123 Rizal St., Camiling"
                  {...register("address", { required: false })}
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
            </motion.div>


            {/* Map — Dynamic, privacy-safe: coordinates stay in local state only */}
            <motion.div variants={itemVariants} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                  Location Reference
                </label>
                <div className="flex items-center gap-1.5 text-[9px] font-black text-primary uppercase tracking-widest">
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
            </motion.div>

            <motion.div variants={itemVariants} className="w-full space-y-2">
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
            </motion.div>
          </div>
          
          {/* Sticky Action Buttons */}
          <div className="flex-shrink-0 flex gap-4 pt-4 border-t border-gray-100/50 dark:border-white/[0.05]">
            <Button
              type="button"
              variant="secondary"
              outline={true}
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 h-14 rounded-2xl font-bold border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm uppercase tracking-wider"
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-14 rounded-2xl font-bold shadow-2xl shadow-primary/25 bg-primary dark:bg-gradient-to-r dark:from-primary dark:to-primary/90 text-white hover:scale-[1.02] active:scale-[0.98] transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2"
              isLoading={isLoading}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </motion.div>
    </Modal>
  );
};

export default EditProfileModal;

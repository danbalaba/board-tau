"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { UserProfile } from "@/services/user/profile";
import Button from "@/components/common/Button";
import Input from "@/components/inputs/Input";
import Textarea from "@/components/inputs/Textarea";
import { useResponsiveToast } from "@/components/common/ResponsiveToast";
import { CheckCircle, XCircle, User, Phone, Info, Mail, MapPin, Globe } from "lucide-react";
import { validateName, validatePhoneNumber, sanitizeInput } from "@/lib/validators";
import Modal from "./Modal";
import { motion, AnimatePresence } from "framer-motion";

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
  const { success, error } = useResponsiveToast();
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<UserProfile>({
    defaultValues: profile,
  });

  const onSubmit = async (data: UserProfile) => {
    setIsLoading(true);
    try {
      const sanitizedData = {
        ...data,
        name: sanitizeInput(data.name || ""),
        phoneNumber: sanitizeInput(data.phoneNumber || ""),
        bio: sanitizeInput(data.bio || ""),
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
    reset(profile);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} width="md" title="Edit My Account">
      <div className="p-1">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-6 bg-gray-50/50 dark:bg-gray-900/40 p-5 rounded-3xl border border-gray-100 dark:border-gray-800">
            {/* Full Name */}
            <div className="relative group">
              <Input
                id="name"
                label="Full Name"
                icon={User as any}
                register={register as any}
                errors={errors as any}
                watch={watch as any}
                {...register("name", {
                  required: "Full name is required",
                  validate: (value) => {
                    const nameError = validateName(value || "");
                    return nameError ? nameError : true;
                  }
                })}
                useStaticLabel={false}
              />
            </div>

            {/* Email Address - DISBLED */}
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
                {...register("phoneNumber", {
                  required: "Phone number is required",
                  validate: (value) => {
                    const phoneError = validatePhoneNumber(value || "");
                    return phoneError ? phoneError : true;
                  }
                })}
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
                {...register("city", { required: false })}
                useStaticLabel={false}
              />
              <Input
                id="region"
                label="Region"
                icon={Globe as any}
                register={register as any}
                errors={errors as any}
                watch={watch as any}
                {...register("region", { required: false })}
                useStaticLabel={false}
              />
            </div>

            {/* Bio */}
            <div className="space-y-2 relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 mt-3 text-gray-400 group-focus-within:text-primary transition-colors z-10 pointer-events-none">
                <Info size={18} />
              </div>
              <Textarea
                id="bio"
                label="Member Bio"
                register={register as any}
                errors={errors as any}
                watch={watch as any}
                placeholder="Tell us a bit about yourself..."
                rows={4}
                required={false}
                className="pl-11 pt-4 text-sm font-medium rounded-2xl bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 focus:border-primary transition-all duration-300"
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

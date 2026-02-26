"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { UserProfile } from "@/services/user/profile";
import Button from "@/components/common/Button";
import Input from "@/components/inputs/Input";
import Textarea from "@/components/inputs/Textarea";
import toast from "react-hot-toast";
import { CheckCircle, XCircle } from "lucide-react";

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
  const { register, handleSubmit, formState: { errors }, reset } = useForm<UserProfile>({
    defaultValues: profile,
  });

  const onSubmit = async (data: UserProfile) => {
    setIsLoading(true);
    try {
      await onUpdate(data);
      toast.success("Profile updated successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset(profile);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Edit My Account
            </h2>
            <button
              onClick={handleCancel}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Full Name */}
            <div className="space-y-2">
              <Input
                id="name"
                label="Full Name"
                register={register as any}
                errors={errors as any}
                watch={() => "" as any}
                {...register("name", { required: "Full name is required" })}
                placeholder="Your Full Name"
                useStaticLabel={true}
              />
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <div className="flex items-center space-x-2 px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-900 dark:text-white">{profile.email}</span>
                {profile.emailVerified ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {profile.emailVerified ? "Email is verified" : "Email not verified"}
              </p>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Input
                id="phoneNumber"
                label="Phone Number"
                register={register as any}
                errors={errors as any}
                watch={() => "" as any}
                {...register("phoneNumber", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[+]?[\d\s-]+$/,
                    message: "Please enter a valid phone number"
                  },
                  minLength: {
                    value: 6,
                    message: "Phone number must be at least 6 digits"
                  }
                })}
                placeholder="+65 1234 5678"
                useStaticLabel={true}
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Textarea
                id="bio"
                label="Bio"
                register={register as any}
                errors={errors as any}
                watch={() => "" as any}
                placeholder="Tell us about yourself (optional)"
                rows={3}
                required={false}
              />
            </div>

            {/* Change Password Button */}
            <div className="space-y-2">
              <Button
                type="button"
                outline
                className="w-full"
                onClick={() => toast.success("Password change feature coming soon")}
              >
                Change Password
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                outline
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;

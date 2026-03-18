"use client";

"use client";

import React, { useState } from "react";
import { User, Mail, Phone, Building, Edit2, LogOut, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { UserProfile, updateUserProfileClient } from "@/services/user/profile";
import Button from "@/components/common/Button";
import Input from "@/components/inputs/Input";
import Avatar from "@/components/common/Avatar";
import { signOut } from "next-auth/react";
import { useResponsiveToast } from "@/components/common/ResponsiveToast";
import EditProfileModal from "@/components/modals/EditProfileModal";
import ChangePasswordModal from "@/components/modals/ChangePasswordModal";

interface ProfileClientProps {
  profile: UserProfile;
}

const ProfileClient: React.FC<ProfileClientProps> = ({ profile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { success, error } = useResponsiveToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<UserProfile>({
    defaultValues: profile,
  });

  const onSubmit = async (data: UserProfile) => {
    setIsLoading(true);
    try {
      // TODO: Implement update profile API call
      success("Profile updated successfully");
      setIsEditing(false);
    } catch (err) {
      error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset(profile);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Desktop View */}
      <div className="hidden md:block min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 mb-6">
            <div className="px-6 py-6">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Profile</h1>
              <div className="flex items-center space-x-6">
                <Avatar
                  src={profile.image}
                  alt={profile.name || "User"}
                  className="w-20 h-20"
                />
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{profile.name || "User"}</h2>
                  <p className="text-gray-500 dark:text-gray-400">{profile.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Account</h3>

            <div className="space-y-4">
              <button
                className="w-full flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                onClick={() => setIsEditModalOpen(true)}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-base font-medium text-gray-900 dark:text-white">My Account</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage your account</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {!profile.emailVerified && (
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  )}
                  <Edit2 className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                </div>
              </button>

              <button
                className="w-full flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                onClick={() => setIsChangePasswordModalOpen(true)}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-base font-medium text-gray-900 dark:text-white">Change Password</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Update your password</p>
                  </div>
                </div>
                <Edit2 className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              </button>

              <button
                onClick={() => signOut()}
                className="w-full flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-base font-medium text-gray-900 dark:text-white">Log Out</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Sign out of your account</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 py-4">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Profile</h1>
            <div className="flex items-center space-x-4">
              <Avatar
                src={profile.image}
                alt={profile.name || "User"}
                className="w-16 h-16"
              />
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{profile.name || "User"}</h2>
                <p className="text-gray-500 dark:text-gray-400">{profile.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="px-4 py-4 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Account</h3>

            <div className="space-y-3">
              <button
                className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                onClick={() => setIsEditModalOpen(true)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">My Account</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Manage your account</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!profile.emailVerified && (
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  )}
                  <Edit2 className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                </div>
              </button>

              <button
                className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                onClick={() => setIsChangePasswordModalOpen(true)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Change Password</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Update your password</p>
                  </div>
                </div>
                <Edit2 className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              </button>

              <button
                onClick={() => signOut()}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <LogOut className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Log Out</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Sign out of your account</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onUpdate={async (data) => {
          await updateUserProfileClient(data);
        }}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </div>
  );
};

export default ProfileClient;

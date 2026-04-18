"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, Phone, Building, Edit2, LogOut, Lock, Camera, ArrowRight, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { UserProfile, updateUserProfileClient } from "@/services/user/profile";
import Button from "@/components/common/Button";
import Input from "@/components/inputs/Input";
import Avatar from "@/components/common/Avatar";
import { signOut } from "next-auth/react";
import { useResponsiveToast } from "@/components/common/ResponsiveToast";
import EditProfileModal from "@/components/modals/EditProfileModal";
import ChangePasswordModal from "@/components/modals/ChangePasswordModal";
import ChangeProfileImageModal from "@/components/modals/ChangeProfileImageModal";
import ModernLoader from "@/components/common/ModernLoader";
import Modal from "@/components/modals/Modal";
import ConfirmModal from "@/components/common/ConfirmModal";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface ProfileClientProps {
  profile: UserProfile;
}

const ProfileClient: React.FC<ProfileClientProps> = ({ profile }) => {
  const router = useRouter();
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile>(profile);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { success, error } = useResponsiveToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isChangeImageModalOpen, setIsChangeImageModalOpen] = useState(false);

  useEffect(() => {
    // Air-gap buffer (800ms) to ensure root dots loader is completely gone
    const timer = setTimeout(() => {
      setIsMounted(true);
      setIsPageLoading(true);

      const contentTimer = setTimeout(() => {
        setIsPageLoading(false);
      }, 1000); // Content load duration

      return () => clearTimeout(contentTimer);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    setIsLoggingOut(true);
    signOut({ callbackUrl: "/" });
  };

  const updateProfileImage = async (url: string) => {
    try {
      const updated = await updateUserProfileClient({ image: url });
      setCurrentUserProfile(updated);
      router.refresh(); // REFRESH TO SYNC NAVBAR
    } catch (err: any) {
      error("Failed to update profile image");
      throw err;
    }
  };

  if (!isMounted) return null;

  if (isPageLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[70vh]">
        <ModernLoader text="Securely loading your profile..." />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.98, y: 15 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Settings Layout */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8 py-8"
      >
        {/* Header Section */}
        <section className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-10 shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 dark:bg-accent/10 rounded-full -mr-32 -mt-32 blur-3xl transition-transform group-hover:scale-125 duration-1000" />

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-10 relative z-10">
            {/* Avatar Section */}
            <div className="relative group/avatar cursor-pointer" onClick={() => setIsChangeImageModalOpen(true)}>
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-3xl overflow-hidden ring-8 ring-gray-50/50 dark:ring-gray-900/50 dark:bg-gray-700 relative shadow-inner">
                <Avatar
                  src={currentUserProfile.image}
                  name={currentUserProfile.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/avatar:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-[2px]">
                   <Camera size={24} className="scale-75 group-hover/avatar:scale-100 transition-transform" />
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute -bottom-2 -right-2 bg-primary text-white p-2.5 rounded-2xl shadow-xl shadow-primary/30 z-20 border-4 border-white dark:border-gray-800"
              >
                <Camera size={16} />
              </motion.button>
            </div>

            {/* Profile Info */}
            <div className="text-center md:text-left flex-1 py-1">
              <motion.h1 variants={itemVariants} className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-2">
                {currentUserProfile.name || "User Account"}
              </motion.h1>
              <motion.p variants={itemVariants} className="text-sm font-bold text-primary/80 dark:text-accent/80 uppercase tracking-widest mb-4">
                Personal Member Profile
              </motion.p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <motion.div
                  variants={itemVariants}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100/50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-700"
                >
                  <Mail size={14} className="text-gray-400" />
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{currentUserProfile.email}</span>
                </motion.div>

                {currentUserProfile.emailVerified && (
                  <motion.div
                    variants={itemVariants}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800/30"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-sm shadow-green-500/50" />
                    <span className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-tighter">Verified Official</span>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Content Tabs/Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column - Core Settings */}
          <div className="lg:col-span-12">
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-200/40 dark:shadow-none"
            >
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 dark:bg-accent/20 flex items-center justify-center">
                   <ShieldCheck size={18} className="text-primary dark:text-accent" />
                </div>
                Account Security & Preferences
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {/* My Account Card */}
                <motion.button
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="p-6 rounded-3xl bg-gray-50 dark:bg-gray-900/40 border-2 border-transparent hover:border-primary/20 dark:hover:border-accent/40 text-left flex flex-col gap-6 group relative overflow-hidden transition-all duration-300"
                  onClick={() => setIsEditModalOpen(true)}
                >
                   <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                     <User className="w-6 h-6 text-primary dark:text-accent group-hover:text-white" />
                   </div>
                   <div>
                     <p className="text-base font-black text-gray-900 dark:text-white mb-1">Personal Info</p>
                     <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Update your name, bio, and phone number for the community.</p>
                   </div>
                   <div className="mt-auto flex items-center gap-1 text-[10px] font-black text-primary dark:text-accent uppercase tracking-widest opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                      Manage Information <ArrowRight size={12} />
                   </div>
                </motion.button>

                {/* Change Password Card */}
                <motion.button
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="p-6 rounded-3xl bg-gray-50 dark:bg-gray-900/40 border-2 border-transparent hover:border-indigo-500/20 dark:hover:border-accent/40 text-left flex flex-col gap-6 group transition-all duration-300"
                  onClick={() => setIsChangePasswordModalOpen(true)}
                >
                   <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center group-hover:bg-indigo-600 transition-colors duration-300">
                     <Lock className="w-6 h-6 text-indigo-500 group-hover:text-white" />
                   </div>
                   <div>
                     <p className="text-base font-black text-gray-900 dark:text-white mb-1">Change Password</p>
                     <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Ensure your credentials are strong and regularly updated.</p>
                   </div>
                   <div className="mt-auto flex items-center gap-1 text-[10px] font-black text-indigo-600 dark:text-accent uppercase tracking-widest opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                      Update Password <ArrowRight size={12} />
                   </div>
                </motion.button>

                {/* Log Out Card */}
                <motion.button
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="p-6 rounded-3xl bg-rose-50/50 dark:bg-rose-900/10 border-2 border-transparent hover:border-rose-300/30 dark:hover:border-rose-900/60 text-left flex flex-col gap-6 group transition-all duration-300"
                  onClick={() => setShowLogoutConfirm(true)}
                >
                   <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-rose-100 dark:border-rose-900 flex items-center justify-center group-hover:bg-rose-600 transition-colors duration-300">
                     <LogOut className="w-6 h-6 text-rose-500 group-hover:text-white" />
                   </div>
                   <div>
                     <p className="text-base font-black text-rose-600 dark:text-rose-400 mb-1">Logout</p>
                     <p className="text-xs text-rose-500/60 dark:text-rose-400/60 font-medium leading-relaxed">Sign out securely from this device. All data is locally cleared.</p>
                   </div>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Modals Container */}
      <AnimatePresence>
        {isEditModalOpen && (
          <EditProfileModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            profile={currentUserProfile}
            onUpdate={async (data) => {
              const updated = await updateUserProfileClient(data);
              setCurrentUserProfile(updated);
              router.refresh(); // REFRESH NAVBAR
            }}
          />
        )}
      </AnimatePresence>

      {isChangePasswordModalOpen && (
        <ChangePasswordModal
          isOpen={isChangePasswordModalOpen}
          onClose={() => setIsChangePasswordModalOpen(false)}
        />
      )}

      {isChangeImageModalOpen && (
        <ChangeProfileImageModal
          isOpen={isChangeImageModalOpen}
          onClose={() => setIsChangeImageModalOpen(false)}
          currentImage={currentUserProfile.image}
          onUpdate={updateProfileImage}
        />
      )}

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        width="sm"
      >
        <ConfirmModal
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={handleLogout}
          title="Sign Out?"
          message={`Are you sure you want to sign out of your account, ${currentUserProfile.name}? Any unsaved changes may be lost.`}
          confirmLabel="Yes, Sign Out"
          cancelLabel="Wait, Stay Logged In"
          isLoading={isLoggingOut}
          variant="danger"
        />
      </Modal>
    </div>
  );
};

export default ProfileClient;

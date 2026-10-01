"use client";

import React, { useState } from "react";
import { X, Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import ModalInput from "@/components/inputs/ModalInput";
import Button from "@/components/common/Button";
import { useResponsiveToast } from "@/components/common/ResponsiveToast";
import { changeUserPasswordClient } from "@/services/client/profile.client";
import { changePasswordResolver, ChangePasswordFormValues } from "./hooks/use-change-password-validation";
import Modal from "./Modal";
import { motion } from "framer-motion";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasPassword?: boolean;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  hasPassword = true,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { success, error } = useResponsiveToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ChangePasswordFormValues>({
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    resolver: changePasswordResolver,
    mode: "onChange",
  });

  const onSubmit = async (data: ChangePasswordFormValues) => {
    setIsLoading(true);
    try {
      // If they don't have a password, we pass an empty string for oldPassword
      await changeUserPasswordClient(hasPassword ? data.oldPassword : "", data.newPassword);
      success(hasPassword ? "Password updated successfully" : "Password set successfully! You can now log in using your email.");
      reset();
      onClose();
      // Reload to update the hasPassword status in the UI
      window.location.reload();
    } catch (err: any) {
      error(err.message || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1,
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
      onClose={handleClose} 
      width="md" 
      title={hasPassword ? "Change Password" : "Set Account Password"}
      closeOnOutsideClick={false}
      fullOnMobile={true}
    >
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-1"
      >
        {/* Security Badge Header */}
        <div className="flex flex-row items-center gap-3.5 mb-4 sm:mb-6 pt-1 shrink-0 px-1">
          <div className="w-11 h-11 sm:w-16 sm:h-16 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5 sm:w-8 sm:h-8 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Security Protocol
            </p>
            <h4 className="text-[11px] sm:text-xs font-medium text-gray-400 dark:text-gray-500 leading-snug line-clamp-2">
              {hasPassword 
                ? "Maintain your account's integrity by updating your credentials regularly."
                : "Create a unique password to enable multiple ways to access your BoardTAU account."}
            </h4>
          </div>
        </div>

        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-amber-50/50 dark:bg-amber-900/5 backdrop-blur-sm rounded-2xl border border-amber-100/50 dark:border-amber-800/30 flex items-start gap-2.5 sm:gap-3">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[10px] sm:text-[11px] text-amber-800/80 dark:text-amber-400/80 font-medium leading-relaxed italic">
            Note: {hasPassword 
              ? "All other active sessions will be terminated upon success."
              : "You will be able to log in with either your social account or email + password."}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
          <div className="space-y-1 bg-gray-50/30 dark:bg-white/[0.02] backdrop-blur-md p-1.5 sm:p-2 rounded-2xl sm:rounded-[2.5rem] border border-gray-100/50 dark:border-white/[0.05] shadow-inner">
            {/* Current Password */}
            {hasPassword && (
              <motion.div variants={itemVariants} className="relative group p-2 sm:p-3">
                <ModalInput
                  id="oldPassword"
                  label="Current Password"
                  type="password"
                  register={register as any}
                  errors={errors as any}
                  watch={watch as any}
                  icon={Lock as any}
                  placeholder="Enter your current password"
                  {...register("oldPassword")}
                />
              </motion.div>
            )}

            {/* New Password */}
            <motion.div variants={itemVariants} className="relative group p-2 sm:p-3">
              <ModalInput
                id="newPassword"
                label={hasPassword ? "New Secure Password" : "Create New Password"}
                type="password"
                register={register as any}
                errors={errors as any}
                watch={watch as any}
                icon={ShieldCheck as any}
                placeholder="Enter a strong new password"
                {...register("newPassword")}
              />
            </motion.div>

            {/* Confirm New Password */}
            <motion.div variants={itemVariants} className="relative group p-2 sm:p-3">
              <ModalInput
                id="confirmPassword"
                label="Re-type New Password"
                type="password"
                register={register as any}
                errors={errors as any}
                watch={watch as any}
                icon={ShieldCheck as any}
                placeholder="Repeat your new password"
                {...register("confirmPassword")}
              />
            </motion.div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 sm:gap-4 pt-2 pb-2 sm:pb-0">
            <Button
              type="button"
              variant="secondary"
              outline={true}
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 h-12 sm:h-14 rounded-2xl font-bold border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-xs sm:text-sm uppercase tracking-wider"
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-[1.5] h-12 sm:h-14 rounded-2xl font-bold shadow-xl shadow-primary/25 bg-primary dark:bg-gradient-to-r dark:from-primary dark:to-primary/90 text-white hover:scale-[1.01] active:scale-[0.98] transition-all text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2"
              isLoading={isLoading}
            >
              {hasPassword ? "Update Credentials" : "Secure Account"}
            </Button>
          </div>
        </form>
      </motion.div>
    </Modal>
  );
};

export default ChangePasswordModal;

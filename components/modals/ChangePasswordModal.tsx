"use client";

import React, { useState } from "react";
import { X, Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import Input from "@/components/inputs/Input";
import Button from "@/components/common/Button";
import { useResponsiveToast } from "@/components/common/ResponsiveToast";
import { changeUserPasswordClient } from "@/services/user/profile";
import { validateChangePasswordForm } from "@/lib/validators";
import Modal from "./Modal";
import { motion } from "framer-motion";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { success, error } = useResponsiveToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await changeUserPasswordClient(data.oldPassword, data.newPassword);
      success("Password updated successfully");
      reset();
      onClose();
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

  return (
    <Modal isOpen={isOpen} onClose={handleClose} width="md" title="Change Password">
      <div className="p-1">
        <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-400 font-medium leading-relaxed">
            For your security, changing your password will sign you out from all other active sessions and requires logging in again.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-6 bg-gray-50/50 dark:bg-gray-900/40 p-5 rounded-3xl border border-gray-100 dark:border-gray-800">
            {/* Current Password */}
            <div className="relative group">
              <Input
                id="oldPassword"
                label="Old Password"
                type="password"
                register={register as any}
                errors={errors as any}
                watch={watch as any}
                useStaticLabel={false}
                icon={Lock as any}
                {...register("oldPassword", {
                  required: "Current password is required",
                  validate: (value) => validateChangePasswordForm(value, "", "").oldPassword === undefined || "Incorrect password",
                })}
              />
            </div>

            <div className="h-px bg-gray-100 dark:bg-gray-800 mx-2" />

            {/* New Password */}
            <div className="relative group">
              <Input
                id="newPassword"
                label="New Password"
                type="password"
                register={register as any}
                errors={errors as any}
                watch={watch as any}
                useStaticLabel={false}
                icon={ShieldCheck as any}
                {...register("newPassword", {
                  required: "New password is required",
                  validate: (value) => validateChangePasswordForm("", value, "").newPassword === undefined || "6+ chars with special sym.",
                })}
              />
            </div>

            {/* Confirm New Password */}
            <div className="relative group">
              <Input
                id="confirmPassword"
                label="Confirm Password"
                type="password"
                register={register as any}
                errors={errors as any}
                watch={watch as any}
                useStaticLabel={false}
                icon={ShieldCheck as any}
                {...register("confirmPassword", {
                  required: "Confirm your password",
                  validate: (value) => {
                    const passMatch = watch("newPassword") === value;
                    return passMatch || "Passwords do not match";
                  }
                })}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              outline={true}
              onClick={handleClose}
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
              Change Password
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ChangePasswordModal;

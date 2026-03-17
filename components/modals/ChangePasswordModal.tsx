"use client";

import React, { useState } from "react";
import { X, Lock, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import Input from "@/components/inputs/Input";
import Button from "@/components/common/Button";
import toast from "react-hot-toast";
import { changeUserPasswordClient } from "@/services/user/profile";
import { validateChangePasswordForm } from "@/lib/validators";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
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
      toast.success("Password updated successfully");
      reset();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Change Password
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="space-y-1">
            <Input
              id="oldPassword"
              label="Current Password"
              type={showOldPassword ? "text" : "password"}
              register={register}
              errors={errors}
              useStaticLabel
              validationRules={{
                validate: (value: string) => validateChangePasswordForm(value, "", "").oldPassword === undefined,
              }}
              placeholder="Enter your current password"
              icon={Lock}
              disabled={isLoading}
            />
            <div className="absolute right-3 top-24 mt-1">
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showOldPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <Input
              id="newPassword"
              label="New Password"
              type={showNewPassword ? "text" : "password"}
              register={register}
              errors={errors}
              useStaticLabel
              validationRules={{
                validate: (value: string) => validateChangePasswordForm("", value, "").newPassword === undefined,
              }}
              placeholder="Enter your new password"
              icon={Lock}
              disabled={isLoading}
            />
            <div className="absolute right-3 top-36 mt-1">
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showNewPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <Input
              id="confirmPassword"
              label="Confirm New Password"
              type={showConfirmPassword ? "text" : "password"}
              register={register}
              errors={errors}
              useStaticLabel
              validationRules={{
                validate: (value: string, formValues: any) =>
                  validateChangePasswordForm("", formValues.newPassword, value).confirmPassword === undefined,
              }}
              placeholder="Confirm your new password"
              icon={Lock}
              disabled={isLoading}
            />
            <div className="absolute right-3 top-48 mt-1">
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
              isLoading={isLoading}
            >
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;

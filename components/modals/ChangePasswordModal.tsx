"use client";

import React, { useState } from "react";
import { X, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import Input from "@/components/inputs/Input";
import Button from "@/components/common/Button";
import { validateChangePasswordForm } from "@/lib/validators";
import { changeUserPasswordClient } from "@/services/user/profile";
import toast from "react-hot-toast";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>();

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true);
    try {
      await changeUserPasswordClient(data.currentPassword, data.newPassword);
      toast.success("Password changed successfully");
      reset();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleCancel}
      />

      {/* Modal content */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Change Password
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Update your password to keep your account secure
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <Input
              id="currentPassword"
              label="Current Password"
              type="password"
              placeholder="Enter your current password"
              register={register}
              errors={errors}
              useStaticLabel
              disabled={isLoading}
            />
          </div>

          <div>
            <Input
              id="newPassword"
              label="New Password"
              type="password"
              placeholder="Enter your new password"
              register={register}
              errors={errors}
              useStaticLabel
              disabled={isLoading}
            />
          </div>

          <div>
            <Input
              id="confirmPassword"
              label="Confirm New Password"
              type="password"
              placeholder="Confirm your new password"
              register={register}
              errors={errors}
              useStaticLabel
              disabled={isLoading}
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4">
            <Button
              type="button"
              outline
              onClick={handleCancel}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              isLoading={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? "Changing..." : "Change Password"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;

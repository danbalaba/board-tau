'use client';

import { useState } from 'react';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';
import { z } from 'zod';
import { isForbiddenPassword } from '@/lib/password-blacklist';

const NO_HTML = /^(?!.*<[^>]+>).+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/;

export const landlordPasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required.'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters.')
    .max(100, 'New password must be less than 100 characters.')
    .regex(PASSWORD_REGEX, 'Password must contain uppercase, lowercase, number, and special character.')
    .regex(NO_HTML, 'Password must not contain HTML tags.')
    .refine((val) => !isForbiddenPassword(val), {
      message: 'This password is too common/easy to guess. Please choose a stronger one.',
    }),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your new password.'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export function useLandlordSecurity() {
  const { success, error: toastError } = useResponsiveToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: '' }));
    }
  };

  const submitPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const validationResult = landlordPasswordSchema.safeParse(passwordData);
    if (!validationResult.success) {
      const newErrors: Record<string, string> = {};
      for (const issue of validationResult.error.issues) {
        const fieldKey = issue.path[0] as string;
        if (!newErrors[fieldKey]) {
          newErrors[fieldKey] = issue.message;
        }
      }
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0] || 'Please fix the errors before saving';
      toastError(firstError);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      success('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setErrors({});
    } catch (err: any) {
      toastError(err.message || 'Error updating password');
    } finally {
      setIsLoading(false);
    }
  };

  const isDirty = Boolean(passwordData.currentPassword || passwordData.newPassword || passwordData.confirmPassword);

  return {
    passwordData,
    handlePasswordChange,
    submitPasswordChange,
    isLoading,
    isDirty,
    errors
  };
}



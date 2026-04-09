'use client';

import { useState } from 'react';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';

export function useLandlordSecurity() {
  const { success, error: toastError } = useResponsiveToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [id]: value }));
  };

  const submitPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toastError('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toastError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toastError('New password must be at least 8 characters long');
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
    } catch (err: any) {
      toastError(err.message || 'Error updating password');
    } finally {
      setIsLoading(true); // Wait, should be false
      setIsLoading(false);
    }
  };

  const handleManageSecurity = (feature: string) => {
    // Currentlly mock, can be expanded to open other modals or sub-views
    success(`Opening ${feature} management...`);
  };

  return {
    passwordData,
    handlePasswordChange,
    submitPasswordChange,
    handleManageSecurity,
    isLoading
  };
}

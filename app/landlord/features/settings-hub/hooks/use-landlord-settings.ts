'use client';

import { useState } from 'react';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';

/**
 * Validates and sanitizes image sources using a strict character whitelist.
 */
export const getSafeImageSrc = (image: string): string => {
  if (!image || typeof image !== 'string' || image.length > 2048) return '';
  
  const lower = image.toLowerCase();
  const isSafeProtocol = lower.startsWith('http://') || lower.startsWith('https://') || lower.startsWith('blob:');
  const isRelative = image.startsWith('/');

  if (isSafeProtocol || isRelative) {
    const safeUrl = image.split('').filter(c => /^[-a-zA-Z0-9:/_. ?#&%]$/.test(c)).join('');
    if (safeUrl === image) {
      return safeUrl;
    }
  }
  
  return '';
};

export function useLandlordSettings() {
  const { success, error: toastError } = useResponsiveToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'payment' | 'security'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: 'John Landlord',
    email: 'john.landlord@example.com',
    phone: '+63 912 345 6789',
    address: '123 Main Street, Tarlac City, Philippines',
    bio: 'Experienced property manager with 5+ years in the boarding house business.',
    profileImage: null as File | null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        toastError('Only valid image files are allowed.');
        return;
      }
      setFormData((prev) => ({ ...prev, profileImage: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      success('Settings updated successfully!');
    } catch (error) {
      console.error('Error updating settings:', error);
      toastError('Failed to update settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    isLoading,
    formData,
    setFormData,
    handleInputChange,
    handleImageChange,
    handleSubmit,
    getSafeImageSrc
  };
}

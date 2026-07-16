import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';
import { updateUserProfileClient } from '@/services/client/profile.client';
import { useEdgeStore } from '@/lib/edgestore';
import { validateName, validatePhoneNumber } from '@/lib/validators';
import { useLandlordProfileStore } from './use-landlord-profile-store';

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

export function useLandlordSettings(initialTab?: 'profile' | 'notifications' | 'payment' | 'security') {
  const router = useRouter();
  const { success, error: toastError } = useResponsiveToast();
  const { edgestore } = useEdgeStore();
  const closeSettings = useLandlordProfileStore((state) => state.closeSettings);
  const updateUser = useLandlordProfileStore((state) => state.updateUser);
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'payment' | 'security'>(initialTab || 'profile');

  // Sync activeTab with initialTab when it changes (e.g., when reopening the modal with a specific tab)
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    region: '',
    bio: '',
    profileImage: null as File | null,
    currentImageUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch initial data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/user/profile');
        const data = await response.json();
        
        if (data) {
          setFormData({
            name: data.name || '',
            email: data.email || '',
            phone: data.phoneNumber || '',
            address: data.address || '',
            city: data.city || '',
            region: data.region || '',
            bio: data.bio || '',
            profileImage: null,
            currentImageUrl: data.image || '',
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setIsInitialLoad(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        toastError('Only valid image files are allowed.');
        return;
      }
      
      setIsUploading(true);
      setUploadProgress(0);

      try {
        const res = await edgestore.publicFiles.upload({
          file,
          onProgressChange: (progress) => {
            setUploadProgress(progress);
          },
        });
        
        setFormData((prev) => ({ 
          ...prev, 
          currentImageUrl: res.url,
          profileImage: null // We've already uploaded it
        }));
        success('Profile picture uploaded!');
      } catch (err) {
        console.error('Upload error:', err);
        toastError('Failed to upload image');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const newErrors: Record<string, string> = {};

    // 1. Validation
    const nameError = validateName(formData.name);
    if (nameError) {
      newErrors.name = nameError;
    }

    if (formData.phone) {
      const phoneError = validatePhoneNumber(formData.phone);
      if (phoneError) {
        newErrors.phone = phoneError;
      }
    }

    if (!formData.address || formData.address.length < 5) {
      newErrors.address = 'Please enter a valid address';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toastError('Please fix the errors before saving');
      return;
    }

    setIsLoading(true);

    try {
      // Update profile in database
      await updateUserProfileClient({
        name: formData.name,
        phoneNumber: formData.phone,
        address: formData.address,
        city: formData.city,
        region: formData.region,
        bio: formData.bio,
        image: formData.currentImageUrl,
      });

      // Update global store for instant UI feedback
      updateUser({
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        province: formData.region,
        bio: formData.bio,
        image: formData.currentImageUrl,
      });

      router.refresh();
      success('Settings updated successfully!');
      
      // Auto-close modal on success as requested
      setTimeout(() => {
        closeSettings();
      }, 500);
    } catch (error: any) {
      console.error('Error updating settings:', error);
      toastError(error.message || 'Failed to update settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    isLoading: isLoading || isInitialLoad,
    isUploading,
    uploadProgress,
    formData,
    setFormData,
    errors,
    handleInputChange,
    handleImageChange,
    handleSubmit,
    getSafeImageSrc
  };
}

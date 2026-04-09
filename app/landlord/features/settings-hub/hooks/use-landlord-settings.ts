import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';
import { updateUserProfileClient } from '@/services/user/profile';
import { useEdgeStore } from '@/lib/edgestore';

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

export function useLandlordSettings(initialTab?: 'notifications' | 'payment' | 'security') {
  const router = useRouter();
  const { success, error: toastError } = useResponsiveToast();
  const { edgestore } = useEdgeStore();
  const [activeTab, setActiveTab] = useState<'notifications' | 'payment' | 'security'>(initialTab || 'notifications');

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
    bio: '',
    profileImage: null as File | null,
    currentImageUrl: '',
  });

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
      let imageUrl = formData.currentImageUrl;

      // 1. Upload new image if exists
      if (formData.profileImage) {
        const res = await edgestore.publicFiles.upload({
          file: formData.profileImage,
        });
        imageUrl = res.url;
      }

      // 2. Update profile in database
      await updateUserProfileClient({
        name: formData.name,
        phoneNumber: formData.phone,
        address: formData.address,
        bio: formData.bio,
        image: imageUrl,
      });

      setFormData(prev => ({ ...prev, currentImageUrl: imageUrl, profileImage: null }));
      router.refresh();
      success('Settings updated successfully!');
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
    formData,
    setFormData,
    handleInputChange,
    handleImageChange,
    handleSubmit,
    getSafeImageSrc
  };
}

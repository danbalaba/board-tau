import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';
import { updateUserProfileClient } from '@/services/client/profile.client';
import { useEdgeStore } from '@/lib/edgestore';
import { sanitizeInput } from '@/lib/validators';
import { editProfileSchema } from '@/components/modals/hooks/use-edit-profile-validation';
import { useLandlordProfileStore } from './use-landlord-profile-store';
import { geocodeAddress } from '@/services/geocoding';
import { TAU_COORDINATES } from '@/utils/constants';

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

export function useLandlordSettings(initialTab?: 'profile' | 'security') {
  const router = useRouter();
  const { success, error: toastError } = useResponsiveToast();
  const { edgestore } = useEdgeStore();
  const closeSettings = useLandlordProfileStore((state) => state.closeSettings);
  const updateUser = useLandlordProfileStore((state) => state.updateUser);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>(initialTab || 'profile');

  // Sync activeTab with initialTab when it changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const [initialFormData, setInitialFormData] = useState<any>(null);
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
    latlng: null as [number, number] | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch initial data
  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (!response.ok) {
          console.warn(`[Profile Fetch] Received status ${response.status}`);
          return;
        }
        const data = await response.json();
        
        if (data && !data.error && isMounted) {
          let initialLatLng: [number, number] = TAU_COORDINATES;
          const addressQuery = data.address || (data.city ? `${data.city}, ${data.region || ''}` : '');
          if (addressQuery && addressQuery.length > 3) {
            try {
              const addressInfo = await geocodeAddress(addressQuery);
              if (addressInfo && addressInfo.coordinates && isMounted) {
                initialLatLng = addressInfo.coordinates;
              }
            } catch (e) {
              console.warn('Initial address geocoding failed:', e);
            }
          }

          const fetchedData = {
            name: data.name || '',
            email: data.email || '',
            phone: data.phoneNumber || '',
            address: data.address || '',
            city: data.city || '',
            region: data.region || '',
            bio: data.bio || '',
            profileImage: null,
            currentImageUrl: data.image || '',
            latlng: initialLatLng,
          };
          setFormData(fetchedData);
          setInitialFormData(fetchedData);
        }
      } catch (err) {
        console.warn('Unable to fetch profile (network or session issue):', err);
      } finally {
        if (isMounted) {
          setIsInitialLoad(false);
        }
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const isDirty = Boolean(
    initialFormData && (
      formData.name !== initialFormData.name ||
      formData.phone !== initialFormData.phone ||
      formData.address !== initialFormData.address ||
      formData.city !== initialFormData.city ||
      formData.region !== initialFormData.region ||
      formData.bio !== initialFormData.bio ||
      formData.currentImageUrl !== initialFormData.currentImageUrl ||
      formData.profileImage !== null
    )
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
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
          profileImage: null
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

    // Comprehensive Zod validation matching EditProfileModal
    const validationResult = editProfileSchema.safeParse({
      name: formData.name,
      phoneNumber: formData.phone,
      city: formData.city,
      region: formData.region,
      address: formData.address,
      bio: formData.bio || '',
    });

    if (!validationResult.success) {
      const newErrors: Record<string, string> = {};
      for (const issue of validationResult.error.issues) {
        const fieldKey = issue.path[0] === 'phoneNumber' ? 'phone' : (issue.path[0] as string);
        if (!newErrors[fieldKey]) {
          newErrors[fieldKey] = issue.message;
        }
      }
      setErrors(newErrors);
      const firstErrorMessage = Object.values(newErrors)[0] || 'Please fix the errors before saving';
      toastError(firstErrorMessage);
      return;
    }

    const validatedData = validationResult.data;
    setIsLoading(true);

    try {
      const sanitizedData = {
        name: sanitizeInput(validatedData.name),
        phoneNumber: sanitizeInput(validatedData.phoneNumber),
        address: sanitizeInput(validatedData.address),
        city: sanitizeInput(validatedData.city),
        region: sanitizeInput(validatedData.region),
        bio: sanitizeInput(validatedData.bio || ''),
        image: formData.currentImageUrl,
      };

      // Update profile in database
      await updateUserProfileClient(sanitizedData);

      // Update initial state baseline
      setInitialFormData({ ...formData });

      // Update global store for instant UI feedback
      updateUser({
        name: sanitizedData.name,
        phone: sanitizedData.phoneNumber,
        address: sanitizedData.address,
        city: sanitizedData.city,
        province: sanitizedData.region,
        bio: sanitizedData.bio,
        image: formData.currentImageUrl,
      });

      router.refresh();
      success('Settings updated successfully!');
      
      // Auto-close modal on success
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
    isDirty,
    formData,
    setFormData,
    errors,
    handleInputChange,
    handleImageChange,
    handleSubmit,
    getSafeImageSrc
  };
}


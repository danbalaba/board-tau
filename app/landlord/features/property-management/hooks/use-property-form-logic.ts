'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEdgeStore } from '@/lib/edgestore';
import { toast } from 'sonner';

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

export function usePropertyFormLogic(initialData: any) {
  const router = useRouter();
  const { edgestore } = useEdgeStore();
  
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    price: initialData.price?.toString() || '',
    roomCount: initialData.roomCount?.toString() || '',
    bathroomCount: initialData.bathroomCount?.toString() || '',
    guestCount: '2', 
    province: initialData.region || '',
    address: initialData.address || '',
    city: initialData.city || '',
    zipCode: initialData.zipCode || '',
    latlng: initialData.latlng || [120.9842, 14.5995],
    propertyFiles: [] as File[],
    existingImages: (initialData.images || []).map((img: any) => img.url),
    amenities: [] as string[],
    rules: {
      femaleOnly: initialData.rules?.femaleOnly || false,
      maleOnly: initialData.rules?.maleOnly || false,
      visitorsAllowed: initialData.rules?.visitorsAllowed ?? true,
      petsAllowed: initialData.rules?.petsAllowed || false,
      smokingAllowed: initialData.rules?.smokingAllowed || false,
    },
    features: {
      security24h: initialData.features?.security24h || false,
      cctv: initialData.features?.cctv || false,
      fireSafety: initialData.features?.fireSafety || false,
      nearTransport: initialData.features?.nearTransport ?? true,
      studyFriendly: initialData.features?.studyFriendly ?? true,
      quietEnvironment: initialData.features?.quietEnvironment || false,
      flexibleLease: initialData.features?.flexibleLease ?? true,
    },
    categories: (initialData.categories || []).map((cat: any) => cat.category?.name),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [activeSection, setActiveSection] = useState('basics');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < 200) setActiveSection('basics');
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (initialData.amenities) {
      const activeAmenities: string[] = [];
      const am = initialData.amenities;
      const mapping: Record<string, any> = {
        'Wifi': 'wifi',
        'Air Conditioning': 'airConditioning',
        'Parking': 'parking',
        'Kitchen': 'kitchen',
        'Laundry': 'laundry',
        'Gym': 'gym',
        'Swimming Pool': 'pool',
        'Elevator': 'elevator',
        '24/7 Security': 'security24h'
      };

      Object.entries(mapping).forEach(([label, key]) => {
        if (am[key]) activeAmenities.push(label);
      });

      setFormData(prev => ({ ...prev, amenities: activeAmenities }));
    }
  }, [initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
      if (filesArray.length !== e.target.files.length) {
        toast.error('Only image files are allowed.');
      }
      setFormData(prev => ({ ...prev, propertyFiles: [...prev.propertyFiles, ...filesArray] }));
    }
  };

  const deleteExistingImage = (url: string) => {
    setFormData(prev => ({ ...prev, existingImages: prev.existingImages.filter((img: string) => img !== url) }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.price || parseInt(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (formData.existingImages.length === 0 && formData.propertyFiles.length === 0) {
      newErrors.images = 'At least one property image is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitForm = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix errors before saving.');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Synchronizing updates across all records...');
    
    try {
      const newImageUrls: string[] = [];
      for (const file of formData.propertyFiles) {
        const res = await edgestore.publicFiles.upload({ file });
        newImageUrls.push(res.url);
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        price: parseInt(formData.price),
        roomCount: parseInt(formData.roomCount),
        bathroomCount: parseInt(formData.bathroomCount),
        region: formData.province,
        address: formData.address,
        city: formData.city,
        zipCode: formData.zipCode,
        latlng: formData.latlng,
        category: formData.categories,
        amenities: formData.amenities,
        images: [...formData.existingImages, ...newImageUrls],
        ...formData.rules,
        ...formData.features,
      };

      const isEditing = !!initialData?.id;
      const url = isEditing ? `/api/landlord/properties?id=${initialData.id}` : '/api/landlord/properties';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(isEditing ? 'Property updated successfully!' : 'Property created successfully!', { id: toastId });
        router.push('/landlord/properties');
        router.refresh();
      } else {
        toast.error(result.error || `Failed to ${isEditing ? 'update' : 'create'} property`, { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error('An unexpected error occurred.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    setFormData,
    errors,
    isSubmitting,
    isMounted,
    activeSection,
    setActiveSection,
    handleImageChange,
    deleteExistingImage,
    handleSubmitForm,
    getSafeImageSrc
  };
}

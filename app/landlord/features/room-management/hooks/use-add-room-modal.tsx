import React, { useState, useEffect } from 'react';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';
import { useEdgeStore } from '@/lib/edgestore';
import { ROOM_TYPES } from '@/data/roomTypes';

interface UseAddRoomModalProps {
  initialListingId?: string;
  initialData?: any;
  onSuccess?: () => void;
  onClose: () => void;
}

export const useAddRoomModal = ({
  initialListingId,
  initialData,
  onSuccess,
  onClose
}: UseAddRoomModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const { edgestore } = useEdgeStore();
  const responsiveToast = useResponsiveToast();
  const [uploadingImages, setUploadingImages] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    listingId: initialListingId || '',
    name: '',
    description: '',
    roomType: '',
    bathroomArrangement: '',
    bedType: '',
    bedCount: '',
    price: '',
    capacity: '',
    availableSlots: '',
    reservationFee: '',
    size: '',
    amenities: [] as string[],
    images: [] as string[]
  });
  
  // SYNC INITIAL DATA (EDIT MODE)
  React.useEffect(() => {
    if (initialData) {
      setFormData({
        listingId: initialData.propertyId || initialListingId || '',
        name: initialData.name || '',
        description: initialData.description || '',
        roomType: initialData.roomType || '',
        bathroomArrangement: initialData.bathroomArrangement || '',
        bedType: initialData.bedType || '',
        bedCount: initialData.bedCount?.toString() || '',
        price: initialData.price?.toString() || '',
        capacity: initialData.capacity?.toString() || '',
        availableSlots: initialData.availableSlots?.toString() || '',
        reservationFee: initialData.reservationFee?.toString() || '',
        size: initialData.size?.toString() || '',
        amenities: initialData.amenities?.map((a: any) => typeof a === 'string' ? a : a.id) || [],
        images: initialData.images || []
      });
    }
  }, [initialData, initialListingId]);

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.listingId) newErrors.listingId = 'Please select a building';
      if (!formData.name) newErrors.name = 'Room name is required';
      if (!formData.roomType) newErrors.roomType = 'Please select a room category';
      if (!formData.bathroomArrangement) newErrors.bathroomArrangement = 'Please select a bathroom setup';
    }

    if (step === 2) {
      // Price
      const price = Number(formData.price);
      if (formData.price === undefined || formData.price === '') {
        newErrors.price = 'Price is required';
      } else if (price < 500) {
        newErrors.price = 'Price must be at least ₱500';
      } else if (price > 50000) {
        newErrors.price = 'Price cannot exceed ₱50,000';
      }

      // Reservation Fee
      const resFee = Number(formData.reservationFee);
      if (formData.reservationFee === undefined || formData.reservationFee === '') {
        newErrors.reservationFee = 'Reservation fee is required';
      } else if (resFee < 500) {
        newErrors.reservationFee = 'Fee must be at least ₱500';
      } else if (resFee > 50000) {
        newErrors.reservationFee = 'Fee cannot exceed ₱50,000';
      }

      if (!formData.bedType) newErrors.bedType = 'Bed type is required';
      
      // Bed Count
      const bedCountStr = formData.bedCount;
      if (bedCountStr === undefined || bedCountStr === '') {
        newErrors.bedCount = 'Bed count is required';
      } else {
        const bedCount = Number(bedCountStr);
        if (bedCount < 1) {
          newErrors.bedCount = 'Bed count must be at least 1';
        } else if (bedCount > 10) {
          newErrors.bedCount = 'Bed count cannot exceed 10';
        }
      }

      // Capacity Logic (Specific to Bedspace)
      if (formData.bedCount && !newErrors.bedCount) {
        if (!formData.bedType) {
          newErrors.capacity = 'Please select a bed type';
        } else if (Number(formData.capacity) <= 0) {
          newErrors.capacity = 'Capacity cannot be zero';
        } else if (formData.roomType === 'BEDSPACE' && Number(formData.capacity) <= 1) {
          newErrors.capacity = 'Bedspace capacity must be > 1';
        }
      }

      // Size
      const sizeStr = formData.size;
      if (sizeStr === undefined || sizeStr === '') {
        newErrors.size = 'Size is required';
      } else {
        const size = Number(sizeStr);
        if (size < 5) {
          newErrors.size = 'Size must be at least 5 sqm';
        } else if (size > 100) {
          newErrors.size = 'Size cannot exceed 100 sqm';
        }
      }

      if (!formData.description || formData.description.length < 20) {
        newErrors.description = 'Description needs at least 20 chars';
      }
    }

    if (step === 3) {
      if (files.length === 0 && formData.images.length === 0) {
        newErrors.images = 'At least one photo is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // AUTO CALCULATION LOGIC
      if (name === 'bedType' || name === 'bedCount' || name === 'roomType') {
        const type = newData.roomType;
        const bType = newData.bedType;
        const bCount = newData.bedCount;
        
        if (!bType || !bCount || Number(bCount) === 0) {
          newData.capacity = '';
        } else if (type === 'BEDSPACE') {
          newData.capacity = bType === 'BUNK' ? (Number(bCount) * 2).toString() : bCount.toString();
        } else {
          newData.capacity = bCount.toString();
        }
        newData.availableSlots = newData.capacity;
      }
      
      return newData;
    });

    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleCategoryToggle = (typeId: string) => {
    const nextType = formData.roomType === typeId ? '' : typeId;
    setFormData(prev => {
      const newData = { 
        ...prev, 
        roomType: nextType,
        amenities: [],
        bedType: '', // RESET ON CATEGORY CHANGE
        bedCount: '',
        capacity: '',
        availableSlots: ''
      };
      
      return newData;
    });
    
    // Clear roomType error if selected
    if (errors.roomType) {
        setErrors(prev => { const n = {...prev}; delete n.roomType; return n; });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (files.length + selectedFiles.length > 5) return responsiveToast.error({ title: "Too Many Images", description: 'You can only upload up to 5 images per room.' });
      const invalidFiles = selectedFiles.filter(file => file.size > 5 * 1024 * 1024);
      if (invalidFiles.length > 0) return responsiveToast.error({ title: "File Too Large", description: 'Please make sure each image is under 5MB.' });
      setFiles(prev => [...prev, ...selectedFiles]);
      setErrors(prev => ({ ...prev, images: '' }));
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      // Scroll to top of next step
      const container = document.querySelector('.custom-scrollbar');
      if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setShakeKey(prev => prev + 1); // Trigger shake animation again
      // Auto-scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.getElementById(`field-${firstErrorField}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
        setShakeKey(prev => prev + 1);
        return;
    }
    setLoading(true);
    let imageUrls = [...formData.images];

    try {
      if (files.length > 0) {
        setUploadingImages(true);
        const uploadPromises = files.map(file => edgestore.publicFiles.upload({ file }));
        const uploads = await Promise.all(uploadPromises);
        imageUrls = [...imageUrls, ...uploads.map(u => u.url)];
      }

      const url = initialData ? `/api/landlord/rooms/${initialData.id}` : '/api/landlord/rooms';
      const response = await fetch(url, {
        method: initialData ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          images: imageUrls,
          price: Number(formData.price),
          capacity: Number(formData.capacity),
          availableSlots: Number(formData.availableSlots),
          bedCount: Number(formData.bedCount),
          reservationFee: Number(formData.reservationFee),
          size: formData.size ? Number(formData.size) : null,
        }),
      });

      if (response.ok) {
        responsiveToast.success({
          title: "SUCCESS",
          description: initialData ? 'Unit updated!' : 'Unit published!'
        });
        onSuccess?.();
        onClose();
        setCurrentStep(1);
        setFiles([]);
      } else {
        const err = await response.json();
        responsiveToast.error({ title: "ERROR", description: err.message || 'Failed to save' });
      }
    } catch (error) {
      console.error(error);
      responsiveToast.error({ title: "ERROR", description: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  return {
    currentStep,
    loading,
    uploadingImages,
    errors,
    files,
    formData,
    setFormData,
    setErrors,
    handleChange,
    handleCategoryToggle,
    handleFileChange,
    removeFile,
    setFiles,
    shakeKey,
    handleNext,
    handleBack,
    handleSubmit
  };
};

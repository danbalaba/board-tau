import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';
import { useEdgeStore } from '@/lib/edgestore';


import { validateField } from '../validation/room-schema';
import { saveDraftToStorage, loadDraftFromStorage, clearDraftFromStorage } from '@/utils/draftStorage';
import { formatCleanTitle } from '@/lib/utils';

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
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const { edgestore } = useEdgeStore();
  const responsiveToast = useResponsiveToast();
  const [uploadingImages, setUploadingImages] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [restoredDraft, setRestoredDraft] = useState(false);

  const [formData, setFormData] = useState({
    listingId: initialListingId || '',
    name: '',
    description: '',
    roomType: '',
    bathroomArrangement: '',
    kitchenSetup: '',
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

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<number | null>(null);
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [savedDraftData, setSavedDraftData] = useState<any | null>(null);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [isCheckingDraft, setIsCheckingDraft] = useState(!initialData);
  const [activeAmenityCategory, setActiveAmenityCategory] = useState<string>('');

  const draftKey = `add_room_modal_draft_${initialListingId || 'global'}`;

  // CHECK DRAFT FROM INDEXEDDB ON MOUNT (CREATE MODE ONLY)
  useEffect(() => {
    if (initialData) {
      setIsCheckingDraft(false);
      return;
    }
    let isMounted = true;

    const checkDraft = async () => {
      try {
        let saved = await loadDraftFromStorage(draftKey);
        if (!saved && !initialListingId) {
          saved = await loadDraftFromStorage('add_room_modal_draft_general');
        }

        if (isMounted && saved && saved.formData) {
          const hasContent = Object.values(saved.formData).some(val => 
            Array.isArray(val) ? val.length > 0 : Boolean(val && String(val).trim() !== '')
          );
          if (hasContent) {
            setHasSavedDraft(true);
            setSavedDraftData(saved);
            setShowDraftModal(true);
          }
        }
      } catch (err) {
        console.warn('Failed to check room draft:', err);
      } finally {
        if (isMounted) {
          setIsCheckingDraft(false);
        }
      }
    };

    checkDraft();

    return () => { isMounted = false; };
  }, [initialListingId, initialData, draftKey]);

  // APPLY DRAFT INTO FORM ON USER CONFIRMATION
  const applyDraft = () => {
    if (savedDraftData && savedDraftData.formData) {
      setFormData(prev => ({
        ...prev,
        ...savedDraftData.formData,
        listingId: initialListingId || savedDraftData.formData.listingId || prev.listingId
      }));
      if (savedDraftData.currentStep && typeof savedDraftData.currentStep === 'number') {
        setCurrentStep(savedDraftData.currentStep);
      }
      if (savedDraftData.activeAmenityCategory && typeof savedDraftData.activeAmenityCategory === 'string') {
        setActiveAmenityCategory(savedDraftData.activeAmenityCategory);
      }
      setRestoredDraft(true);
      setSaveStatus('saved');
      const now = new Date();
      setLastSavedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setLastSavedTimestamp(Date.now());
      responsiveToast.info({
        title: "DRAFT RESTORED",
        description: "Restored your unsaved room progress."
      });
    }
    setShowDraftModal(false);
  };

  // AUTO-SAVE FORM STATE TO INDEXEDDB
  useEffect(() => {
    if (initialData) return;
    const hasData = Boolean(
      formData.listingId ||
      formData.name || 
      formData.description || 
      formData.roomType || 
      formData.price || 
      formData.images.length > 0 ||
      formData.amenities.length > 0
    );

    if (hasData) {
      const timer = setTimeout(() => {
        setSaveStatus('saving');
        const saveStartTime = Date.now();
        saveDraftToStorage(draftKey, { formData, currentStep, activeAmenityCategory }).then(() => {
          const elapsedTime = Date.now() - saveStartTime;
          const minDisplay = Math.max(0, 500 - elapsedTime);
          setTimeout(() => {
            setSaveStatus('saved');
            const now = new Date();
            setLastSavedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            setLastSavedTimestamp(Date.now());
          }, minDisplay);
        }).catch(err => {
          console.warn('Failed to auto-save room draft:', err);
          setSaveStatus('idle');
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [formData, currentStep, activeAmenityCategory, draftKey, initialData]);

  // DISCARD DRAFT AND CLEAR FROM INDEXEDDB
  const discardDraft = async () => {
    try {
      await clearDraftFromStorage(draftKey);
      await clearDraftFromStorage('add_room_modal_draft_general');
    } catch (err) {
      console.warn('Failed to clear room draft:', err);
    }
    setFormData({
      listingId: initialListingId || '',
      name: '',
      description: '',
      roomType: '',
      bathroomArrangement: '',
      kitchenSetup: '',
      bedType: '',
      bedCount: '',
      price: '',
      capacity: '',
      availableSlots: '',
      reservationFee: '',
      size: '',
      amenities: [],
      images: []
    });
    setFiles([]);
    setCurrentStep(1);
    setErrors({});
    setRestoredDraft(false);
    setHasSavedDraft(false);
    setSavedDraftData(null);
    setShowDraftModal(false);
    setSaveStatus('idle');
    setLastSavedTimestamp(null);
    setLastSavedTime('');
    responsiveToast.success({
      title: "DRAFT CLEARED",
      description: "Form reset to default."
    });
  };
  
  // SYNC INITIAL DATA (EDIT MODE)
  React.useEffect(() => {
    if (initialData) {
      setFormData({
        listingId: initialData.propertyId || initialListingId || '',
        name: initialData.name || '',
        description: initialData.description || '',
        roomType: initialData.roomType || '',
        bathroomArrangement: initialData.bathroomArrangement || '',
        kitchenSetup: initialData.kitchenSetup || '',
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
      const fieldsToValidate = ['listingId', 'name', 'roomType', 'bathroomArrangement', 'kitchenSetup'];
      fieldsToValidate.forEach((f) => {
        const err = validateField(f, (formData as any)[f]);
        if (err) newErrors[f] = err;
      });
    }

    if (step === 2) {
      const fieldsToValidate = ['price', 'reservationFee', 'bedType', 'bedCount', 'size'];
      fieldsToValidate.forEach((f) => {
        const err = validateField(f, (formData as any)[f]);
        if (err) newErrors[f] = err;
      });

      // Capacity Logic (Specific to Bedspace)
      if (formData.bedCount && !newErrors.bedCount) {
        if (!formData.bedType) {
          newErrors.capacity = 'Please select a bed type';
        } else if (Number(formData.capacity) <= 0) {
          newErrors.capacity = 'Capacity cannot be zero or negative';
        } else if (formData.roomType === 'BEDSPACE' && Number(formData.capacity) <= 1) {
          newErrors.capacity = 'Bedspace capacity must be > 1';
        }
      }
    }

    if (step === 3) {
      const descErr = validateField('description', formData.description);
      if (descErr) newErrors.description = descErr;

      if (files.length === 0 && formData.images.length === 0) {
        newErrors.images = 'At least one photo is required';
      }
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;

    if (!isValid) {
      const firstErrorField = Object.keys(newErrors)[0];
      if (firstErrorField) {
        setTimeout(() => {
          const element = document.getElementById(`field-${firstErrorField}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 50);
      }
    }

    return isValid;
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // AUTO CALCULATION LOGIC
      if (name === 'bedType' || name === 'bedCount' || name === 'roomType') {
        const bType = newData.bedType;
        const bCount = newData.bedCount;
        const bCountNum = Number(bCount);
        
        if (!bType || !bCount || isNaN(bCountNum) || bCountNum <= 0) {
          newData.capacity = '';
        } else {
          const isBunk = String(bType).toUpperCase().includes('BUNK') || String(bType).toUpperCase().includes('DECK');
          const multiplier = isBunk ? 2 : 1;
          newData.capacity = (bCountNum * multiplier).toString();
        }
        newData.availableSlots = newData.capacity;
      }
      
      return newData;
    });

    // Real-time Zod validation error update
    const err = validateField(name, value);
    setErrors(prev => {
      if (err) {
        return { ...prev, [name]: err };
      } else {
        const next = { ...prev };
        delete next[name];
        return next;
      }
    });
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

      const nonImageFiles = selectedFiles.filter(file => !file.type.startsWith('image/'));
      if (nonImageFiles.length > 0) return responsiveToast.error({ title: "Invalid File Type", description: 'Please upload only image files (JPG, PNG, WEBP).' });

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
          name: formatCleanTitle(formData.name),
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
        setSubmitted(true);
        clearDraftFromStorage(draftKey).catch(() => {});
        clearDraftFromStorage('add_room_modal_draft_general').catch(() => {});
        setRestoredDraft(false);
        queryClient.invalidateQueries({ queryKey: ['landlordRooms'] });
        queryClient.refetchQueries({ queryKey: ['landlordRooms'] });
        responsiveToast.success({
          title: "SUCCESS",
          description: initialData ? 'Unit updated!' : 'Unit published!'
        });
        
        setTimeout(() => {
          onSuccess?.();
          onClose();
          setCurrentStep(1);
          setFiles([]);
          setSubmitted(false);
        }, 1500);
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
    handleSubmit,
    submitted,
    restoredDraft,
    discardDraft,
    saveStatus,
    lastSavedTime,
    lastSavedTimestamp,
    showDraftModal,
    setShowDraftModal,
    hasSavedDraft,
    savedDraftData,
    applyDraft,
    isCheckingDraft,
    activeAmenityCategory,
    setActiveAmenityCategory
  };
};

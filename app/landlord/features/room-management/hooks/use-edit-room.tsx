import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';
import { useEdgeStore } from '@/lib/edgestore';
import { validateField } from '../validation/room-schema';
import { saveDraftToStorage, loadDraftFromStorage, clearDraftFromStorage } from '@/utils/draftStorage';

interface FormState {
  listingId: string;
  name: string;
  description: string;
  roomType: string;
  bathroomArrangement: string;
  kitchenSetup: string;
  bedType: string;
  bedCount: string;
  price: string;
  capacity: string;
  availableSlots: string;
  reservationFee: string;
  size: string;
  amenities: string[];
  images: string[];
}

export function useEditRoom(
  initialData: any,
  onSuccess: () => void,
  onClose: () => void
) {
  const queryClient = useQueryClient();
  const { edgestore } = useEdgeStore();
  const responsiveToast = useResponsiveToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shakeKey, setShakeKey] = useState(0);

  const [files, setFiles] = useState<File[]>([]);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  const [restoredDraft, setRestoredDraft] = useState(false);

  // Initial form state computed from initialData
  const initialFormState: FormState = useMemo(() => {
    return {
      listingId: initialData?.listingId || initialData?.propertyId || '',
      name: initialData?.name || '',
      description: initialData?.description || '',
      roomType: initialData?.roomTypeDefinitionId || initialData?.roomType || '',
      bathroomArrangement: initialData?.bathroomArrangement || '',
      kitchenSetup: initialData?.kitchenSetup || initialData?.listing?.kitchenSetup || initialData?.listing?.kitchenFacility || '',
      bedType: initialData?.bedType || '',
      bedCount: initialData?.bedCount?.toString() || '1',
      price: initialData?.price?.toString() || '',
      capacity: initialData?.capacity?.toString() || '',
      availableSlots: initialData?.availableSlots?.toString() || '',
      reservationFee: initialData?.reservationFee?.toString() || '',
      size: initialData?.size?.toString() || '',
      amenities: (initialData?.amenities || []).map((a: any) =>
        typeof a === 'string' ? a : (a?.id || a?.name || '')
      ).filter(Boolean) as string[],
      images: (initialData?.images || []).map((img: any) =>
        typeof img === 'string' ? img : (img?.url || '')
      ).filter(Boolean) as string[]
    };
  }, [initialData]);

  const [formData, setFormData] = useState(initialFormState);
  const [history, setHistory] = useState<any[]>([]);

  // Draft state variables
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<number | null>(null);
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [savedDraftData, setSavedDraftData] = useState<any | null>(null);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [isCheckingDraft, setIsCheckingDraft] = useState(true);
  const [activeAmenityCategory, setActiveAmenityCategory] = useState<string>('');

  const roomId = initialData?.id || 'general';
  const draftKey = `edit_room_modal_draft_${roomId}`;

  // Keep form synced when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialFormState);
      setDeletedImages([]);
      setFiles([]);
    }
  }, [initialData, initialFormState]);

  // Check draft from IndexedDB on mount
  useEffect(() => {
    if (!initialData?.id) {
      setIsCheckingDraft(false);
      return;
    }
    let isMounted = true;

    const checkDraft = async () => {
      try {
        const saved = await loadDraftFromStorage(draftKey);
        if (isMounted && saved && saved.formData) {
          const hasChanges = JSON.stringify(saved.formData) !== JSON.stringify(initialFormState);
          if (hasChanges) {
            setHasSavedDraft(true);
            setSavedDraftData(saved);
            setShowDraftModal(true);
          }
        }
      } catch (err) {
        console.warn('Failed to check room edit draft:', err);
      } finally {
        if (isMounted) {
          setIsCheckingDraft(false);
        }
      }
    };

    checkDraft();
    return () => { isMounted = false; };
  }, [initialData?.id, draftKey, initialFormState]);

  // Apply draft into form on user confirmation
  const applyDraft = () => {
    if (savedDraftData && savedDraftData.formData) {
      setFormData(prev => ({
        ...prev,
        ...savedDraftData.formData,
      }));
      if (savedDraftData.currentStep && typeof savedDraftData.currentStep === 'number') {
        setCurrentStep(savedDraftData.currentStep);
      }
      if (savedDraftData.activeAmenityCategory && typeof savedDraftData.activeAmenityCategory === 'string') {
        setActiveAmenityCategory(savedDraftData.activeAmenityCategory);
      }
      if (Array.isArray(savedDraftData.deletedImages)) {
        setDeletedImages(savedDraftData.deletedImages);
      }
      setRestoredDraft(true);
      setSaveStatus('saved');
      const now = new Date();
      setLastSavedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setLastSavedTimestamp(Date.now());
      responsiveToast.info({
        title: "DRAFT RESTORED",
        description: "Restored your unsaved room edit progress."
      });
    }
    setShowDraftModal(false);
  };

  // Auto-save form state to IndexedDB
  useEffect(() => {
    if (!initialData?.id || isCheckingDraft) return;
    const isDifferentFromInitial = JSON.stringify(formData) !== JSON.stringify(initialFormState) || deletedImages.length > 0;

    if (isDifferentFromInitial) {
      const timer = setTimeout(() => {
        setSaveStatus('saving');
        const saveStartTime = Date.now();
        saveDraftToStorage(draftKey, {
          formData,
          currentStep,
          activeAmenityCategory,
          deletedImages
        }).then(() => {
          const elapsedTime = Date.now() - saveStartTime;
          const minDisplay = Math.max(0, 500 - elapsedTime);
          setTimeout(() => {
            setSaveStatus('saved');
            const now = new Date();
            setLastSavedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            setLastSavedTimestamp(Date.now());
          }, minDisplay);
        }).catch(err => {
          console.warn('Failed to auto-save room edit draft:', err);
          setSaveStatus('idle');
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [formData, currentStep, activeAmenityCategory, deletedImages, draftKey, initialData?.id, initialFormState, isCheckingDraft]);

  // Discard draft and clear from IndexedDB
  const discardDraft = async () => {
    try {
      await clearDraftFromStorage(draftKey);
    } catch (err) {
      console.warn('Failed to clear room edit draft:', err);
    }
    setFormData(initialFormState);
    setFiles([]);
    setDeletedImages([]);
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
      description: "Form reset to original values."
    });
  };

  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialFormState) ||
      files.length > 0 ||
      deletedImages.length > 0;
  }, [formData, initialFormState, files.length, deletedImages.length]);

  const canUndo = history.length > 0;

  const saveHistory = useCallback(() => {
    setHistory(prev => {
      const newState = {
        formData: JSON.parse(JSON.stringify(formData)),
        files: [...files],
        deletedImages: [...deletedImages]
      };
      return [...prev, newState].slice(-20);
    });
  }, [formData, files, deletedImages]);

  const handleUndo = useCallback(() => {
    if (history.length > 0) {
      const newHistory = [...history];
      const previousState = newHistory.pop();
      setHistory(newHistory);

      if (previousState && previousState.formData) {
        setFormData(previousState.formData);
        setFiles(previousState.files || []);
        setDeletedImages(previousState.deletedImages || []);
      }
    }
  }, [history]);

  const handleReset = () => {
    setFormData(initialFormState);
    setHistory([]);
    setFiles([]);
    setDeletedImages([]);
    setErrors({});
  };

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

      const remainingImages = formData.images.filter((img: string) => !deletedImages.includes(img));
      if (files.length === 0 && remainingImages.length === 0) {
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
    saveHistory();

    setFormData(prev => {
      const newData = { ...prev, [name]: value };

      if (name === 'roomType') {
        newData.bedType = '';
        newData.bedCount = '';
        newData.capacity = '0';
        newData.availableSlots = '0';
      } else if (name === 'bedType' || name === 'bedCount') {
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
    saveHistory();
    const nextType = formData.roomType === typeId ? '' : typeId;
    setFormData(prev => ({
      ...prev,
      roomType: nextType,
      amenities: [],
      bedType: '',
      bedCount: '',
      capacity: '',
      availableSlots: ''
    }));

    if (errors.roomType) {
      setErrors(prev => { const n = { ...prev }; delete n.roomType; return n; });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      saveHistory();
      const selectedFiles = Array.from(e.target.files);
      const remainingExisting = formData.images.filter((img: string) => !deletedImages.includes(img)).length;
      if (remainingExisting + files.length + selectedFiles.length > 5) {
        return responsiveToast.error({
          title: "Too Many Images",
          description: 'You can only upload up to 5 images per room.'
        });
      }

      const invalidFiles = selectedFiles.filter(file => file.size > 5 * 1024 * 1024);
      if (invalidFiles.length > 0) {
        return responsiveToast.error({
          title: "File Too Large",
          description: 'Please make sure each image is under 5MB.'
        });
      }

      const nonImageFiles = selectedFiles.filter(file => !file.type.startsWith('image/'));
      if (nonImageFiles.length > 0) {
        return responsiveToast.error({
          title: "Invalid File Type",
          description: 'Please upload only image files (JPG, PNG, WEBP).'
        });
      }

      setFiles(prev => [...prev, ...selectedFiles]);
      setErrors(prev => ({ ...prev, images: '' }));
    }
  };

  const removeFile = (index: number) => {
    saveHistory();
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAmenityToggle = (val: string) => {
    saveHistory();
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(val)
        ? prev.amenities.filter((a: string) => a !== val)
        : [...prev.amenities, val]
    }));
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      const container = document.querySelector('.custom-scrollbar');
      if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setShakeKey(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep(prev => prev - 1);
  };

  const validateAll = () => {
    const newErrors: Record<string, string> = {};
    const fieldsToValidate1 = ['listingId', 'name', 'roomType', 'bathroomArrangement', 'kitchenSetup'];
    fieldsToValidate1.forEach((f) => {
      const err = validateField(f, (formData as any)[f]);
      if (err) newErrors[f] = err;
    });

    const fieldsToValidate2 = ['price', 'reservationFee', 'bedType', 'bedCount', 'size'];
    fieldsToValidate2.forEach((f) => {
      const err = validateField(f, (formData as any)[f]);
      if (err) newErrors[f] = err;
    });

    const descErr = validateField('description', formData.description);
    if (descErr) newErrors.description = descErr;

    const remainingImages = formData.images.filter((img: string) => !deletedImages.includes(img));
    if (files.length === 0 && remainingImages.length === 0) {
      newErrors.images = 'At least one photo is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateAll()) {
      setShakeKey(prev => prev + 1);
      return;
    }
    setLoading(true);
    let imageUrls = formData.images.filter((img: string) => !deletedImages.includes(img));

    try {
      if (files.length > 0) {
        setUploadingImages(true);
        const uploadPromises = files.map(file => edgestore.publicFiles.upload({ file }));
        const uploads = await Promise.all(uploadPromises);
        imageUrls = [...imageUrls, ...uploads.map(u => u.url)];
      }

      const response = await fetch(`/api/landlord/rooms/${initialData.id}`, {
        method: 'PATCH',
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
        setSubmitted(true);
        clearDraftFromStorage(draftKey).catch(() => { });
        setRestoredDraft(false);
        queryClient.invalidateQueries({ queryKey: ['landlordRooms'] });
        queryClient.refetchQueries({ queryKey: ['landlordRooms'] });
        responsiveToast.success({
          title: "SUCCESS",
          description: 'Unit details updated successfully!'
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
        responsiveToast.error({ title: "ERROR", description: err.message || 'Failed to update unit' });
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
    handleAmenityToggle,
    handleFileChange,
    removeFile,
    setFiles,
    deletedImages,
    setDeletedImages,
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
    setActiveAmenityCategory,
    isDirty,
    canUndo,
    handleUndo,
    handleReset,
    saveHistory
  };
}

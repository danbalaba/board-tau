'use client';

import { useState, useEffect, useRef } from 'react';
import { validateCreateListingStep } from '../components/creator/validation/create-listing';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { useEdgeStore } from '@/lib/edgestore';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface RoomType {
  roomType: string;
  bathroomArrangement: string;
  price: string;
  bedType: string;
  bedCount: string;
  capacity: string;
  size: string;
  availableSlots: string;
  reservationFee: string;
  description: string;
  amenities: string[];
}

import { saveDraftToStorage, loadDraftFromStorage, clearDraftFromStorage } from '@/utils/draftStorage';
import { formatCleanTitle } from '@/lib/utils';

export function usePropertyCreatorLogic(initialData: any) {
  const router = useRouter();
  const propertyId = initialData?.id ? String(initialData.id) : '';
  const isSubmittedRef = useRef(false);
  const { edgestore } = useEdgeStore();
  const { success, error: toastError } = useResponsiveToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [navDirection, setNavDirection] = useState<'next' | 'back' | null>(null);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(propertyId ? 6 : 0);

  useEffect(() => {
    if (propertyId) {
      setMaxUnlockedStep(6);
    } else {
      setMaxUnlockedStep((prev) => Math.max(prev, currentStep));
    }
  }, [currentStep, propertyId]);

  const [isMounted, setIsMounted] = useState(false);
  const [isProcessingNext, setIsProcessingNext] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const [propertyFiles, setPropertyFiles] = useState<Record<string, File[]>>({});
  const [roomFiles, setRoomFiles] = useState<Record<number, File[]>>({});

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const dbImageUrls = (initialData?.images || []).map((i: any) => typeof i === 'string' ? i : i.url).filter(Boolean);
  if (dbImageUrls.length === 0 && initialData?.imageSrc) {
    dbImageUrls.push(initialData.imageSrc);
  }

  const mappedPropertyImages = initialData?.propertyImages?.property || {
    'General': dbImageUrls,
    'Bedroom': dbImageUrls.slice(0, 1),
    'Kitchen': dbImageUrls.slice(0, 1),
    'Bathroom': dbImageUrls.slice(0, 1),
    'Common Area': dbImageUrls.slice(0, 1),
    'Exterior': dbImageUrls.slice(0, 1),
  };

  const mappedRoomImages: Record<number, string[]> = initialData?.propertyImages?.rooms || {};
  (initialData?.rooms || []).forEach((r: any, idx: number) => {
    const rImgs = (r.images || []).map((img: any) => typeof img === 'string' ? img : img.url).filter(Boolean);
    mappedRoomImages[idx] = rImgs.length > 0 ? rImgs : (dbImageUrls.slice(0, 1));
  });

  const defaultValues = {
    propertyInfo: {
      propertyName: initialData?.propertyInfo?.propertyName || initialData?.title || '',
      description: initialData?.propertyInfo?.description || initialData?.description || '',
      price: (initialData?.propertyInfo?.price ?? initialData?.price ?? '').toString(),
      category: initialData?.propertyInfo?.category || initialData?.category || initialData?.propertyType?.name || '',
      propertyTypeId: initialData?.propertyInfo?.propertyTypeId || initialData?.propertyTypeId || initialData?.propertyType?.id || '',
    },
    businessInfo: {
      businessName: initialData?.businessInfo?.businessName || initialData?.title || '',
      businessType: initialData?.businessInfo?.businessType || initialData?.category || initialData?.propertyType?.name || '',
      businessDescription: initialData?.businessInfo?.businessDescription || initialData?.description || '',
      yearsExperience: initialData?.businessInfo?.yearsExperience || '',
    },
    location: {
      address: initialData?.location?.address || initialData?.address || '',
      city: initialData?.location?.city || initialData?.city || '',
      province: initialData?.location?.province || initialData?.region || '',
      zipCode: initialData?.location?.zipCode || initialData?.zipCode || '',
      coordinates: initialData?.location?.coordinates || 
        ((initialData?.latitude && initialData?.longitude) ? [initialData.latitude, initialData.longitude] : []),
    },
    propertyConfig: {
      totalRooms: initialData?.propertyConfig?.totalRooms !== undefined && initialData?.propertyConfig?.totalRooms !== null 
        ? String(initialData.propertyConfig.totalRooms) 
        : (initialData?.roomCount !== undefined && initialData?.roomCount !== null ? String(initialData.roomCount) : (initialData?.rooms?.length ? String(initialData.rooms.length) : '')),
      bathroomCount: initialData?.propertyConfig?.bathroomCount !== undefined && initialData?.propertyConfig?.bathroomCount !== null 
        ? String(initialData.propertyConfig.bathroomCount) 
        : (initialData?.bathroomCount !== undefined && initialData?.bathroomCount !== null ? String(initialData.bathroomCount) : ''),
      kitchenSetup: initialData?.propertyConfig?.kitchenSetup || initialData?.kitchenSetup || '',
      bathroomSetup: initialData?.propertyConfig?.bathroomSetup || initialData?.bathroomSetup || '',
      femaleOnly: initialData?.propertyConfig?.femaleOnly ?? initialData?.femaleOnly ?? false,
      maleOnly: initialData?.propertyConfig?.maleOnly ?? initialData?.maleOnly ?? false,
      visitorsAllowed: initialData?.propertyConfig?.visitorsAllowed ?? initialData?.visitorsAllowed ?? true,
      petsAllowed: initialData?.propertyConfig?.petsAllowed ?? initialData?.petsAllowed ?? false,
      smokingAllowed: initialData?.propertyConfig?.smokingAllowed ?? initialData?.smokingAllowed ?? false,
      security24h: initialData?.propertyConfig?.security24h ?? initialData?.security24h ?? false,
      cctv: initialData?.propertyConfig?.cctv ?? initialData?.cctv ?? false,
      fireSafety: initialData?.propertyConfig?.fireSafety ?? initialData?.fireSafety ?? false,
      nearTransport: initialData?.propertyConfig?.nearTransport ?? initialData?.nearTransport ?? true,
      studyFriendly: initialData?.propertyConfig?.studyFriendly ?? initialData?.studyFriendly ?? false,
      quietEnvironment: initialData?.propertyConfig?.quietEnvironment ?? initialData?.quietEnvironment ?? false,
      flexibleLease: initialData?.propertyConfig?.flexibleLease ?? initialData?.flexibleLease ?? false,
      amenities: initialData?.propertyConfig?.amenities || (initialData?.listingLinks || []).map((link: any) => link.attributeId || link.attribute?.id || link.attribute?.name || link).filter(Boolean),
      rules: initialData?.propertyConfig?.rules || initialData?.rules || [],
      features: initialData?.propertyConfig?.features || initialData?.features || [],
      depositAmount: initialData?.propertyConfig?.depositAmount !== undefined && initialData?.propertyConfig?.depositAmount !== null 
        ? String(initialData.propertyConfig.depositAmount) 
        : (initialData?.depositAmount !== undefined && initialData?.depositAmount !== null ? String(initialData.depositAmount) : ''),
      moveOutNoticeDays: initialData?.propertyConfig?.moveOutNoticeDays !== undefined && initialData?.propertyConfig?.moveOutNoticeDays !== null 
        ? String(initialData.propertyConfig.moveOutNoticeDays) 
        : (initialData?.moveOutNoticeDays !== undefined && initialData?.moveOutNoticeDays !== null ? String(initialData.moveOutNoticeDays) : ''),
      contractMode: initialData?.propertyConfig?.contractMode || initialData?.contractMode || (initialData?.customPdfUrl || initialData?.pdfUrl || initialData?.documents?.customContract ? 'CUSTOM_PDF' : 'AUTO_GEN'),
      customPdfUrl: initialData?.propertyConfig?.customPdfUrl || initialData?.customPdfUrl || initialData?.pdfUrl || initialData?.documents?.customContract || initialData?.businessInfo?.documents?.customContract || '',
      customContractClauses: initialData?.propertyConfig?.customContractClauses || initialData?.customContractClauses || [],
      landlordSignatureBase64: initialData?.propertyConfig?.landlordSignatureBase64 || '',
      rooms: (initialData?.propertyConfig?.rooms || (initialData?.rooms || []).map((r: any) => ({
        roomType: r.roomType || r.roomTypeDefinitionId || r.roomTypeDefinition?.name || r.roomTypeDefinition?.id || 'SOLO',
        bathroomArrangement: (r.bathroomArrangement === 'PRIVATE' || r.bathroomArrangement === 'PRIVATE_CR') ? 'PRIVATE_CR' : 'COMMON_CR',
        price: (r.price ?? initialData?.price ?? 1000).toString(),
        bedType: r.bedType || 'SINGLE',
        bedCount: (r.bedCount ?? 1).toString(),
        capacity: (r.capacity ?? 1).toString(),
        size: (r.size ?? 15).toString(),
        availableSlots: (r.availableSlots ?? 1).toString(),
        reservationFee: (r.reservationFee ?? 500).toString(),
        description: r.description || '',
        amenities: (r.roomLinks || r.amenities || []).map((link: any) => typeof link === 'string' ? link : (link.attributeId || link.attribute?.id || link.attribute?.name || link.id || link.name)).filter(Boolean),
      }))) as RoomType[], 
    },
    propertyImages: {
      property: mappedPropertyImages,
      rooms: mappedRoomImages,
    },
    documents: initialData?.documents || {
      governmentId: initialData?.governmentId || initialData?.landlordVerificationDocs || '',
      businessPermit: initialData?.businessPermit || initialData?.landlordVerificationDocs || '',
      landTitle: initialData?.landTitle || initialData?.landlordVerificationDocs || '',
      barangayClearance: initialData?.barangayClearance || initialData?.landlordVerificationDocs || '',
      fireSafetyCertificate: initialData?.fireSafetyCertificate || initialData?.landlordVerificationDocs || '',
    },
  };

  const methods = useForm({
    defaultValues,
    mode: 'onChange',
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    setError,
    clearErrors,
    reset,
    formState: { errors },
  } = methods;

  // Reset form with database values when editing a new property
  useEffect(() => {
    if (propertyId) {
      reset(defaultValues);
    }
  }, [propertyId]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'propertyConfig.rooms',
  });

  // 💾 Persistent Draft Auto-Save System (Separated per property ID for Edit Mode)
  const DRAFT_KEY = initialData?.id 
    ? `boardtau_property_editor_draft_${initialData.id}` 
    : 'boardtau_property_creator_draft';
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [savedDraftData, setSavedDraftData] = useState<any>(null);
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const isDraftNotEmpty = (parsed: any): boolean => {
    if (!parsed || !parsed.formValues) return false;
    if (parsed.currentStep > 0) return true;
    const pInfo = parsed.formValues.propertyInfo || {};
    const bInfo = parsed.formValues.businessInfo || {};
    const loc = parsed.formValues.location || {};
    
    return Boolean(
      pInfo.propertyName?.trim() ||
      pInfo.description?.trim() ||
      pInfo.price?.trim() ||
      bInfo.businessName?.trim() ||
      bInfo.businessDescription?.trim() ||
      loc.address?.trim()
    );
  };

  // Check for existing saved draft on initial mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    loadDraftFromStorage(DRAFT_KEY).then((parsed) => {
      if (parsed && isDraftNotEmpty(parsed)) {
        setSavedDraftData(parsed);
        setHasSavedDraft(true);
        if (parsed.updatedAt) {
          const timeObj = new Date(parsed.updatedAt);
          setLastSavedTimestamp(timeObj.getTime());
          setLastSavedTime(timeObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          setSaveStatus('saved');
        }
      } else {
        // Purge invalid/empty legacy draft
        clearDraftFromStorage(DRAFT_KEY).catch(() => {});
      }
    }).catch((err) => {
      console.warn('Error reading property creator draft:', err);
    });
  }, []);

  // Auto-save form state to IndexedDB / Storage whenever fields or step changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let timer: NodeJS.Timeout;

    const subscription = watch((value) => {
      if (isSubmitting || isSubmittedRef.current) return;
      if (!isDraftNotEmpty({ formValues: value, currentStep })) return;
      
      setSaveStatus('saving');
      clearTimeout(timer);

      timer = setTimeout(async () => {
        if (isSubmitting || isSubmittedRef.current) return;
        try {
          const now = new Date();
          const draftPayload = {
            formValues: value,
            currentStep,
            maxUnlockedStep,
            updatedAt: now.toISOString(),
          };
          await saveDraftToStorage(DRAFT_KEY, draftPayload);
          setLastSavedTimestamp(now.getTime());
          setLastSavedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        } catch (err) {
          console.warn('Failed to auto-save property creator draft:', err);
        } finally {
          setSaveStatus('saved');
        }
      }, 600);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [watch, currentStep, maxUnlockedStep]);

  // Immediately persist step navigation changes to draft storage (Creation mode only)
  useEffect(() => {
    if (typeof window === 'undefined' || propertyId) return;
    const formValues = getValues();
    if (!isDraftNotEmpty({ formValues, currentStep })) return;

    const now = new Date();
    const draftPayload = {
      formValues,
      currentStep,
      maxUnlockedStep,
      updatedAt: now.toISOString(),
    };
    saveDraftToStorage(DRAFT_KEY, draftPayload).then(() => {
      setLastSavedTimestamp(now.getTime());
      setLastSavedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setSaveStatus('saved');
    }).catch((err) => {
      console.warn('Failed to save step change to draft storage:', err);
    });
  }, [currentStep, maxUnlockedStep, getValues, propertyId]);

  const [isDraftActionExecuted, setIsDraftActionExecuted] = useState(false);

  const loadDraft = () => {
    if (isDraftActionExecuted || !savedDraftData) return;
    setIsDraftActionExecuted(true);
    methods.reset(savedDraftData.formValues);
    if (typeof savedDraftData.currentStep === 'number') {
      setCurrentStep(savedDraftData.currentStep);
    }
    if (typeof savedDraftData.maxUnlockedStep === 'number') {
      setMaxUnlockedStep(savedDraftData.maxUnlockedStep);
    } else if (typeof savedDraftData.currentStep === 'number') {
      setMaxUnlockedStep(savedDraftData.currentStep);
    }
    setHasSavedDraft(false);
    setSavedDraftData(null);
    success('Draft restored! Continuing where you left off.', { id: 'draft-restored-toast' });
  };

  const clearDraft = () => {
    clearDraftFromStorage(DRAFT_KEY).catch(() => {});
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(DRAFT_KEY);
        sessionStorage.removeItem(DRAFT_KEY);
      } catch (e) {}
    }
    setUploadedFiles({});
    setPropertyFiles({});
    setRoomFiles({});
    methods.reset(defaultValues);
    setCurrentStep(0);
    setMaxUnlockedStep(0);
    setHasSavedDraft(false);
    setSavedDraftData(null);
    setSaveStatus('idle');
  };

  const watchedTotalRooms = watch('propertyConfig.totalRooms');

  // Auto-sync rooms based on totalRooms count
  useEffect(() => {
    const totalRooms = parseInt(watchedTotalRooms) || 0;
    const currentRooms = getValues('propertyConfig.rooms') || [];
    const currentCount = currentRooms.length;
    
    // Kill-switch: Stop generating if the user types > 50 to prevent browser crashes
    if (totalRooms > 50) return;
    
    if (totalRooms === currentCount) return;

    if (totalRooms > currentCount) {
      const diff = totalRooms - currentCount;
      const roomsToAdd = Array.from({ length: diff }, () => ({
        roomType: '',
        bathroomArrangement: '',
        price: '',
        bedType: '',
        bedCount: '',
        capacity: '',
        size: '',
        availableSlots: '',
        reservationFee: '',
        description: '',
        amenities: [],
      }));
      append(roomsToAdd);
    } else if (totalRooms < currentCount && totalRooms >= 0) {
      const diff = currentCount - totalRooms;
      for (let i = 0; i < diff; i++) {
        remove(currentCount - 1 - i);
      }
    }
  }, [watchedTotalRooms, append, remove, getValues]);

  // Self-cleaning effect for legacy placeholders
  useEffect(() => {
    if (isMounted) {
      const currentValues = getValues();
      if (currentValues.documents) {
        Object.entries(currentValues.documents).forEach(([key, value]) => {
          if (typeof value === 'string' && /^https?:\/\/pending-upload\.com/.test(value)) {
            setValue(`documents.${key}` as any, '');
          }
        });
      }
    }
  }, [isMounted, getValues, setValue]);

  const handleNext = async () => {
    if (isProcessingNext) return;
    setIsProcessingNext(true);
    
    try {
      clearErrors();
      console.log('Validating step:', currentStep);
      const currentValues = getValues();
      const result = validateCreateListingStep(currentStep, currentValues);

      if (currentStep === 2) { 
        if (!(currentValues.propertyConfig as any).bathroomType) {
          (currentValues.propertyConfig as any).bathroomType = 'PRIVATE';
          const bathroomErrIndex = result.errors.findIndex(e => e.field === 'propertyConfig.bathroomType');
          if (bathroomErrIndex > -1) {
            result.errors.splice(bathroomErrIndex, 1);
            if (result.errors.length === 0) result.valid = true;
          }
        }

        const rawBathroomCount = currentValues.propertyConfig.bathroomCount;
        if (rawBathroomCount === '' || rawBathroomCount === null || rawBathroomCount === undefined) {
          result.valid = false;
          if (!result.errors.some(e => e.field === 'propertyConfig.bathroomCount')) {
            result.errors.push({
              field: 'propertyConfig.bathroomCount',
              message: 'Bathroom count is required'
            });
          }
        }
      }

      if (!result.valid) {
        if (result.errors.length > 0) {
          const firstError = result.errors[0];
          // toast notifications cleared for inline validation preference

          result.errors.forEach(err => {
            const bracketField = err.field.includes('[') 
              ? err.field 
              : err.field.replace(/\.(\d+)\./g, '[$1].').replace(/\.(\d+)$/g, '[$1]');
            
            setError(bracketField as any, {
              type: 'manual',
              message: err.message
            });
          });

          setTimeout(() => {
            const firstField = firstError.field;
            const normalizedFieldId = firstField.replace(/\[(\d+)\]/g, '.$1');
            const bracketFieldId = firstField.replace(/\.(\d+)\./g, '[$1].').replace(/\.(\d+)$/g, '[$1]');

            let roomCardEl: HTMLElement | null = null;
            if (firstField.includes('propertyConfig.rooms')) {
              const match = firstField.match(/rooms[\.\[](\d+)/);
              const roomIdx = match ? match[1] : '0';
              roomCardEl = document.getElementById(`room-card-${roomIdx}`);
            }

            let element: HTMLElement | null = roomCardEl || document.getElementById(bracketFieldId) || document.getElementById(normalizedFieldId) || document.getElementById(firstField);
            if (!element) {
              element = document.querySelector(`[name="${bracketFieldId}"]`) || document.querySelector(`[name="${normalizedFieldId}"]`) || document.querySelector(`[name="${firstField}"]`);
            }
            if (!element && (firstField === 'businessInfo.businessType' || firstField === 'propertyInfo.propertyTypeId')) {
              element = document.getElementById('businessInfo.businessType');
            }

            const targetToScroll = roomCardEl || element?.closest('.rounded-\\[2\\.5rem\\]') as HTMLElement || element;
            const scrollContainer = document.getElementById('scroll-container');

            if (targetToScroll) {
              if (scrollContainer) {
                const containerRect = scrollContainer.getBoundingClientRect();
                const targetRect = targetToScroll.getBoundingClientRect();
                const targetTop = (targetRect.top + scrollContainer.scrollTop) - containerRect.top - 20;

                scrollContainer.scrollTo({
                  top: Math.max(0, targetTop),
                  behavior: 'smooth'
                });
              } else {
                targetToScroll.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }

              targetToScroll.classList.add('animate-shake');
              setTimeout(() => {
                targetToScroll?.classList.remove('animate-shake');
              }, 1500);
            }
          }, 100);
        }
        return;
      }

      if (currentStep < 6) {
        setNavDirection('next');
        setCurrentStep(prev => prev + 1);
        const scrollContainer = document.getElementById('scroll-container');
        if (scrollContainer) {
          scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    } catch (error: any) {
      console.error('Validation error:', error);
      toastError('Navigation failed: ' + (error.message || 'unknown error'));
    } finally {
      setTimeout(() => setIsProcessingNext(false), 400);
    }
  };

  const handleBack = () => {
    setNavDirection('back');
    setCurrentStep((prev) => prev - 1);
    const scrollContainer = document.getElementById('scroll-container');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const navigateToStep = (targetStep: number) => {
    if (targetStep === currentStep) return;
    if (targetStep < currentStep) {
      setNavDirection('back');
    } else {
      setNavDirection('next');
    }
    setCurrentStep(targetStep);
    const scrollContainer = document.getElementById('scroll-container');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setValue('location.coordinates', [lat, lng]);
  };

  const handleAddressAutoFill = (address: any) => {
    setValue('location.address', address.address || '', { shouldValidate: true, shouldDirty: true });
    setValue('location.city', address.city || '', { shouldValidate: true, shouldDirty: true });
    setValue('location.province', address.province || '', { shouldValidate: true, shouldDirty: true });
    setValue('location.zipCode', address.zipCode || '', { shouldValidate: true, shouldDirty: true });
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileUpload = async (type: string, file: File) => {
    if (!file) {
      setUploadedFiles((prev) => {
        const updated = { ...prev };
        delete (updated as any)[type];
        return updated;
      });
      setValue(`documents.${type}` as any, '', { shouldValidate: true });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toastError(`File ${file.name} is too large. Max 5MB.`);
      return;
    }

    setUploadedFiles((prev) => ({ ...prev, [type]: file }));

    try {
      const base64Url = await fileToBase64(file);
      setValue(`documents.${type}` as any, base64Url, { shouldValidate: true });
    } catch {
      const blobUrl = URL.createObjectURL(file);
      setValue(`documents.${type}` as any, blobUrl, { shouldValidate: true });
    }
    clearErrors(`documents.${type}` as any);
  };

  const handlePropertyFilesChange = async (files: Record<string, File[]>) => {
    setPropertyFiles(files);
    const updatedUrls: Record<string, string[]> = {};

    for (const [cat, catFiles] of Object.entries(files)) {
      updatedUrls[cat] = await Promise.all(
        catFiles.map(f => fileToBase64(f).catch(() => URL.createObjectURL(f)))
      );
    }

    setValue('propertyImages.property' as any, updatedUrls, { shouldValidate: true });

    const totalCount = Object.values(files).flat().length;
    if (totalCount >= 3) {
      clearErrors('propertyImages.property' as any);
    }
  };

  const handleRoomFilesChange = async (roomIndex: number, files: File[]) => {
    setRoomFiles(prev => ({ ...prev, [roomIndex]: files }));
    const base64Urls = await Promise.all(
      files.map(f => fileToBase64(f).catch(() => URL.createObjectURL(f)))
    );
    setValue(`propertyImages.rooms.${roomIndex}` as any, base64Urls, { shouldValidate: true });
    if (files.length > 0) {
      clearErrors(`propertyImages.rooms.${roomIndex}` as any);
    }
  };

  const [submissionProgress, setSubmissionProgress] = useState(0);
  const [submissionStage, setSubmissionStage] = useState<1 | 2 | 3 | 4>(1);

  const queryClient = useQueryClient();

  const createPropertyMutation = useMutation({
    mutationFn: async (payload: any) => {
      const isEdit = Boolean(initialData?.id);
      const url = isEdit ? `/api/landlord/properties?id=${initialData.id}` : '/api/landlord/properties';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to save property');
      return result;
    },
    onSuccess: async () => {
      isSubmittedRef.current = true;
      setSubmissionStage(4);
      setSubmissionProgress(100);
      try {
        await clearDraftFromStorage(DRAFT_KEY);
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(DRAFT_KEY);
          window.sessionStorage.removeItem(DRAFT_KEY);
        }
      } catch (e) {
        console.warn('Failed to clear draft on publication success:', e);
      }
      queryClient.invalidateQueries({ queryKey: ['landlordProperties'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      success(initialData?.id ? (initialData?.status === 'REJECTED' ? 'Property resubmitted for Admin review!' : 'Property updated successfully!') : 'Property listing published successfully!');
      await new Promise(r => setTimeout(r, 2000));
      window.location.href = '/landlord/properties';
    },
    onError: (error: any) => {
      isSubmittedRef.current = false;
      setIsSubmitting(false);
      toastError(error.message || 'Error during publication.');
    }
  });

  const uploadWithRetry = async (uploadFn: () => Promise<any>, maxRetries = 2) => {
    let lastErr;
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await uploadFn();
      } catch (err: any) {
        lastErr = err;
        await new Promise(r => setTimeout(r, 1000 * (i + 1))); // exponential backoff
      }
    }
    throw lastErr;
  };

  const onSubmit = async (data: any) => {
    if (isSubmitting || isSubmittedRef.current) return;
    setIsSubmitting(true);
    isSubmittedRef.current = true;
    setSubmissionStage(1);
    setSubmissionProgress(15);
    
    try {
      // Stage 1: Blueprint Audit - Give 2.2s so Kerby's Blueprint mascot is clearly visible
      await new Promise(r => setTimeout(r, 2200));

      // Stage 2: Compliance & Rules Audit - Give 2.2s for Kerby's Checklist mascot
      setSubmissionStage(2);
      setSubmissionProgress(35);
      await new Promise(r => setTimeout(r, 2200));

      // Stage 3: Media & Docs Uploading
      setSubmissionStage(3);
      setSubmissionProgress(50);

      // 1. Upload Documents (Parallel)
      const docUploadPromises = Object.entries(uploadedFiles).map(async ([type, file]) => {
        if (!(file instanceof File)) return null;
        const freshFile = new File([file], file.name, { type: file.type });
        const res = await uploadWithRetry(() => edgestore.identityDocs.upload({ 
          file: freshFile,
          input: { landlordId: "PENDING", listingId: "PENDING" }
        }));
        return { type, url: res.url };
      });
      
      const docResults = (await Promise.all(docUploadPromises)).filter(Boolean);
      const docUrls: Record<string, string> = {};
      docResults.forEach(r => { if(r) docUrls[r.type] = r.url; });
      setSubmissionProgress(65);

      // Helper to convert Base64 Data URL to File object for EdgeStore upload
      const base64ToFile = (base64DataUrl: string, filename: string): File => {
        try {
          const arr = base64DataUrl.split(',');
          const mimeMatch = arr[0].match(/:(.*?);/);
          const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
          const bstr = atob(arr[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          return new File([u8arr], filename, { type: mime });
        } catch (err) {
          return new File([], filename, { type: 'image/jpeg' });
        }
      };

      // 2. Upload Property Images with Categories (Parallel)
      const propertyImagePromises: Promise<{ url: string, category: string } | null>[] = [];
      for (const [category, files] of Object.entries(propertyFiles)) {
        if (Array.isArray(files)) {
          for (const file of files) {
            if (!(file instanceof File)) continue;
            propertyImagePromises.push((async () => {
              const freshFile = new File([file], file.name, { type: file.type });
              const res = await uploadWithRetry(() => edgestore.publicFiles.upload({ file: freshFile }));
              return { url: res.url, category };
            })());
          }
        }
      }

      // Fallback: If propertyFiles in memory is empty (e.g. after browser refresh), reconstruct files from Base64 draft
      if (propertyImagePromises.length === 0 && data.propertyImages?.property) {
        for (const [category, urls] of Object.entries(data.propertyImages.property as Record<string, string[]>)) {
          if (Array.isArray(urls)) {
            urls.forEach((urlStr, idx) => {
              if (typeof urlStr === 'string' && urlStr.startsWith('data:image/')) {
                const file = base64ToFile(urlStr, `${category}_${idx + 1}.jpg`);
                propertyImagePromises.push((async () => {
                  const res = await uploadWithRetry(() => edgestore.publicFiles.upload({ file }));
                  return { url: res.url, category };
                })());
              } else if (typeof urlStr === 'string' && (urlStr.startsWith('http://') || urlStr.startsWith('https://'))) {
                propertyImagePromises.push(Promise.resolve({ url: urlStr, category }));
              }
            });
          }
        }
      }

      const propertyImageUrls = (await Promise.all(propertyImagePromises)).filter(Boolean) as { url: string, category: string }[];
      setSubmissionProgress(75);

      // 3. Upload Room Images (Parallel)
      const roomImageUrlsMap: Record<number, string[]> = {};
      const roomUploadPromises: Promise<{ roomIndex: number, url: string } | null>[] = [];
      
      for (const [roomIndex, files] of Object.entries(roomFiles)) {
        for (const file of (files || [])) {
          if (!(file instanceof File)) continue;
          roomUploadPromises.push((async () => {
            const freshFile = new File([file], file.name, { type: file.type });
            const res = await uploadWithRetry(() => edgestore.publicFiles.upload({ file: freshFile }));
            return { roomIndex: parseInt(roomIndex), url: res.url };
          })());
        }
      }

      // Fallback: If roomFiles in memory is empty (e.g. after browser refresh), reconstruct files from Base64 draft
      if (roomUploadPromises.length === 0 && data.propertyImages?.rooms) {
        for (const [roomIdxStr, urls] of Object.entries(data.propertyImages.rooms as Record<string, string[]>)) {
          const rIndex = parseInt(roomIdxStr);
          if (Array.isArray(urls)) {
            urls.forEach((urlStr, idx) => {
              if (typeof urlStr === 'string' && urlStr.startsWith('data:image/')) {
                const file = base64ToFile(urlStr, `room_${rIndex + 1}_${idx + 1}.jpg`);
                roomUploadPromises.push((async () => {
                  const res = await uploadWithRetry(() => edgestore.publicFiles.upload({ file }));
                  return { roomIndex: rIndex, url: res.url };
                })());
              } else if (typeof urlStr === 'string' && (urlStr.startsWith('http://') || urlStr.startsWith('https://'))) {
                if (!roomImageUrlsMap[rIndex]) roomImageUrlsMap[rIndex] = [];
                roomImageUrlsMap[rIndex].push(urlStr);
              }
            });
          }
        }
      }

      const roomResults = (await Promise.all(roomUploadPromises)).filter(Boolean);
      roomResults.forEach(r => {
        if (r) {
          if (!roomImageUrlsMap[r.roomIndex]) roomImageUrlsMap[r.roomIndex] = [];
          roomImageUrlsMap[r.roomIndex].push(r.url);
        }
      });
      setSubmissionProgress(85);

      // Stage 4: Submitting Database Record
      setSubmissionStage(4);
      setSubmissionProgress(90);

      // 4. Map Customized Rooms for the Dashboard
      const finalRooms = (data.propertyConfig.rooms || []).map((room: any, i: number) => ({
        name: formatCleanTitle(room.name || `Room ${i + 1}`),
        roomType: room.roomType,
        bathroomArrangement: room.bathroomArrangement,
        price: parseInt(room.price) || parseInt(data.propertyInfo.price),
        bedType: room.bedType,
        bedCount: parseInt(room.bedCount) || 1,
        capacity: parseInt(room.capacity) || 1,
        availableSlots: parseInt(room.availableSlots) || 1,
        size: room.size ? parseFloat(room.size) : null,
        reservationFee: parseInt(room.reservationFee) || 500,
        description: room.description || `Customized unit for ${data.propertyInfo.propertyName} - Unit ${i + 1}`,
        amenities: room.amenities || [],
        images: roomImageUrlsMap[i] || [] // Use uploaded room images
      }));

      const finalCustomPdfUrl = docUrls.customContract || (docUrls as any)['propertyConfig.customPdfUrl'] || data.propertyConfig?.customPdfUrl || '';

      // 4. Transform data for API - Flattens the structure to match the existing createProperty service
      const payload = {
        title: formatCleanTitle(data.propertyInfo.propertyName),
        description: data.propertyInfo.description,
        propertyTypeId: data.propertyInfo?.propertyTypeId || data.businessInfo?.businessType || null,
        price: parseInt(data.propertyInfo.price),
        roomCount: finalRooms.length,
        bathroomCount: parseInt(data.propertyConfig.bathroomCount),
        region: data.location.province,
        address: data.location.address,
        city: data.location.city,
        zipCode: data.location.zipCode,
        // API expects [lng, lat] for latlng mapping
        latlng: data.location.coordinates.length === 2
          ? [data.location.coordinates[1], data.location.coordinates[0]]
          : [120.9842, 14.5995],
        category: data.propertyInfo.category,
        images: propertyImageUrls,
        imageSrc: propertyImageUrls[0]?.url || "",
        amenities: data.propertyConfig['no-curfew'] 
          ? [...(data.propertyConfig.amenities || []), "No Curfew"] 
          : (data.propertyConfig.amenities || []),
        // API expects rules at the top level
        femaleOnly: !!data.propertyConfig['female-only'],
        maleOnly: !!data.propertyConfig['male-only'],
        visitorsAllowed: data.propertyConfig['visitors-allowed'] !== false,
        petsAllowed: !!data.propertyConfig['pets-allowed'],
        smokingAllowed: !!data.propertyConfig['smoking-allowed'],
        noCurfew: !!data.propertyConfig['no-curfew'],
        // API expects features at the top level
        security24h: !!data.propertyConfig.security24h,
        cctv: !!data.propertyConfig.cctv,
        fireSafety: !!data.propertyConfig.fireSafety,
        nearTransport: data.propertyConfig.nearTransport !== false,
        floodFree: !!data.propertyConfig.floodFree,
        backupPower: !!data.propertyConfig.backupPower,
        rules: data.propertyConfig.rules || [],
        features: data.propertyConfig.features || [],
        rooms: finalRooms, // Use the customized rooms
        contractMode: data.propertyConfig?.contractMode || 'AUTO_GEN',
        customPdfUrl: finalCustomPdfUrl,
        depositAmount: parseInt(data.propertyConfig.depositAmount) || 0,
        moveOutNoticeDays: parseInt(data.propertyConfig.moveOutNoticeDays) || 30,
        customContractClauses: data.propertyConfig.customContractClauses || [],
        landlordSignatureBase64: data.propertyConfig.landlordSignatureBase64 || '',
        documents: {
          ...docUrls,
          customContract: finalCustomPdfUrl,
        },
        businessInfo: {
          ...data.businessInfo,
          businessName: formatCleanTitle(data.businessInfo?.businessName),
          kitchenSetup: data.propertyConfig?.kitchenSetup || '',

          bathroomSetup: data.propertyConfig?.bathroomSetup || '',
          contractMode: data.propertyConfig?.contractMode || 'AUTO_GEN',
          customPdfUrl: finalCustomPdfUrl,
          documents: {
            ...docUrls,
            customContract: finalCustomPdfUrl,
          }
        },
      };

      await createPropertyMutation.mutateAsync(payload);

    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
      toastError('Error during publication.');
    }
  };

  return {
    methods,
    register,
    control,
    watch,
    errors: methods.formState.errors,
    fields,
    append,
    remove,
    getValues,
    setValue,
    setError: methods.setError,
    clearErrors,
    currentStep,
    setCurrentStep,
    navDirection,
    navigateToStep,
    maxUnlockedStep,
    setMaxUnlockedStep,
    isSubmitting,
    submissionStage,
    submissionProgress,
    isMounted,
    uploadedFiles,
    propertyFiles,
    roomFiles,
    handleNext,
    handleBack,
    handleLocationSelect,
    handleAddressAutoFill,
    handleFileUpload,
    handlePropertyFilesChange,
    handleRoomFilesChange,
    hasSavedDraft,
    savedDraftData,
    lastSavedTime,
    lastSavedTimestamp,
    saveStatus,
    loadDraft,
    clearDraft,
    onSubmit: handleSubmit(onSubmit),
  };
}

'use client';

import { useState, useEffect } from 'react';
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

export function usePropertyCreatorLogic(initialData: any) {
  const router = useRouter();
  const { edgestore } = useEdgeStore();
  const { success, error: toastError } = useResponsiveToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [isProcessingNext, setIsProcessingNext] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const [propertyFiles, setPropertyFiles] = useState<Record<string, File[]>>({});
  const [roomFiles, setRoomFiles] = useState<Record<number, File[]>>({});

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const defaultValues = {
    propertyInfo: {
      propertyName: initialData?.propertyInfo?.propertyName || '',
      description: initialData?.propertyInfo?.description || '',
      price: initialData?.propertyInfo?.price || '',
      category: initialData?.propertyInfo?.category || '',
    },
    businessInfo: {
      businessName: initialData?.businessInfo?.businessName || '',
      businessType: initialData?.businessInfo?.businessType || '',
      businessDescription: initialData?.businessInfo?.businessDescription || '',
      yearsExperience: initialData?.businessInfo?.yearsExperience || '',
    },
    location: {
      address: initialData?.location?.address || '',
      city: initialData?.location?.city || '',
      province: initialData?.location?.province || '',
      zipCode: initialData?.location?.zipCode || '',
      coordinates: initialData?.location?.coordinates || [],
    },
    propertyConfig: {
      totalRooms: initialData?.propertyConfig?.totalRooms || '',
      bathroomCount: initialData?.propertyConfig?.bathroomCount || '',
      femaleOnly: initialData?.propertyConfig?.femaleOnly || false,
      maleOnly: initialData?.propertyConfig?.maleOnly || false,
      visitorsAllowed: initialData?.propertyConfig?.visitorsAllowed || false,
      petsAllowed: initialData?.propertyConfig?.petsAllowed || false,
      smokingAllowed: initialData?.propertyConfig?.smokingAllowed || false,
      security24h: initialData?.propertyConfig?.security24h || false,
      cctv: initialData?.propertyConfig?.cctv || false,
      fireSafety: initialData?.propertyConfig?.fireSafety || false,
      nearTransport: initialData?.propertyConfig?.nearTransport || false,
      studyFriendly: initialData?.propertyConfig?.studyFriendly || false,
      quietEnvironment: initialData?.propertyConfig?.quietEnvironment || false,
      flexibleLease: initialData?.propertyConfig?.flexibleLease || false,
      amenities: initialData?.propertyConfig?.amenities || [],
      rules: initialData?.propertyConfig?.rules || [],
      features: initialData?.propertyConfig?.features || [],
      rooms: (initialData?.propertyConfig?.rooms || []) as RoomType[], 
    },
    propertyImages: {
      property: initialData?.propertyImages?.property || {},
      rooms: {},
    },
    documents: initialData?.documents || {
      governmentId: '',
      businessPermit: '',
      landTitle: '',
      barangayClearance: '',
      fireSafetyCertificate: '',
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
    formState: { errors },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'propertyConfig.rooms',
  });

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
            setError(err.field as any, {
              type: 'manual',
              message: err.message
            });
          });

          setTimeout(() => {
            let element = document.getElementById(firstError.field);
            if (!element) {
              element = document.querySelector(`[name="${firstError.field}"]`);
            }

            if (element) {
              const elementRect = element.getBoundingClientRect();
              const absoluteElementTop = elementRect.top + window.pageYOffset;
              const middleOffset = absoluteElementTop - 150;

              window.scrollTo({ top: middleOffset, behavior: 'smooth' });

              const scrollContainer = document.getElementById('scroll-container');
              if (scrollContainer) {
                const containerRect = scrollContainer.getBoundingClientRect();
                const targetTop = (elementRect.top + scrollContainer.scrollTop) - containerRect.top - 150;
                scrollContainer.scrollTo({ top: targetTop, behavior: 'smooth' });
              }

              element.classList.add('animate-shake', 'animate-glow-error');
              setTimeout(() => {
                element?.classList.remove('animate-shake', 'animate-glow-error');
              }, 2000);

              if (typeof (element as any).focus === 'function') {
                (element as any).focus();
              }
            }
          }, 100);
        }
        return;
      }

      if (currentStep < 6) {
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
    setCurrentStep((prev) => prev - 1);
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

  const handleFileUpload = (type: string, file: File) => {
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
    // Use a real blob URL for local browser preview
    const blobUrl = URL.createObjectURL(file);
    setValue(`documents.${type}` as any, blobUrl, { shouldValidate: true });
    clearErrors(`documents.${type}` as any);
  };

  const handlePropertyFilesChange = (files: Record<string, File[]>) => {
    setPropertyFiles(files);
    const updatedUrls: Record<string, string[]> = {};
    Object.entries(files).forEach(([cat, catFiles]) => {
      updatedUrls[cat] = catFiles.map(f => URL.createObjectURL(f));
    });
    setValue('propertyImages.property' as any, updatedUrls, { shouldValidate: true });
    
    const totalCount = Object.values(files).flat().length;
    if (totalCount >= 3) {
      clearErrors('propertyImages.property' as any);
    }
  };

  const handleRoomFilesChange = (roomIndex: number, files: File[]) => {
    setRoomFiles(prev => ({ ...prev, [roomIndex]: files }));
    // Use real blob URLs for local browser preview
    const blobUrls = files.map(f => URL.createObjectURL(f));
    setValue(`propertyImages.rooms.${roomIndex}` as any, blobUrls, { shouldValidate: true });
    if (files.length > 0) {
      clearErrors(`propertyImages.rooms.${roomIndex}` as any);
    }
  };

  const queryClient = useQueryClient();

  const createPropertyMutation = useMutation({
    mutationFn: async (payload: any) => {
      const response = await fetch('/api/landlord/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to publish property');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landlordProperties'] });
      success('Property listing published successfully!');
      window.location.href = '/landlord/properties';
    },
    onError: (error: any) => {
      toastError(error.message || 'Error during publication.');
    }
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      // 1. Upload Documents
      const docUrls: Record<string, string> = {};
      for (const [type, file] of Object.entries(uploadedFiles)) {
        if (!(file instanceof File)) continue;
        try {
          const freshFile = new File([file], file.name, { type: file.type });
          const res = await edgestore.identityDocs.upload({ 
            file: freshFile,
            input: { landlordId: "PENDING", listingId: "PENDING" }
          });
          docUrls[type] = res.url;
          // Small delay to prevent network congestion
          await new Promise(r => setTimeout(r, 200));
        } catch (err: any) {
          throw err;
        }
      }

      // 2. Upload Property Images with Categories
      const propertyImageUrls: { url: string, category: string }[] = [];
      for (const [category, files] of Object.entries(propertyFiles)) {
        if (Array.isArray(files)) {
          for (const file of files) {
            if (!(file instanceof File)) continue;
            try {
              const freshFile = new File([file], file.name, { type: file.type });
              const res = await edgestore.publicFiles.upload({ file: freshFile });
              propertyImageUrls.push({ url: res.url, category });
              await new Promise(r => setTimeout(r, 200));
            } catch (err: any) {
              throw err;
            }
          }
        }
      }

      // 3. Upload Room Images
      const roomImageUrlsMap: Record<number, string[]> = {};
      for (const [roomIndex, files] of Object.entries(roomFiles)) {
        const urls: string[] = [];
        for (const file of (files || [])) {
          if (!(file instanceof File)) continue;
          try {
            const freshFile = new File([file], file.name, { type: file.type });
            const res = await edgestore.publicFiles.upload({ file: freshFile });
            urls.push(res.url);
            await new Promise(r => setTimeout(r, 200));
          } catch (err: any) {
            throw err;
          }
        }
        roomImageUrlsMap[parseInt(roomIndex)] = urls;
      }

      // 4. Map Customized Rooms for the Dashboard
      const finalRooms = (data.propertyConfig.rooms || []).map((room: any, i: number) => ({
        name: `Room ${i + 1}`,
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

      // 4. Transform data for API - Flattens the structure to match the existing createProperty service
      const payload = {
        title: data.propertyInfo.propertyName,
        description: data.propertyInfo.description,
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
        flexibleLease: !!data.propertyConfig.flexibleLease,
        customRules: data.propertyConfig.rules || [],
        customFeatures: data.propertyConfig.features || [],
        rooms: finalRooms, // Use the customized rooms
        documents: docUrls,
        businessInfo: data.businessInfo,
      };

      await createPropertyMutation.mutateAsync(payload);

    } catch (error) {
      console.error(error);
      toastError('Error during publication.');
    } finally {
      setIsSubmitting(false);
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
    clearErrors,
    currentStep,
    setCurrentStep,
    isSubmitting,
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
    onSubmit: handleSubmit(onSubmit),
  };
}

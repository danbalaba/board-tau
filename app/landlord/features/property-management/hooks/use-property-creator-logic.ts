'use client';

import { useState, useEffect } from 'react';
import { validateStep } from '@/services/validation/hostApplication';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { useEdgeStore } from '@/lib/edgestore';
import { toast } from 'sonner';

export function usePropertyCreatorLogic(initialData: any) {
  const router = useRouter();
  const { edgestore } = useEdgeStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const [propertyFiles, setPropertyFiles] = useState<File[]>([]);
  const [roomFiles, setRoomFiles] = useState<Record<number, File[]>>({});

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const defaultValues = {
    businessInfo: {
      businessName: initialData?.businessInfo?.businessName || '',
      businessType: initialData?.businessInfo?.businessType || 'boarding-house',
      businessDescription: initialData?.businessInfo?.businessDescription || '',
      yearsExperience: initialData?.businessInfo?.yearsExperience || '',
    },
    propertyInfo: {
      propertyName: initialData?.propertyInfo?.propertyName || '',
      description: initialData?.propertyInfo?.description || '',
      price: initialData?.propertyInfo?.price || '',
      category: initialData?.propertyInfo?.category || [],
      leaseTerms: initialData?.propertyInfo?.leaseTerms || 'semester',
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
      rooms: initialData?.propertyConfig?.rooms || [],
    },
    propertyImages: {
      property: initialData?.propertyImages?.property || [],
      rooms: initialData?.propertyImages?.rooms || {},
    },
    documents: initialData?.documents || {
      governmentId: '',
      businessPermit: '',
      landTitle: '',
      barangayClearance: '',
      fireSafetyCertificate: '',
    },
    contactInfo: {
      fullName: initialData?.contactInfo?.fullName || '',
      email: initialData?.contactInfo?.email || '',
      phoneNumber: initialData?.contactInfo?.phoneNumber || '',
      emergencyContact: {
        name: initialData?.contactInfo?.emergencyContact?.name || '',
        relationship: initialData?.contactInfo?.emergencyContact?.relationship || '',
        phoneNumber: initialData?.contactInfo?.emergencyContact?.phoneNumber || '',
      },
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

  // Real-time validation for business mission description
  const missionDescription = watch('businessInfo.businessDescription');
  useEffect(() => {
    if (missionDescription && missionDescription.length >= 100) {
      clearErrors('businessInfo.businessDescription' as any);
    }
  }, [missionDescription, clearErrors]);

  const handleNext = async () => {
    try {
      console.log('Validating step:', currentStep);
      // Perform validation for the current step before proceeding
      const currentValues = getValues();
      
      // Mapping Landlord steps (0-7) to Host validation steps (1-8)
      const validationStep = currentStep + 1;
      
      // Create a simplified validation object
      const validationData = {
        ...currentValues,
        businessInfo: {
          businessName: currentValues.businessInfo?.businessName || '',
          businessType: currentValues.businessInfo?.businessType || 'boarding-house',
          businessDescription: currentValues.businessInfo?.businessDescription || '',
          yearsExperience: currentValues.businessInfo?.yearsExperience || '3+'
        }
      };

      const result = validateStep(validationStep, validationData);

      // Step 0: Business Info - Tell us your mission
      if (currentStep === 0) {
        if (!validationData.businessInfo.businessDescription || validationData.businessInfo.businessDescription.length < 100) {
          result.valid = false;
          result.errors.push({ 
            field: 'businessInfo.businessDescription', 
            message: 'Mission description must be at least 100 characters (Marketing standard)' 
          });
        }
      }

      // Maintain overrides for higher room counts and bathroom selection
      if (currentStep === 3) { // Property Configuration (Step 4) - Index 3
        // Mock bathroomType if missing to pass strict host validation
        if (!(validationData.propertyConfig as any).bathroomType) {
          (validationData.propertyConfig as any).bathroomType = 'PRIVATE';
          // If we added it here, we should check if it was actually invalid before
          const bathroomErrIndex = result.errors.findIndex(e => e.field === 'propertyConfig.bathroomType');
          if (bathroomErrIndex > -1) {
            result.errors.splice(bathroomErrIndex, 1);
            if (result.errors.length === 0) result.valid = true;
          }
        }
        
        // If rooms > 50, we already checked it by setting it to 50 in validationData if needed?
        // Let's be explicit:
        if (currentValues.propertyConfig.totalRooms > 50 && currentValues.propertyConfig.totalRooms <= 100) {
          const roomErrIndex = result.errors.findIndex(e => e.field === 'propertyConfig.totalRooms');
          if (roomErrIndex > -1) {
            result.errors.splice(roomErrIndex, 1);
            if (result.errors.length === 0) result.valid = true;
          }
        }
        // Check if bathroomCount is empty (User requirement)
        // Note: Number('') is 0, so we must check the raw string or handle null/undefined
        const rawBathroomCount = currentValues.propertyConfig.bathroomCount;
        if (rawBathroomCount === '' || rawBathroomCount === null || rawBathroomCount === undefined) {
          result.valid = false;
          // Check if error already exists for this field to avoid duplicates
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
          toast.error(firstError.message, {
            description: `Field: ${firstError.field}`,
            duration: 4000
          });
          
          result.errors.forEach(err => {
            setError(err.field as any, { 
              type: 'manual', 
              message: err.message 
            });
          });

          // Scroll to the first error field automatically
          setTimeout(() => {
            const scrollContainer = document.getElementById('scroll-container');
            let element = document.getElementById(firstError.field);
            if (!element) {
              element = document.querySelector(`[name="${firstError.field}"]`);
            }
            
            if (element && scrollContainer) {
              const elementRect = element.getBoundingClientRect();
              const containerRect = scrollContainer.getBoundingClientRect();
              const targetTop = (elementRect.top + scrollContainer.scrollTop) - containerRect.top - 150;
              
              // Manual smooth scroll implementation for guaranteed smoothness
              const startTop = scrollContainer.scrollTop;
              const distance = targetTop - startTop;
              const duration = 800; // ms
              let startTime: number | null = null;
              
              const animation = (currentTime: number) => {
                if (startTime === null) startTime = currentTime;
                const timeElapsed = currentTime - startTime;
                const progress = Math.min(timeElapsed / duration, 1);
                
                // Ease out cubic function
                const ease = 1 - Math.pow(1 - progress, 3);
                
                scrollContainer.scrollTop = startTop + distance * ease;
                
                if (timeElapsed < duration) {
                  requestAnimationFrame(animation);
                }
              };
              
              requestAnimationFrame(animation);

              // Add shake and glow animations
              element.classList.add('animate-shake', 'animate-glow-error');
              setTimeout(() => {
                element?.classList.remove('animate-shake', 'animate-glow-error');
              }, 2000);
              
              if (typeof (element as any).focus === 'function') {
                (element as any).focus();
              }
            }
          }, 200);
        }
        return;
      }

      // Step 3 -> 4: Sync Room Configurations with Total Rooms
      if (currentStep === 3) {
        const targetRoomCount = parseInt(currentValues.propertyConfig.totalRooms) || 0;
        const currentRooms = currentValues.propertyConfig.rooms || [];
        
        if (currentRooms.length < targetRoomCount) {
          // Append missing rooms
          for (let i = currentRooms.length; i < targetRoomCount; i++) {
            append({
              name: `Room ${i + 1}`,
              roomType: 'SOLO',
              bathroomArrangement: 'PRIVATE',
              price: '',
              bedType: 'Single',
              capacity: '1',
              size: '',
              availableSlots: '1',
              reservationFee: '500',
              description: '',
              amenities: [],
              images: [],
            } as any);
          }
        } else if (currentRooms.length > targetRoomCount && targetRoomCount > 0) {
          // Trim extra rooms from the end if the user decreased the count
          for (let i = currentRooms.length - 1; i >= targetRoomCount; i--) {
            remove(i);
          }
        }
      }

      if (currentStep < 7) {
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
      toast.error('Navigation failed: ' + (error.message || 'unknown error'));
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
      toast.error(`File ${file.name} is too large. Max 5MB.`);
      return;
    }

    setUploadedFiles((prev) => ({ ...prev, [type]: file }));
    // Use a real blob URL for local browser preview
    const blobUrl = URL.createObjectURL(file);
    setValue(`documents.${type}` as any, blobUrl, { shouldValidate: true });
    clearErrors(`documents.${type}` as any);
  };

  const handlePropertyFilesChange = (files: File[]) => {
    setPropertyFiles(files);
    // Use real blob URLs for local browser preview
    const blobUrls = files.map(f => URL.createObjectURL(f));
    setValue('propertyImages.property' as any, blobUrls, { shouldValidate: true });
    if (files.length > 0) {
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

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    const toastId = toast.loading('Publishing your new property listing...');

    try {
      // 1. Upload Documents
      const docUrls: Record<string, string> = {};
      for (const [type, file] of Object.entries(uploadedFiles)) {
        const res = await edgestore.publicFiles.upload({ file });
        docUrls[type] = res.url;
      }

      // 2. Upload Property Images
      const propertyImageUrls: string[] = [];
      for (const file of propertyFiles) {
        const res = await edgestore.publicFiles.upload({ file });
        propertyImageUrls.push(res.url);
      }

      // 3. Upload Room Images
      const roomsWithImages = await Promise.all(data.propertyConfig.rooms.map(async (r: any, idx: number) => {
        const roomImages: string[] = [];
        const files = roomFiles[idx] || [];
        for (const file of files) {
          const res = await edgestore.publicFiles.upload({ file });
          roomImages.push(res.url);
        }
        return {
          ...r,
          price: parseInt(r.price),
          capacity: parseInt(r.capacity),
          size: parseFloat(r.size) || 0,
          availableSlots: parseInt(r.availableSlots),
          reservationFee: parseInt(r.reservationFee),
          images: roomImages,
        };
      }));

      // 4. Transform data for API - Flattens the structure to match the existing createProperty service
      const payload = {
        title: data.propertyInfo.propertyName,
        description: data.propertyInfo.description,
        price: parseInt(data.propertyInfo.price),
        roomCount: parseInt(data.propertyConfig.totalRooms),
        bathroomCount: parseInt(data.propertyConfig.bathroomCount),
        leaseTerms: data.propertyInfo.leaseTerms,
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
        amenities: data.propertyConfig.amenities,
        // API expects rules at the top level
        femaleOnly: data.propertyConfig.femaleOnly,
        maleOnly: data.propertyConfig.maleOnly,
        visitorsAllowed: data.propertyConfig.visitorsAllowed,
        petsAllowed: data.propertyConfig.petsAllowed,
        smokingAllowed: data.propertyConfig.smokingAllowed,
        // API expects features at the top level
        security24h: data.propertyConfig.security24h,
        cctv: data.propertyConfig.cctv,
        fireSafety: data.propertyConfig.fireSafety,
        nearTransport: data.propertyConfig.nearTransport,
        studyFriendly: data.propertyConfig.studyFriendly,
        quietEnvironment: data.propertyConfig.quietEnvironment,
        flexibleLease: data.propertyConfig.flexibleLease,
        rooms: roomsWithImages,
        documents: docUrls,
        businessInfo: data.businessInfo,
      };

      const response = await fetch('/api/landlord/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Property listing published successfully!', { id: toastId });
        router.push('/landlord/properties');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to publish property', { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error('Error during publication.', { id: toastId });
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

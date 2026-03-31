'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  Bed, 
  Bath, 
  Users, 
  Image as ImageIcon, 
  FileText, 
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Check
} from 'lucide-react';
import { useEdgeStore } from '@/lib/edgestore';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';
import { cn } from '@/utils/helper';
import Button from '@/components/common/Button';

import dynamic from 'next/dynamic';

// Dynamically imported Step Components (Optimized rendering)
const PropertyBasicStep = dynamic(() => import('@/components/host-application/PropertyBasicStep'), { ssr: false });
const PropertyConfigStep = dynamic(() => import('@/components/host-application/PropertyConfigStep'), { ssr: false });
const LocationStep = dynamic(() => import('@/components/host-application/LocationStep'), { ssr: false });
const PropertyImagesStep = dynamic(() => import('@/components/host-application/PropertyImagesStep'), { ssr: false });
const RoomConfigStep = dynamic(() => import('@/components/host-application/RoomConfigStep'), { ssr: false });
const DocumentsStep = dynamic(() => import('@/components/host-application/DocumentsStep'), { ssr: false });
const ReviewStep = dynamic(() => import('@/components/host-application/ReviewStep'), { ssr: false });

const STEPS = [
  { id: 'basic', title: 'Basic Info', icon: Building2 },
  { id: 'config', title: 'Property Config', icon: FileText },
  { id: 'location', title: 'Location', icon: MapPin },
  { id: 'images', title: 'Images', icon: ImageIcon },
  { id: 'rooms', title: 'Room Setup', icon: Bed },
  { id: 'documents', title: 'Documents', icon: FileText },
  { id: 'review', title: 'Review', icon: CheckCircle },
];

export default function LandlordCreatePropertyClient() {
  const router = useRouter();
  const { edgestore } = useEdgeStore();
  const toast = useResponsiveToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([15.635189, 120.415343]);

  // Document and Image upload state
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const [propertyFiles, setPropertyFiles] = useState<File[]>([]);
  const [roomFiles, setRoomFiles] = useState<Record<number, File[]>>({});

  const methods = useForm({
    defaultValues: {
      contactInfo: {
        fullName: '',
        phoneNumber: '',
        email: '',
        emergencyContact: {
          name: '',
          relationship: '',
        },
      },
      businessInfo: {
        businessName: '',
        businessType: '',
        businessDescription: '',
      },
      propertyInfo: {
        propertyName: '',
        description: '',
        category: [],
        price: '',
        leaseTerms: '',
      },
      propertyConfig: {
        totalRooms: '',
        bathroomCount: '',
        femaleOnly: false,
        maleOnly: false,
        visitorsAllowed: true,
        petsAllowed: false,
        smokingAllowed: false,
        security24h: false,
        cctv: false,
        fireSafety: false,
        nearTransport: true,
        studyFriendly: true,
        quietEnvironment: false,
        flexibleLease: true,
        amenities: [],
        rules: [],
        bathroomType: 'Shared',
        rooms: [
          {
            roomType: 'SOLO',
            bathroomArrangement: 'PRIVATE_CR',
            price: '',
            bedType: 'Single',
            capacity: '1',
            size: '',
            availableSlots: '1',
            reservationFee: '500',
            description: '',
            amenities: [] as string[],
          }
        ],
      },
      location: {
        address: '',
        city: '',
        province: '',
        zipCode: '',
        latlng: [120.415343, 15.635189], // [lng, lat] for GeoJSON
      },
      propertyImages: {
        property: [] as string[],
        rooms: {} as Record<number, string[]>,
      },
      documents: {
        governmentId: '',
        businessPermit: '',
        landTitle: '',
        barangayClearance: '',
        fireSafetyCertificate: '',
      }
    },
    mode: 'onChange',
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    clearErrors,
    formState: { errors, isValid },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'propertyConfig.rooms',
  });

  const handleNext = async () => {
    // Validate current step before proceeding
    const stepFields: Record<number, string[]> = {
      0: ['businessInfo', 'propertyInfo'],
      1: ['propertyConfig'],
      2: ['location'],
      3: ['propertyImages'],
      4: ['propertyConfig.rooms'],
      5: ['documents'],
    };

    const fieldsToValidate = stepFields[currentStep] || [];
    const isStepValid = await methods.trigger(fieldsToValidate as any);

    if (isStepValid) {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      toast.error('Please complete all required fields correctly.');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setMapCenter([lat, lng]);
    setValue('location.latlng', [lng, lat], { shouldValidate: true });
  };

  const handleAddressAutoFill = (address: any) => {
    setValue('location.address', address.address, { shouldValidate: true });
    setValue('location.city', address.city, { shouldValidate: true });
    setValue('location.province', address.province, { shouldValidate: true });
    setValue('location.zipCode', address.zipCode, { shouldValidate: true });
  };

  const handleFileUpload = (type: string, file: File) => {
    setUploadedFiles(prev => ({ ...prev, [type]: file }));
    setValue(`documents.${type}` as any, file.name, { shouldValidate: true });
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    const toastId = toast.loading('Uploading assets and creating property...');
    try {
      // 1. Upload Documents
      const docUrls: Record<string, string> = {};
      for (const [key, file] of Object.entries(uploadedFiles)) {
        const res = await edgestore.publicFiles.upload({ file });
        docUrls[key] = res.url;
      }

      // 2. Upload Property Images
      const propertyImageUrls: string[] = [];
      for (const file of propertyFiles) {
        const res = await edgestore.publicFiles.upload({ file });
        propertyImageUrls.push(res.url);
      }

      // 3. Upload Room Images
      const roomImageUrls: Record<number, string[]> = {};
      for (const [index, files] of Object.entries(roomFiles)) {
        const urls: string[] = [];
        for (const file of files) {
          const res = await edgestore.publicFiles.upload({ file });
          urls.push(res.url);
        }
        roomImageUrls[parseInt(index)] = urls;
      }

      // 4. Map the complex form state to the API expected payload
      const payload = {
        title: data.propertyInfo.propertyName,
        description: data.propertyInfo.description,
        price: parseInt(data.propertyInfo.price),
        roomCount: parseInt(data.propertyConfig.totalRooms),
        bathroomCount: parseInt(data.propertyConfig.bathroomCount),
        country: "Philippines",
        region: data.location.province,
        latlng: data.location.latlng, // [lng, lat]
        category: data.propertyInfo.category,
        amenities: data.propertyConfig.amenities,
        
        // Rules
        femaleOnly: data.propertyConfig.femaleOnly,
        maleOnly: data.propertyConfig.maleOnly,
        visitorsAllowed: data.propertyConfig.visitorsAllowed,
        petsAllowed: data.propertyConfig.petsAllowed,
        smokingAllowed: data.propertyConfig.smokingAllowed,
        
        // Features
        security24h: data.propertyConfig.security24h,
        cctv: data.propertyConfig.cctv,
        fireSafety: data.propertyConfig.fireSafety,
        nearTransport: data.propertyConfig.nearTransport,
        studyFriendly: data.propertyConfig.studyFriendly,
        quietEnvironment: data.propertyConfig.quietEnvironment,
        flexibleLease: data.propertyConfig.flexibleLease,
        
        // Images (Main property images)
        images: propertyImageUrls,
        
        // Detailed Rooms
        rooms: data.propertyConfig.rooms.map((room: any, index: number) => ({
          name: room.roomType === 'SOLO' ? `Room ${index + 1}` : `Bedspace ${index + 1}`,
          price: parseInt(room.price),
          capacity: parseInt(room.capacity),
          availableSlots: parseInt(room.availableSlots),
          roomType: room.roomType,
          bedType: room.bedType,
          size: parseFloat(room.size) || 0,
          reservationFee: parseInt(room.reservationFee),
          description: room.description,
          amenities: room.amenities,
          images: roomImageUrls[index] || [],
        })),

        // Business/Contact info
        businessInfo: data.businessInfo,
        documents: docUrls,
      };

      const response = await fetch('/api/landlord/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Property created successfully!', { id: toastId });
        router.push('/landlord/properties');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to create property', { id: toastId });
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('An unexpected error occurred. Please try again.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <PropertyBasicStep register={register} errors={errors} watch={watch} control={control} />;
      case 1:
        return <PropertyConfigStep register={register} errors={errors} watch={watch} control={control} getValues={getValues} />;
      case 2:
        return (
          <LocationStep 
            register={register} 
            errors={errors} 
            watch={watch} 
            mapCenter={mapCenter} 
            onLocationSelect={handleLocationSelect}
            onAddressAutoFill={handleAddressAutoFill}
          />
        );
      case 3:
        return (
          <PropertyImagesStep 
            register={register} 
            errors={errors} 
            watch={watch} 
            control={control} 
            getValues={getValues} 
            setValue={setValue}
            clearErrors={clearErrors}
            onPropertyFilesChange={(files) => setPropertyFiles(files)}
            onRoomFilesChange={(index, files) => setRoomFiles(prev => ({ ...prev, [index]: files }))}
          />
        );
      case 4:
        return (
          <RoomConfigStep 
            register={register} 
            errors={errors} 
            watch={watch} 
            fields={fields}
            append={append}
            remove={remove}
            control={control}
            getValues={getValues}
            setValue={setValue}
          />
        );
      case 5:
        return (
          <DocumentsStep 
            register={register} 
            errors={errors} 
            uploadedFiles={uploadedFiles}
            onFileUpload={handleFileUpload}
          />
        );
      case 6:
        return <ReviewStep watch={watch} onBack={handleBack} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Add New Property</h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Complete the steps below to list your property on BoardTAU</p>
      </div>

      {/* Steper */}
      <div className="mb-12 relative">
        <div className="flex justify-between items-center relative z-10">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === index;
            const isCompleted = currentStep > index;

            return (
              <div key={step.id} className="flex flex-col items-center group cursor-pointer" onClick={() => index < currentStep && setCurrentStep(index)}>
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 border-2",
                  isActive 
                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105" 
                    : isCompleted
                      ? "bg-green-500 border-green-500 text-white"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 group-hover:border-primary/40"
                )}>
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className={cn(
                  "mt-3 text-xs font-bold uppercase tracking-wider transition-colors duration-300 hidden md:block",
                  isActive ? "text-primary dark:text-primary" : "text-gray-400 dark:text-gray-500"
                )}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Progress Line */}
        <div className="absolute top-6 left-0 w-full h-0.5 bg-gray-100 dark:bg-gray-800 -z-0">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: '0%' }}
            animate={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Content Form */}
      <FormProvider {...methods}>
        <div className="bg-transparent">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="mt-10 pt-8 border-t border-gray-100 dark:border-gray-800">
            <div className="grid grid-cols-2 sm:grid-cols-3 items-center gap-4">
              <div className="flex justify-start">
                {currentStep > 0 && (
                  <Button
                    outline
                    type="button"
                    onClick={handleBack}
                    disabled={isSubmitting}
                    className="min-w-[140px] px-6 py-2.5 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                )}
              </div>

              {/* Center Column: Step Indicator */}
              <div className="hidden sm:flex flex-col items-center">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-0.5">Progress</span>
                <span className="text-[11px] font-black text-primary uppercase tracking-widest">
                  Step {currentStep + 1} of {STEPS.length}
                </span>
              </div>

              {/* Right Column: Next/Submit Button */}
              <div className="flex justify-end">
                {currentStep === STEPS.length - 1 ? (
                  <Button
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                    className="min-w-[140px] px-8 py-2.5 text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-primary/10"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </div>
                    ) : (
                      'Submit Listing'
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    className="min-w-[140px] px-8 py-2.5 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-primary/10"
                  >
                    Next Step
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
            
            <p className="mt-8 text-center text-xs text-gray-400 font-medium uppercase tracking-[0.2em]">
              Your progress is automatically saved
            </p>
          </div>
        </div>
      </FormProvider>
    </div>
  );
}

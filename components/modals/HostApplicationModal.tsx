"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, FileText, Home, User, MapPin, Upload, CheckCircle, AlertCircle, Building2, Info, ArrowRight, Camera, Bed } from 'lucide-react';
import { TAU_COORDINATES } from '@/utils/constants';
import { ROOM_TYPES } from '@/data/roomTypes';
import { validateStep } from '@/services/validation/hostApplication';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';

import Modal from './Modal';
import Button from '../common/Button';
import WelcomeStep from '../host-application/WelcomeStep';
import LandlordInfoStep from '../host-application/LandlordInfoStep';
import PropertyBasicStep from '../host-application/PropertyBasicStep';
import LocationStep from '../host-application/LocationStep';
import PropertyConfigStep from '../host-application/PropertyConfigStep';
import PropertyImagesStep from '../host-application/PropertyImagesStep';
import RoomConfigStep from '../host-application/RoomConfigStep';
import CustomAmenityModal from '../host-application/CustomAmenityModal';
import DocumentsStep from '../host-application/DocumentsStep';
import ReviewStep from '../host-application/ReviewStep';
import { useRouter } from 'next/navigation';
import { createHostApplication } from '@/services/landlord/applications';

const STEPS = {
  WELCOME: 0,
  LANDLORD_INFO: 1,
  PROPERTY_BASIC: 2,
  LOCATION: 3,
  PROPERTY_CONFIG: 4,
  ROOM_CONFIG: 5,
  PROPERTY_IMAGES: 6,
  DOCUMENTS: 7,
  REVIEW: 8
};

interface RoomType {
  roomType: string;
  bathroomArrangement: string;
  price: string;
  bedType: string;
  capacity: string;
  size: string;
  availableSlots: string;
  reservationFee: string;
  description: string;
  amenities: string[];
}

interface HostApplicationFormData {
  businessInfo: {
    businessName: string;
    businessType: string;
    businessRegistrationNumber: string;
    taxIdentificationNumber: string;
    businessDescription: string;
    yearsExperience: string;
  };
  propertyInfo: {
    propertyName: string;
    description: string;
    category: string[];
    roomType: string;
    price: string;
    leaseTerms: string;
  };
  contactInfo: {
    fullName: string;
    phoneNumber: string;
    email: string;
    emergencyContact: {
      name: string;
      relationship: string;
      phoneNumber: string;
    };
  };
  location: {
    address: string;
    city: string;
    province: string;
    zipCode: string;
    coordinates: [number, number];
  };
  propertyConfig: {
    totalRooms: string;
    rooms: RoomType[];
    bathroomCount: string;
    bathroomType: string;
    amenities: string[];
    rules: string[];
    smokingAllowed: boolean;
    petsAllowed: boolean;
    visitorsAllowed: boolean;
    // Rules / Preferences
    femaleOnly: boolean;
    maleOnly: boolean;
    // Advanced Filters
    security24h: boolean;
    cctv: boolean;
    fireSafety: boolean;
    nearTransport: boolean;
    studyFriendly: boolean;
    quietEnvironment: boolean;
    flexibleLease: boolean;
  };
  propertyImages: {
    property: string[];
    rooms: Record<number, string[]>;
  };
  documents: {
    governmentId: string;
    businessPermit: string;
    landTitle: string;
    barangayClearance: string;
    fireSafetyCertificate: string;
    otherDocuments: string;
  };
}

interface HostApplicationModalProps {
  onCloseModal?: () => void;
}

const HostApplicationModal: React.FC<HostApplicationModalProps> = ({ onCloseModal }) => {
  const [step, setStep] = useState(STEPS.WELCOME);
  const [isLoading, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>(TAU_COORDINATES);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const toast = useResponsiveToast();

  // Lock background scroll when modal is open
  useEffect(() => {
    const body = document.body;
    const scrollY = window.scrollY;
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    return () => {
      body.style.overflow = '';
      body.style.position = '';
      body.style.top = '';
      body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, []);


    const {
     register,
     handleSubmit,
     control,
     watch,
     formState: { errors },
     reset,
     setValue,
     setError,
     clearErrors,
     getValues,
     trigger
   } = useForm<HostApplicationFormData>({
     mode: 'onSubmit', // Validate only when submitting
     reValidateMode: 'onSubmit', // Revalidate only when submitting
    defaultValues: {
       businessInfo: {
         businessName: '',
         businessType: '',
         businessRegistrationNumber: '',
         taxIdentificationNumber: '',
         businessDescription: '',
         yearsExperience: 'less-than-1'
       },
       propertyInfo: {
         propertyName: '',
         description: '',
         category: ['Student-Friendly'],
         roomType: ROOM_TYPES.SOLO,
         price: '',
         leaseTerms: ''
       },
      contactInfo: {
        fullName: '',
        phoneNumber: '',
        email: '',
        emergencyContact: {
          name: '',
          relationship: '',
          phoneNumber: ''
        }
      },
      location: {
        address: '',
        city: '',
        province: '',
        zipCode: '',
        coordinates: TAU_COORDINATES
      },
       propertyConfig: {
         totalRooms: '',
         rooms: [
           {
             roomType: ROOM_TYPES.SOLO,
             bathroomArrangement: 'PRIVATE_CR',
             price: '',
             bedType: 'Single',
             capacity: '1',
             size: '',
             availableSlots: '',
             reservationFee: '500',
             description: '',
             amenities: []
           }
         ],
         bathroomCount: '',
         bathroomType: 'shared',
         amenities: [],
         rules: [],
         smokingAllowed: false,
         petsAllowed: false,
         visitorsAllowed: false,
         // Rules / Preferences
         femaleOnly: false,
         maleOnly: false,
         // Advanced Filters
         security24h: false,
         cctv: false,
         fireSafety: false,
         nearTransport: false,
         studyFriendly: false,
         quietEnvironment: false,
         flexibleLease: false
       },
       propertyImages: {
         property: [],
         rooms: {}
       },
       documents: {
         governmentId: '',
         businessPermit: '',
         landTitle: '',
         barangayClearance: '',
         fireSafetyCertificate: '',
         otherDocuments: ''
       }
    }
  });

  // Custom validation rules
  const validateRequired = (value: any) => value && value.toString().trim() !== '';
  const validateEmail = (value: any) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const validatePhone = (value: any) => /^\d{10,15}$/.test(value.replace(/\D/g, ''));
  const validatePrice = (value: any) => Number(value) > 0 && Number(value) <= 50000;

  const { fields, append, remove } = useFieldArray({
    name: 'propertyConfig.rooms',
    control
  });

  // Auto-populate room cards when totalRooms changes
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'propertyConfig.totalRooms') {
        const totalRooms = parseInt(value?.propertyConfig?.totalRooms || '0', 10);
        if (isNaN(totalRooms) || totalRooms < 1) return;

        const currentCount = getValues('propertyConfig.rooms').length;

        if (totalRooms > currentCount) {
          // Add rooms to match total
          for (let i = currentCount; i < totalRooms; i++) {
            append({
              roomType: ROOM_TYPES.SOLO,
              bathroomArrangement: 'PRIVATE_CR',
              price: '',
              bedType: 'Single',
              capacity: '1',
              size: '',
              availableSlots: '',
              reservationFee: '500',
              description: '',
              amenities: [],
            });
          }
        } else if (totalRooms < currentCount) {
          // Remove extra rooms from the end
          for (let i = currentCount - 1; i >= totalRooms; i--) {
            remove(i);
          }
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, append, remove, getValues]);

  const [isContinuing, setIsContinuing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

    const nextStep = async (e?: React.MouseEvent) => {
     if (e) {
       e.stopPropagation();
       e.preventDefault();
     }

     // Prevent spamming
     if (isContinuing) {
       return;
     }

     setIsContinuing(true);
     clearErrors();
     console.log('Current step:', step, 'Moving to:', step + 1);

     // Get current form values
     const formValues = getValues();

     // Validate current step using validation service
     const validationResult = validateStep(step, formValues);

      if (!validationResult.valid) {
       // Set validation errors in react-hook-form to display in individual components
       validationResult.errors.forEach(error => {
         setError(error.field as any, { 
           type: 'manual', 
           message: error.message 
         });
       });

       // Show specific field errors in toast notifications (prioritize general ones)
       const errorPriority = (field: string) => {
         if (field.includes('propertyImages')) return 1;
         if (field.includes('documents')) return 2;
         return 3;
       };

       const sortedErrors = [...validationResult.errors].sort((a, b) => errorPriority(a.field) - errorPriority(b.field));

       sortedErrors.slice(0, 2).forEach(error => {
         toast.error(error.message, {
           duration: 5000,
           style: {
             background: '#dc2626',
             color: 'white',
             fontWeight: '500',
           },
           icon: '⚠️',
         });
       });

        // Find the first error field and scroll to it
        const firstError = validationResult.errors[0];
        if (firstError) {
          const fieldId = firstError.field;
          const errorElement = document.getElementById(fieldId);
          const scrollContainer = document.querySelector('.overflow-y-auto');
          
          if (errorElement && scrollContainer) {
            // Force a smooth scroll to the error element within the modal container
            const topOffset = 100;
            const elementPosition = errorElement.getBoundingClientRect().top;
            const containerPosition = scrollContainer.getBoundingClientRect().top;
            const scrollTarget = scrollContainer.scrollTop + (elementPosition - containerPosition) - topOffset;
            
            scrollContainer.scrollTo({
              top: scrollTarget,
              behavior: 'smooth'
            });

            // Add a visual highlight effect
            errorElement.style.transition = 'all 0.3s ease';
            errorElement.style.boxShadow = '0 0 0 4px rgba(220, 38, 38, 0.2)';
            
            setTimeout(() => {
              errorElement.style.boxShadow = '';
            }, 3000);
          }
        }

       // Trigger validation for all fields in current step to show errors
       const fieldsToValidate = getFieldsToValidateForStep(step);
       await trigger(fieldsToValidate as any);

       // Allow continue again after a short delay
       setTimeout(() => setIsContinuing(false), 500);
       return;
     }

     // Sanitized values are preserved in formValues via reference

      if (step < Object.keys(STEPS).length - 1) {
        setStep(step + 1);
        setIsContinuing(false);
        // Scroll to the top of the form (scroll the modal content container)
        setTimeout(() => {
          const modalContent = document.querySelector('.overflow-y-auto');
          if (modalContent) {
            modalContent.scrollTo({
              top: 0,
              behavior: 'smooth'
            });
          }
        }, 100); // Small delay to ensure the DOM has updated
      } else {
        setIsContinuing(false);
      }
   };

  const getFieldsToValidateForStep = (currentStep: number): string[] => {
    switch (currentStep) {
      case STEPS.LANDLORD_INFO:
        return [
          'contactInfo.fullName',
          'contactInfo.phoneNumber',
          'contactInfo.email',
          'contactInfo.emergencyContact.name',
          'contactInfo.emergencyContact.relationship',
          'contactInfo.emergencyContact.phoneNumber',
          'businessInfo.businessDescription'
        ];
      case STEPS.PROPERTY_BASIC:
        return [
          'businessInfo.businessName',
          'businessInfo.businessType',
          'businessInfo.yearsExperience',
          'propertyInfo.propertyName',
          'propertyInfo.description',
          'propertyInfo.category',
          'propertyInfo.price',
          'propertyInfo.leaseTerms'
        ];
      case STEPS.LOCATION:
        return [
          'location.address',
          'location.city',
          'location.province',
          'location.zipCode'
        ];
       case STEPS.PROPERTY_CONFIG:
         return [
           'propertyConfig.totalRooms',
           'propertyConfig.bathroomCount',
           'propertyConfig.bathroomType'
         ];
       case STEPS.ROOM_CONFIG:
         return [
           'propertyConfig.rooms'
         ];
      case STEPS.PROPERTY_IMAGES:
        return [ 'propertyImages.property', 'propertyImages.rooms' ];
      case STEPS.DOCUMENTS:
        return [
          'documents.governmentId',
          'documents.businessPermit',
          'documents.landTitle',
          'documents.barangayClearance',
          'documents.fireSafetyCertificate'
        ];
      default:
        return [];
    }
  };

  const prevStep = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    // Always reset continuing state and clear errors when going back
    setIsContinuing(false);
    clearErrors();
    
    console.log('Current step:', step, 'Moving to:', step - 1);
    if (step > 0) {
      setStep(prev => prev - 1);
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setMapCenter([lat, lng]);
    setValue('location.coordinates', [lat, lng]);
  };

  const handleAddressAutoFill = (address: {
    address: string;
    city: string;
    province: string;
    zipCode: string;
  }) => {
    setValue('location.address', address.address);
    setValue('location.city', address.city);
    setValue('location.province', address.province);
    setValue('location.zipCode', address.zipCode);
  };

  const handleFileUpload = (documentType: keyof HostApplicationFormData['documents'], file: File) => {
    setUploadedFiles(prev => ({
      ...prev,
      [documentType]: file
    }));
    // In real implementation, you would upload the file to storage and get a URL
    const fakeUrl = `https://boardtau-storage.com/uploads/${documentType}-${Date.now()}.pdf`;
    setValue(`documents.${documentType}`, fakeUrl as any);
    
    // Clear error for this specific field in real-time
    clearErrors(`documents.${documentType}` as any);
  };

  const onSubmit = async (data: HostApplicationFormData) => {
    if (step !== STEPS.REVIEW) {
      nextStep();
      return;
    }

    // Prevent submit spamming
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Final validation before submission
      const validationResult = validateStep(STEPS.REVIEW, data);
      if (!validationResult.valid) {
        toast.error(validationResult.errors[0].message, {
          duration: 4000,
          style: {
            background: '#dc2626',
            color: 'white',
            fontWeight: '500',
          },
          icon: '⚠️',
        });
        setTimeout(() => setIsSubmitting(false), 3000); // Stricter debounce
        return;
      }

      startTransition(async () => {
        try {
          // Transform data format if needed
          const formattedData = {
            businessInfo: {
              ...data.businessInfo,
              yearsExperience: data.businessInfo.yearsExperience === 'less-than-1' ? '0' :
                            data.businessInfo.yearsExperience === '1-3' ? '1-3' :
                            data.businessInfo.yearsExperience === '3-5' ? '3-5' : '5+'
            },
            propertyInfo: {
              ...data.propertyInfo,
              price: Number(data.propertyInfo.price)
            },
            contactInfo: {
              ...data.contactInfo
            },
            location: {
              ...data.location
            },
            propertyConfig: {
              ...data.propertyConfig,
              totalRooms: Number(data.propertyConfig.totalRooms),
              rooms: data.propertyConfig.rooms.map(room => ({
                ...room,
                price: Number(room.price),
                capacity: (room.bedType === 'Bunk' || room.bedType === 'Double' || room.bedType === 'Queen')
                  ? Number(room.capacity) * 2 
                  : Number(room.capacity)
              })),
              bathroomCount: Number(data.propertyConfig.bathroomCount),
              amenities: data.propertyConfig.amenities,
              rules: data.propertyConfig.rules,
              // Rules / Preferences
              femaleOnly: data.propertyConfig.femaleOnly,
              maleOnly: data.propertyConfig.maleOnly,
              // Advanced Filters
              security24h: data.propertyConfig.security24h,
              cctv: data.propertyConfig.cctv,
              fireSafety: data.propertyConfig.fireSafety,
              nearTransport: data.propertyConfig.nearTransport,
              studyFriendly: data.propertyConfig.studyFriendly,
              quietEnvironment: data.propertyConfig.quietEnvironment,
              flexibleLease: data.propertyConfig.flexibleLease
            },
            propertyImages: data.propertyImages,
            documents: {
              ...data.documents
            }
          };

          // Call the createHostApplication function
          await createHostApplication(formattedData);

          toast.success('Application submitted successfully! We will review it within 24 hours.');
          onCloseModal?.();
          reset();
        } catch (error) {
          console.error('Error submitting host application:', error);
          toast.error(error instanceof Error ? error.message : 'Failed to submit application');
        } finally {
          setIsSubmitting(false);
        }
      });
    } catch (error) {
      console.error('Validation error:', error);
      setIsSubmitting(false);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case STEPS.WELCOME: return 'Welcome';
      case STEPS.LANDLORD_INFO: return 'Your Information';
      case STEPS.PROPERTY_BASIC: return 'Property Information';
      case STEPS.LOCATION: return 'Property Location';
      case STEPS.PROPERTY_CONFIG: return 'Property Configuration';
      case STEPS.ROOM_CONFIG: return 'Room Configuration';
      case STEPS.PROPERTY_IMAGES: return 'Property & Room Images';
      case STEPS.DOCUMENTS: return 'Required Documents';
      case STEPS.REVIEW: return 'Review & Submit';
      default: return 'Unknown Step';
    }
  };

  const getStepIcon = () => {
    switch (step) {
      case STEPS.WELCOME: return <Home className="w-6 h-6" />;
      case STEPS.LANDLORD_INFO: return <User className="w-6 h-6" />;
      case STEPS.PROPERTY_BASIC: return <Building2 className="w-6 h-6" />;
      case STEPS.LOCATION: return <MapPin className="w-6 h-6" />;
      case STEPS.PROPERTY_CONFIG: return <FileText className="w-6 h-6" />;
      case STEPS.ROOM_CONFIG: return <Bed className="w-6 h-6" />;
      case STEPS.PROPERTY_IMAGES: return <Camera className="w-6 h-6" />;
      case STEPS.DOCUMENTS: return <Upload className="w-6 h-6" />;
      case STEPS.REVIEW: return <CheckCircle className="w-6 h-6" />;
      default: return <AlertCircle className="w-6 h-6" />;
    }
  };

  const stepConfig = [
    { id: STEPS.WELCOME, label: 'Welcome', icon: <Home className="w-4 h-4" /> },
    { id: STEPS.LANDLORD_INFO, label: 'Landlord Info', icon: <User className="w-4 h-4" /> },
    { id: STEPS.PROPERTY_BASIC, label: 'Property Basics', icon: <Building2 className="w-4 h-4" /> },
    { id: STEPS.LOCATION, label: 'Location', icon: <MapPin className="w-4 h-4" /> },
    { id: STEPS.PROPERTY_CONFIG, label: 'Configuration', icon: <FileText className="w-4 h-4" /> },
    { id: STEPS.ROOM_CONFIG, label: 'Rooms', icon: <Bed className="w-4 h-4" /> },
    { id: STEPS.PROPERTY_IMAGES, label: 'Images', icon: <Camera className="w-4 h-4" /> },
    { id: STEPS.DOCUMENTS, label: 'Documents', icon: <Upload className="w-4 h-4" /> },
    { id: STEPS.REVIEW, label: 'Review', icon: <CheckCircle className="w-4 h-4" /> }
  ];

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-white dark:bg-gray-900 overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="hidden md:flex w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Host Application</h2>
          <div className="space-y-1">
            {stepConfig.map((config) => (
              <div
                key={config.id}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 cursor-pointer group ${
                  config.id < step
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                    : config.id === step
                    ? 'bg-primary dark:bg-primary/20 text-white dark:text-primary border border-primary dark:border-primary'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  config.id < step
                    ? 'bg-green-500 text-white'
                    : config.id === step
                    ? 'bg-white dark:bg-primary text-primary dark:text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300'
                }`}>
                  {config.id < step ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    config.icon
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  config.id === step ? 'text-white dark:text-white' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {config.label}
                </span>
                {config.id === step && (
                  <motion.div
                    className="ml-auto"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-auto p-6">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-primary dark:bg-primary transition-all duration-500"
              initial={{ width: '0%' }}
              animate={{ width: `${((step) / (Object.keys(STEPS).length - 1)) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Step {step + 1} of {Object.keys(STEPS).length}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Modal.WindowHeader title={getStepTitle()} />
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center space-x-3">
            <div className="bg-primary dark:bg-primary text-white dark:text-white p-2 rounded-lg">
              {getStepIcon()}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{getStepTitle()}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {step === STEPS.WELCOME && "Get started with your host application"}
                {step === STEPS.LANDLORD_INFO && "Tell us about yourself"}
                {step === STEPS.PROPERTY_BASIC && "Provide property details"}
                {step === STEPS.LOCATION && "Where is your property located?"}
                {step === STEPS.PROPERTY_CONFIG && "Configure your property"}
                {step === STEPS.PROPERTY_IMAGES && "Add property and room images"}
                {step === STEPS.DOCUMENTS && "Upload required documents"}
                {step === STEPS.REVIEW && "Review your application"}
              </p>
            </div>
          </div>
          {step > 0 && (
            <Button
              type="button"
              onClick={(e) => prevStep(e)}
              size="small"
              className="bg-primary dark:bg-primary text-white dark:text-white hover:bg-primary/90 dark:hover:bg-primary/90 flex items-center space-x-1 w-auto min-w-[100px]"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>
          )}
        </div>

        {/* Mobile Progress Indicator */}
        <div className="md:hidden px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-primary dark:bg-primary transition-all duration-500"
              initial={{ width: '0%' }}
              animate={{ width: `${((step) / (Object.keys(STEPS).length - 1)) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {Object.values(STEPS).map((s) => (
              <div key={s} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  s < step ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
                  s === step ? 'bg-primary dark:bg-primary text-white dark:text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  {s < step ? <CheckCircle className="w-5 h-5" /> : s + 1}
                </div>
                <span className={`text-xs mt-1 ${
                  s === step ? 'text-primary dark:text-primary font-medium' : 'text-gray-500 dark:text-gray-500'
                }`}>
                  {stepConfig[s].label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto overflow-x-hidden bg-white dark:bg-gray-900">
          {step === STEPS.WELCOME ? (
            <WelcomeStep onNext={nextStep} />
          ) : (
            <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
              {step === STEPS.LANDLORD_INFO && (
                <LandlordInfoStep register={register} errors={errors} watch={watch} control={control} />
              )}
              {step === STEPS.PROPERTY_BASIC && (
                <PropertyBasicStep register={register} errors={errors} watch={watch} control={control} />
              )}
              {step === STEPS.LOCATION && (
                <LocationStep
                  register={register}
                  errors={errors}
                  watch={watch}
                  mapCenter={mapCenter}
                  onLocationSelect={handleLocationSelect}
                  onAddressAutoFill={handleAddressAutoFill}
                />
              )}
              {step === STEPS.PROPERTY_CONFIG && (
                <PropertyConfigStep
                  register={register}
                  errors={errors}
                  watch={watch}
                  control={control}
                  getValues={getValues}
                />
              )}
               {step === STEPS.ROOM_CONFIG && (
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
               )}
               {step === STEPS.PROPERTY_IMAGES && (
                 <PropertyImagesStep
                   register={register}
                   errors={errors}
                   watch={watch}
                   control={control}
                   getValues={getValues}
                   setValue={setValue}
                   clearErrors={clearErrors}
                 />
               )}
               {step === STEPS.DOCUMENTS && (
                 <DocumentsStep
                   register={register}
                   errors={errors}
                   uploadedFiles={uploadedFiles}
                   onFileUpload={handleFileUpload as (documentType: string, file: File) => void}
                 />
               )}
              {step === STEPS.REVIEW && <ReviewStep watch={watch} onBack={prevStep} />}

              {/* Next/Submit Button */}
              {step > 0 && (
                <div className="pt-6">
                  <Button
                    type={step === STEPS.REVIEW ? "submit" : "button"}
                    onClick={step === STEPS.REVIEW ? undefined : (e) => nextStep(e)}
                    className="w-full"
                    isLoading={isLoading || isContinuing || isSubmitting}
                    disabled={isContinuing || isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : (isContinuing ? 'Processing...' : (step === STEPS.REVIEW ? 'Submit Application' : 'Continue →'))}
                  </Button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostApplicationModal;

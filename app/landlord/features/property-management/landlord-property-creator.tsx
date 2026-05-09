'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Info,
  MapPin,
  FileText,
  Bed,
  Camera,
  Upload,
  CheckCircle,
  User,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormProvider } from 'react-hook-form';
import { cn } from '@/utils/helper';
import Button from '@/components/common/Button';
import Skeleton from '@/components/common/Skeleton';
import LoadingAnimation from '@/components/common/LoadingAnimation';

import { usePropertyCreatorLogic } from './hooks/use-property-creator-logic';

// Wizard Steps
import PropertyBasicStep from './components/creator/PropertyBasicStep';
import PropertyConfigStep from './components/creator/PropertyConfigStep';
import LandlordLocationStep from './components/landlord-location-step';
import PropertyImagesStep from './components/creator/PropertyImagesStep';
import RoomConfigStep from './components/creator/RoomConfigStep';
import DocumentsStep from './components/creator/DocumentsStep';
import ReviewStep from './components/creator/ReviewStep';

const STEPS = [
  { id: 'identity', title: 'Property Basics', icon: Building2 },
  { id: 'location', title: 'Location', icon: MapPin },
  { id: 'config', title: 'Property Setup', icon: FileText },
  { id: 'rooms', title: 'Room Setup', icon: Bed },
  { id: 'images', title: 'Images', icon: Camera },
  { id: 'docs', title: 'Documents', icon: Upload },
  { id: 'review', title: 'Review', icon: CheckCircle },
];

export function LandlordPropertyCreator() {
  const router = useRouter();
  const {
    methods,
    register,
    control,
    watch,
    errors,
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
    onSubmit,
  } = usePropertyCreatorLogic({});

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <PropertyBasicStep 
            register={register} 
            errors={errors} 
            watch={watch} 
            control={control} 
          />
        );
      case 1:
        return (
          <LandlordLocationStep 
            register={register} 
            errors={errors} 
            watch={watch}
            control={control}
            mapCenter={watch('location.coordinates')}
            onLocationSelect={handleLocationSelect} 
            onAddressAutoFill={handleAddressAutoFill} 
          />
        );
      case 2:
        return (
          <PropertyConfigStep 
            register={register} 
            errors={errors} 
            watch={watch} 
            control={control} 
            getValues={getValues}
            setValue={setValue}
          />
        );
      case 3:
        return (
          <RoomConfigStep 
            register={register} 
            errors={errors} 
            watch={watch} 
            control={control} 
            fields={fields}
            append={append}
            remove={remove}
            getValues={getValues}
            setValue={setValue}
          />
        );
      case 4:
        return (
          <PropertyImagesStep 
            register={register} 
            errors={errors} 
            watch={watch} 
            control={control} 
            getValues={getValues}
            setValue={setValue}
            clearErrors={clearErrors}
            propertyFiles={propertyFiles}
            roomFiles={roomFiles}
            onPropertyFilesChange={handlePropertyFilesChange}
            onRoomFilesChange={handleRoomFilesChange}
          />
        );
      case 5:
        return (
          <DocumentsStep 
            register={register} 
            errors={errors} 
            watch={watch}
            control={control}
            uploadedFiles={uploadedFiles} 
            onFileUpload={handleFileUpload} 
          />
        );
      case 6:
        return (
          <ReviewStep 
            watch={watch} 
            control={control}
            onBack={handleBack} 
          />
        );
      default:
        return null;
    }
  };

  if (!isMounted) {
    return (
      <div className="w-full relative min-h-screen pb-32">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">
          {/* Header Skeleton */}
          <Skeleton className="h-28 w-full rounded-2xl mb-12" />
          
          {/* Steps Skeleton */}
          <div className="flex justify-between items-center mb-12 px-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="w-10 h-10 rounded-xl" />
            ))}
          </div>

          {/* Form Skeleton */}
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-xl space-y-6">
            <Skeleton className="h-8 w-1/3 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>

          {/* Footer Skeleton */}
          <div className="mt-12 flex justify-between gap-4">
            <Skeleton className="h-14 w-32 rounded-xl" />
            <Skeleton className="h-14 w-48 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative min-h-screen pb-32" id="scroll-container">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">
            {/* Wizard Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/10 shadow-sm mb-12">
               <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                     <div className="p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-primary">
                        <Building2 size={20} />
                     </div>
                     <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                           New Property Listing
                        </h1>
                        <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                           {STEPS[currentStep].title} Step • {currentStep + 1} / {STEPS.length}
                        </p>
                     </div>
                  </div>
                  <div className="flex-none">
                    <Button 
                      outline 
                      type="button"
                      onClick={() => router.back()} 
                      className="rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest h-fit whitespace-nowrap hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300 bg-white/5 dark:bg-gray-800/50"
                    >
                      Discard Draft
                    </Button>
                  </div>
               </div>
            </div>

            {/* Progress Stepper */}
            <div className="mb-12 relative px-2">
              <div className="flex justify-between items-center relative z-10">
                {STEPS.map((step, index) => {
                  const isActive = currentStep === index;
                  const isCompleted = currentStep > index;
                  return (
                    <div 
                      key={step.id} 
                      className="flex flex-col items-center group cursor-pointer relative" 
                      onClick={() => index < currentStep && setCurrentStep(index)}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 border-2 relative z-10",
                        isActive 
                          ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105" 
                          : isCompleted 
                            ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 group-hover:border-primary/40"
                      )}>
                        {isCompleted ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                      </div>
                      <span className={cn(
                        "hidden md:block absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-black uppercase tracking-widest transition-colors",
                        isActive ? "text-primary" : "text-gray-400"
                      )}>
                        {step.title}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="absolute top-5 left-0 w-full h-[2px] bg-gray-100 dark:bg-gray-800 -z-0">
                <motion.div 
                   className="h-full bg-primary"
                   initial={{ width: '0%' }}
                   animate={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                   transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Form Steps */}
            <FormProvider {...methods}>
              <form onSubmit={(e) => e.preventDefault()}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="min-h-[400px]"
                  >
                    {renderStep()}
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Footer */}
                <div className="mt-10 pt-8 border-t border-gray-100 dark:border-gray-800 relative z-[50]">
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
                    
                    <div className="hidden sm:flex flex-col items-center">
                       <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-0.5">Creation Progress</span>
                       <span className="text-[11px] font-black text-primary uppercase tracking-widest">
                          Section {currentStep + 1} / {STEPS.length}
                       </span>
                    </div>

                    <div className="flex justify-end">
                      {currentStep === STEPS.length - 1 ? (
                        <Button 
                          type="submit"
                          onClick={(e) => {
                            e.preventDefault();
                            onSubmit();
                          }} 
                          isLoading={isSubmitting}
                          className="min-w-[160px] px-8 py-2.5 text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-primary/10"
                        >
                          {isSubmitting ? 'Syncing...' : 'Publish listing'}
                        </Button>
                      ) : (
                        <Button 
                          type="button"
                          onClick={handleNext} 
                          className="min-w-[140px] px-8 py-2.5 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-primary/10"
                        >
                          Next Step
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </FormProvider>

            {/* Info Notice */}
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="mt-12 flex items-center gap-4 p-5 bg-sky-50 dark:bg-sky-900/10 rounded-2xl border border-sky-100 dark:border-sky-900/20"
            >
               <div className="p-2 bg-sky-500/10 text-sky-600 rounded-lg"><Info size={20} /></div>
               <p className="text-xs font-bold text-sky-700 dark:text-sky-300 leading-relaxed uppercase tracking-tighter">
                  Every section you complete is automatically saved in your local draft to prevent data loss.
               </p>
            </motion.div>
      </div>
    </div>
  );
};

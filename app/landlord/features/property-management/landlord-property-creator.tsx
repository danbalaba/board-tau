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
import LoadingAnimation from '@/components/common/LoadingAnimation';

import { usePropertyCreatorLogic } from './hooks/use-property-creator-logic';

// Wizard Steps
import LandlordInfoStep from '@/components/host-application/LandlordInfoStep';
import PropertyBasicStep from '@/components/host-application/PropertyBasicStep';
import PropertyConfigStep from '@/components/host-application/PropertyConfigStep';
import LandlordLocationStep from './components/landlord-location-step';
import PropertyImagesStep from '@/components/host-application/PropertyImagesStep';
import RoomConfigStep from '@/components/host-application/RoomConfigStep';
import DocumentsStep from '@/components/host-application/DocumentsStep';
import ReviewStep from '@/components/host-application/ReviewStep';

const STEPS = [
  { id: 'landlord', title: 'Landlord Info', icon: User },
  { id: 'identity', title: 'Property Basics', icon: Building2 },
  { id: 'location', title: 'Location', icon: MapPin },
  { id: 'config', title: 'Configuration', icon: FileText },
  { id: 'rooms', title: 'Rooms', icon: Bed },
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
          <LandlordInfoStep 
            register={register} 
            errors={errors} 
            watch={watch} 
            control={control} 
          />
        );
      case 1:
        return (
          <PropertyBasicStep 
            register={register} 
            errors={errors} 
            watch={watch} 
            control={control} 
          />
        );
      case 2:
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
      case 3:
        return (
          <PropertyConfigStep 
            register={register} 
            errors={errors} 
            watch={watch} 
            control={control} 
            getValues={getValues}
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
      case 6:
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
      case 7:
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

  return (
    <div className="w-full relative min-h-screen pb-32">
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
                  <Button 
                    outline 
                    type="button"
                    onClick={() => router.back()} 
                    className="rounded-xl px-4 py-2 text-[9px] font-black uppercase tracking-widest h-fit"
                  >
                    Discard Draft
                  </Button>
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
                            ? "bg-green-500 border-green-500 text-white" 
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
                       <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-0.5">Application Progress</span>
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

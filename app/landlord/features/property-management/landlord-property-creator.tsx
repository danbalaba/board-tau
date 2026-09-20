'use client';

import React, { useState, useEffect } from 'react';
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
  Sparkles,
  X,
  MessageSquare,
  Lock,
  Save,
  Send,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormProvider } from 'react-hook-form';
import { cn } from '@/utils/helper';
import Button from '@/components/common/Button';
import Skeleton from '@/components/common/Skeleton';
import LoadingAnimation from '@/components/common/LoadingAnimation';
import Modal from '@/components/modals/Modal';
import { KerbyMascot, KerbyPose } from '@/components/modals/search-modal/KerbyMascot';
import { useKerby } from '@/lib/context/KerbyContext';
import { useLoading } from '@/components/loading/LoadingContext';
import { usePropertyCreatorLogic } from './hooks/use-property-creator-logic';

// Wizard Steps
import PropertyBasicStep from './components/creator/PropertyBasicStep';
import PropertyConfigStep from './components/creator/PropertyConfigStep';
import LandlordLocationStep from './components/landlord-location-step';
import PropertyImagesStep from './components/creator/PropertyImagesStep';
import RoomConfigStep from './components/creator/RoomConfigStep';
import DocumentsStep from './components/creator/DocumentsStep';
import ReviewStep from './components/creator/ReviewStep';
import { PropertySubmissionLoaderModal } from './components/creator/PropertySubmissionLoaderModal';
import { PropertyDiscardLoaderModal } from './components/creator/PropertyDiscardLoaderModal';

const CREATE_STEPS = [
  { id: 'identity', title: 'Property Basics', icon: Building2 },
  { id: 'location', title: 'Location', icon: MapPin },
  { id: 'config', title: 'Property Setup', icon: FileText },
  { id: 'rooms', title: 'Room Setup', icon: Bed },
  { id: 'images', title: 'Images', icon: Camera },
  { id: 'docs', title: 'Documents', icon: Upload },
  { id: 'review', title: 'Review', icon: CheckCircle },
];

const EDIT_STEPS = [
  { id: 'identity', title: 'Property Basics', icon: Building2 },
  { id: 'location', title: 'Location', icon: MapPin },
  { id: 'config', title: 'Property Setup', icon: FileText },
  { id: 'rooms', title: 'Room Setup', icon: Bed },
  { id: 'images', title: 'Images', icon: Camera },
  { id: 'docs', title: 'Documents', icon: Upload },
];

function getKerbyGuidance(currentStep: number, category?: string, propertyName?: string): { pose: KerbyPose; speech: string; badge: string } {
  const propLabel = category && category !== 'Property' ? category : 'Property';
  const nameLabel = propertyName || 'your compound';

  switch (currentStep) {
    case 0:
      return {
        pose: 'waving',
        speech: `Mabuhay Host! Let's set up your business background & select the accommodation category for ${nameLabel}.`,
        badge: 'Step 1: Property Identity',
      };
    case 1:
      return {
        pose: 'pointing',
        speech: `Pin your ${propLabel} location accurately near TAU Campus so students and faculty can find you!`,
        badge: 'Step 2: Geolocation & Address',
      };
    case 2:
      return {
        pose: 'studying',
        speech: `Configure total capacity, shared amenities, house rules, and security options for your ${propLabel}.`,
        badge: 'Step 3: Taxonomy & Setup',
      };
    case 3:
      return {
        pose: 'pointing',
        speech: `Set up room rates, capacities, and bed arrangements for your ${propLabel} units.`,
        badge: 'Step 4: Rooms & Pricing',
      };
    case 4:
      return {
        pose: 'loving',
        speech: `Showcase your ${propLabel}! High-quality photos attract 3x more student inquiries.`,
        badge: 'Step 5: Photo Gallery',
      };
    case 5:
      return {
        pose: 'thinking',
        speech: `Upload your business permits & verification docs so our Admin team can award you the Host Trust Badge.`,
        badge: 'Step 6: Legal Verification',
      };
    case 6:
      return {
        pose: 'excited',
        speech: `Awesome job! Review your complete ${propLabel} listing before submitting for admin approval!`,
        badge: 'Step 7: Final Review',
      };
    default:
      return {
        pose: 'waving',
        speech: `Welcome to BoardTAU Landlord Creator! Let's build your property listing together.`,
        badge: 'Listing Creator',
      };
  }
}

function AutoSaveBadge({ 
  saveStatus, 
  lastSavedTimestamp, 
  lastSavedTime 
}: { 
  saveStatus: 'idle' | 'saving' | 'saved'; 
  lastSavedTimestamp: number | null; 
  lastSavedTime: string; 
}) {
  const [relativeText, setRelativeText] = useState('');

  useEffect(() => {
    const updateText = () => {
      if (saveStatus === 'saving') {
        setRelativeText('Saving changes...');
        return;
      }
      if (!lastSavedTimestamp) {
        setRelativeText(lastSavedTime ? `Saved at ${lastSavedTime}` : 'Saved just now');
        return;
      }
      const diffSec = Math.floor((Date.now() - lastSavedTimestamp) / 1000);
      if (diffSec < 10) {
        setRelativeText('Saved just now ✓');
      } else if (diffSec < 60) {
        setRelativeText(`Saved ${diffSec}s ago`);
      } else {
        const diffMin = Math.floor(diffSec / 60);
        if (diffMin < 60) {
          setRelativeText(`Saved ${diffMin}m ago`);
        } else {
          setRelativeText(`Saved at ${lastSavedTime}`);
        }
      }
    };

    updateText();
    const interval = setInterval(updateText, 4000);
    return () => clearInterval(interval);
  }, [saveStatus, lastSavedTimestamp, lastSavedTime]);

  const isSaving = saveStatus === 'saving';

  return (
    <div 
      className={cn(
        "relative w-[130px] h-7 px-2.5 rounded-full border transition-colors duration-300 flex items-center justify-center shrink-0 overflow-hidden select-none",
        isSaving 
          ? "bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/20" 
          : "bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-400 border-primary/20"
      )}
    >
      <AnimatePresence initial={false}>
        {isSaving ? (
          <motion.div
            key="saving"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-wider whitespace-nowrap w-full"
          >
            <div className="animate-spin w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full shrink-0" />
            <span className="truncate">Saving...</span>
          </motion.div>
        ) : (
          <motion.div
            key="saved"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-wider whitespace-nowrap w-full"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="truncate">{relativeText || 'Auto-Saved'}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function LandlordPropertyCreator({ initialData = {} }: { initialData?: any }) {
  const router = useRouter();
  const { startLoading } = useLoading();
  const isEditMode = Boolean(initialData?.id);
  const isRejected = initialData?.status === 'REJECTED';
  const rejectionReason = initialData?.rejectionReason || 'One or more details or legal verification documents require revision.';

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
    setError,
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
    onSubmit,
  } = usePropertyCreatorLogic(initialData);

  const STEPS = isEditMode ? EDIT_STEPS : CREATE_STEPS;

  const [showDraftModal, setShowDraftModal] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [discardTarget, setDiscardTarget] = useState<'reset' | 'exit'>('reset');

  const stepperRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (stepperRef.current && stepperRef.current.children[currentStep]) {
      const activeEl = stepperRef.current.children[currentStep] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [currentStep]);

  useEffect(() => {
    if (hasSavedDraft) {
      setShowDraftModal(true);
    }
  }, [hasSavedDraft]);

  const handleStartDiscard = (target: 'reset' | 'exit' = 'exit') => {
    setShowDraftModal(false);
    setDiscardTarget(target);
    setIsDiscarding(true);
  };

  const handleFinishDiscard = () => {
    setIsDiscarding(false);
    clearDraft();
    if (startLoading) startLoading();
    router.push('/landlord/properties');
  };

  const [customNav, setCustomNav] = useState<{
    nextLabel: string;
    backLabel: string;
    onNext: () => void;
    onBack: () => void;
  } | null>(null);

  useEffect(() => {
    setCustomNav(null);
  }, [currentStep]);

  const getStepButtonLabel = () => {
    if (isEditMode) {
      switch (currentStep) {
        case 0:
          return { next: 'Next: Location', back: '' };
        case 1:
          return { next: 'Next: Property Setup', back: 'Back: Basics' };
        case 2:
          return { next: 'Next: Room Setup', back: 'Back: Location' };
        case 3:
          return { next: 'Next: Photo Uploads', back: 'Back: Property Setup' };
        case 4:
          return { next: 'Next: Business Docs', back: 'Back: Room Setup' };
        case 5:
          return { next: isSubmitting ? 'Syncing...' : (isRejected ? 'Save & Resubmit Listing' : 'Save Changes'), back: 'Back: Photos' };
        default:
          return { next: 'Next Step', back: 'Previous' };
      }
    }

    switch (currentStep) {
      case 0:
        return { next: 'Next: Location', back: '' };
      case 1:
        return { next: 'Next: Property Setup', back: 'Back: Basics' };
      case 2:
        return { next: 'Next: Room Setup', back: 'Back: Location' };
      case 3:
        return { next: 'Next: Photo Uploads', back: 'Back: Property Setup' };
      case 4:
        return { next: 'Next: Business Docs', back: 'Back: Room Setup' };
      case 5:
        return { next: 'Next: Final Review', back: 'Back: Photos' };
      case 6:
        return { next: isSubmitting ? 'Syncing...' : 'Publish Listing', back: 'Back: Docs' };
      default:
        return { next: 'Next Step', back: 'Previous' };
    }
  };

  const watchCategory = (watch as any)('propertyInfo.category') || (watch as any)('propertyInfo.propertyTypeId') || (watch as any)('businessInfo.businessType') || 'Property';
  const watchPropertyName = (watch as any)('propertyInfo.propertyName') || (watch as any)('businessInfo.businessName') || 'your compound';

  const kerbyGuide = React.useMemo(() => {
    return getKerbyGuidance(currentStep, watchCategory, watchPropertyName);
  }, [currentStep, watchCategory, watchPropertyName]);

  const { setKerbyState } = useKerby();

  useEffect(() => {
    setKerbyState(kerbyGuide);
    return () => setKerbyState(null);
  }, [kerbyGuide, setKerbyState]);

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <PropertyBasicStep 
            register={register} 
            errors={errors} 
            watch={watch} 
            control={control} 
            setValue={setValue}
            clearErrors={clearErrors}
            isEditMode={isEditMode}
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
            setError={setError}
            clearErrors={clearErrors}
            isEditMode={isEditMode}
            onCustomNavChange={setCustomNav}
            onMainNext={handleNext}
            onMainBack={handleBack}
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
            clearErrors={clearErrors}
            onCustomNavChange={setCustomNav}
            onMainNext={handleNext}
            onMainBack={handleBack}
            defaultToLastRoom={navDirection === 'back'}
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
            onPropertyFilesChange={handlePropertyFilesChange}
            roomFiles={roomFiles}
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
            getValues={getValues}
            uploadedFiles={uploadedFiles}
            propertyFiles={propertyFiles}
            roomFiles={roomFiles}
            onNavigateStep={setCurrentStep}
            onCustomNavChange={setCustomNav}
            onSubmit={onSubmit}
          />
        );
      default:
        return null;
    }
  };



  const getDraftLocationLabel = (draft: any) => {
    if (!draft) return 'Property Basics';

    const mainStepIdx = typeof draft.currentStep === 'number' ? draft.currentStep : 0;
    const formVals = draft.formValues || {};
    const pCfg = formVals.propertyConfig || {};

    const mainStepTitles = [
      'Property Basics',
      'Location & Address',
      'Property Setup',
      'Room & Unit Setup',
      'Photo Gallery',
      'Legal & Business Documents',
      'Final Review',
    ];

    const mainTitle = mainStepTitles[mainStepIdx] || `Step ${mainStepIdx + 1}`;

    if (mainStepIdx === 2) {
      const subStep = pCfg.subStep || 1;
      if (subStep === 1) return `${mainTitle} → Building Structure`;
      if (subStep === 2) {
        const tabKey = pCfg.activeAmenityTab || 'STORES';
        const amenityTabNames: Record<string, string> = {
          STORES: 'Nearby Stores',
          INTERNET: 'Internet & WiFi',
          BACKUP_SYSTEMS: 'Power & Water Backup',
          PARKING: 'Vehicle Parking',
          LAUNDRY: 'Laundry Services',
          STUDY_LOUNGE: 'Study Area',
          CARETAKER: 'Property Caretaker',
          FITNESS: 'Fitness & Sports',
        };
        const tabLabel = amenityTabNames[tabKey] || 'Shared Amenities';
        return `${mainTitle} → Shared Amenities (${tabLabel})`;
      }
      if (subStep === 3) {
        const activeRuleTab = pCfg.activeRuleTab || 'GENDER_POLICY';
        const ruleTabNames: Record<string, string> = {
          GENDER_POLICY: 'Gender Policy',
          CURFEW: 'Curfew Policy',
          VISITOR_POLICY: 'Visitor Policy',
          PET_POLICY: 'Pet Policy',
          SMOKING_POLICY: 'Smoking Policy',
          ALCOHOL_POLICY: 'Alcohol Policy',
          SMOKE_ALCOHOL: 'Smoke & Alcohol',
        };
        const subGroupLabel = ruleTabNames[activeRuleTab] || 'House Rules';
        return `${mainTitle} → House Rules (${subGroupLabel})`;
      }
      if (subStep === 4) {
        const activeFeatureTab = pCfg.activeFeatureTab || 'SECURITY';
        const featureTabNames: Record<string, string> = {
          SECURITY: 'CCTV & Guards',
          FIRE_SAFETY: 'Fire Safety',
          UTILITIES: 'Water & Power',
        };
        const subGroupLabel = featureTabNames[activeFeatureTab] || 'Security & Safety';
        return `${mainTitle} → Security & Safety (${subGroupLabel})`;
      }
      if (subStep === 5) return `${mainTitle} → Lease Contract`;
    }

    return mainTitle;
  };

  return (
    <div className="w-full relative min-h-screen">
      {/* 🧹 DISCARD DRAFT ANIMATED LOADER MODAL WITH KERBY */}
      <PropertyDiscardLoaderModal
        isOpen={isDiscarding}
        onComplete={handleFinishDiscard}
        title={discardTarget === 'exit' ? "Discarding Property Draft & Exiting..." : "Discarding Property Draft & Starting Fresh..."}
      />

      <Modal 
        isOpen={showDraftModal} 
        onClose={() => {
            handleStartDiscard('reset');
        }}
        title={isEditMode ? "Continue Editing Your Property?" : "Continue Where You Left Off?"}
      >
        <div className="space-y-6 p-1">
          <div className="p-4 rounded-2xl bg-primary/5 dark:bg-primary/10 border border-primary/15 flex items-start gap-4">
            <div className="p-3 bg-primary text-white rounded-xl shadow-md shrink-0">
              <Building2 size={24} />
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-gray-900 dark:text-white text-base leading-tight">
                {savedDraftData?.formValues?.propertyInfo?.propertyName || initialData?.title || 'Untitled Property'}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-bold flex items-center gap-1.5 flex-wrap">
                <span>Saved at {lastSavedTime || 'recently'}</span>
                <span>•</span>
                <span className="text-primary font-black">{getDraftLocationLabel(savedDraftData)}</span>
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
            {isEditMode 
              ? "We saved your previous changes for this property! Would you like to pick up where you left off or start over with your published details?"
              : "We saved your work so you won't lose anything! Would you like to keep working on this property or start a fresh new listing?"}
          </p>
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button
              outline
              type="button"
              onClick={() => {
                handleStartDiscard('reset');
              }}
              className="w-full sm:w-auto h-11 px-6 text-xs font-bold"
            >
              {isEditMode ? 'Start Over' : 'Start Fresh Listing'}
            </Button>
            <Button
              type="button"
              onClick={() => {
                setShowDraftModal(false);
                loadDraft();
              }}
              className="w-full sm:w-auto h-11 px-6 text-xs font-bold shadow-md shadow-primary/20"
            >
              {isEditMode ? 'Resume Saved Edits' : 'Continue Listing'}
            </Button>
          </div>
        </div>
      </Modal>
      <div className="max-w-7xl mx-auto px-0 sm:px-6 md:px-8 py-0 sm:py-10 pb-28 sm:pb-16">
            {/* Wizard Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 sm:p-6 rounded-none sm:rounded-2xl border-x-0 border-t-0 sm:border border-primary/10 shadow-sm mb-4 sm:mb-12">
               <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 sm:gap-4 pr-36 md:pr-0">
                     <div className="p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-primary shrink-0">
                        <Building2 size={20} />
                     </div>
                     <div>
                        <h1 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white leading-tight">
                           {isEditMode ? (isRejected ? 'Update & Resubmit Listing' : 'Edit Property Details') : 'New Property Listing'}
                        </h1>
                         <p className="text-[10px] sm:text-[11px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">
                            {(STEPS[currentStep] || STEPS[0])?.title} Step • {currentStep + 1} / {STEPS.length}
                         </p>
                     </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    {/* 💾 Live Fixed Position Auto-Save Status Badge */}
                    <div className="absolute top-3.5 right-3.5 md:relative md:top-auto md:right-auto z-20 shrink-0">
                       <AutoSaveBadge 
                         saveStatus={saveStatus} 
                         lastSavedTimestamp={lastSavedTimestamp} 
                         lastSavedTime={lastSavedTime} 
                       />
                    </div>

                    <Button 
                      outline 
                      type="button"
                      onClick={() => {
                        if (isEditMode) {
                          if (startLoading) startLoading();
                          router.push('/landlord/properties');
                        } else {
                          handleStartDiscard('exit');
                        }
                      }} 
                      className="w-full sm:w-auto rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest h-fit whitespace-nowrap hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300 bg-white/5 dark:bg-gray-800/50 cursor-pointer"
                    >
                      {isEditMode ? 'Back to Properties' : 'Discard & Exit'}
                    </Button>
                  </div>
               </div>
            </div>

            {/* 🌹 ROSE RED REJECTION NOTICE BANNER (If Rejected) */}
            {isRejected && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 sm:mb-10 p-4 sm:p-6 rounded-2xl bg-rose-500/10 dark:bg-rose-500/15 border-2 border-rose-500/30 flex items-start gap-4 shadow-sm"
              >
                <div className="p-2.5 sm:p-3 bg-rose-500 text-white rounded-xl shadow-md shrink-0">
                  <MessageSquare size={20} className="sm:w-5 sm:h-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-rose-600 dark:text-rose-400 text-xs sm:text-sm uppercase tracking-wider">
                      Admin Listing Moderation Feedback
                    </h3>
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-500 uppercase tracking-widest">
                      Action Required
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-relaxed bg-white/60 dark:bg-slate-900/60 p-3 rounded-xl border border-rose-500/20">
                    "{rejectionReason}"
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pt-1">
                    Please update the flagged sections in this wizard and click <span className="text-rose-500 font-black">"Save & Resubmit Listing"</span> on the final step to send your listing back for Admin review.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Draggable & Scrollable Progress Stepper Pills (Edge-to-Edge) */}
            <div className="mb-4 sm:mb-8 w-full overflow-hidden">
              <div 
                ref={stepperRef}
                className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth py-1 px-4 sm:px-0"
              >
                {STEPS.map((step, index) => {
                  const isActive = currentStep === index;
                  const isCompleted = isEditMode ? true : currentStep > index;
                  const isLocked = isEditMode ? false : index > maxUnlockedStep;
                  const StepIcon = step.icon;

                  return (
                    <button 
                      key={step.id} 
                      type="button"
                      disabled={isLocked}
                      onClick={() => !isLocked && navigateToStep(index)}
                      className={cn(
                        "flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all shrink-0 cursor-pointer select-none",
                        isActive 
                          ? "bg-primary text-white shadow-lg shadow-primary/25 scale-[1.02] ring-2 ring-primary/20" 
                          : isCompleted 
                            ? "bg-primary/10 text-primary dark:text-primary-400 border border-primary/30 hover:bg-primary/20" 
                            : isLocked
                              ? "bg-gray-200/40 dark:bg-gray-800/40 text-gray-400 dark:text-gray-500 border border-transparent cursor-not-allowed opacity-50"
                              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary/40 hover:text-primary shadow-sm"
                      )} 
                      title={isLocked ? `Step ${index + 1}: ${step.title} (Locked)` : `Step ${index + 1}: ${step.title}`}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-transform",
                        isActive 
                          ? "bg-white/20 text-white" 
                          : isCompleted 
                            ? "bg-primary text-white" 
                            : isLocked
                              ? "bg-transparent text-gray-400 dark:text-gray-500"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                      )}>
                        {isCompleted ? (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        ) : isLocked ? (
                          <Lock className="w-3 h-3" />
                        ) : (
                          <StepIcon className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <span className="text-[11px] sm:text-xs tracking-tight">
                        <span className="opacity-60 mr-1">{index + 1}.</span>
                        {step.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Full-Width Form Section (Option C) */}
            <div className="w-full space-y-6">
              <FormProvider {...methods}>
                <form onSubmit={(e) => e.preventDefault()}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="min-h-0"
                    >
                      {renderStep()}
                    </motion.div>
                  </AnimatePresence>

                  {/* Info Notice */}
                  <motion.div 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     className="mt-4 mb-20 md:mb-0 sm:mt-6 flex items-center gap-3 sm:gap-4 p-3.5 sm:p-5 bg-sky-50 dark:bg-sky-900/10 rounded-none sm:rounded-2xl border-x-0 sm:border border-sky-100 dark:border-sky-900/20"
                  >
                     <div className="p-2 bg-sky-500/10 text-sky-600 rounded-lg shrink-0"><Info size={18} className="sm:w-5 sm:h-5" /></div>
                     <p className="text-[11px] sm:text-xs font-bold text-sky-700 dark:text-sky-300 leading-relaxed uppercase tracking-tighter">
                        Every section you complete is automatically saved as you type to prevent data loss.
                     </p>
                  </motion.div>

                  {/* Navigation Footer (Fixed Sticky Bottom Action Bar on Mobile, Inline on Desktop) */}
                  <div className="fixed bottom-0 left-0 right-0 z-50 md:relative md:bottom-auto md:left-auto md:right-auto md:z-[50] bg-white/95 dark:bg-gray-900/95 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none border-t border-gray-200 dark:border-gray-800 p-3 sm:p-0 sm:mt-8 sm:pt-6 shadow-[0_-8px_30px_rgba(0,0,0,0.15)] md:shadow-none transition-all">
                    <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 items-center gap-2.5 sm:gap-4 px-2 sm:px-0">
                      <div className="flex justify-start">
                        {currentStep > 0 && (
                          <Button 
                            outline 
                            type="button" 
                            onClick={customNav ? customNav.onBack : handleBack} 
                            disabled={isSubmitting}
                            className="h-11 px-3.5 sm:px-5 flex items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap rounded-xl sm:rounded-2xl"
                          >
                            <ChevronLeft className="w-4 h-4 shrink-0" />
                            <span className="truncate max-w-[130px] sm:max-w-none">{customNav ? customNav.backLabel : getStepButtonLabel().back}</span>
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
                            className="h-11 px-5 sm:px-8 flex items-center justify-center gap-2 text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-primary/10 whitespace-nowrap rounded-xl sm:rounded-2xl"
                          >
                            {isSubmitting ? (
                              <span className="flex items-center justify-center gap-2">
                                <span>Syncing...</span>
                              </span>
                            ) : isEditMode ? (
                              isRejected ? (
                                <span className="flex items-center justify-center gap-2">
                                  <span>Save & Resubmit Listing</span>
                                  <Send className="w-4 h-4 shrink-0" />
                                </span>
                              ) : (
                                <span className="flex items-center justify-center gap-2">
                                  <span>Save Changes</span>
                                  <Save className="w-4 h-4 shrink-0" />
                                </span>
                              )
                            ) : (
                              <span>Publish Listing</span>
                            )}
                          </Button>
                        ) : (
                          <Button 
                            type="button"
                            onClick={customNav ? customNav.onNext : handleNext} 
                            className="h-11 px-4 sm:px-6 flex items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-primary/10 whitespace-nowrap rounded-xl sm:rounded-2xl"
                          >
                            <span className="truncate max-w-[140px] sm:max-w-none">{customNav ? customNav.nextLabel : getStepButtonLabel().next}</span>
                            <ChevronRight className="w-4 h-4 shrink-0" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </form>
              </FormProvider>
            </div>
      </div>

      {/* Fullscreen Interactive Kerby Loading Modal */}
      <PropertySubmissionLoaderModal 
        isOpen={isSubmitting} 
        progress={submissionProgress}
        stage={submissionStage}
        actionType={isEditMode ? 'edit' : 'create'}
      />
    </div>
  );
}

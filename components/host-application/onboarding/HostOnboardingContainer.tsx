"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Controller } from "react-hook-form";
import dynamic from "next/dynamic";
import Webcam from "react-webcam";
import { User } from "next-auth";
import {
  User as UserIcon,
  Phone,
  Mail,
  Building2,
  MapPin,
  FileText,
  Camera,
  BadgeCheck,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Home,
  CreditCard,
  X,
  Sparkles,
  Check,
  Lock,
  AlertCircle,
} from "lucide-react";
import Button from "@/components/common/Button";
import Input from "@/components/inputs/Input";
import Modal from "@/components/modals/Modal";
import { toast } from "react-hot-toast";
import { ConfettiButton, triggerConfetti } from "@/components/lightswind/confetti-button";
import { useHostApplicationLogic } from "@/components/host-application/useHostApplicationLogic";
import KerbyMascotStage from "./KerbyMascotStage";
import KerbyDesktopIntroModal from "./KerbyDesktopIntroModal";
import { HostApplicationSubmissionLoaderModal } from "@/components/host-application/HostApplicationSubmissionLoaderModal";
import { cn } from "@/utils/helper";

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
          : "bg-primary/10 dark:bg-primary/20 text-primary border-primary/20"
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
import {
  validateFullName,
  validatePhoneNumber,
  validateEmail,
  validateBusinessName,
  getDesktopStepForMobileStep,
} from "../HostApplicationUtils";

// Steps
import WelcomeStep from "@/components/host-application/steps/WelcomeStep";
import LandlordIdentityStep from "@/components/host-application/steps/LandlordIdentityStep";
import EstablishmentInfoStep from "@/components/host-application/steps/EstablishmentInfoStep";
import PropertyEvidenceStep from "@/components/host-application/steps/PropertyEvidenceStep";
import LegalDocumentsStep from "@/components/host-application/steps/LegalDocumentsStep";
import PrepareStep from "@/components/host-application/steps/PrepareStep";
import ReviewStep from "@/components/host-application/steps/ReviewStep";

// Dynamically import biometric AI engines
const SelfieStep = dynamic(() => import("@/components/host-application/steps/SelfieStep"), {
  loading: () => (
    <div className="h-[350px] flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">
        Loading AI Face Engine...
      </span>
    </div>
  ),
});

const IDStep = dynamic(() => import("@/components/host-application/steps/IDStep"), {
  loading: () => (
    <div className="h-[350px] flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">
        Loading ID Scanner...
      </span>
    </div>
  ),
});

interface HostOnboardingContainerProps {
  user?: User & { id: string; role?: string };
  onCloseModal?: () => void;
}

const FORM_STEPS = [
  { id: 1, title: "Identity", icon: UserIcon },
  { id: 2, title: "Establishment", icon: Building2 },
  { id: 3, title: "Property", icon: MapPin },
  { id: 4, title: "Legal & Bills", icon: FileText },
  { id: 5, title: "Guidelines", icon: ShieldCheck },
  { id: 6, title: "Selfie Liveness", icon: Camera },
  { id: 7, title: "ID Scan", icon: CreditCard },
  { id: 8, title: "Review & Submit", icon: BadgeCheck },
];

export const HostOnboardingContainer: React.FC<HostOnboardingContainerProps> = ({ user, onCloseModal }) => {
  const [isSleepingMobile, setIsSleepingMobile] = useState(true);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(1);
  const stepperRef = useRef<HTMLDivElement>(null);
  const logic = useHostApplicationLogic();
  const { mobileStep, setMobileStep } = logic;
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [showDesktopIntro, setShowDesktopIntro] = useState(true);
  const [mobileDocChoice, setMobileDocChoice] = useState<'permit' | 'utility'>('permit');

  useEffect(() => {
    if (!logic.isCheckingDraft && logic.hasSavedDraft) {
      setShowDraftModal(true);
    }
  }, [logic.isCheckingDraft, logic.hasSavedDraft]);

  const getDraftLocationLabel = (draft: any) => {
    if (!draft) return 'Identity Info';
    const mStep = typeof draft.mobileStep === 'number' ? draft.mobileStep : 1;
    const dStep = typeof draft.step === 'number' ? draft.step : 1;

    const stepNames = [
      'Welcome',
      'Identity Details',
      'Establishment Profile',
      'Property Location & Facade',
      'Legal Permits & Bills',
      'Host Guidelines',
      'Selfie Liveness Scan',
      'ID Card Scan',
      'Final Review & Submit'
    ];

    return stepNames[dStep] || `Question ${mStep} of 16`;
  };

  useEffect(() => {
    if (logic.step > 0) {
      setIsSleepingMobile(false);
    }
  }, [logic.step]);

  useEffect(() => {
    if (logic.step > maxUnlockedStep) {
      setMaxUnlockedStep(logic.step);
    }
  }, [logic.step, maxUnlockedStep]);

  useEffect(() => {
    if (stepperRef.current && logic.step > 0) {
      const activeIdx = logic.step - 1;
      const activeEl = stepperRef.current.children[activeIdx] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [logic.step]);

  const renderStepContent = (isMobileView = false) => {
    switch (logic.step) {
      case 0:
        return <WelcomeStep onNext={logic.nextStep} />;
      case 1:
        return (
          <LandlordIdentityStep
            register={logic.register}
            errors={logic.errors}
            watch={logic.watch}
            control={logic.control}
          />
        );
      case 2:
        return (
          <EstablishmentInfoStep
            register={logic.register}
            errors={logic.errors}
            watch={logic.watch}
            control={logic.control}
          />
        );
      case 3:
        return (
          <PropertyEvidenceStep
            register={logic.register}
            errors={logic.errors}
            watch={logic.watch}
            setValue={logic.setValue}
            facadeFile={logic.facadeFile}
            setFacadeFile={(file) => {
              logic.setFacadeFile(file);
              if (file) {
                logic.clearErrors('propertyEvidence.facadePhotoUrl');
              }
            }}
            mode={isMobileView ? (mobileStep === 8 ? 'location' : mobileStep === 9 ? 'facade' : 'all') : 'all'}
          />
        );
      case 4:
        return (
          <LegalDocumentsStep
            permitFile={logic.permitFile}
            setPermitFile={(file) => {
              logic.setPermitFile(file);
              if (file) logic.clearErrors('verification.businessPermitUrl');
            }}
            utilityBillFile={logic.utilityBillFile}
            setUtilityBillFile={(file) => {
              logic.setUtilityBillFile(file);
              if (file) logic.clearErrors('verification.businessPermitUrl');
            }}
            fireSafetyFile={logic.fireSafetyFile}
            setFireSafetyFile={(file) => {
              logic.setFireSafetyFile(file);
              if (file) logic.clearErrors('verification.fireSafetyUrl');
            }}
            mode={isMobileView ? (mobileStep === 10 ? 'primary' : mobileStep === 11 ? 'fire' : 'all') : 'all'}
            errors={logic.errors}
            docChoice={logic.docChoice}
            onDocChoiceChange={(choice) => {
              setMobileDocChoice(choice);
              logic.setDocChoice(choice);
            }}
          />
        );
      case 5:
        return (
          <PrepareStep
            hasReadGuidelines={logic.hasReadGuidelines}
            setHasReadGuidelines={(val) => {
              logic.setHasReadGuidelines(val);
              if (val) logic.clearErrors('guidelines' as any);
            }}
            hideHeader={isMobileView}
            hasError={!!(logic.errors as any)?.guidelines}
            errorMessage={(logic.errors as any)?.guidelines?.message}
          />
        );
      case 6:
        return (
          <SelfieStep
            capturedSelfie={logic.capturedSelfie}
            setCapturedSelfie={logic.setCapturedSelfie}
            webcamRef={logic.webcamRef as React.RefObject<Webcam>}
            facingMode={logic.facingMode}
            isFaceAligned={logic.isFaceAligned}
            livenessStatus={logic.livenessStatus}
            activeChallenge={logic.activeChallenge}
            setIsFaceAligned={logic.setIsFaceAligned}
            isProcessing={logic.isProcessing}
            isEngineReady={logic.isEngineReady}
            isFlashActive={logic.isFlashActive}
            toggleCamera={() =>
              logic.setFacingMode((prev) => (prev === "user" ? "environment" : "user"))
            }
            handleCaptureSelfie={logic.handleCaptureSelfie}
            hideHeader={isMobileView}
          />
        );
      case 7:
        return (
          <IDStep
            capturedID={logic.capturedID}
            setCapturedID={logic.setCapturedID}
            isProcessing={logic.isIDProcessing}
            handleCaptureID={logic.handleCaptureID}
            selfieRetakeNeeded={logic.selfieRetakeNeeded}
            handleRetakeSelfie={logic.handleRetakeSelfie}
            hideHeader={isMobileView}
          />
        );
      case 8:
        return (
          <ReviewStep
            watch={logic.watch}
            onBack={logic.prevStep}
            onGoToStep={(desktopStep: number, mobileStepNum: number) => {
              logic.setStep(desktopStep);
              setMobileStep(mobileStepNum);
            }}
            capturedSelfie={logic.capturedSelfie}
            capturedID={logic.capturedID}
            facadeFile={logic.facadeFile}
            permitFile={logic.permitFile}
            utilityBillFile={logic.utilityBillFile}
            fireSafetyFile={logic.fireSafetyFile}
            onSubmit={logic.handleSubmit}
            isSubmitting={logic.isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  const currentStepTitle = FORM_STEPS[logic.step - 1]?.title || "Identity";
  const progressPct = logic.step > 0 ? Math.round((logic.step / 8) * 100) : 0;

  // Sync mobile step changes to logic.step & clear stale errors on step navigation
  useEffect(() => {
    if (logic.isCheckingDraft || logic.hasSavedDraft) return;
    if (isSleepingMobile && logic.step === 0) return;

    const expectedDesktopStep = getDesktopStepForMobileStep(mobileStep);
    if (logic.step !== expectedDesktopStep) {
      logic.clearErrors();
      logic.setStep(expectedDesktopStep);
    }

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [mobileStep, logic.isCheckingDraft, logic.hasSavedDraft, isSleepingMobile, logic.step]);

  // Trigger celebration confetti burst when entering mobile step 16 (You're All Set!) or desktop step 8 (Review & Submit)
  useEffect(() => {
    if (mobileStep === 16 || logic.step === 8) {
      triggerConfetti({ particleCount: 130 });
    }
  }, [mobileStep, logic.step]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [logic.step]);

  const handleMobileNext = async () => {
    let isValid = true;
    if (mobileStep === 1) isValid = await logic.trigger('contactInfo.fullName');
    if (mobileStep === 2) isValid = true; // Dedicated Welcome Interstitial Step
    if (mobileStep === 3) isValid = await logic.trigger('contactInfo.phoneNumber');
    if (mobileStep === 4) isValid = await logic.trigger('contactInfo.email');
    if (mobileStep === 5) {
      const roleVal = logic.getValues('contactInfo.ownershipRole');
      if (!roleVal) {
        isValid = false;
        logic.setError('contactInfo.ownershipRole', { type: 'required', message: 'Role or ownership status is required' });
      } else {
        logic.clearErrors('contactInfo.ownershipRole');
      }
    }
    if (mobileStep === 6) isValid = await logic.trigger('businessInfo.businessName');
    if (mobileStep === 7) {
      const typeVal = logic.getValues('businessInfo.businessType');
      if (!typeVal) {
        isValid = false;
        logic.setError('businessInfo.businessType', { type: 'required', message: 'Accommodation type is required' });
      } else {
        logic.clearErrors('businessInfo.businessType');
      }
    }
    if (mobileStep === 8) {
      const expVal = logic.getValues('businessInfo.yearsExperience');
      if (!expVal) {
        isValid = false;
        logic.setError('businessInfo.yearsExperience', { type: 'required', message: 'Landlord experience level is required' });
      } else {
        logic.clearErrors('businessInfo.yearsExperience');
      }
    }
    if (mobileStep === 9) isValid = await logic.trigger('propertyEvidence.address');
    if (mobileStep === 10) {
      if (!logic.facadeFile) {
        isValid = false;
        logic.setError('propertyEvidence.facadePhotoUrl', {
          type: 'required',
          message: 'Facade photo of main entrance is required'
        });
        toast.error('Please upload a clear facade photo of your building');
      } else {
        logic.clearErrors('propertyEvidence.facadePhotoUrl');
      }
    }
    if (mobileStep === 11) {
      if (!logic.permitFile && !logic.utilityBillFile) {
        isValid = false;
        logic.setError('verification.businessPermitUrl', {
          type: 'required',
          message: 'Business Permit or Utility Bill is required'
        });
        toast.error('Please upload your Mayor\'s Permit or Utility Bill');
      } else {
        logic.clearErrors('verification.businessPermitUrl');
      }
    }
    if (mobileStep === 12) {
      if (!logic.fireSafetyFile) {
        isValid = false;
        logic.setError('verification.fireSafetyUrl', {
          type: 'required',
          message: 'Fire Safety Certificate is required'
        });
        toast.error('Please upload your BFP Fire Safety Certificate');
      } else {
        logic.clearErrors('verification.fireSafetyUrl');
      }
    }
    if (mobileStep === 13) {
      if (!logic.hasReadGuidelines) {
        isValid = false;
        logic.setError('guidelines' as any, {
          type: 'required',
          message: 'You must agree to the guidelines before proceeding'
        });
        toast.error('Please accept the Host Community Guidelines to proceed');
      } else {
        logic.clearErrors('guidelines' as any);
      }
    }
    if (mobileStep === 14) {
      if (!logic.capturedSelfie) {
        isValid = false;
        toast.error('Please complete the selfie liveness check to proceed');
      }
    }
    if (mobileStep === 15) {
      if (!logic.capturedID) {
        isValid = false;
        toast.error('Please capture your Government ID document to proceed');
      }
    }

    if (mobileStep === 16 || mobileStep === 17) {
      isValid = true;
    }

    if (isValid && mobileStep < 17) {
      setMobileStep((prev) => prev + 1);
    }
  };

  const handleMobileBack = () => {
    setMobileStep((prev) => Math.max(1, prev - 1));
  };

  const rawFullName = logic.watch("contactInfo.fullName") || user?.name || "";
  const firstName = rawFullName.trim() ? rawFullName.trim().split(" ")[0] : "there";

  if (logic.isCheckingDraft) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f17] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <span className="text-xs font-black uppercase tracking-widest text-primary/70">
          Checking Saved Progress...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f17] py-0 md:pt-4 md:pb-12 px-0 md:px-8 transition-colors">
      {/* 🚀 FULL SCREEN KERBY SUBMISSION LOADER MODAL */}
      <HostApplicationSubmissionLoaderModal
        isOpen={logic.isSubmitting}
        progress={logic.submissionProgress}
        stage={logic.submissionStage}
      />

      {/* 💾 DRAFT RESTORATION MODAL */}
      <Modal
        isOpen={showDraftModal}
        onClose={() => setShowDraftModal(false)}
        title="Continue Your Host Application?"
      >
        <div className="space-y-6 p-1">
          <div className="p-4 rounded-2xl bg-primary/5 dark:bg-primary/10 border border-primary/15 flex items-start gap-4">
            <div className="p-3 bg-primary text-white rounded-xl shadow-md shrink-0">
              <UserIcon size={24} />
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-gray-900 dark:text-white text-base leading-tight">
                {logic.savedDraftData?.formValues?.contactInfo?.fullName || logic.savedDraftData?.formValues?.businessInfo?.businessName || 'Saved Host Application Draft'}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-bold flex items-center gap-1.5 flex-wrap">
                <span>Saved at {logic.lastSavedTime || 'recently'}</span>
                <span>•</span>
                <span className="text-primary font-black">
                  {getDraftLocationLabel(logic.savedDraftData)}
                </span>
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
            We saved your host application progress so you won't lose your entered details or uploads! Would you like to pick up where you left off or start fresh?
          </p>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button
              outline
              type="button"
              onClick={() => {
                setShowDraftModal(false);
                logic.clearDraft();
              }}
              className="w-full sm:w-auto h-11 px-6 text-xs font-bold"
            >
              Start Fresh Application
            </Button>
            <Button
              type="button"
              onClick={() => {
                setShowDraftModal(false);
                setIsSleepingMobile(false);
                logic.loadDraft();
              }}
              className="w-full sm:w-auto h-11 px-6 text-xs font-bold shadow-md shadow-primary/20"
            >
              Continue Application
            </Button>
          </div>
        </div>
      </Modal>

      {/* Desktop & Mobile Intro Stage (Step 0) */}
      {showDesktopIntro && logic.step === 0 && !showDraftModal ? (
        <>
          <KerbyDesktopIntroModal
            isOpen={true}
            userName={user?.name || "Landlord"}
            onStart={() => {
              setShowDesktopIntro(false);
              if (logic.step === 0) {
                logic.setStep(1);
                setMobileStep(1);
              }
            }}
          />
          <KerbyMascotStage
            step={0}
            userName={user?.name || "Landlord"}
            isSleepingMobile={isSleepingMobile}
            onWakeUpMobile={() => {
              setIsSleepingMobile(false);
              setShowDesktopIntro(false);
              if (logic.step === 0) {
                logic.setStep(1);
                setMobileStep(1);
              }
            }}
            showDesktopHero={false}
          />
        </>
      ) : (
        <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 md:px-8">
        {/* Wizard Header Banner (Desktop) */}
        {!logic.submitted && logic.step > 0 && (
          <div className="hidden md:block relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-3.5 sm:p-5 rounded-2xl border border-primary/10 shadow-sm mb-3.5">
            <div className="relative z-10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-lg text-primary dark:text-[#4fa89a] shrink-0">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-tight">
                    Landlord Registration
                  </h1>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                    Step {logic.step} of 8: {currentStepTitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <AutoSaveBadge 
                  saveStatus={logic.saveStatus} 
                  lastSavedTimestamp={logic.lastSavedTimestamp} 
                  lastSavedTime={logic.lastSavedTime} 
                />
                <span className="px-3 py-1.5 rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-[#4fa89a] border border-primary/20 text-sm font-black tracking-wider">
                  {progressPct}%
                </span>
                <button
                  type="button"
                  onClick={() => {
                    toast.success("Progress saved! You can resume your application anytime.");
                    if (onCloseModal) {
                      onCloseModal();
                    } else if (typeof window !== "undefined") {
                      window.location.href = "/";
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-200/70 dark:bg-slate-800/70 hover:bg-red-500/10 hover:text-red-500 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                  title="Save & Exit Application"
                >
                  <X size={14} />
                  <span className="hidden lg:inline">Save & Exit</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Draggable Stepper Pills (Desktop) */}
        {!logic.submitted && logic.step > 0 && (
          <div className="hidden md:block mb-5 w-full overflow-hidden">
            <div
              ref={stepperRef}
              className="flex items-center gap-2.5 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth py-1"
            >
              {FORM_STEPS.map((step, index) => {
                const stepNum = index + 1;
                const isActive = logic.step === stepNum;
                const isCompleted = logic.step > stepNum;
                const isLocked = stepNum > maxUnlockedStep;
                const StepIcon = step.icon;

                return (
                  <button
                    key={step.title}
                    type="button"
                    disabled={isLocked}
                    onClick={() => !isLocked && logic.setStep(stepNum)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all shrink-0 cursor-pointer select-none",
                      isActive
                        ? "bg-primary text-white shadow-lg shadow-primary/25 scale-[1.02] ring-2 ring-primary/20"
                        : isCompleted
                        ? "bg-primary/10 text-primary dark:text-[#4fa89a] border border-primary/30 hover:bg-primary/20"
                        : isLocked
                        ? "bg-gray-200/40 dark:bg-slate-800/40 text-gray-400 dark:text-gray-500 border border-transparent cursor-not-allowed opacity-50"
                        : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:border-primary/40 hover:text-primary shadow-sm"
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-transform",
                        isActive
                          ? "bg-white/20 text-white"
                          : isCompleted
                          ? "bg-primary text-white"
                          : isLocked
                          ? "bg-transparent text-gray-400 dark:text-gray-500"
                          : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      ) : isLocked ? (
                        <Lock className="w-3.5 h-3.5" />
                      ) : (
                        <StepIcon className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <span className="text-xs tracking-tight">
                      <span className="opacity-60 mr-1">{stepNum}.</span>
                      {step.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ---------------- MOBILE 1-QUESTION-AT-A-TIME FLOW (<768px) ---------------- */}
        {!logic.submitted && !isSleepingMobile && (
          <div className="md:hidden w-full min-h-[100dvh] px-5 pt-4 pb-28 flex flex-col justify-between relative overflow-hidden bg-slate-50 dark:bg-[#0b0f17]">
            {/* Ambient Background Aura Glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-primary/10 dark:bg-primary/15 blur-3xl" />
              <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-primary/10 dark:bg-primary/15 blur-3xl" />
            </div>

            {/* Top Bar Header (Clean Progress Header without Skip button) */}
            <div className="w-full mb-6 relative z-10">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20 text-primary font-black uppercase tracking-widest text-[10px]">
                    Question {mobileStep} of 17
                  </span>
                  <AutoSaveBadge 
                    saveStatus={logic.saveStatus} 
                    lastSavedTimestamp={logic.lastSavedTimestamp} 
                    lastSavedTime={logic.lastSavedTime} 
                  />
                </div>
                <span className="text-xs font-black text-slate-400 dark:text-slate-500 tracking-wider">
                  {Math.round((mobileStep / 17) * 100)}%
                </span>
              </div>
              {/* Progress Line */}
              <div className="w-full h-2.5 bg-slate-200/80 dark:bg-[#151c2c] rounded-full overflow-hidden p-0.5 shadow-inner">
                <div
                  className="h-full bg-primary transition-all duration-300 rounded-full shadow-sm"
                  style={{ width: `${(mobileStep / 17) * 100}%` }}
                />
              </div>
            </div>

            {/* Main Centered Content (Modernized Layout) */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`mobile-q-${mobileStep}`}
                initial={{ opacity: 0, y: mobileStep === 2 ? 0 : 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: mobileStep === 2 ? 0 : -15 }}
                transition={{ duration: 0.25 }}
                className={cn(
                  "w-full max-w-sm mx-auto flex flex-col items-center text-center relative z-10",
                  mobileStep === 2 ? "mt-4 mb-auto" : "my-auto"
                )}
              >
                {/* 1. Speech Bubble Centered (Intro Cloud Bubble Design) - Hidden on Step 2 for clean welcome layout */}
                {mobileStep !== 2 && (
                  <div className="w-full max-w-xs sm:max-w-sm relative mb-8 flex flex-col items-center z-20">
                    {/* Main Cloud Body */}
                    <div className="w-full bg-white/95 dark:bg-[#151c2c]/95 backdrop-blur-xl px-6 py-4 rounded-[2.4rem] border-2 border-primary/20 dark:border-primary/30 shadow-xl shadow-primary/5 text-center relative z-10">
                      <div className="flex items-center justify-center gap-1.5 mb-1.5">
                        <Sparkles size={15} className="text-primary" />
                        <span className="text-xs font-black uppercase tracking-widest text-primary">
                          Kerby Mascot Guidance
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
                        {mobileStep === 1 && <>Hi, I'm <span className="text-primary font-black">Kerby</span>. It's great to meet you!</>}
                        {mobileStep === 3 && <>How can students & admins reach you by phone?</>}
                        {mobileStep === 4 && <>What email address should we use for host notifications?</>}
                        {mobileStep === 5 && <>What is your role or ownership status?</>}
                        {mobileStep === 6 && <>Tell us the name of your accommodation!</>}
                        {mobileStep === 7 && <>What type of rental establishment is this?</>}
                        {mobileStep === 8 && <>What is your landlord experience level?</>}
                        {mobileStep === 9 && <>Pin your property location on the map!</>}
                        {mobileStep === 10 && <>Upload a clear facade photo of your building!</>}
                        {mobileStep === 11 && <>Upload your business permit or utility bill.</>}
                        {mobileStep === 12 && <>Attach your BFP Fire Safety Certificate.</>}
                        {mobileStep === 13 && <>Review TAU Community Guidelines.</>}
                        {mobileStep === 14 && <>Quick biometric face scan.</>}
                        {mobileStep === 15 && <>Upload a clear photo of your ID card.</>}
                        {mobileStep === 16 && <>Awesome job, <span className="text-primary font-black">{firstName}</span>! You completed all verification steps!</>}
                        {mobileStep === 17 && <>Review all details before submitting!</>}
                      </p>
                    </div>

                    {/* Cloud Bubble Tail */}
                    <div className="absolute -bottom-4 right-12 sm:right-16 flex flex-col items-start gap-0.5 z-0 pointer-events-none">
                      <span className="w-4 h-4 rounded-full bg-white dark:bg-[#151c2c] border-2 border-primary/20 dark:border-primary/30 shadow-sm" />
                      <span className="w-3 h-3 rounded-full bg-white dark:bg-[#151c2c] border-2 border-primary/20 dark:border-primary/30 shadow-sm -translate-x-1.5" />
                      <span className="w-2 h-2 rounded-full bg-white dark:bg-[#151c2c] border-2 border-primary/20 dark:border-primary/30 shadow-sm -translate-x-3" />
                    </div>
                  </div>
                )}

                {/* 2. Mascot Artwork & Stage (Unified Higher-Positioned Kerby + Cloud Bubble on Step 2) */}
                {mobileStep === 2 ? (
                  <div className="relative w-full h-[360px] sm:h-[400px] my-auto overflow-visible pointer-events-none">
                    {/* Kerby peeking from left edge - Positioned HIGHER UP so head aligns with speech bubble */}
                    <motion.div
                      initial={{ x: -180, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 140, damping: 16 }}
                      className="absolute -left-4 sm:-left-8 top-10 sm:top-12 w-[280px] sm:w-[320px] pointer-events-none z-20"
                    >
                      <img
                        src="/assets/mascot/kerby-mobile-right-peeking.png"
                        alt="Kerby Peeking Mascot"
                        className="w-full h-auto object-contain filter drop-shadow-2xl"
                      />
                    </motion.div>

                    {/* Cloud Speech Bubble positioned DIRECTLY at top-right of Kerby's head */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.88, x: 20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      transition={{ type: "spring", stiffness: 220, damping: 20, delay: 0.15 }}
                      className="absolute right-0 sm:right-2 top-4 sm:top-6 w-[225px] sm:w-[255px] pointer-events-auto z-30"
                    >
                      {/* Main Cloud Body matching KerbyMascot.tsx / KerbyMascotStage.tsx with generous padding */}
                      <div className="w-full bg-white dark:bg-[#151c2c] border-2 border-primary/30 dark:border-primary/40 p-4 sm:p-5 rounded-[2.2rem] shadow-2xl text-left relative z-10 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-primary">
                          <Sparkles size={14} className="shrink-0 animate-pulse text-primary" />
                          <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                            Welcome to BoardTAU
                          </span>
                        </div>

                        <h2 className="text-lg sm:text-xl font-black tracking-tight font-[family-name:var(--font-outfit)] leading-snug text-slate-900 dark:text-white">
                          It's nice to meet you,{" "}
                          <span className="text-primary font-black">
                            {firstName}
                          </span>
                          !
                        </h2>
                      </div>

                      {/* Slanted Connecting Cloud / Thought Circles (Diminishing circles pointing down-left directly onto Kerby's head) */}
                      <div className="absolute -bottom-4 left-3 flex flex-col items-start gap-1 z-0 pointer-events-none">
                        <span className="w-4 h-4 rounded-full bg-white dark:bg-[#151c2c] border-2 border-primary/30 shadow-sm" />
                        <span className="w-2.5 h-2.5 rounded-full bg-white dark:bg-[#151c2c] border border-primary/30 shadow-sm -translate-x-2" />
                        <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-[#151c2c] border border-primary/30 shadow-sm -translate-x-3.5" />
                      </div>
                    </motion.div>
                  </div>
                ) : (
                  <>
                    <div className={cn("flex flex-col items-center justify-center relative shrink-0 transition-all duration-300", mobileStep === 16 ? "mb-3" : "mb-6")}>
                      <div className={cn(
                        "relative flex items-center justify-center pointer-events-none animate-kerby-float",
                        mobileStep === 16 ? "w-64 h-64 sm:w-72 sm:h-72" : "w-56 h-56 sm:w-64 sm:h-64"
                      )}>
                        <img
                          src={
                            mobileStep === 1
                              ? "/assets/mascot/kerby-mobile-name.png"
                              : mobileStep === 3
                              ? "/assets/mascot/kerby-mobile-contact.png"
                              : mobileStep === 4
                              ? "/assets/mascot/kerby-mobile-contact.png"
                              : mobileStep === 5
                              ? "/assets/mascot/kerby-mobile-role.png"
                              : mobileStep === 6
                              ? "/assets/mascot/kerby-mobile-establishment.png"
                              : mobileStep === 7
                              ? "/assets/mascot/kerby-mobile-accommodation.png"
                              : mobileStep === 8
                              ? "/assets/mascot/kerby-mobile-experience.png"
                              : mobileStep === 9
                              ? "/assets/mascot/kerby-location-fullbody.png"
                              : mobileStep === 10
                              ? "/assets/mascot/kerby-facade-fullbody.png"
                              : mobileStep === 11
                              ? (mobileDocChoice === 'utility' ? "/assets/mascot/kerby-utility-bill-fullbody.png" : "/assets/mascot/kerby-permit-fullbody.png")
                              : mobileStep === 12
                              ? "/assets/mascot/kerby-mobile-firesafety.png"
                              : mobileStep === 13
                              ? "/assets/mascot/kerby-mobile-guidelines.png"
                              : mobileStep === 14
                              ? "/assets/mascot/kerby-mobile-selfie.png"
                              : mobileStep === 15
                              ? "/assets/mascot/kerby-mobile-idscan.png"
                              : mobileStep === 16
                              ? "/assets/mascot/kerby-halfbody-celebrate-popper.png"
                              : "/assets/mascot/kerby-mobile-review.png"
                          }
                          alt="Kerby Mascot"
                          className="w-full h-full object-contain filter drop-shadow-2xl"
                        />
                      </div>
                      <div className={cn("bg-slate-900/20 dark:bg-black/60 rounded-full blur-md -mt-3 animate-kerby-shadow", mobileStep === 16 ? "w-44 h-4.5" : "w-36 h-4 sm:w-44 sm:h-4.5")} />
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-[family-name:var(--font-outfit)] leading-tight mb-2">
                      {mobileStep === 1 && "What's your name?"}
                      {mobileStep === 3 && "What's your contact number?"}
                      {mobileStep === 4 && "What's your official email?"}
                      {mobileStep === 5 && "What is your role?"}
                      {mobileStep === 6 && "What's your establishment name?"}
                      {mobileStep === 7 && "What type of accommodation?"}
                      {mobileStep === 8 && "What's your experience level?"}
                      {mobileStep === 9 && "Where is your property located?"}
                      {mobileStep === 10 && "Facade Photo"}
                      {mobileStep === 11 && "Permit or Utility Bill"}
                      {mobileStep === 12 && "Fire Safety Certificate"}
                      {mobileStep === 13 && "Host Community Guidelines"}
                      {mobileStep === 14 && "Selfie Liveness Scan"}
                      {mobileStep === 15 && "Upload Government ID"}
                      {mobileStep === 16 && "You're All Set!"}
                      {mobileStep === 17 && "Review & Submit"}
                    </h2>
                  </>
                )}

                {/* 4. Subtitle (Removed on Step 2 as requested) */}
                <p className={cn("text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed", mobileStep === 16 ? "mb-4" : "mb-6")}>
                  {mobileStep === 1 && "Pick the name you want to see around the app."}
                  {mobileStep === 3 && "Primary contact number for urgent booking inquiries."}
                  {mobileStep === 4 && "Official email address for application updates and booking notifications."}
                  {mobileStep === 5 && "Select your legal relationship or position for this property."}
                  {mobileStep === 6 && "The boarding house or property name students will see on BoardTAU."}
                  {mobileStep === 7 && "Select the classification of your rental establishment."}
                  {mobileStep === 8 && "Select your landlord hosting experience level."}
                  {mobileStep === 9 && "Pin your exact location near TAU Campus on the live map."}
                  {mobileStep === 10 && "Must clearly show the main entrance or establishment sign."}
                  {mobileStep === 11 && "Mayor's Permit or Electric (TARELCO II) / Water Bill under your name."}
                  {mobileStep === 12 && "Required for TAU student housing safety compliance."}
                  {mobileStep === 13 && "Agreement to TAU safety, hygiene, and hosting standards."}
                  {mobileStep === 14 && "Position your face inside the oval & follow prompts."}
                  {mobileStep === 15 && "Driver's License, UMID, Passport, or National ID."}
                  {mobileStep === 16 && "Your host application details are 100% completed."}
                  {mobileStep === 17 && "Verify your complete details before sending to Admin review."}
                </p>

                {/* 5. Inputs / Choice Cards */}
                <div className="w-full">
                  {mobileStep === 1 && (
                    <div className="w-full text-left">
                      <Input
                        id="contactInfo.fullName"
                        label="Full Name"
                        type="text"
                        placeholder="e.g. Juan De La Cruz"
                        register={logic.register}
                        errors={logic.errors}
                        watch={logic.watch}
                        required={true}
                        useStaticLabel={true}
                        validationRules={{
                          required: "Full name is required",
                          validate: validateFullName,
                        }}
                        onChange={(e) => {
                          logic.setValue("contactInfo.fullName", e.target.value, { shouldValidate: true });
                        }}
                      />
                    </div>
                  )}

                  {/* Step 2 is a Clean Welcome Interstitial matching reference design */}
                  {mobileStep === 2 && null}

                  {mobileStep === 3 && (
                    <div className="w-full text-left">
                      <Input
                        id="contactInfo.phoneNumber"
                        label="Primary Contact Number"
                        type="tel"
                        placeholder="(+63) 9XX-XXXXXXX"
                        register={logic.register}
                        errors={logic.errors}
                        watch={logic.watch}
                        required={true}
                        useStaticLabel={true}
                        validationRules={{
                          required: "Contact number is required",
                          validate: validatePhoneNumber,
                        }}
                        onChange={(e) => {
                          logic.setValue("contactInfo.phoneNumber", e.target.value, { shouldValidate: true });
                        }}
                      />
                    </div>
                  )}

                  {mobileStep === 4 && (
                    <div className="w-full text-left">
                      <Input
                        id="contactInfo.email"
                        label="Official Email Address"
                        type="email"
                        placeholder="your@email.com"
                        register={logic.register}
                        errors={logic.errors}
                        watch={logic.watch}
                        required={true}
                        useStaticLabel={true}
                        validationRules={{
                          required: "Email address is required",
                          validate: validateEmail,
                        }}
                        onChange={(e) => {
                          logic.setValue("contactInfo.email", e.target.value, { shouldValidate: true });
                        }}
                      />
                    </div>
                  )}

                  {mobileStep === 5 && (
                    <div className="w-full space-y-2.5">
                      <div className="grid grid-cols-1 gap-2.5">
                        {[
                          { val: 'OWNER' as const, label: 'Property Owner (Title Holder)' },
                          { val: 'CO_OWNER_FAMILY' as const, label: 'Co-Owner / Family Representative' },
                          { val: 'AUTHORIZED_CARETAKER' as const, label: 'Authorized Manager / Caretaker' },
                          { val: 'SUBLESSOR' as const, label: 'Master Tenant / Sub-lessor' },
                        ].map((opt) => (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => {
                              logic.setValue('contactInfo.ownershipRole', opt.val, { shouldValidate: true });
                              logic.clearErrors('contactInfo.ownershipRole');
                            }}
                            className={cn(
                              "w-full text-left py-4 px-5 rounded-2xl border-2 transition-all text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-between shadow-sm cursor-pointer",
                              logic.watch('contactInfo.ownershipRole') === opt.val
                                ? "bg-primary/10 dark:bg-primary/20 text-primary border-primary ring-2 ring-primary/20 shadow-md scale-[1.01]"
                                : logic.errors?.contactInfo?.ownershipRole
                                ? "bg-white dark:bg-[#151c2c] border-red-400 dark:border-red-500/50 text-slate-700 dark:text-slate-200 hover:border-red-500 animate-shake"
                                : "bg-white dark:bg-[#151c2c] border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-primary/40"
                            )}
                          >
                            <span>{opt.label}</span>
                            {logic.watch('contactInfo.ownershipRole') === opt.val && <Check size={18} className="text-primary stroke-[3]" />}
                          </button>
                        ))}
                      </div>

                      {logic.errors?.contactInfo?.ownershipRole && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-1.5 text-red-500 font-extrabold text-xs pt-1 px-1 text-left"
                        >
                          <AlertCircle size={14} className="shrink-0 text-red-500" />
                          <span className="uppercase tracking-wide text-[11px]">
                            {logic.errors.contactInfo.ownershipRole.message || "Please select your role"}
                          </span>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {mobileStep === 6 && (
                    <div className="w-full text-left">
                      <Input
                        id="businessInfo.businessName"
                        label="Establishment Name"
                        type="text"
                        placeholder="e.g. De La Cruz Student Boarding"
                        register={logic.register}
                        errors={logic.errors}
                        watch={logic.watch}
                        required={true}
                        useStaticLabel={true}
                        validationRules={{
                          required: "Establishment name is required",
                          validate: validateBusinessName,
                        }}
                        onChange={(e) => {
                          logic.setValue("businessInfo.businessName", e.target.value, { shouldValidate: true });
                        }}
                      />
                    </div>
                  )}

                  {mobileStep === 7 && (
                    <div className="w-full space-y-2.5">
                      <div className="grid grid-cols-1 gap-2.5">
                        {[
                          { val: 'boarding-house', label: 'Boarding House' },
                          { val: 'dormitory', label: 'Dormitory' },
                          { val: 'apartment', label: 'Apartment Building' },
                          { val: 'transient-house', label: 'Transient House' },
                          { val: 'agri-hostel', label: 'Agri-Hostel (TAU University Lodge)' },
                        ].map((opt) => (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => {
                              logic.setValue('businessInfo.businessType', opt.val, { shouldValidate: true });
                              logic.clearErrors('businessInfo.businessType');
                            }}
                            className={cn(
                              "w-full text-left py-4 px-5 rounded-2xl border-2 transition-all text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-between shadow-sm cursor-pointer",
                              logic.watch('businessInfo.businessType') === opt.val
                                ? "bg-primary/10 dark:bg-primary/20 text-primary border-primary ring-2 ring-primary/20 shadow-md scale-[1.01]"
                                : logic.errors?.businessInfo?.businessType
                                ? "bg-white dark:bg-[#151c2c] border-red-400 dark:border-red-500/50 text-slate-700 dark:text-slate-200 hover:border-red-500 animate-shake"
                                : "bg-white dark:bg-[#151c2c] border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-primary/40"
                            )}
                          >
                            <span>{opt.label}</span>
                            {logic.watch('businessInfo.businessType') === opt.val && <Check size={18} className="text-primary stroke-[3]" />}
                          </button>
                        ))}
                      </div>

                      {logic.errors?.businessInfo?.businessType && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-1.5 text-red-500 font-extrabold text-xs pt-1 px-1 text-left"
                        >
                          <AlertCircle size={14} className="shrink-0 text-red-500" />
                          <span className="uppercase tracking-wide text-[11px]">
                            {logic.errors.businessInfo.businessType.message || "Please select accommodation type"}
                          </span>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {mobileStep === 8 && (
                    <div className="w-full space-y-2.5">
                      <div className="grid grid-cols-1 gap-2.5">
                        {[
                          { val: 'less-than-1', label: 'First-Time Landlord (< 1 year)' },
                          { val: '1-3-years', label: 'Experienced (1 - 3 years)' },
                          { val: '3-5-years', label: 'Established (3 - 5 years)' },
                          { val: '5-plus-years', label: 'Veteran Landlord (5+ years)' },
                        ].map((opt) => (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => {
                              logic.setValue('businessInfo.yearsExperience', opt.val, { shouldValidate: true });
                              logic.clearErrors('businessInfo.yearsExperience');
                            }}
                            className={cn(
                              "w-full text-left py-4 px-5 rounded-2xl border-2 transition-all text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-between shadow-sm cursor-pointer",
                              logic.watch('businessInfo.yearsExperience') === opt.val
                                ? "bg-primary/10 dark:bg-primary/20 text-primary border-primary ring-2 ring-primary/20 shadow-md scale-[1.01]"
                                : logic.errors?.businessInfo?.yearsExperience
                                ? "bg-white dark:bg-[#151c2c] border-red-400 dark:border-red-500/50 text-slate-700 dark:text-slate-200 hover:border-red-500 animate-shake"
                                : "bg-white dark:bg-[#151c2c] border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-primary/40"
                            )}
                          >
                            <span>{opt.label}</span>
                            {logic.watch('businessInfo.yearsExperience') === opt.val && <Check size={18} className="text-primary stroke-[3]" />}
                          </button>
                        ))}
                      </div>

                      {logic.errors?.businessInfo?.yearsExperience && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-1.5 text-red-500 font-extrabold text-xs pt-1 px-1 text-left"
                        >
                          <AlertCircle size={14} className="shrink-0 text-red-500" />
                          <span className="uppercase tracking-wide text-[11px]">
                            {logic.errors.businessInfo.yearsExperience.message || "Please select experience level"}
                          </span>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {mobileStep >= 9 && mobileStep <= 15 && (
                    <div className="w-full text-left">
                      {renderStepContent(true)}
                    </div>
                  )}

                  {mobileStep === 16 && (
                    <div className="w-full">
                      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 text-center space-y-2 shadow-lg shadow-primary/5">
                        <div className="w-10 h-10 mx-auto rounded-full bg-primary text-white flex items-center justify-center shadow-md shadow-primary/20">
                          <Check size={22} className="stroke-[3]" />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 dark:text-white text-sm sm:text-base uppercase tracking-wider">
                            Host Profile 100% Ready!
                          </h4>
                          <p className="text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed max-w-xs mx-auto opacity-90">
                            You've successfully completed all required verification steps! Let's do a final review.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {mobileStep === 17 && (
                    <div className="w-full text-left">
                      {renderStepContent(true)}
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Mobile Fixed Sticky Footer */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0b0f17]/95 backdrop-blur-xl border-t border-gray-200/80 dark:border-slate-800/80 p-4 flex items-center gap-3">
              {mobileStep > 1 && (
                <Button
                  type="button"
                  onClick={handleMobileBack}
                  outline
                  className="!w-auto min-w-[100px] px-5 py-4 rounded-2xl border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 font-extrabold text-xs shrink-0 hover:bg-gray-50 dark:hover:bg-slate-800"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <ChevronLeft size={18} />
                    <span>Back</span>
                  </div>
                </Button>
              )}

              {mobileStep === 17 ? (
                <ConfettiButton
                  onClick={logic.handleSubmit}
                  disabled={logic.isSubmitting}
                  className="flex-1 rounded-2xl py-4 bg-gradient-to-r from-primary via-[#2f7d6d] to-[#256357] hover:brightness-110 active:scale-[0.98] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/30"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>{logic.isSubmitting ? "Submitting..." : "Submit Application"}</span>
                  </div>
                </ConfettiButton>
              ) : mobileStep === 16 ? (
                <Button
                  type="button"
                  onClick={handleMobileNext}
                  className="flex-1 rounded-2xl py-4 bg-gradient-to-r from-primary via-[#2f7d6d] to-[#256357] hover:brightness-110 active:scale-[0.98] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/30"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>Review Application</span>
                    <ChevronRight size={18} />
                  </div>
                </Button>
              ) : mobileStep === 14 && !logic.capturedSelfie ? (
                <Button
                  type="button"
                  onClick={logic.handleCaptureSelfie}
                  disabled={logic.isProcessing || !logic.isEngineReady || !logic.isFaceAligned || logic.livenessStatus !== 'passed'}
                  className={cn(
                    "flex-1 rounded-2xl py-4 font-black text-xs uppercase tracking-wider shadow-lg transition-all",
                    logic.isFaceAligned && logic.livenessStatus === 'passed'
                      ? "bg-gradient-to-r from-primary via-[#2f7d6d] to-[#256357] hover:brightness-110 active:scale-[0.98] text-white shadow-primary/30 cursor-pointer"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-transparent shadow-none cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Camera size={18} />
                    <span>
                      {logic.isFaceAligned && logic.livenessStatus === 'passed'
                        ? "Capture Selfie Now"
                        : "Follow Prompt to Capture"}
                    </span>
                  </div>
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleMobileNext}
                  className="flex-1 rounded-2xl py-4 bg-gradient-to-r from-primary via-[#2f7d6d] to-[#256357] hover:brightness-110 active:scale-[0.98] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/30"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>Continue</span>
                    <ChevronRight size={18} />
                  </div>
                </Button>
              )}
            </div>
          </div>
        )}

        {/* ---------------- DESKTOP 2-COLUMN GROUPED LAYOUT (≥768px) ---------------- */}
        <div className="hidden md:grid grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Left Mascot Stage (Desktop 4 columns) */}
          {!logic.submitted && (
            <div className="col-span-4 lg:col-span-4 xl:col-span-4 min-h-[700px] lg:min-h-[740px] xl:min-h-[760px] h-full sticky top-20">
              <KerbyMascotStage
                step={logic.step}
                userName={user?.name || "Landlord"}
                isSleepingMobile={false}
                onWakeUpMobile={() => {}}
              />
            </div>
          )}

          {/* Right Main Form Container (Desktop 8 columns) */}
          <div
            className={`col-span-1 ${
              logic.submitted ? "col-span-12" : "col-span-8 lg:col-span-8 xl:col-span-8"
            } bg-white dark:bg-slate-900 rounded-[2.5rem] p-7 md:p-8 lg:p-10 border border-gray-100 dark:border-slate-800 shadow-xl relative min-h-[700px] lg:min-h-[740px] xl:min-h-[760px] flex flex-col justify-between overflow-visible`}
          >
            {/* Step Body */}
            <div className="flex-1 flex flex-col justify-start">
              {logic.isLoadingStep ? (
                <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full"
                  />
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">
                    Updating Step...
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={logic.step}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 flex flex-col justify-start"
                  >
                    {renderStepContent()}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            {/* Desktop Navigation Footer Actions */}
            {!logic.submitted && logic.step > 0 && !logic.isLoadingStep && (
              <div className={`pt-6 mt-auto border-t border-gray-100 dark:border-slate-800 flex items-center gap-4 ${logic.step > 1 ? "justify-between" : "justify-end"}`}>
                {logic.step > 1 && (
                  <Button
                    onClick={logic.prevStep}
                    disabled={logic.isSubmitting}
                    outline
                    className="!w-auto px-6 py-3.5 rounded-2xl border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-extrabold text-xs uppercase tracking-wider transition-all"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <ChevronLeft size={16} />
                      <span>Back</span>
                    </div>
                  </Button>
                )}

                {logic.step === FORM_STEPS.length ? (
                  <ConfettiButton
                    onClick={logic.handleSubmit}
                    disabled={logic.isSubmitting}
                    className="!w-auto rounded-2xl px-8 py-3.5 bg-gradient-to-r from-primary via-[#2f7d6d] to-[#256357] hover:brightness-110 active:scale-[0.98] shadow-xl shadow-primary/30 font-black text-xs text-white uppercase tracking-wider"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span>{logic.isSubmitting ? "Submitting..." : "Submit Application"}</span>
                    </div>
                  </ConfettiButton>
                ) : (
                  <Button
                    onClick={logic.nextStep}
                    disabled={logic.isSubmitting}
                    className="!w-auto rounded-2xl px-8 py-3.5 bg-gradient-to-r from-primary via-[#2f7d6d] to-[#256357] hover:brightness-110 active:scale-[0.98] shadow-xl shadow-primary/30 font-black text-xs text-white uppercase tracking-wider"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span>Continue</span>
                      <ChevronRight size={16} />
                    </div>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
  );
};

export default HostOnboardingContainer;

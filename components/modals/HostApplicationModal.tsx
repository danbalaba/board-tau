"use client";

import React from 'react';
import Modal from './Modal';
import { 
  User, 
  MapPin, 
  FileText, 
  Camera, 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft,
  X,
  BadgeCheck,
  ShieldCheck,
  Layout,
  CreditCard,
  Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../common/Button';
import { cn } from '@/utils/helper';
import Webcam from 'react-webcam';

// Hook & Utils
import { useHostApplicationLogic } from '../host-application/useHostApplicationLogic';

import dynamic from 'next/dynamic';

// Steps
import WelcomeStep from '../host-application/steps/WelcomeStep';
import LandlordInfoStep from '../host-application/steps/LandlordInfoStep';
import PropertyEvidenceStep from '../host-application/steps/PropertyEvidenceStep';
import LegalDocumentsStep from '../host-application/steps/LegalDocumentsStep';
import PrepareStep from '../host-application/steps/PrepareStep';
import ReviewStep from '../host-application/steps/ReviewStep';

// HI-3 OPTIMIZATION: Dynamically import heavy biometric steps
const SelfieStep = dynamic(() => import('../host-application/steps/SelfieStep'), {
  loading: () => <div className="h-[400px] flex flex-col items-center justify-center gap-3">
    <div className="w-10 h-10 border-2 border-primary/10 border-t-primary rounded-full animate-spin" />
    <span className="text-[10px] font-black uppercase tracking-widest text-primary/40">Loading Face Engine...</span>
  </div>
});

const IDStep = dynamic(() => import('../host-application/steps/IDStep'), {
  loading: () => <div className="h-[400px] flex flex-col items-center justify-center gap-3">
    <div className="w-10 h-10 border-2 border-primary/10 border-t-primary rounded-full animate-spin" />
    <span className="text-[10px] font-black uppercase tracking-widest text-primary/40">Loading ID Scanner...</span>
  </div>
});

interface HostApplicationModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const STEPS_CONFIG = [
  { title: "Welcome", icon: Home },
  { title: "Identity", icon: User },
  { title: "Property", icon: MapPin },
  { title: "Legal", icon: FileText },
  { title: "Prepare", icon: ShieldCheck },
  { title: "Selfie", icon: Camera },
  { title: "ID Scan", icon: CreditCard },
  { title: "Review", icon: BadgeCheck },
];

const HostApplicationModal: React.FC<HostApplicationModalProps> = ({ 
  isOpen = true, 
  onClose = () => {} 
}) => {
  const logic = useHostApplicationLogic(onClose);

  const renderStepIndicator = () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Progress</span>
        <span className="text-[10px] font-black text-primary uppercase tracking-widest">{Math.round((logic.step / (STEPS_CONFIG.length - 1)) * 100)}%</span>
      </div>
      <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-primary"
          initial={{ width: "0%" }}
          animate={{ width: `${(logic.step / (STEPS_CONFIG.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (logic.step) {
      case 0: return <WelcomeStep onNext={logic.nextStep} />;
      case 1: return <LandlordInfoStep register={logic.register} errors={logic.errors} watch={logic.watch} control={logic.control} />;
      case 2: return <PropertyEvidenceStep register={logic.register} errors={logic.errors} watch={logic.watch} setValue={logic.setValue} facadeFile={logic.facadeFile} setFacadeFile={logic.setFacadeFile} />;
      case 3: return <LegalDocumentsStep permitFile={logic.permitFile} setPermitFile={logic.setPermitFile} fireSafetyFile={logic.fireSafetyFile} setFireSafetyFile={logic.setFireSafetyFile} />;
      case 4: return <PrepareStep hasReadGuidelines={logic.hasReadGuidelines} setHasReadGuidelines={logic.setHasReadGuidelines} />;
      case 5: return <SelfieStep capturedSelfie={logic.capturedSelfie} setCapturedSelfie={logic.setCapturedSelfie} webcamRef={logic.webcamRef as React.RefObject<Webcam>} facingMode={logic.facingMode} isFaceAligned={logic.isFaceAligned} hasUserBlinked={logic.hasUserBlinked} setIsFaceAligned={logic.setIsFaceAligned} isProcessing={logic.isProcessing} isFlashActive={logic.isFlashActive} toggleCamera={() => logic.setFacingMode(prev => prev === 'user' ? 'environment' : 'user')} handleCaptureSelfie={logic.handleCaptureSelfie} />;
      case 6: return <IDStep capturedID={logic.capturedID} setCapturedID={logic.setCapturedID} webcamRef={logic.webcamRef as React.RefObject<Webcam>} facingMode={logic.facingMode} isIDAligned={logic.isIDAligned} setIsIDAligned={logic.setIsIDAligned} isProcessing={logic.isProcessing} isFlashActive={logic.isFlashActive} toggleCamera={() => logic.setFacingMode(prev => prev === 'user' ? 'environment' : 'user')} handleCaptureID={logic.handleCaptureID} isPhoneDetected={logic.isPhoneDetected} />;
      case 7: return <ReviewStep watch={logic.watch} onBack={logic.prevStep} capturedSelfie={logic.capturedSelfie} capturedID={logic.capturedID} facadeFile={logic.facadeFile} permitFile={logic.permitFile} fireSafetyFile={logic.fireSafetyFile} />;
      default: return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} width="xl" hasFixedFooter={true} closeOnOutsideClick={false}>
      <div className="h-[95vh] md:h-auto md:max-h-[90vh] overflow-hidden flex flex-col bg-white dark:bg-[#0f172a]">
        <div className="flex-1 min-h-0 flex overflow-hidden">
          {/* Sidebar */}
          {!logic.submitted && (
            <div className="w-[280px] bg-[#1e293b] hidden lg:flex flex-col shrink-0 relative overflow-hidden">
              {/* Sidebar Header */}
              <div className="p-8 pb-10">
                <h2 className="text-lg font-bold text-white tracking-tight">Host Application</h2>
              </div>
              
              <div className="flex-1 px-4 space-y-1 relative z-10">
                {STEPS_CONFIG.map((stepConfig, idx) => (
                  <motion.div 
                    key={idx} 
                    className={cn(
                      "relative p-3 rounded-xl transition-all duration-300 flex items-center gap-4 cursor-default group",
                      logic.step === idx 
                        ? "bg-emerald-500/10 text-emerald-400" 
                        : "text-gray-400 hover:text-gray-200"
                    )}
                  >
                    {/* Active Indicator Bar */}
                    {logic.step === idx && (
                      <motion.div 
                        layoutId="activeStep"
                        className="absolute left-0 w-1 h-6 bg-emerald-500 rounded-r-full"
                      />
                    )}

                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500",
                      logic.step === idx 
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                        : "bg-gray-800 text-gray-500 group-hover:bg-gray-700"
                    )}>
                      <stepConfig.icon size={16} />
                    </div>
                    
                    <span className="text-sm font-medium">{stepConfig.title}</span>
                    
                    {logic.step === idx && (
                      <motion.div 
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="ml-auto"
                      >
                        <ChevronRight size={14} className="text-emerald-500" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Sidebar Decoration */}
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col relative bg-[#f8fafc] dark:bg-[#0f172a]">
            {/* Header */}
            <div className="h-16 px-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0 bg-white dark:bg-[#0f172a] z-20">
              <div className="w-10" /> {/* Spacer */}
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest">
                {STEPS_CONFIG[logic.step]?.title || "Application"}
              </h3>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            {/* Sub Header (Step Context) */}
            {!logic.submitted && (
              <div className="px-8 py-6 bg-white dark:bg-[#1e293b]/30 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  {React.createElement(STEPS_CONFIG[logic.step]?.icon || Layout, { size: 20 })}
                </div>
                <div className="flex flex-col">
                  <h4 className="text-base font-bold text-gray-900 dark:text-white">
                    {STEPS_CONFIG[logic.step]?.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {logic.step === 0 ? "Get started with your host application" : `Step ${logic.step + 1} of ${STEPS_CONFIG.length}`}
                  </p>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-8 md:p-12 max-w-4xl mx-auto w-full min-h-full flex flex-col">
                {logic.isLoadingStep ? (
                  <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
                    <div className="relative">
                      <motion.div 
                        animate={{ rotate: 360 }} 
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="w-12 h-12 border-2 border-emerald-500/10 border-t-emerald-500 rounded-full"
                      />
                    </div>
                    <p className="mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest animate-pulse">Processing...</p>
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={logic.step}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="w-full flex-1"
                    >
                      {renderStepContent()}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </div>

            {/* Footer Navigation */}
            {!logic.submitted && logic.step > 0 && !logic.isLoadingStep && (
              <div className="p-6 px-12 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0f172a] flex justify-between items-center shrink-0 z-10">
                <Button 
                  onClick={logic.prevStep} 
                  disabled={logic.isSubmitting} 
                  outline
                  className="px-6 text-gray-500 hover:text-gray-900 dark:hover:text-white font-bold text-xs border-transparent hover:border-gray-200"
                >
                  <div className="flex items-center gap-2">
                    <ChevronLeft size={16} />
                    <span>Back</span>
                  </div>
                </Button>
                
                <Button 
                  onClick={logic.step === STEPS_CONFIG.length - 1 ? logic.handleSubmit : logic.nextStep} 
                  disabled={logic.isSubmitting}
                  className="rounded-xl px-8 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 font-bold text-xs text-white"
                >
                  <div className="flex items-center gap-2">
                    <span>{logic.isSubmitting ? "Processing..." : logic.step === STEPS_CONFIG.length - 1 ? "Submit Application" : "Continue"}</span>
                    {!logic.isSubmitting && logic.step !== STEPS_CONFIG.length - 1 && <ChevronRight size={16} />}
                  </div>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Full Screen Success Overlay */}
        <AnimatePresence>
          {logic.submitted && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950/90 flex items-center justify-center z-[100] p-4 backdrop-blur-md">
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-12 text-center max-w-md w-full shadow-2xl relative overflow-hidden border border-white/10">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-3">
                  <BadgeCheck size={40} className="text-emerald-500 -rotate-3" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Application Submitted</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">Your application is being processed. We will notify you once the verification is complete.</p>
                
                <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-4">
                  <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 2, ease: "easeInOut" }} className="h-full bg-emerald-500" />
                </div>
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Redirecting to Dashboard</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
};

export default HostApplicationModal;

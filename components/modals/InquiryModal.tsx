import React from "react";
import Modal from "./Modal";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronLeft, FaChevronRight, FaCheck, FaTimes } from "react-icons/fa";
import { Loader2, ShieldCheck, Lock, CheckCircle2 } from "lucide-react";
import SafeImage from "@/components/common/SafeImage";
import { format } from "date-fns";

// Dedicated Mascot Component
import InquiryKerbyMascot from "./inquiry-modal/InquiryKerbyMascot";

// Hook & Utils
import { useInquiryLogic } from "./inquiry-modal/useInquiryLogic";
import { getSafeImageSrcString } from "./inquiry-modal/InquiryModalUtils";
import InquiryProgressBar from "./inquiry-modal/components/InquiryProgressBar";
import InquirySubmissionLoaderModal from "./inquiry-modal/components/InquirySubmissionLoaderModal";

// Steps
import PaymentStep from "./inquiry-modal/steps/PaymentStep";
import StayStep from "./inquiry-modal/steps/StayStep";
import NoteStep from "./inquiry-modal/steps/NoteStep";
import PrepareStep from "./inquiry-modal/steps/PrepareStep";
import OTPVerifyStep from "./inquiry-modal/steps/OTPVerifyStep";
import ReviewStep from "./inquiry-modal/steps/ReviewStep";

import dynamic from "next/dynamic";

// HI-3 OPTIMIZATION: Dynamically import heavy biometric steps
const SelfieStep = dynamic(() => import("./inquiry-modal/steps/SelfieStep"), {
  loading: () => <div className="h-[400px] flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>
});

const IDStep = dynamic(() => import("./inquiry-modal/steps/IDStep"), {
  loading: () => <div className="h-[400px] flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>
});

interface Room {
  id: string;
  name: string;
  price: number;
  capacity: number;
  availableSlots: number;
  images: {
    id: string;
    url: string;
    caption?: string;
    order?: number;
  }[];
  roomType: string;
  status: string;
  reservationFee: number;
}

interface InquiryModalProps {
  listingName: string;
  listingId: string;
  landlordId: string;
  room: Room;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  activeStay?: { endDate: string; status: string; listing: { title: string } } | null;
  leaseContract?: any;
}

const InquiryModal: React.FC<InquiryModalProps> = ({
  listingName,
  listingId,
  landlordId,
  room,
  onSubmit,
  isLoading: propsLoading,
  isOpen,
  onClose,
  activeStay,
  leaseContract,
}) => {
  const logic = useInquiryLogic(listingId, landlordId, room, onSubmit, activeStay);
  const [isDetailsExpanded, setIsDetailsExpanded] = React.useState(false);
  const [showMobileKerbyModal, setShowMobileKerbyModal] = React.useState(false);

  const renderStepContent = () => {
    switch (logic.currentStep) {
      case 1: return <PaymentStep register={logic.register} errors={logic.errors} getValues={logic.getValues} />;
      case 2: return <StayStep {...logic} room={room} />;
      case 3: return <NoteStep register={logic.register} errors={logic.errors} watch={logic.watch as any} setValue={logic.setValue as any} />;
      case 4: return <PrepareStep 
                        isShowingIDList={logic.isShowingIDList} 
                        setIsShowingIDList={logic.setIsShowingIDList} 
                        selectedIDTab={logic.selectedIDTab} 
                        setSelectedIDTab={logic.setSelectedIDTab} 
                        hasReadGuidelines={logic.hasReadGuidelines}
                        setHasReadGuidelines={logic.setHasReadGuidelines}
                      />;
      case 5: return <SelfieStep {...logic} isProcessing={logic.isSelfieProcessing} isEngineReady={logic.isEngineReady} />;
      case 6: return <IDStep {...logic} isProcessing={logic.isIDProcessing} />;
      case 7: return <OTPVerifyStep 
                        register={logic.register as any} 
                        errors={logic.errors} 
                        watch={logic.watch as any} 
                        setValue={logic.setValue as any} 
                        isProcessing={logic.isProcessing} 
                        setIsProcessing={(val: any) => {(window as any)._setIsProcessing = val;}}
                        userEmail={logic.userEmail} 
                        resendCooldown={logic.resendCooldown}
                        setResendCooldown={logic.setResendCooldown}
                        otpAttemptLimitReached={logic.otpAttemptLimitReached}
                        setOtpAttemptLimitReached={logic.setOtpAttemptLimitReached}
                        lockoutCountdown={logic.lockoutCountdown}
                        setLockoutCountdown={logic.setLockoutCountdown}
                      />;
      case 8: return <ReviewStep watchedValues={logic.watchedValues} capturedSelfie={logic.capturedSelfie} capturedID={logic.capturedID} room={room} leaseContract={leaseContract} tenantSignature={logic.tenantSignature} setTenantSignature={logic.setTenantSignature} />;
      default: return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} width="full" noPadding={true} hasFixedFooter={true} closeOnOutsideClick={false} fullOnMobile={true}>
      <div className="w-full h-full md:w-[98vw] md:h-[96vh] max-w-full max-h-full mx-auto my-auto overflow-hidden flex flex-col bg-white dark:bg-gray-900 rounded-none md:rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0 z-20 bg-white dark:bg-gray-900">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-text-primary dark:text-gray-100 uppercase tracking-tight">
              {logic.submitted ? "Success" : "Send Inquiry"}
            </h2>
            {!logic.submitted && <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">{listingName}</p>}
          </div>
          <button 
            onClick={() => {
              if (!logic.isIDProcessing && !logic.isSelfieProcessing && !logic.isProcessing) {
                onClose?.();
              }
            }} 
            disabled={logic.isIDProcessing || logic.isSelfieProcessing || logic.isProcessing}
            className={`p-2 rounded-full transition-colors ${
              logic.isIDProcessing || logic.isSelfieProcessing || logic.isProcessing
                ? 'opacity-30 cursor-not-allowed text-gray-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 text-gray-500'
            }`}
          >
            <FaTimes className="text-xl text-gray-500" />
          </button>
        </div>
        
        {/* Main Content 3-Column Widescreen Layout */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
          
          {/* DESKTOP LEFT COLUMN: Full Height Dedicated Inquiry Kerby Mascot Panel */}
          <div className="hidden lg:flex flex-col justify-between w-full lg:w-[360px] xl:w-[400px] p-4 border-r border-gray-200 dark:border-gray-800 bg-slate-50/60 dark:bg-gray-900/40 shrink-0 overflow-y-auto h-full">
            <InquiryKerbyMascot
              currentStep={logic.currentStep}
              mode="desktop"
            />
          </div>

          {/* MIDDLE COLUMN: Interactive Step Wizard with Scoped Action Footer */}
          <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-900 overflow-hidden h-full">
            
            {/* Scrollable Step Content Body */}
            <div className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar">
              {/* Mobile Kerby Assistant Interactive Banner Pill */}
              <div className="block lg:hidden mb-3">
                <InquiryKerbyMascot
                  currentStep={logic.currentStep}
                  mode="mobile-pill"
                  onOpenMobileModal={() => setShowMobileKerbyModal(true)}
                />
              </div>

              {/* Mobile-Only Compact Header Strip (Expandable Room Summary) */}
              <div className="lg:hidden mb-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs overflow-hidden transition-all">
                  <button 
                    onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                    className="w-full p-2 flex items-center gap-3 text-left active:bg-gray-50 dark:active:bg-gray-700 transition-colors"
                  >
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-gray-100 dark:border-gray-700">
                           <SafeImage 
                              src={getSafeImageSrcString((room.images && room.images.length > 0) ? room.images[0].url : "/images/placeholder.jpg")} 
                              alt={room.name}
                           />
                      </div>
                      <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-black text-sm text-gray-900 dark:text-white truncate">{room.name}</h4>
                            <motion.div
                              animate={{ rotate: isDetailsExpanded ? 180 : 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <FaChevronRight size={10} className="text-gray-400 rotate-90" />
                            </motion.div>
                          </div>
                          <p className="text-primary font-black text-sm">₱ {room.price.toLocaleString()}<span className="text-[10px] font-medium text-gray-500 ml-1">/mo</span></p>
                          <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[8px] font-black tracking-widest uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded leading-none">
                                  Step {logic.currentStep} of {logic.totalSteps}
                              </span>
                          </div>
                      </div>
                  </button>

                  <AnimatePresence>
                    {isDetailsExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50"
                      >
                        <div className="p-4 space-y-3">
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-200 dark:border-gray-700">
                              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Type</p>
                              <p className="text-xs font-black">{(room as any).roomTypeDefinition?.name || room.roomType}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-200 dark:border-gray-700">
                              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Capacity</p>
                              <p className="text-xs font-black">{room.capacity}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-200 dark:border-gray-700">
                              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Left</p>
                              <p className="text-xs font-black">{room.availableSlots}</p>
                            </div>
                          </div>

                          <div className="bg-primary/5 dark:bg-primary/10 p-3 rounded-xl border border-primary/10">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Reservation Fee</span>
                              <span className="text-sm font-black text-primary">₱ {(room.reservationFee * (logic.watchedValues?.[8] ? room.capacity : (Number(logic.watchedValues?.[7]) || 1))).toLocaleString()}</span>
                            </div>
                            <p className="text-[9px] text-gray-400 font-medium italic">Calculated as ₱ {room.reservationFee.toLocaleString()} x {logic.watchedValues?.[8] ? `${room.capacity} (Full Room Buyout)` : `${logic.watchedValues?.[7] || 1} occupants`}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
              </div>

              {/* Responsive Stepper Progress Bar */}
              <InquiryProgressBar
                currentStepId={logic.currentStep}
                maxUnlockedStepId={logic.maxUnlockedStep}
                onStepClick={logic.handleStepClick}
              />
              
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={logic.currentStep}
                  initial={{ x: logic.direction > 0 ? 30 : -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: logic.direction > 0 ? -30 : 30, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Scoped Action Navigation Footer inside Middle Column */}
            <div className="p-4 bg-slate-50/90 dark:bg-gray-900/90 border-t border-gray-200 dark:border-gray-800 shrink-0 z-20 flex flex-col gap-2">
              <div className="flex justify-between items-center gap-4">
                <button
                  type="button"
                  onClick={logic.handlePrevStep}
                  disabled={logic.currentStep === 1 || logic.isIDProcessing || logic.isSelfieProcessing || logic.isProcessing}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-bold text-sm transition-all active:scale-95 flex-1 ${
                    logic.currentStep === 1 || logic.isIDProcessing || logic.isSelfieProcessing || logic.isProcessing
                      ? 'opacity-40 cursor-not-allowed bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-100 shadow-xs'
                  }`}
                >
                  <FaChevronLeft size={12} /> BACK
                </button>

                {logic.currentStep < logic.totalSteps ? (
                  <button
                    type="button"
                    onClick={logic.handleNextStep}
                    disabled={!logic.isStepCompleted(logic.currentStep) || logic.isProcessing || logic.isIDProcessing || logic.isSelfieProcessing || (logic.currentStep === 7 && logic.otpAttemptLimitReached)}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black text-sm transition-all active:scale-95 flex-1 ${
                      logic.isStepCompleted(logic.currentStep) && !logic.isProcessing && !logic.isIDProcessing && !logic.isSelfieProcessing && !(logic.currentStep === 7 && logic.otpAttemptLimitReached)
                        ? 'bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/25'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {(logic.isProcessing && logic.currentStep === 7) || logic.isIDProcessing || logic.isSelfieProcessing ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-1" /> VERIFYING...</>
                    ) : (
                      <>CONTINUE <FaChevronRight size={12} /></>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={logic.handleFormSubmit}
                    disabled={!logic.isStepCompleted(logic.currentStep) || logic.isUploading}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black text-sm transition-all active:scale-95 flex-1 ${
                      logic.isStepCompleted(logic.currentStep)
                        ? 'bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/30'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {logic.isUploading ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-1" /> UPLOADING...</>
                    ) : (
                      <>SUBMIT <FaCheck size={14} className="ml-1" /></>
                    )}
                  </button>
                )}
              </div>
              <p className="text-[9px] text-center text-gray-400 dark:text-gray-500 uppercase font-bold tracking-[0.1em]">
                Step {logic.currentStep} of {logic.totalSteps} • Secure Inquiry Processing
              </p>
            </div>
          </div>

          {/* DESKTOP RIGHT COLUMN: Full Height Detailed Room & Inquiry Summary Panel */}
          <div className="hidden lg:flex flex-col justify-between w-full lg:w-[380px] xl:w-[420px] shrink-0 p-4 border-l border-gray-200 dark:border-gray-800 bg-slate-50/60 dark:bg-gray-900/40 overflow-y-auto h-full space-y-4 custom-scrollbar">
            
            {/* Top Section: Room Card & Real-time Live Application Preview */}
            <div className="space-y-3.5">
              
              {/* Header Label */}
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Inquiry Summary
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700">
                  Real-time Preview
                </span>
              </div>

              {/* Main Room Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                
                {/* Photo Gallery Banner */}
                <div className="relative aspect-[16/9] bg-gray-100 dark:bg-gray-900">
                  <AnimatePresence initial={false}>
                    {(room.images && room.images.length > 0) ? (
                      <SafeImage
                        key={room.images[logic.currentImageIndex]?.url || logic.currentImageIndex}
                        src={getSafeImageSrcString(room.images[logic.currentImageIndex]?.url)}
                        alt={room.name}
                        priority={true}
                        unoptimized={true}
                        containerClassName="absolute inset-0 w-full h-full"
                      />
                    ) : (
                      <div className="absolute inset-0 w-full h-full flex items-center justify-center text-gray-400 font-black text-[10px] uppercase">
                        No Image Available
                      </div>
                    )}
                  </AnimatePresence>

                  {/* Listing Badge */}
                  <div className="absolute top-2.5 left-2.5 z-20">
                    <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider rounded-md border border-white/10">
                      {listingName}
                    </span>
                  </div>

                  {(room.images && room.images.length > 1) && (
                    <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 z-30 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
                      <button 
                        type="button"
                        onClick={() => logic.setCurrentImageIndex(prev => prev === 0 ? room.images.length - 1 : prev - 1)} 
                        className="text-white hover:text-primary transition-colors cursor-pointer p-0.5"
                      >
                        <FaChevronLeft size={10} />
                      </button>
                      <span className="text-[9px] font-mono font-bold text-white px-1">
                        {logic.currentImageIndex + 1} / {room.images.length}
                      </span>
                      <button 
                        type="button"
                        onClick={() => logic.setCurrentImageIndex(prev => prev === room.images.length - 1 ? 0 : prev + 1)} 
                        className="text-white hover:text-primary transition-colors cursor-pointer p-0.5"
                      >
                        <FaChevronRight size={10} />
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Card Main Info */}
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-black text-gray-900 dark:text-white leading-tight">{room.name}</h4>
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-0.5 font-mono">ROOM CODE: #{room.id.slice(-6).toUpperCase()}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-base font-black text-primary">₱ {room.price.toLocaleString()}</span>
                      <span className="text-[9px] font-medium text-gray-400 block">/ month</span>
                    </div>
                  </div>

                  {/* Room Specs Grid */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div className="bg-gray-50 dark:bg-gray-700/40 p-2 rounded-xl border border-gray-100 dark:border-gray-700 text-center">
                      <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tight">Room Style</p>
                      <p className="text-[11px] font-black text-gray-800 dark:text-gray-200 truncate mt-0.5">
                        {(room as any).roomTypeDefinition?.name || room.roomType}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/40 p-2 rounded-xl border border-gray-100 dark:border-gray-700 text-center">
                      <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tight">Capacity</p>
                      <p className="text-[11px] font-black text-gray-800 dark:text-gray-200 mt-0.5">
                        {room.capacity} Pax
                      </p>
                    </div>
                    <div className="bg-emerald-500/10 dark:bg-emerald-500/20 p-2 rounded-xl border border-emerald-500/20 text-center">
                      <p className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">Status</p>
                      <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {room.availableSlots === 0 ? 'Waitlist' : `${room.availableSlots} Left`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Application Details Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 border border-gray-200 dark:border-gray-700 space-y-3">
                <h5 className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200 pb-2 border-b border-gray-100 dark:border-gray-700">
                  Application Live Details
                </h5>

                <div className="space-y-2 text-xs">
                  {/* Payment Method */}
                  <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/30 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Payment Method</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200 text-xs">
                      {logic.watch('paymentMethod') ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-black">
                          {logic.watch('paymentMethod') === 'gcash' ? 'GCash' : logic.watch('paymentMethod') === 'maya' ? 'Maya' : logic.watch('paymentMethod') === 'stripe' ? 'Credit/Debit Card (Stripe)' : logic.watch('paymentMethod')}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic text-[11px]">Step 1 Pending</span>
                      )}
                    </span>
                  </div>

                  {/* Target Stay Dates */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Check-In Date</span>
                      <span className="font-black text-gray-900 dark:text-white text-[11px]">
                        {logic.watch('moveInDate') ? (
                          (() => {
                            const val = logic.watch('moveInDate');
                            try {
                              const parts = val.split('-');
                              if (parts.length === 3) {
                                const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                                return !isNaN(d.getTime()) ? format(d, 'MMM dd, yyyy') : val;
                              }
                              const d = new Date(val);
                              return !isNaN(d.getTime()) ? format(d, 'MMM dd, yyyy') : val;
                            } catch {
                              return val;
                            }
                          })()
                        ) : (
                          <span className="text-gray-400 italic font-normal">Step 2 Pending</span>
                        )}
                      </span>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Check-Out Date</span>
                      <span className="font-black text-gray-900 dark:text-white text-[11px]">
                        {logic.watch('checkOutDate') ? (
                          (() => {
                            const val = logic.watch('checkOutDate');
                            try {
                              const parts = val.split('-');
                              if (parts.length === 3) {
                                const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                                return !isNaN(d.getTime()) ? format(d, 'MMM dd, yyyy') : val;
                              }
                              const d = new Date(val);
                              return !isNaN(d.getTime()) ? format(d, 'MMM dd, yyyy') : val;
                            } catch {
                              return val;
                            }
                          })()
                        ) : (
                          <span className="text-gray-400 italic font-normal">Step 2 Pending</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Verification Badges */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/30 p-2 rounded-xl border border-gray-100 dark:border-gray-700">
                      <span className="text-[9px] font-bold text-gray-400 uppercase">Selfie</span>
                      {logic.capturedSelfie ? (
                        <span className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                          Verified <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-gray-400">Step 5</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/30 p-2 rounded-xl border border-gray-100 dark:border-gray-700">
                      <span className="text-[9px] font-bold text-gray-400 uppercase">ID Card</span>
                      {logic.capturedID ? (
                        <span className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                          Matched <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-gray-400">Step 6</span>
                      )}
                    </div>
                  </div>

                  {/* Reservation Fee Live Calculation */}
                  <div className="bg-primary/5 dark:bg-primary/10 p-3.5 rounded-xl border border-primary/15 mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black text-gray-700 dark:text-gray-200 uppercase tracking-wider">Total Reservation Fee</span>
                      <span className="text-base font-black text-primary">
                        ₱ {(room.reservationFee * (logic.watch('isSoloBuyout') ? room.capacity : (Number(logic.watch('occupantsCount')) || 1))).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[9px] text-gray-400 font-medium italic">
                      Calculated as ₱ {room.reservationFee.toLocaleString()} x {logic.watch('isSoloBuyout') ? `${room.capacity} (Full Room Buyout)` : `${logic.watch('occupantsCount') || 1} occupant(s)`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section: Progress Bar & Security Assurance */}
            <div className="space-y-3 pt-2">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-gray-900 dark:text-white uppercase leading-none">Inquiry Progress</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Step {logic.currentStep} of {logic.totalSteps}</p>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: logic.totalSteps }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-2.5 h-1.5 rounded-full transition-colors ${i + 1 <= logic.currentStep ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`} 
                    />
                  ))}
                </div>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-200/50 dark:border-emerald-800/30 text-center">
                <p className="text-[9px] text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Secure Inquiry Processing</span>
                </p>
                <p className="text-[8px] text-emerald-600/80 dark:text-emerald-400/70 font-medium mt-0.5">
                  Payment is held securely and only charged upon host approval.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-stage Animated Submission Loader Modal Overlay */}
        <InquirySubmissionLoaderModal
          isOpen={logic.submitted || logic.isUploading}
          progress={logic.submitted ? 100 : undefined}
        />

        {/* FLOATING MOBILE KERBY MASCOT MODAL OVERLAY */}
        <InquiryKerbyMascot
          currentStep={logic.currentStep}
          mode="mobile-popover"
          isOpenMobileModal={showMobileKerbyModal}
          onCloseMobileModal={() => setShowMobileKerbyModal(false)}
        />
      </div>
    </Modal>
  );
};

export default InquiryModal;

"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronLeft, FaChevronRight, FaCheck, FaTimes } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import SafeImage from "@/components/common/SafeImage";
import { getSafeImageSrcString } from "@/components/modals/inquiry-modal/InquiryModalUtils";
import { useWalkInModal } from "../../hooks/use-walk-in-modal";

// Import Steps
import WalkInLocationStep from "./steps/walk-in-location-step";
import WalkInGuestStep from "./steps/walk-in-guest-step";
import WalkInPaymentStep from "./steps/walk-in-payment-step";
import WalkInReviewStep from "./steps/walk-in-review-step";

// Reusing Identity Verification Steps
import SelfieStep from "@/components/modals/inquiry-modal/steps/SelfieStep";
import IDStep from "@/components/modals/inquiry-modal/steps/IDStep";

interface LandlordWalkInModalProps {
  isOpen: boolean;
  onClose: () => void;
  landlordId: string;
  listings: any[]; // Expecting listings with their rooms
  onSuccess: () => void;
}

const LandlordWalkInModal: React.FC<LandlordWalkInModalProps> = ({
  isOpen,
  onClose,
  landlordId,
  listings,
  onSuccess
}) => {
  const modal = useWalkInModal(landlordId, onSuccess, onClose);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  if (!isOpen) return null;

  // Selected Room Data for Sidebar
  const selectedListingId = modal.getValues("listingId");
  const selectedRoomId = modal.getValues("roomId");
  const listing = listings.find((l) => l.id === selectedListingId);
  const room = listing?.rooms?.find((r: any) => r.id === selectedRoomId);
  const occupantsCount = modal.getValues("occupantsCount") || 1;

  const renderStepIndicator = () => (
    <div className="relative mb-6 md:mb-8 bg-white dark:bg-gray-800/40 p-4 md:p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50 overflow-hidden">
      <div className="absolute top-8 md:top-9 left-[10%] right-[10%] h-[1.5px] bg-gray-100 dark:bg-gray-700 -z-0" />
      <div 
        className="absolute top-8 md:top-9 left-[10%] h-[1.5px] bg-primary transition-all duration-700 ease-in-out -z-0" 
        style={{ width: `${((modal.currentStep - 1) / (modal.totalSteps - 1)) * 80}%` }}
      />
      
      <div className="flex justify-between items-center relative z-10">
        {[1, 2, 3, 4, 5, 6].map((step) => (
          <div key={step} className="flex flex-col items-center gap-2 md:gap-2.5">
            <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold transition-all duration-500 transform ${
              modal.currentStep === step 
                ? "bg-primary text-white scale-110 shadow-md shadow-primary/20 ring-2 ring-primary/10" 
                : modal.currentStep > step
                ? "bg-primary text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-400"
            }`}>
              {modal.currentStep > step ? <FaCheck size={10} className="md:w-[12px]" /> : step}
            </div>
            <span className={`text-[8px] md:text-[9px] font-bold uppercase tracking-widest hidden md:block transition-colors duration-300 ${
              modal.currentStep === step ? "text-primary" : modal.currentStep > step ? "text-primary/60" : "text-gray-400"
            }`}>
              {step === 1 ? "Room" : step === 2 ? "Guest" : step === 3 ? "Selfie" : step === 4 ? "ID" : step === 5 ? "Stay" : "Review"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (modal.currentStep) {
      case 1:
        return (
          <WalkInLocationStep
            listings={listings}
            register={modal.register}
            errors={modal.errors}
            setValue={modal.setValue}
            watch={modal.watch}
          />
        );
      case 2:
        return (
          <WalkInGuestStep
            register={modal.register}
            errors={modal.errors}
          />
        );
      case 3:
        return (
          <SelfieStep
            capturedSelfie={modal.capturedSelfie}
            setCapturedSelfie={modal.setCapturedSelfie}
            webcamRef={modal.webcamRef}
            facingMode={modal.facingMode}
            isFaceAligned={modal.isFaceAligned}
            hasUserBlinked={modal.hasUserBlinked}
            setIsFaceAligned={modal.setIsFaceAligned}
            isProcessing={modal.isProcessing}
            isFlashActive={modal.isFlashActive}
            toggleCamera={modal.toggleCamera}
            handleCaptureSelfie={modal.handleCaptureSelfie}
          />
        );
      case 4:
        return (
          <IDStep
            capturedID={modal.capturedID}
            setCapturedID={modal.setCapturedID}
            webcamRef={modal.webcamRef}
            facingMode={modal.facingMode}
            isIDAligned={modal.isIDAligned}
            isPhoneDetected={modal.isPhoneDetected}
            setIsIDAligned={modal.setIsIDAligned}
            setIsPhoneDetected={modal.setIsPhoneDetected}
            isProcessing={modal.isProcessing}
            toggleCamera={modal.toggleCamera}
            handleCaptureID={modal.handleCaptureID}
          />
        );
      case 5:
        return (
          <WalkInPaymentStep
            setValue={modal.setValue}
            watch={modal.watch}
            getValues={modal.getValues}
            errors={modal.errors}
            listings={listings}
            dateRange={modal.dateRange}
            setDateRange={modal.setDateRange}
            showCalendar={modal.showCalendar}
            setShowCalendar={modal.setShowCalendar}
          />
        );
      case 6:
        return (
          <WalkInReviewStep 
             getValues={modal.getValues}
             capturedSelfie={modal.capturedSelfie}
             capturedID={modal.capturedID}
             listings={listings}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-6xl h-[95vh] md:h-[90vh] bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0 z-20 bg-white dark:bg-gray-900">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-text-primary dark:text-gray-100 uppercase tracking-tight">
              {modal.submitted ? "Success" : "Create Walk-In Record"}
            </h2>
            {!modal.submitted && <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Physical Payment Registration</p>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors active:scale-95">
            <FaTimes className="text-xl text-gray-500" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="overflow-y-auto flex-1 min-h-0 custom-scrollbar">
          <div className="p-4 md:p-6 pb-24 md:pb-6">
            
            {/* Mobile-Only Compact Header Strip (Expandable) */}
            {room && (
              <div className="lg:hidden mb-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-all">
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
                          <p className="text-primary font-black text-sm">₱ {room.price?.toLocaleString()}<span className="text-[10px] font-medium text-gray-500 ml-1">/mo</span></p>
                          <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[8px] font-black tracking-widest uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded leading-none">
                                  Step {modal.currentStep} of {modal.totalSteps}
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
                              <p className="text-xs font-black">{room.roomType}</p>
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
                              <span className="text-sm font-black text-primary">₱ {((room.reservationFee || 0) * occupantsCount).toLocaleString()}</span>
                            </div>
                            <p className="text-[9px] text-gray-400 font-medium italic">Calculated as ₱ {room.reservationFee?.toLocaleString()} x {occupantsCount} occupants</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 order-2 lg:order-1">
                {renderStepIndicator()}
                
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={modal.currentStep}
                    initial={{ x: modal.direction > 0 ? 30 : -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: modal.direction > 0 ? -30 : 30, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    {renderStepContent()}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Desktop Sidebar Summary (Hidden on small screens) */}
              <div className="lg:col-span-1 order-1 lg:order-2 hidden lg:block">
                <div className="lg:sticky lg:top-4 space-y-4">
                  {room ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                      <div className="relative aspect-[16/10] bg-gray-100 dark:bg-gray-900">
                          <AnimatePresence initial={false}>
                            {(room.images && room.images.length > 0) ? (
                             <SafeImage
                                key={room.images[modal.currentImageIndex].url}
                                src={getSafeImageSrcString(room.images[modal.currentImageIndex].url)}
                                alt={room.name}
                                priority={true}
                                unoptimized={true}
                                containerClassName="absolute inset-0 w-full h-full"
                             />
                            ) : (
                              <div className="absolute inset-0 w-full h-full flex items-center justify-center text-gray-400 font-black text-[10px] uppercase">No Image</div>
                            )}
                          </AnimatePresence>
                          
                          {(room.images && room.images.length > 1) && (
                            <div className="absolute bottom-3 right-3 flex gap-2 z-30">
                               <button onClick={() => modal.setCurrentImageIndex(prev => prev === 0 ? room.images.length - 1 : prev - 1)} className="bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full pointer-events-auto transition-all shadow-lg backdrop-blur-sm active:scale-90"><FaChevronLeft size={12} /></button>
                               <button onClick={() => modal.setCurrentImageIndex(prev => prev === room.images.length - 1 ? 0 : prev + 1)} className="bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full pointer-events-auto transition-all shadow-lg backdrop-blur-sm active:scale-90"><FaChevronRight size={12} /></button>
                            </div>
                          )}
                      </div>
                      
                      <div className="p-5">
                          <div className="flex items-center gap-2 mb-3">
                              <span className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest rounded">Walk-In Detail</span>
                              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 text-[8px] font-black uppercase tracking-widest rounded font-mono">#{room.price?.toLocaleString()}</span>
                          </div>
                          
                          <h4 className="text-xl font-black text-gray-900 dark:text-white mb-4">{room.name}</h4>
                          
                          <div className="space-y-3">
                              <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/30 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700">
                                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pricing</span>
                                  <span className="text-sm font-black text-primary">₱ {room.price?.toLocaleString()}<span className="text-[9px] text-gray-400 ml-1">/ mo</span></span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                  <div className="bg-gray-50 dark:bg-gray-700/30 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700 text-center">
                                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mb-0.5">Type</p>
                                      <p className="text-xs font-black truncate">{room.roomType}</p>
                                  </div>
                                  <div className="bg-gray-50 dark:bg-gray-700/30 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700 text-center">
                                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mb-0.5">Capacity</p>
                                      <p className="text-xs font-black">{room.capacity}</p>
                                  </div>
                              </div>
                              <div className="bg-emerald-500/5 dark:bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/10 text-center">
                                  <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-0.5">Availability</p>
                                  <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase">{room.availableSlots === 0 ? 'Waitlist' : `${room.availableSlots} SLOTS LEFT`}</p>
                              </div>
  
                              <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-xl border border-primary/10 mt-4">
                                  <div className="flex justify-between items-center mb-1">
                                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Reservation Fee</span>
                                      <span className="text-sm font-black text-primary">₱ {((room.reservationFee || 0) * occupantsCount).toLocaleString()}</span>
                                  </div>
                                  <p className="text-[9px] text-gray-400 font-medium italic">Calculated as ₱ {room.reservationFee?.toLocaleString()} x {occupantsCount} occupants</p>
                              </div>
                          </div>
  
                          <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                              <div>
                                  <p className="text-[10px] font-black text-gray-900 dark:text-white uppercase leading-none">Step Progress</p>
                                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">{modal.currentStep} of {modal.totalSteps}</p>
                              </div>
                              <div className="flex gap-1">
                                  {Array.from({ length: modal.totalSteps }).map((_, i) => (
                                      <div key={i} className={`w-2.5 h-1 rounded-full ${i + 1 <= modal.currentStep ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`} />
                                  ))}
                              </div>
                          </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 h-full min-h-[400px] flex items-center justify-center p-6 text-center">
                       <div>
                         <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                           <FaCheck className="text-gray-300 dark:text-gray-600" size={24} />
                         </div>
                         <h4 className="text-gray-900 dark:text-gray-100 font-bold mb-2">No Room Selected</h4>
                         <p className="text-xs text-gray-500">Please select a listing and room on Step 1 to preview its details here.</p>
                       </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer Navigation */}
        <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shrink-0 z-20 flex flex-col gap-3">
          <div className="flex justify-between items-center gap-4">
            <button
              type="button"
              onClick={modal.handlePrevStep}
              disabled={modal.currentStep === 1}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-bold text-sm transition-all active:scale-95 flex-1 ${
                modal.currentStep === 1
                  ? 'opacity-40 cursor-not-allowed bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-100 shadow-sm'
              }`}
            >
              <FaChevronLeft size={12} /> BACK
            </button>

            {modal.currentStep < modal.totalSteps ? (
              <button
                type="button"
                onClick={modal.handleNextStep}
                disabled={!modal.isStepCompleted(modal.currentStep)}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black text-sm transition-all active:scale-95 flex-1 ${
                  modal.isStepCompleted(modal.currentStep)
                    ? 'bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/25'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                CONTINUE <FaChevronRight size={12} />
              </button>
            ) : (
              <button
                type="button"
                onClick={modal.handleFormSubmit}
                disabled={!modal.isStepCompleted(modal.currentStep) || modal.isUploading}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black text-sm transition-all active:scale-95 flex-1 ${
                  modal.isStepCompleted(modal.currentStep)
                    ? 'bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/30'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {modal.isUploading ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-1" /> UPLOADING...</>
                ) : (
                  <>CONFIRM WALK-IN <FaCheck size={14} className="ml-1" /></>
                )}
              </button>
            )}
          </div>
          <p className="text-[9px] text-center text-gray-400 dark:text-gray-500 uppercase font-bold tracking-[0.1em]">
            Step {modal.currentStep} of {modal.totalSteps} • Walk-In Registration
          </p>
        </div>

        {/* Full Screen Success Overlay */}
        <AnimatePresence>
          {modal.submitted && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-3xl p-8 text-center max-w-md w-full shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaCheck size={40} className="text-primary" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">WALK-IN CREATED!</h3>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-6 uppercase tracking-wide">The reservation was successfully recorded.</p>
                
                <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                  <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1.5, ease: "easeOut" }} className="h-full bg-primary" />
                </div>
                <span className="text-[10px] font-black text-primary opacity-60 tracking-[0.2em] uppercase">Processing...</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default LandlordWalkInModal;

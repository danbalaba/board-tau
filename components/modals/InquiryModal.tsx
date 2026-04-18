"use client";

import React from "react";
import Modal from "./Modal";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronLeft, FaChevronRight, FaCheck, FaTimes, FaCreditCard } from "react-icons/fa";
import { Loader2 } from "lucide-react";

// Hook & Utils
import { useInquiryLogic } from "./inquiry-modal/useInquiryLogic";
import { getSafeImageSrcString } from "./inquiry-modal/InquiryModalUtils";

// Steps
import PaymentStep from "./inquiry-modal/steps/PaymentStep";
import StayStep from "./inquiry-modal/steps/StayStep";
import NoteStep from "./inquiry-modal/steps/NoteStep";
import PrepareStep from "./inquiry-modal/steps/PrepareStep";
import SelfieStep from "./inquiry-modal/steps/SelfieStep";
import IDStep from "./inquiry-modal/steps/IDStep";
import ReviewStep from "./inquiry-modal/steps/ReviewStep";

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
  room: Room;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const InquiryModal: React.FC<InquiryModalProps> = ({
  listingName,
  listingId,
  room,
  onSubmit,
  isLoading: propsLoading,
  isOpen,
  onClose,
}) => {
  const logic = useInquiryLogic(listingId, room, onSubmit);

  const renderStepIndicator = () => (
    <div className="relative mb-8 bg-white dark:bg-gray-800/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50 overflow-hidden">
      <div className="absolute top-9 left-[10%] right-[10%] h-[1.5px] bg-gray-100 dark:bg-gray-700 -z-0" />
      <div 
        className="absolute top-9 left-[10%] h-[1.5px] bg-primary transition-all duration-700 ease-in-out -z-0" 
        style={{ width: `${((logic.currentStep - 1) / (logic.totalSteps - 1)) * 80}%` }}
      />
      
      <div className="flex justify-between items-center relative z-10">
        {[1, 2, 3, 4, 5, 6, 7].map((step) => (
          <div key={step} className="flex flex-col items-center gap-2.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 transform ${
              logic.currentStep === step 
                ? "bg-primary text-white scale-110 shadow-md shadow-primary/20 ring-2 ring-primary/10" 
                : logic.currentStep > step
                ? "bg-primary text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-400"
            }`}>
              {logic.currentStep > step ? <FaCheck size={12} /> : step}
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-widest hidden md:block transition-colors duration-300 ${
              logic.currentStep === step ? "text-primary" : logic.currentStep > step ? "text-primary/60" : "text-gray-400"
            }`}>
              {step === 1 ? "Pay" : step === 2 ? "Stay" : step === 3 ? "Note" : step === 4 ? "Prepare" : step === 5 ? "Selfie" : step === 6 ? "ID" : "Review"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (logic.currentStep) {
      case 1: return <PaymentStep register={logic.register} errors={logic.errors} getValues={logic.getValues} />;
      case 2: return <StayStep {...logic} room={room} />;
      case 3: return <NoteStep register={logic.register} errors={logic.errors} />;
      case 4: return <PrepareStep isShowingIDList={logic.isShowingIDList} setIsShowingIDList={logic.setIsShowingIDList} selectedIDTab={logic.selectedIDTab} setSelectedIDTab={logic.setSelectedIDTab} />;
      case 5: return <SelfieStep {...logic} isProcessing={logic.isProcessing} />;
      case 6: return <IDStep {...logic} isProcessing={logic.isProcessing} />;
      case 7: return <ReviewStep watchedValues={logic.watchedValues} capturedSelfie={logic.capturedSelfie} capturedID={logic.capturedID} room={room} />;
      default: return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} width="xl" hasFixedFooter={true}>
      <div className="max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-text-primary dark:text-gray-100">
            {logic.submitted ? "Inquiry Sent!" : "Send Inquiry"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <FaTimes className="text-xl text-gray-500" />
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {renderStepIndicator()}
                
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={logic.currentStep}
                    initial={{ x: logic.direction > 0 ? 50 : -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: logic.direction > 0 ? -50 : 50, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    {renderStepContent()}
                  </motion.div>
                </AnimatePresence>

                <div className="flex justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={logic.handlePrevStep}
                    disabled={logic.currentStep === 1}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      logic.currentStep === 1
                        ? 'opacity-50 cursor-not-allowed text-gray-400 border-gray-200 dark:border-gray-700'
                        : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-text-primary dark:text-gray-100'
                    }`}
                  >
                    <FaChevronLeft size={14} /> Previous
                  </button>

                  {logic.currentStep < logic.totalSteps ? (
                    <button
                      type="button"
                      onClick={logic.handleNextStep}
                      disabled={!logic.isStepCompleted(logic.currentStep)}
                      className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                        logic.isStepCompleted(logic.currentStep)
                          ? 'bg-primary hover:bg-primary-dark text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Next <FaChevronRight size={14} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={logic.handleFormSubmit}
                      disabled={!logic.isStepCompleted(logic.currentStep) || logic.isUploading}
                      className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                        logic.isStepCompleted(logic.currentStep)
                          ? 'bg-primary hover:bg-primary-dark text-white shadow-md'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {logic.isUploading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Uploading Docs...</>
                      ) : (
                        <>Send Inquiry <FaCheck size={14} /></>
                      )}
                    </button>
                  )}
                </div>
                <p className="text-xs text-center text-gray-500 mt-4">
                  By sending this inquiry, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="relative">
                      <div className="aspect-[4/3] w-full overflow-hidden relative bg-gray-100 dark:bg-gray-900">
                        <AnimatePresence mode="wait">
                          {(room.images && room.images.length > 0) ? (
                            <motion.img
                              key={(room.images && room.images.length > 0) ? room.images[logic.currentImageIndex].url : "placeholder"}
                              initial={{ opacity: 0, scale: 1.1 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.4, ease: "easeInOut" }}
                              src={getSafeImageSrcString((room.images && room.images.length > 0) ? room.images[logic.currentImageIndex].url : "/images/placeholder.jpg")}
                              alt={room.name}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-gray-400">No image available</span>
                            </div>
                          )}
                        </AnimatePresence>
                      </div>
                      {(room.images && room.images.length > 1) && (
                        <>
                          <button onClick={() => logic.setCurrentImageIndex(prev => prev === 0 ? room.images.length - 1 : prev - 1)} className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"><FaChevronLeft size={16} /></button>
                          <button onClick={() => logic.setCurrentImageIndex(prev => prev === room.images.length - 1 ? 0 : prev + 1)} className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"><FaChevronRight size={16} /></button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-lg font-bold text-text-primary dark:text-gray-100 mb-2">{room.name}</h4>
                    <div className="space-y-1 mb-3">
                      <p className="text-2xl font-bold text-primary dark:text-primary-light">₱ {room.price.toLocaleString()}<span className="text-sm font-medium text-gray-500 ml-1">/mo</span></p>
                      <div className="flex flex-col gap-1 text-xs text-primary font-semibold bg-primary/10 dark:bg-primary/20 px-3 py-2 rounded-lg w-fit border border-primary/20">
                        <div className="flex items-center gap-2"><FaCreditCard size={12} /><span className="text-sm">₱ {(room.reservationFee * (logic.getValues('occupantsCount') || 1)).toLocaleString()} Total Reservation Fee</span></div>
                        <span className="text-[10px] opacity-70 ml-5 font-normal">₱ {room.reservationFee.toLocaleString()} x {logic.getValues('occupantsCount') || 1} occupants</span>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-text-secondary dark:text-gray-400">
                      <p><span className="font-medium">Room Type:</span> {room.roomType}</p>
                      <p><span className="font-medium">Capacity:</span> {room.capacity}</p>
                      <p><span className="font-medium">Available:</span> {room.availableSlots}</p>
                    </div>
                  </div>

                  <div className="mt-4 bg-primary/5 dark:bg-primary/10 rounded-xl p-4 border border-primary/20 dark:border-primary/30">
                    <h5 className="font-semibold text-primary dark:text-primary-light mb-2">Summary</h5>
                    <div className="space-y-1 text-sm text-text-secondary dark:text-gray-400">
                      <p>Step {logic.currentStep} of {logic.totalSteps}</p>
                      {logic.getValues('paymentMethod') && <p>Pay: {logic.getValues('paymentMethod')}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {logic.submitted && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center max-w-md w-full shadow-2xl">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"><FaCheck size={40} className="text-primary" /></div>
                    <h3 className="text-2xl font-bold mb-2">Inquiry Sent!</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Wait for host approval.</p>
                    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1.5 }} className="h-full bg-primary" />
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default InquiryModal;

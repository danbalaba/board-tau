"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronLeft, FaChevronRight, FaCheck, FaTimes } from "react-icons/fa";
import { Loader2, ShieldCheck, Building2, CheckCircle2 } from "lucide-react";
import SafeImage from "@/components/common/SafeImage";
import Modal from "@/components/modals/Modal";
import { format } from "date-fns";
import { getSafeImageSrcString } from "@/components/modals/inquiry-modal/InquiryModalUtils";
import { useWalkInModal } from "../../hooks/use-walk-in-modal";

import WalkInProgressBar from "./components/WalkInProgressBar";
import WalkInSubmissionLoaderModal from "./components/WalkInSubmissionLoaderModal";

// Steps
import WalkInLocationStep from "./steps/walk-in-location-step";
import WalkInGuestStep from "./steps/walk-in-guest-step";
import WalkInPaymentStep from "./steps/walk-in-payment-step";
import WalkInReviewStep from "./steps/walk-in-review-step";

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

  // Selected Room & Listing Data for Sidebar & Mobile Header
  const selectedListingId = modal.watch("listingId");
  const selectedRoomId = modal.watch("roomId");
  const listing = listings.find((l) => l.id === selectedListingId);
  const room = listing?.rooms?.find((r: any) => r.id === selectedRoomId);
  const occupantsCount = modal.watch("occupantsCount") || 1;
  const isSoloBuyout = modal.watch("isSoloBuyout");
  const paymentType = modal.watch("paymentType") || 'DIRECT_RENT';
  const securityDeposit = Number(modal.watch("securityDeposit")) || 0;
  const isFlatRate = Boolean(room?.roomTypeDefinition?.isFlatRate);

  const calculatedLiveTotal = React.useMemo(() => {
    if (!room) return 0;
    if (paymentType === 'DIRECT_RENT') {
      const roomPrice = room.price || 0;
      const baseRent = isFlatRate 
        ? roomPrice 
        : roomPrice * (isSoloBuyout ? (room.capacity || 1) : occupantsCount);
      return baseRent + securityDeposit;
    } else {
      const reservationFee = room.reservationFee || 0;
      const baseFee = isFlatRate 
        ? reservationFee 
        : reservationFee * (isSoloBuyout ? (room.capacity || 1) : occupantsCount);
      return baseFee;
    }
  }, [room, paymentType, isFlatRate, isSoloBuyout, occupantsCount, securityDeposit]);

  useEffect(() => {
    if (!isOpen) {
      modal.resetState();
    }
  }, [isOpen]);

  useEffect(() => {
    if (room && isOpen) {
      modal.setValue("totalPrice", calculatedLiveTotal, { shouldValidate: true });
    }
  }, [room?.id, calculatedLiveTotal, isOpen]);

  if (!isOpen) return null;

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
      case 4:
        return (
          <WalkInReviewStep 
             getValues={modal.getValues}
             listings={listings}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} width="full" noPadding={true} hasFixedFooter={true} closeOnOutsideClick={false} fullOnMobile={true}>
      <div className="w-full h-full md:w-[98vw] md:h-[96vh] max-w-full max-h-full mx-auto my-auto overflow-hidden flex flex-col bg-white dark:bg-gray-900 rounded-none md:rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0 z-20 bg-white dark:bg-gray-900">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-text-primary dark:text-gray-100 uppercase tracking-tight">
              {modal.submitted ? "Success" : "Create Walk-In Record"}
            </h2>
            {!modal.submitted && (
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                Physical Payment & Check-In Registration
              </p>
            )}
          </div>
          <button 
            onClick={onClose} 
            disabled={modal.isUploading}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors active:scale-95 text-gray-500"
          >
            <FaTimes className="text-xl text-gray-500" />
          </button>
        </div>

        {/* Main Content Layout */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
          
          {/* MIDDLE COLUMN: Interactive Step Wizard */}
          <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-900 overflow-hidden h-full">
            
            {/* Scrollable Step Content Body */}
            <div className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar">
              
              {/* Mobile-Only Compact Header Strip (Expandable Room Summary) */}
              {room && (
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
                              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Style</p>
                              <p className="text-xs font-black truncate">{room.roomTypeDefinition?.name || room.roomType || room.type || "Standard"}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-200 dark:border-gray-700">
                              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Capacity</p>
                              <p className="text-xs font-black">{room.capacity} Pax</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-200 dark:border-gray-700">
                              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Left</p>
                              <p className="text-xs font-black">{room.availableSlots}</p>
                            </div>
                          </div>

                          <div className="bg-primary/5 dark:bg-primary/10 p-3 rounded-xl border border-primary/10">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                {paymentType === 'DIRECT_RENT' ? "Total Move-In Payment" : "Total Reservation Fee"}
                              </span>
                              <span className="text-sm font-black text-primary">
                                ₱ {calculatedLiveTotal.toLocaleString()}
                              </span>
                            </div>
                            <p className="text-[9px] text-gray-400 font-medium italic">
                              {!room
                                ? "Pending room selection"
                                : paymentType === 'DIRECT_RENT'
                                ? (isFlatRate
                                    ? "1st Month Rent (Flat Unit Rate)"
                                    : isSoloBuyout
                                    ? `₱ ${(room?.price || 0).toLocaleString()} x ${room?.capacity || 1} beds (Full Buyout)`
                                    : `₱ ${(room?.price || 0).toLocaleString()} x ${occupantsCount} occupant(s)`) + (securityDeposit > 0 ? ` + ₱${securityDeposit.toLocaleString()} deposit` : "")
                                : (isFlatRate
                                    ? "Flat Reservation Fee"
                                    : isSoloBuyout
                                    ? `₱ ${(room?.reservationFee || 0).toLocaleString()} x ${room?.capacity || 1} beds (Full Buyout)`
                                    : `₱ ${(room?.reservationFee || 0).toLocaleString()} x ${occupantsCount} occupant(s)`)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Walk-In Progress Bar */}
              <WalkInProgressBar
                currentStepId={modal.currentStep}
                maxUnlockedStepId={modal.maxUnlockedStep}
                onStepClick={modal.handleStepClick}
              />

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

            {/* Scoped Action Navigation Footer */}
            <div className="p-4 bg-slate-50/90 dark:bg-gray-900/90 border-t border-gray-200 dark:border-gray-800 shrink-0 z-20 flex flex-col gap-2">
              <div className="flex justify-between items-center gap-4">
                <button
                  type="button"
                  onClick={modal.handlePrevStep}
                  disabled={modal.currentStep === 1 || modal.isUploading}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-bold text-sm transition-all active:scale-95 flex-1 ${
                    modal.currentStep === 1 || modal.isUploading
                      ? 'opacity-40 cursor-not-allowed bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-100 shadow-xs cursor-pointer'
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
                        ? 'bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/25 cursor-pointer'
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
                        ? 'bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/30 cursor-pointer'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {modal.isUploading ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-1" /> RECORDING...</>
                    ) : (
                      <>CONFIRM WALK-IN <FaCheck size={14} className="ml-1" /></>
                    )}
                  </button>
                )}
              </div>
              <p className="text-[9px] text-center text-gray-400 dark:text-gray-500 uppercase font-bold tracking-[0.1em]">
                Step {modal.currentStep} of {modal.totalSteps} • Walk-In Physical Registration
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: Full Height Detailed Room & Walk-In Summary Panel (Desktop) */}
          <div className="hidden lg:flex flex-col justify-between w-full lg:w-[380px] xl:w-[420px] shrink-0 p-4 border-l border-gray-200 dark:border-gray-800 bg-slate-50/60 dark:bg-gray-900/40 overflow-y-auto h-full space-y-4 custom-scrollbar">
            
            {/* Top Section */}
            <div className="space-y-3.5">
              
              {/* Header Label */}
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Walk-In Live Summary
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700">
                  Real-time Preview
                </span>
              </div>

              {room ? (
                /* Main Room Card */
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  
                  {/* Photo Gallery Banner */}
                  <div className="relative aspect-[16/9] bg-gray-100 dark:bg-gray-900">
                    <AnimatePresence initial={false}>
                      {(room.images && room.images.length > 0) ? (
                        <SafeImage
                          key={room.images[modal.currentImageIndex]?.url || modal.currentImageIndex}
                          src={getSafeImageSrcString(room.images[modal.currentImageIndex]?.url)}
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
                        {listing?.title || "Property"}
                      </span>
                    </div>

                    {(room.images && room.images.length > 1) && (
                      <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 z-30 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
                        <button 
                          type="button"
                          onClick={() => modal.setCurrentImageIndex((prev: number) => prev === 0 ? room.images.length - 1 : prev - 1)} 
                          className="text-white hover:text-primary transition-colors cursor-pointer p-0.5"
                        >
                          <FaChevronLeft size={10} />
                        </button>
                        <span className="text-[9px] font-mono font-bold text-white px-1">
                          {modal.currentImageIndex + 1} / {room.images.length}
                        </span>
                        <button 
                          type="button"
                          onClick={() => modal.setCurrentImageIndex((prev: number) => prev === room.images.length - 1 ? 0 : prev + 1)} 
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
                        <span className="text-base font-black text-primary">₱ {room.price?.toLocaleString()}</span>
                        <span className="text-[9px] font-medium text-gray-400 block">/ month</span>
                      </div>
                    </div>

                    {/* Room Specs Grid */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <div className="bg-gray-50 dark:bg-gray-700/40 p-2 rounded-xl border border-gray-100 dark:border-gray-700 text-center">
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tight">Style</p>
                        <p className="text-[11px] font-black text-gray-800 dark:text-gray-200 truncate mt-0.5">
                          {room.roomTypeDefinition?.name || room.roomType || room.type || "Standard"}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/40 p-2 rounded-xl border border-gray-100 dark:border-gray-700 text-center">
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tight">Capacity</p>
                        <p className="text-[11px] font-black text-gray-800 dark:text-gray-200 mt-0.5">
                          {room.capacity} Pax
                        </p>
                      </div>
                      <div className="bg-primary/10 p-2 rounded-xl border border-primary/20 text-center">
                        <p className="text-[8px] font-bold text-primary uppercase tracking-tight">Availability</p>
                        <p className="text-[11px] font-black text-primary mt-0.5">
                          {room.availableSlots === 0 ? 'Waitlist' : `${room.availableSlots} Left`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 h-[220px] flex items-center justify-center p-6 text-center">
                  <div>
                    <div className="w-12 h-12 bg-primary/10 rounded-full mx-auto mb-3 flex items-center justify-center text-primary">
                      <Building2 size={20} />
                    </div>
                    <h4 className="text-gray-900 dark:text-gray-100 font-extrabold text-sm mb-1">No Room Selected</h4>
                    <p className="text-xs text-gray-400">Select a property listing and room on Step 1 to preview details here.</p>
                  </div>
                </div>
              )}

              {/* Live Record Details Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 border border-gray-200 dark:border-gray-700 space-y-3">
                <h5 className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200 pb-2 border-b border-gray-100 dark:border-gray-700">
                  Walk-In Record Details
                </h5>

                <div className="space-y-2 text-xs">
                  {/* Guest Name */}
                  <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/30 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Primary Guest</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200 text-xs">
                      {modal.watch("guestName") ? (
                        <span className="text-gray-900 dark:text-white font-black">{modal.watch("guestName")}</span>
                      ) : (
                        <span className="text-gray-400 italic text-[11px]">Step 2 Pending</span>
                      )}
                    </span>
                  </div>

                  {/* Target Stay Dates */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Check-In Date</span>
                      <span className="font-black text-gray-900 dark:text-white text-[11px]">
                        {modal.watch('moveInDate') ? (
                          format(new Date(modal.watch('moveInDate')), 'MMM dd, yyyy')
                        ) : (
                          <span className="text-gray-400 italic font-normal">Step 3 Pending</span>
                        )}
                      </span>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Check-Out Date</span>
                      <span className="font-black text-gray-900 dark:text-white text-[11px]">
                        {modal.watch('checkOutDate') ? (
                          format(new Date(modal.watch('checkOutDate')), 'MMM dd, yyyy')
                        ) : (
                          <span className="text-gray-400 italic font-normal">Step 3 Pending</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Fee Live Calculation */}
                  <div className="bg-primary/5 dark:bg-primary/10 p-3.5 rounded-xl border border-primary/15 mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        {paymentType === 'DIRECT_RENT' ? "Total Move-In Payment" : "Total Reservation Fee"}
                      </span>
                      <span className="text-base font-black text-primary">
                        ₱ {calculatedLiveTotal.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[9px] text-gray-400 font-medium italic">
                      {!room
                        ? "Pending room selection"
                        : paymentType === 'DIRECT_RENT'
                        ? (isFlatRate
                            ? "1st Month Rent (Flat Unit Rate)"
                            : isSoloBuyout
                            ? `₱ ${(room?.price || 0).toLocaleString()} x ${room?.capacity || 1} beds (Full Buyout)`
                            : `₱ ${(room?.price || 0).toLocaleString()} x ${occupantsCount} occupant(s)`) + (securityDeposit > 0 ? ` + ₱${securityDeposit.toLocaleString()} deposit` : "")
                        : (isFlatRate
                            ? "Flat Reservation Fee"
                            : isSoloBuyout
                            ? `₱ ${(room?.reservationFee || 0).toLocaleString()} x ${room?.capacity || 1} beds (Full Buyout)`
                            : `₱ ${(room?.reservationFee || 0).toLocaleString()} x ${occupantsCount} occupant(s)`)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section: Progress Bar & Security Assurance */}
            <div className="space-y-3 pt-2">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-gray-900 dark:text-white uppercase leading-none">Record Progress</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Step {modal.currentStep} of {modal.totalSteps}</p>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: modal.totalSteps }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-2.5 h-1.5 rounded-full transition-colors ${i + 1 <= modal.currentStep ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`} 
                    />
                  ))}
                </div>
              </div>

              <div className="bg-primary/5 dark:bg-primary/10 p-2.5 rounded-xl border border-primary/20 text-center">
                <p className="text-[9px] text-primary font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Physical Payment Registration</span>
                </p>
                <p className="text-[8px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                  Occupancy & earnings are recorded automatically upon confirmation.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Walk-In Submission Mascot Loader Modal */}
        <WalkInSubmissionLoaderModal
          isOpen={modal.isUploading || modal.submitted}
          guestName={modal.watch("guestName")}
          roomName={room?.name}
          onComplete={() => {
            onSuccess();
            onClose();
          }}
        />
      </div>
    </Modal>
  );
};

export default LandlordWalkInModal;

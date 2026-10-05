"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MessageSquare, X } from "lucide-react";
import { createPortal } from "react-dom";
import { KerbyMascot, KerbyPose } from "../search-modal/KerbyMascot";

interface InquiryKerbyMascotProps {
  currentStep: number;
  mode?: "desktop" | "mobile-pill" | "mobile-popover";
  onOpenMobileModal?: () => void;
  onCloseMobileModal?: () => void;
  isOpenMobileModal?: boolean;
}

export interface InquiryKerbyState {
  pose: KerbyPose;
  speech: string;
  badge: string;
  customAssetSrc?: string;
}

export const getInquiryKerbyState = (step: number): InquiryKerbyState => {
  switch (step) {
    case 1:
      return {
        pose: "pointing",
        speech: "Choose your preferred payment method! Payment is only charged after your inquiry is approved by the host.",
        badge: "STEP 1 • PAYMENT METHOD",
        customAssetSrc: "/assets/mascot/kerby-inquiry-payment.png",
      };
    case 2:
      return {
        pose: "thinking",
        speech: "Specify your target check-in date and stay duration so the landlord can prepare your room.",
        badge: "STEP 2 • STAY DETAILS",
        customAssetSrc: "/assets/mascot/kerby-inquiry-stay.png",
      };
    case 3:
      return {
        pose: "waving",
        speech: "Add a polite personal note to the landlord! Hosts prioritize respectful and clear messages.",
        badge: "STEP 3 • NOTE TO HOST",
        customAssetSrc: "/assets/mascot/kerby-inquiry-note.png",
      };
    case 4:
      return {
        pose: "studying",
        speech: "Prepare your valid government or student ID before we proceed to biometric verification.",
        badge: "STEP 4 • PREPARE ID",
        customAssetSrc: "/assets/mascot/kerby-inquiry-prepare.png",
      };
    case 5:
      return {
        pose: "excited",
        speech: "Time for a quick selfie! Ensure your face is clearly lit and centered inside the camera frame.",
        badge: "STEP 5 • BIOMETRIC SELFIE",
        customAssetSrc: "/assets/mascot/kerby-inquiry-selfie.png",
      };
    case 6:
      return {
        pose: "pointing",
        speech: "Snap a clear, un-blurred photo of your ID. Your identity details are encrypted and securely protected.",
        badge: "STEP 6 • ID VERIFICATION",
        customAssetSrc: "/assets/mascot/kerby-inquiry-idscan.png",
      };
    case 7:
      return {
        pose: "studying",
        speech: "Check your email inbox for a 6-digit verification code to confirm your identity and prevent spam.",
        badge: "STEP 7 • EMAIL VERIFICATION",
        customAssetSrc: "/assets/mascot/kerby-inquiry-otp.png",
      };
    case 8:
      return {
        pose: "loving",
        speech: "Almost done! Review your inquiry details and sign below to officially send your reservation request.",
        badge: "STEP 8 • FINAL REVIEW",
        customAssetSrc: "/assets/mascot/kerby-inquiry-review.png",
      };
    default:
      return {
        pose: "waving",
        speech: "Mabuhay! I'll guide you through sending your inquiry securely to the landlord.",
        badge: "INQUIRY ASSISTANT",
      };
  }
};

export const InquiryKerbyMascot: React.FC<InquiryKerbyMascotProps> = ({
  currentStep,
  mode = "desktop",
  onOpenMobileModal,
  onCloseMobileModal,
  isOpenMobileModal = false,
}) => {
  const kerbyState = getInquiryKerbyState(currentStep);

  if (mode === "mobile-pill") {
    return (
      <button
        type="button"
        onClick={onOpenMobileModal}
        className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xs hover:border-primary/50 transition-all text-left group cursor-pointer"
      >
        <div className="relative shrink-0 w-10 h-10 rounded-full bg-primary/15 p-1 flex items-center justify-center overflow-hidden border border-primary/30 group-hover:scale-105 transition-transform">
          <img
            src={kerbyState.customAssetSrc || `/assets/mascot/kerby-casual-${kerbyState.pose}.png`}
            alt="Kerby mascot mobile avatar"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 text-[10px] font-bold text-primary dark:text-primary-light uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 shrink-0" />
              <span>Kerby Assistant</span>
            </span>
            <span className="text-[10px] text-primary dark:text-primary-light font-semibold bg-primary/10 dark:bg-primary/20 px-2 py-0.5 rounded-md flex items-center gap-1 border border-primary/20">
              <MessageSquare className="w-3 h-3 shrink-0" />
              <span>Tap for advice</span>
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5">
            {kerbyState.speech}
          </p>
        </div>
      </button>
    );
  }

  if (mode === "mobile-popover") {
    if (typeof document === "undefined" || !isOpenMobileModal) return null;

    return createPortal(
      <AnimatePresence>
        {isOpenMobileModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md transition-colors duration-300 lg:hidden"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-5 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary dark:text-primary-light" />
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Kerby Assistant Advice
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onCloseMobileModal}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <KerbyMascot
                pose={kerbyState.pose}
                outfitMode="casual"
                speechText={kerbyState.speech}
                badgeLabel={kerbyState.badge}
                guideType="inquiry"
                customAssetSrc={kerbyState.customAssetSrc}
              />

              <button
                type="button"
                onClick={onCloseMobileModal}
                className="w-full py-3 rounded-2xl bg-[#2f7d6d] hover:bg-[#256659] text-white font-bold text-xs shadow-md transition-all uppercase tracking-wider mt-1 cursor-pointer active:scale-95"
              >
                Got it! Continue Inquiry
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    );
  }

  // Default mode: desktop mascot panel
  return (
    <KerbyMascot
      pose={kerbyState.pose}
      outfitMode="casual"
      speechText={kerbyState.speech}
      badgeLabel={kerbyState.badge}
      guideType="inquiry"
      customAssetSrc={kerbyState.customAssetSrc}
      showCloseButton={false}
    />
  );
};

export default InquiryKerbyMascot;

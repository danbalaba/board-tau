"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SafeImage from "@/components/common/SafeImage";
import { Sparkles, Heart, ShieldCheck, CheckCircle2, ChevronRight } from "lucide-react";

interface KerbyMascotStageProps {
  step: number;
  userName?: string;
  isSleepingMobile: boolean;
  onWakeUpMobile: () => void;
  showDesktopHero?: boolean;
}

// Master Mascot Configuration per Step (Desktop Hero Column & Mobile Fallback)
const MASCOT_CONFIG: Record<number, { title: string; speech: string; image: string; mobileImage: string; badge: string }> = {
  0: {
    title: "Welcome to BoardTAU Landlords!",
    speech: "Hi there! I'm Kerby! Ready to list your property and connect with thousands of TAU student tenants?",
    image: "/assets/mascot/kerby-desktop-welcome.png",
    mobileImage: "/assets/mascot/kerby-mobile-peeking-clipboard.png",
    badge: "Host Partner",
  },
  1: {
    title: "Personal Identity",
    speech: "Tell me a bit about yourself and how boarders or our support team can get in touch with you!",
    image: "/assets/mascot/kerby-desktop-identity.png",
    mobileImage: "/assets/mascot/kerby-mobile-peeking-clipboard.png",
    badge: "Identity Setup",
  },
  2: {
    title: "Establishment Profile",
    speech: "What is your establishment named, and what type of rental property do you manage?",
    image: "/assets/mascot/kerby-desktop-establishment.png",
    mobileImage: "/assets/mascot/kerby-mobile-peeking-clipboard.png",
    badge: "Establishment Setup",
  },
  3: {
    title: "Property & Location",
    speech: "Great! Pin your property location near TAU campus and upload a clear photo of your establishment facade.",
    image: "/assets/mascot/kerby-desktop-location.png",
    mobileImage: "/assets/mascot/kerby-mobile-peeking-pin.png",
    badge: "Location & Facade",
  },
  4: {
    title: "Legal & Safety Documents",
    speech: "Safety first! Upload your Mayor's Permit or Electric Utility Bill (TARELCO II) and Fire Safety Certificate.",
    image: "/assets/mascot/kerby-desktop-legal.png",
    mobileImage: "/assets/mascot/kerby-desktop-compliance.png",
    badge: "Compliance Check",
  },
  5: {
    title: "Guidelines & Agreement",
    speech: "Review our community standards and landlord guidelines to ensure a top-quality experience for all boarders.",
    image: "/assets/mascot/kerby-desktop-guidelines.png",
    mobileImage: "/assets/mascot/kerby-landlord-checklist.png",
    badge: "Community Rules",
  },
  6: {
    title: "AI Face Liveness Scan",
    speech: "Time for a quick selfie! Align your face within the frame and follow the quick liveness prompt.",
    image: "/assets/mascot/kerby-desktop-selfie.png",
    mobileImage: "/assets/mascot/kerby-desktop-scanner.png",
    badge: "Biometric Liveness",
  },
  7: {
    title: "Government ID Scan",
    speech: "Almost there! Position your Government ID card inside the scanner window.",
    image: "/assets/mascot/kerby-desktop-idscan.png",
    mobileImage: "/assets/mascot/kerby-desktop-scanner.png",
    badge: "ID Scanner",
  },
  8: {
    title: "Final Review",
    speech: "Everything looks solid! Review your application details below and click Submit to send to Moderation.",
    image: "/assets/mascot/kerby-desktop-review.png",
    mobileImage: "/assets/mascot/kerby-desktop-celebration.png",
    badge: "Ready for Approval",
  },
};

export const KerbyMascotStage: React.FC<KerbyMascotStageProps> = ({
  step,
  userName = "Landlord",
  isSleepingMobile,
  onWakeUpMobile,
  showDesktopHero = true,
}) => {
  const currentConfig = MASCOT_CONFIG[step] || MASCOT_CONFIG[0];
  const [wakePhase, setWakePhase] = useState<"sleeping" | "yawning" | "stretching" | "peeking">("sleeping");

  // Typewriter state for infinite looping typing animation matching KerbyMascot
  const [displayedText, setDisplayedText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  const fullSpeech = step === 0 ? `Hi ${userName}! ${currentConfig.speech}` : currentConfig.speech;

  // Infinite looping typewriter effect with 3.5s reset pause
  useEffect(() => {
    setDisplayedText("");
    setIsTypingComplete(false);

    if (!fullSpeech) return;

    let index = 0;
    let timeoutId: NodeJS.Timeout | null = null;

    const timer = setInterval(() => {
      index++;
      if (index <= fullSpeech.length) {
        setDisplayedText(fullSpeech.slice(0, index));
        if (index === fullSpeech.length) {
          setIsTypingComplete(true);
          clearInterval(timer);
        }
      } else {
        clearInterval(timer);
      }
    }, 22);

    return () => {
      clearInterval(timer);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [fullSpeech]);

  const handleMobileTap = () => {
    if (!isSleepingMobile) return;

    if (wakePhase === "sleeping") {
      setWakePhase("yawning");
    } else if (wakePhase === "yawning") {
      setWakePhase("stretching");
    } else if (wakePhase === "stretching") {
      setWakePhase("peeking");
    } else if (wakePhase === "peeking") {
      onWakeUpMobile();
    }
  };

  const getWakeImageSrc = () => {
    if (wakePhase === "yawning") {
      return "/assets/mascot/kerby-mobile-yawning.png";
    }
    if (wakePhase === "stretching") {
      return "/assets/mascot/kerby-mobile-stretching.png";
    }
    if (wakePhase === "peeking") {
      return "/assets/mascot/kerby-mobile-left-peeking.png";
    }
    return "/assets/mascot/kerby-carabao-sleeping-pillow.png";
  };

  return (
    <>
      {/* MOBILE SLEEPING SPLASH SCREEN (<768px) - Multi-Tap Interactive & Modern Glassmorphism UI */}
      <AnimatePresence>
        {isSleepingMobile && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            onClick={handleMobileTap}
            className="md:hidden fixed inset-0 z-[100] bg-slate-50 dark:bg-[#0b0f17] flex flex-col items-center justify-between p-6 select-none overflow-hidden cursor-pointer"
          >
            {/* Ambient Background Aura Glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-primary/10 dark:bg-primary/15 blur-3xl" />
              <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-primary/10 dark:bg-primary/15 blur-3xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
            </div>

            {wakePhase === "peeking" ? (
              /* PEEKING STAGE matching Image 1 Reference */
              <div className="absolute inset-0 flex flex-col justify-between p-6 z-10 pointer-events-auto bg-transparent">

                {/* Left Edge Peeking Mascot artwork (Slightly larger scale, straight edge hidden offscreen) */}
                <motion.div
                  initial={{ x: -140, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 140, damping: 16 }}
                  className="absolute -left-10 sm:-left-14 top-20 sm:top-24 w-64 sm:w-72 h-[420px] sm:h-[480px] pointer-events-none z-10"
                >
                  <img
                    src="/assets/mascot/kerby-mobile-left-peeking.png"
                    alt="Kerby Peeking Mascot"
                    className="w-full h-full object-contain object-left filter drop-shadow-2xl"
                  />
                </motion.div>

                {/* Speech Bubble positioned to align with Kerby's head (Matching KerbyMascot Cloud Style) */}
                <div className="absolute right-3 sm:right-6 top-24 sm:top-28 z-20 max-w-[230px] sm:max-w-xs">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-[#0E1A1E] border-2 border-slate-200 dark:border-[#2f7d6d]/50 p-5 rounded-[26px] shadow-2xl text-left relative"
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Sparkles size={14} className="text-[#2f7d6d]" />
                      <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-[#2f7d6d]">
                        KERBY GUIDE
                      </span>
                    </div>
                    <p className="text-base font-black text-slate-900 dark:text-white leading-snug">
                      Hi, I'm <span className="text-[#2f7d6d]">Kerby</span>!
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-200 mt-1.5 leading-relaxed">
                      Ready to start your landlord application? Tap to begin!
                    </p>

                    {/* Speech bubble tail pointing left towards Kerby */}
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-[#0E1A1E] border-l-2 border-b-2 border-slate-200 dark:border-[#2f7d6d]/50 rotate-45" />
                  </motion.div>
                </div>

                {/* Bottom Action Button */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="w-full max-w-xs mx-auto pb-6 text-center z-20 mt-auto"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onWakeUpMobile();
                    }}
                    className="w-full py-4 px-6 rounded-2xl bg-[#2f7d6d] hover:bg-[#27685a] active:scale-95 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#2f7d6d]/30 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Let's Begin</span>
                    <ChevronRight size={16} />
                  </button>
                </motion.div>
              </div>
            ) : (
              <>
                {/* Center Stage: Mascot + Modern Speech Bubble (Enlarged for Prominence & Readability) */}
                <div className="relative w-full max-w-sm sm:max-w-md my-auto flex flex-col items-center justify-center z-10 px-2">
                  {/* Dynamic Dream Cloud Speech Bubble */}
                  <motion.div
                    key={`bubble-${wakePhase}`}
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="w-full relative mb-10 flex flex-col items-center z-20"
                  >
                    {/* Main Cloud Body */}
                    <div className="w-full bg-white dark:bg-[#0E1A1E] px-6 py-5 rounded-[26px] border-2 border-slate-200 dark:border-[#2f7d6d]/50 shadow-xl text-center relative z-10">
                      <div className="flex items-center justify-center gap-1.5 mb-1.5">
                        <Sparkles size={14} className="text-[#2f7d6d]" />
                        <span className="text-[10px] font-bold uppercase tracking-widest font-mono text-[#2f7d6d]">
                          KERBY GUIDE
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed">
                        {wakePhase === "sleeping" && "Zzz... Kerby is taking a quick nap! Tap the screen to wake him up."}
                        {wakePhase === "yawning" && "Yaaawn... Kerby is rubbing his eyes! Tap again to stretch!"}
                        {wakePhase === "stretching" && "Big stretch! Kerby is all energized! Tap again to see Kerby!"}
                      </p>
                    </div>

                    {/* Cloud Bubble Tail (Diminishing Circles Slanting Inwards Pointing to Kerby) */}
                    <div className="absolute -bottom-4 right-16 flex flex-col items-start gap-0.5 z-0 pointer-events-none">
                      <span className="w-4 h-4 rounded-full bg-white dark:bg-[#0E1A1E] border-2 border-slate-200 dark:border-[#2f7d6d]/50 shadow-sm" />
                      <span className="w-3 h-3 rounded-full bg-white dark:bg-[#0E1A1E] border-2 border-slate-200 dark:border-[#2f7d6d]/50 shadow-sm -translate-x-1.5" />
                      <span className="w-2 h-2 rounded-full bg-white dark:bg-[#0E1A1E] border-2 border-slate-200 dark:border-[#2f7d6d]/50 shadow-sm -translate-x-3" />
                    </div>
                  </motion.div>

                  {/* Animated Mascot Frame with Touch Elasticity + Infinite Floating */}
                  <motion.div
                    key={`mascot-frame-${wakePhase}`}
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 280, damping: 14 }}
                    className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center"
                  >
                    <div className="w-full h-full flex items-center justify-center relative animate-kerby-float">
                      <SafeImage
                        src={getWakeImageSrc()}
                        fallbackSrc="/assets/mascot/kerby-carabao-sleeping-pillow.png"
                        alt="Kerby Carabao Mascot"
                        className="w-full h-full object-contain filter drop-shadow-2xl"
                      />

                      {/* Floating Zzz Particles directly above Kerby's sleeping head */}
                      {wakePhase === "sleeping" && (
                        <div className="absolute top-6 left-36 sm:left-40 z-20 pointer-events-none">
                          <motion.span
                            animate={{ opacity: [0, 1, 0], y: [0, -20], x: [0, 14] }}
                            transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", delay: 0 }}
                            className="absolute font-black text-xl text-[#2f7d6d] drop-shadow-md select-none"
                          >
                            Z
                          </motion.span>
                          <motion.span
                            animate={{ opacity: [0, 1, 0], y: [-8, -32], x: [10, 26] }}
                            transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", delay: 0.7 }}
                            className="absolute font-black text-2xl text-[#2f7d6d] drop-shadow-md select-none"
                          >
                            z
                          </motion.span>
                          <motion.span
                            animate={{ opacity: [0, 1, 0], y: [-16, -44], x: [18, 36] }}
                            transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", delay: 1.4 }}
                            className="absolute font-black text-3xl text-[#2f7d6d] drop-shadow-md select-none"
                          >
                            z...
                          </motion.span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* Bottom Action Hint (Text Only) */}
                <motion.div
                  key={`action-${wakePhase}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full max-w-xs pb-6 z-10 text-center"
                >
                  <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest inline-flex items-center justify-center gap-1.5">
                    <span>
                      {wakePhase === "sleeping" && "TAP ANYWHERE TO WAKE UP KERBY"}
                      {wakePhase === "yawning" && "TAP AGAIN TO STRETCH ARMS"}
                      {wakePhase === "stretching" && "TAP AGAIN TO SEE KERBY"}
                    </span>
                    <ChevronRight size={14} className="text-[#2f7d6d] animate-pulse" />
                  </p>
                </motion.div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* DESKTOP HERO MASCOT STAGE (Right or Left Column on >768px) */}
      {showDesktopHero && (
        <div className="hidden md:flex flex-col justify-between h-full p-5 sm:p-6 lg:p-7 bg-gradient-to-br from-[#2f7d6d]/5 via-transparent to-[#2f7d6d]/10 dark:from-[#2f7d6d]/15 dark:to-[#0E1A1E] rounded-[2.5rem] border border-[#2f7d6d]/20 relative overflow-hidden">
          {/* Central Mascot Artwork & Speech Bubble (Bubble Pinned to Top) */}
          <div className="w-full flex-1 flex flex-col items-center justify-start pt-1 relative z-10">
            {/* Cloud-Shaped Speech / Dialogue Bubble (Matching KerbyMascot.tsx) */}
            <div className="w-full max-w-sm lg:max-w-md flex flex-col items-center relative z-20 mb-1">
              <motion.div
                key={`speech-${step}`}
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 280, damping: 22 }}
                className="p-5 sm:p-6 rounded-[28px] bg-white dark:bg-[#0E1A1E] border-2 border-slate-200 dark:border-[#2f7d6d]/50 text-slate-900 dark:text-white shadow-md relative transition-colors duration-300 w-full"
              >
                {/* Cloud Header Accent & Badge Pill */}
                <div className="flex items-center justify-between gap-1.5 text-xs font-bold text-[#2f7d6d] mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#2f7d6d] shrink-0" />
                    <span className="tracking-wider font-mono text-[10px] uppercase">KERBY GUIDE</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#2f7d6d] bg-[#2f7d6d]/10 dark:bg-[#2f7d6d]/20 border border-[#2f7d6d]/30 px-2.5 py-0.5 rounded-full">
                    {currentConfig.badge}
                  </span>
                </div>

                {/* Fixed Height Typing Container: Prevents layout shifting during character-by-character typing */}
                <div className="h-[76px] sm:h-[84px] flex flex-col justify-start overflow-hidden">
                  <p className="text-xs sm:text-sm lg:text-base font-semibold leading-relaxed tracking-wide font-sans text-slate-800 dark:text-slate-100 pr-1">
                    {displayedText}
                    {!isTypingComplete && (
                      <span className="inline-block w-1.5 h-3.5 bg-[#2f7d6d] ml-1 translate-y-0.5 animate-pulse rounded-xs" />
                    )}
                  </p>
                </div>
              </motion.div>

              {/* Slant Connecting Thought Dots: Small Circle (bottom-left near Kerby's head) -> Medium -> Large Circle (top-right touching speech bubble) */}
              <div className="w-full flex justify-end pr-14 sm:pr-20 -mb-3.5 mt-1 pointer-events-none z-10">
                <div className="flex flex-col items-end gap-1">
                  {/* Top Right: Large Circle */}
                  <div className="w-4 h-4 rounded-full bg-white dark:bg-[#0E1A1E] border-2 border-slate-300 dark:border-[#2f7d6d]/50 shadow-sm" />
                  {/* Middle: Medium Circle (slanted left ↙) */}
                  <div className="w-2.5 h-2.5 rounded-full bg-white dark:bg-[#0E1A1E] border border-slate-300 dark:border-[#2f7d6d]/50 shadow-2xs -translate-x-2" />
                  {/* Bottom Left: Small Circle (closest to Kerby's head) */}
                  <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-[#0E1A1E] border border-slate-300 dark:border-[#2f7d6d]/50 shadow-2xs -translate-x-4" />
                </div>
              </div>
            </div>

            {/* Full-Body Kerby Character Stage centered in remaining vertical space */}
            <motion.div
              key={`mascot-${step}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
              className="relative flex-1 flex flex-col items-center justify-center my-auto shrink-0"
            >
              <div className="w-80 h-80 lg:w-[350px] lg:h-[350px] xl:w-[400px] xl:h-[400px] relative flex items-center justify-center pointer-events-none animate-kerby-float">
                <SafeImage
                  src={currentConfig.image}
                  alt={currentConfig.title}
                  className="w-full h-full object-contain filter drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Animated Ground Shadow */}
              <div className="w-56 h-5 bg-slate-900/20 dark:bg-black/40 rounded-full blur-md -mt-2 animate-kerby-shadow" />
            </motion.div>
          </div>

          {/* Bottom Helper Footer */}
          <div className="pt-3 border-t border-[#2f7d6d]/20 flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest z-10">
            <div className="flex items-center gap-1.5 text-[#2f7d6d]">
              <ShieldCheck size={14} />
              <span>Verified Landlord Registration</span>
            </div>
            <span>BoardTAU Security</span>
          </div>

          {/* Ambient Glow Orbs */}
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#2f7d6d]/10 rounded-full blur-3xl pointer-events-none" />
        </div>
      )}
    </>
  );
};

export default KerbyMascotStage;

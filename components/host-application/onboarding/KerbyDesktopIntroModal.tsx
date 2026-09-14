"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight, ShieldCheck, DoorOpen, ArrowRight } from "lucide-react";
import Image from "next/image";
import { cn } from "@/utils/helper";

interface KerbyDesktopIntroModalProps {
  isOpen: boolean;
  onStart: () => void;
  userName?: string;
}

export const KerbyDesktopIntroModal: React.FC<KerbyDesktopIntroModalProps> = ({
  isOpen,
  onStart,
  userName = "Landlord",
}) => {
  const [gateState, setGateState] = useState<"closed" | "open">("closed");

  // Pre-cache all keyframe assets in browser RAM for 0ms transition latency
  useEffect(() => {
    if (typeof window !== "undefined") {
      [
        "/assets/mascot/kerby-desktop-gate-closed.png",
        "/assets/mascot/kerby-desktop-gate-opening.png",
      ].forEach((src) => {
        const img = new window.Image();
        img.src = src;
      });
    }
  }, []);

  if (!isOpen) return null;

  const handleOpenGate = () => {
    if (gateState === "closed") {
      setGateState("open");
    } else if (gateState === "open") {
      onStart();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="hidden md:flex fixed inset-0 z-[100] bg-slate-900/60 dark:bg-[#03060b]/98 backdrop-blur-2xl items-center justify-center p-8 select-none overflow-hidden transition-colors duration-300"
      >
        {/* Subtle Geometric Background Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#2f7d6d_1px,transparent_1px)] [background-size:32px_32px] opacity-15 dark:opacity-10 pointer-events-none" />

        {/* Ambient Background Aura Glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.15, 0.25, 0.15],
              x: [0, 30, 0],
              y: [0, -20, 0],
            }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
            className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#2f7d6d]/15 dark:bg-[#2f7d6d]/25 blur-[140px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.1, 0.2, 0.1],
              x: [0, -40, 0],
              y: [0, 30, 0],
            }}
            transition={{ repeat: Infinity, duration: 10, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#256659]/15 dark:bg-[#1e5146]/25 blur-[140px]"
          />
        </div>

        {/* Full Screen Modern Content Container with Strict Fixed Dimensions */}
        <motion.div
          initial={{ opacity: 0, y: 25, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-5xl h-[540px] md:h-[570px] bg-white dark:bg-[#0E1A1E] backdrop-blur-2xl rounded-[3.5rem] p-8 lg:p-12 border border-slate-200/80 dark:border-[#2f7d6d]/40 shadow-2xl dark:shadow-[0_32px_80px_rgba(0,0,0,0.6)] flex flex-col md:flex-row items-center justify-between gap-8 lg:gap-12 overflow-hidden z-10 transition-colors duration-300"
        >
          {/* Top Decorative Header Strip with BoardTAU Green Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1e5146] via-[#2f7d6d] to-[#4fa89a]" />

          {/* Left Column: Mascot Stage with Micro-Animations */}
          <div className="w-full md:w-1/2 h-[410px] flex flex-col items-center justify-center relative shrink-0">
            {/* Vintage Glowing Lantern Atmosphere */}
            <motion.div
              animate={{
                scale: gateState === "open" ? [1, 1.3, 1] : [1, 1.15, 1],
                opacity: gateState === "open" ? [0.4, 0.7, 0.4] : [0.25, 0.45, 0.25],
              }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute top-10 left-8 w-36 h-36 bg-amber-400/40 rounded-full blur-3xl pointer-events-none"
            />

            {/* Dynamic Soft Light Flare Bloom on Gate Open */}
            <motion.div
              animate={{
                scale: gateState === "open" ? [0.9, 1.25, 1.1] : 0.8,
                opacity: gateState === "open" ? [0.4, 0.8, 0.5] : 0.2,
              }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="absolute inset-0 m-auto w-80 h-80 rounded-full bg-gradient-to-tr from-[#2f7d6d]/40 via-amber-300/45 to-[#4fa89a]/40 blur-3xl pointer-events-none z-0"
            />

            {/* Persistent Floating Mascot Stage */}
            <motion.div
              animate={{
                y: [0, -8, 0],
              }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="relative w-80 h-80 lg:w-[400px] lg:h-[400px] flex items-center justify-center cursor-pointer z-10 group"
              onClick={handleOpenGate}
            >
              {/* Layer 1: Closed Gate Mascot */}
              <motion.div
                initial={{ opacity: 1, scale: 1 }}
                animate={{
                  opacity: gateState === "closed" ? 1 : 0,
                  scale: gateState === "closed" ? 1 : 0.97,
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="absolute inset-0 w-full h-full pointer-events-none"
              >
                <Image
                  src="/assets/mascot/kerby-desktop-gate-closed.png"
                  alt="Kerby Gate Closed"
                  fill
                  priority
                  loading="eager"
                  unoptimized
                  className="object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_20px_35px_rgba(0,0,0,0.4)] group-hover:scale-[1.03] transition-transform duration-300"
                />
              </motion.div>

              {/* Layer 2: Open Gate Mascot (kerby-desktop-gate-opening.png) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{
                  opacity: gateState === "open" ? 1 : 0,
                  scale: gateState === "open" ? 1 : 0.98,
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="absolute inset-0 w-full h-full pointer-events-none"
              >
                <Image
                  src="/assets/mascot/kerby-desktop-gate-opening.png"
                  alt="Kerby Gate Open"
                  fill
                  priority
                  loading="eager"
                  unoptimized
                  className="object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_20px_35px_rgba(0,0,0,0.4)] group-hover:scale-[1.03] transition-transform duration-300"
                />
              </motion.div>
            </motion.div>

            {/* Micro Dynamic Ground Shadow */}
            <motion.div
              animate={{
                scaleX: [1, 0.9, 1],
                opacity: [0.35, 0.2, 0.35],
              }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="w-56 h-5 bg-slate-900/20 dark:bg-black/60 rounded-full blur-lg -mt-6 z-0"
            />
          </div>

          {/* Right Column: Strict Fixed Height Container */}
          <div className="w-full md:w-1/2 h-[410px] flex flex-col justify-between text-left py-1">
            {/* Top Pill Badge with BoardTAU Green Accent */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#2f7d6d]/10 dark:bg-[#2f7d6d]/20 border border-[#2f7d6d]/30 dark:border-[#2f7d6d]/40 w-fit backdrop-blur-md shrink-0">
              <Sparkles size={15} className="text-[#2f7d6d] dark:text-[#4fa89a] animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest text-[#2f7d6d] dark:text-[#4fa89a]">
                Official Landlord Onboarding
              </span>
            </div>

            {/* Speech Bubble Card with Strict Fixed Height (190px) */}
            <div className="bg-slate-50 dark:bg-[#152228] backdrop-blur-xl p-6 lg:p-7 rounded-[2.2rem] border border-slate-200/80 dark:border-[#2f7d6d]/40 shadow-sm relative overflow-hidden h-[190px] min-h-[190px] max-h-[190px] flex flex-col justify-center shrink-0">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#2f7d6d]/5 dark:bg-[#2f7d6d]/10 rounded-full blur-2xl pointer-events-none" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={`speech-${gateState}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="space-y-2.5"
                >
                  <h3 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-[family-name:var(--font-outfit)] leading-tight flex items-center gap-2">
                    {gateState === "open" ? (
                      <>
                        <span className="truncate">Welcome, <span className="text-[#2f7d6d] dark:text-[#4fa89a]">{userName}</span>!</span>
                        <Sparkles className="w-5 h-5 text-[#2f7d6d] dark:text-[#4fa89a] shrink-0 inline-block animate-pulse" />
                      </>
                    ) : (
                      <>
                        <span>Knock on the Gate!</span>
                        <DoorOpen className="w-5 h-5 text-[#2f7d6d] dark:text-[#4fa89a] shrink-0 inline-block" />
                      </>
                    )}
                  </h3>
                  
                  <p className="text-xs lg:text-sm font-medium text-slate-600 dark:text-slate-200 leading-relaxed">
                    {gateState === "closed" ? (
                      <>Hi there! I'm <span className="text-[#2f7d6d] dark:text-[#4fa89a] font-bold">Kerby</span>! Knock on the wooden gate to enter our official landlord onboarding center.</>
                    ) : (
                      <>The gate is wide open! Let's get your boarding house verified and connect with thousands of TAU student boarders.</>
                    )}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Security Guarantee Note */}
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0">
              <ShieldCheck size={18} className="text-[#2f7d6d] dark:text-[#4fa89a] shrink-0" />
              <span>100% Encrypted & TAU Verified Registration</span>
            </div>

            {/* Premium Interactive Action Button with BoardTAU Brand Green (#2f7d6d) */}
            <div className="pt-1 shrink-0">
              <button
                type="button"
                onClick={handleOpenGate}
                className={cn(
                  "relative group overflow-hidden w-full py-4 px-8 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl transition-all duration-300 flex items-center justify-center gap-3 active:scale-[0.98] cursor-pointer",
                  gateState === "open"
                    ? "bg-gradient-to-r from-[#2f7d6d] via-[#256659] to-[#1e5146] hover:brightness-110 text-white shadow-lg shadow-[#2f7d6d]/35"
                    : "bg-[#2f7d6d] hover:bg-[#256659] text-white shadow-lg shadow-[#2f7d6d]/30"
                )}
              >
                {/* Button Light Reflection Overlay */}
                <div className="absolute inset-0 w-1/2 bg-white/20 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-in-out pointer-events-none" />

                {gateState === "closed" ? (
                  <>
                    <DoorOpen size={18} className="transition-transform group-hover:scale-110" />
                    <span>Knock & Open Gate</span>
                    <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </>
                ) : (
                  <>
                    <span>Enter Establishment & Start</span>
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default KerbyDesktopIntroModal;



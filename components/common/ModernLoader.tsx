"use client";

import React from "react";
import { motion } from "framer-motion";
import SafeImage from "@/components/common/SafeImage";

interface ModernLoaderProps {
  text?: string;
  fullPage?: boolean;
  mascotSrc?: string;
}

const ModernLoader: React.FC<ModernLoaderProps> = ({ 
  text = "Loading...", 
  fullPage = false,
  mascotSrc = "/assets/mascot/kerby-global-search.png"
}) => {
  const content = (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[28px] p-7 border border-gray-200/80 dark:border-slate-800 shadow-xl dark:shadow-2xl flex flex-col items-center justify-center gap-5 max-w-sm w-full mx-auto relative overflow-hidden"
    >
      {/* Background Ambient Brand Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#2f7d6d]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Kerby Mascot Container with Brand Halo */}
      <div className="relative w-28 h-28 flex items-center justify-center overflow-visible">
        {/* Outer ambient pulsing halo ring */}
        <motion.div
          className="absolute inset-0 rounded-full border border-[#2f7d6d]/30 bg-[#2f7d6d]/10 pointer-events-none"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.6, 0.1, 0.6],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Kerby Mascot Display */}
        <div className="w-full h-full p-2 relative z-10 flex items-center justify-center">
          <SafeImage
            src={mascotSrc}
            fallbackSrc="/assets/mascot/kerby-casual-waving.png"
            alt="BoardTAU Kerby Mascot"
            showSkeleton={false}
            containerClassName="w-full h-full flex items-center justify-center"
            className="w-full h-full object-contain filter drop-shadow-md"
          />
        </div>
      </div>

      {/* Clear Brand Text & Progress Bar (No technical jargon) */}
      <div className="flex flex-col items-center gap-2.5 z-10 w-full text-center">
        <motion.p
          className="text-xs font-black tracking-widest uppercase text-[#2f7d6d] max-w-[240px] truncate"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          {text}
        </motion.p>

        {/* Brand Progress Track */}
        <div className="w-32 h-1.5 bg-gray-200/80 dark:bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-gray-300/40 dark:border-slate-700/60 shadow-inner">
          <motion.div 
            className="h-full bg-[#2f7d6d] rounded-full"
            animate={{
              x: ["-100%", "100%"]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </div>
    </motion.div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 dark:bg-slate-950/60 backdrop-blur-md p-4">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-16 px-4 w-full">
      {content}
    </div>
  );
};

export default ModernLoader;

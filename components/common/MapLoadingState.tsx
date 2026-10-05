"use client";

import React from "react";
import { motion } from "framer-motion";
import SafeImage from "@/components/common/SafeImage";

interface MapLoadingStateProps {
  label?: string;
  subtitle?: string;
  height?: string;
  mascotSrc?: string;
}

export const MapLoadingState: React.FC<MapLoadingStateProps> = ({
  label = "TAU Campus Map",
  subtitle = "Loading college landmarks & GPS coordinates...",
  height = "h-full min-h-[220px]",
  mascotSrc = "/assets/mascot/kerby-global-navigation.png",
}) => {
  return (
    <div
      className={`w-full ${height} rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 relative overflow-hidden flex items-center justify-center p-6 shadow-inner`}
    >
      {/* Background Ambient Brand Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#2f7d6d]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Ambient Pulsing Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full border border-slate-300/40 dark:border-slate-700/40 opacity-40 animate-pulse" />
      </div>

      {/* Floating Glass Center Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border border-white/60 dark:border-white/15 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col items-center gap-3 text-center max-w-xs w-full transition-all"
      >
        {/* Kerby Mascot Container with Brand Halo */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center overflow-visible">
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

          <div className="w-full h-full p-1.5 relative z-10 flex items-center justify-center">
            <SafeImage
              src={mascotSrc}
              fallbackSrc="/assets/mascot/kerby-global-search.png"
              alt="BoardTAU Kerby Mascot Map Loading"
              showSkeleton={false}
              containerClassName="w-full h-full flex items-center justify-center"
              className="w-full h-full object-contain filter drop-shadow-md"
            />
          </div>
        </div>

        <div>
          <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider text-[#2f7d6d] dark:text-emerald-400">
            {label}
          </h4>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-snug">
            {subtitle}
          </p>
        </div>

        {/* Brand Progress Track */}
        <div className="w-28 h-1.5 bg-gray-200/80 dark:bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-gray-300/40 dark:border-slate-700/60 shadow-inner mt-1">
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
      </motion.div>
    </div>
  );
};

export default MapLoadingState;

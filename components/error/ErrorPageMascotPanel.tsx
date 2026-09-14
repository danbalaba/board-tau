"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface ErrorPageMascotPanelProps {
  imageSrc: string;
  altText: string;
  speechText: string;
  badgeLabel?: string;
  speechIcon?: React.ReactNode;
}

export const ErrorPageMascotPanel: React.FC<ErrorPageMascotPanelProps> = ({
  imageSrc,
  altText,
  speechText,
  badgeLabel = "Kerby AI Assistant",
  speechIcon,
}) => {
  const [mounted, setMounted] = useState(false);
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Living Looping Typewriter Effect with 3.5s Reading Pause
  useEffect(() => {
    if (!mounted) return;

    let timeoutId: NodeJS.Timeout;
    let intervalId: NodeJS.Timeout;
    let isCancelled = false;

    const startTyping = () => {
      let index = 0;
      setDisplayedText("");

      intervalId = setInterval(() => {
        if (isCancelled) return;
        if (index < speechText.length) {
          setDisplayedText(speechText.slice(0, index + 1));
          index++;
        } else {
          clearInterval(intervalId);
          timeoutId = setTimeout(() => {
            if (!isCancelled) {
              startTyping();
            }
          }, 3500);
        }
      }, 22);
    };

    startTyping();

    return () => {
      isCancelled = true;
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [speechText, mounted]);

  return (
    <div className="relative flex flex-col items-center justify-between h-full w-full p-4 sm:p-6 md:p-8 rounded-3xl overflow-hidden select-none border border-slate-200/80 dark:border-white/10 bg-slate-50/90 dark:bg-slate-900/60 backdrop-blur-2xl shadow-2xl transition-all duration-300 min-h-[320px] sm:min-h-[420px] lg:min-h-[600px]">
      {/* Background Ambient Radial Light Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 lg:w-[450px] lg:h-[450px] bg-[#2f7d6d]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Cloud-Shaped Speech / Dialogue Bubble (Floating Overlay with Fixed Height to Prevent Layout Shift) */}
      <div className="w-full z-20 mt-1 sm:mt-3 mb-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="relative p-4 sm:p-5 md:p-6 rounded-[24px] sm:rounded-[28px] bg-white/95 dark:bg-slate-800/95 text-slate-900 dark:text-white border border-slate-200/90 dark:border-slate-700/80 shadow-xl backdrop-blur-xl min-h-[100px] sm:min-h-[120px] md:min-h-[135px] flex flex-col justify-start"
        >
          {/* Cloud Thought Bubble Trail */}
          <div className="absolute -bottom-6 right-8 sm:right-12 flex flex-col items-end gap-1 pointer-events-none z-30">
            <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 shadow-md -mr-1" />
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 shadow-sm mr-1" />
            <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 shadow-sm mr-2.5" />
          </div>

          {/* Cloud Header Accent */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#2f7d6d] dark:text-emerald-400 mb-1 shrink-0">
            {speechIcon ? (
              <span className="shrink-0 text-[#2f7d6d] dark:text-emerald-400">{speechIcon}</span>
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-[#2f7d6d] dark:text-emerald-400 shrink-0" />
            )}
            <span className="tracking-wide font-mono text-[10px] sm:text-[11px] uppercase">Kerby Assistant</span>
          </div>

          {/* Typing Text Container (Fixed min-h for 3 lines of text) */}
          <p className="text-xs sm:text-sm md:text-base font-semibold leading-relaxed tracking-wide min-h-[54px] sm:min-h-[68px] md:min-h-[78px] font-sans">
            {mounted ? displayedText : speechText}
          </p>
        </motion.div>
      </div>

      {/* Hero Mascot Character Image Frame */}
      <div className="relative flex-1 flex items-center justify-center w-full my-auto py-2 z-10">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{
            duration: 3.4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative flex items-center justify-center w-full"
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={imageSrc}
              src={imageSrc}
              alt={altText}
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-48 h-48 sm:w-72 sm:h-72 md:w-[340px] md:h-[340px] lg:w-[440px] lg:h-[440px] xl:w-[480px] xl:h-[480px] object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.22)] filter"
            />
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Footer Branding */}
      <div className="w-full text-center z-20 pt-3 border-t border-slate-200/80 dark:border-white/10 mt-auto">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">
          Official TAU Mascot • <span className="text-[#2f7d6d] dark:text-emerald-400 font-bold">Kerby the Carabao</span>
        </p>
      </div>
    </div>
  );
};

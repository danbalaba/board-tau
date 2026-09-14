"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Sparkles, MessageSquare, X } from "lucide-react";
import { cn } from "@/utils/helper";
import { preloadKerbyAssets } from "@/utils/imagePreloader";

export type KerbyPose =
  | "waving"
  | "pointing"
  | "thinking"
  | "loving"
  | "studying"
  | "driving"
  | "sleeping"
  | "excited";

export type OutfitMode = "casual" | "uniform";

interface KerbyMascotProps {
  pose?: KerbyPose;
  outfitMode?: OutfitMode;
  speechText?: string;
  badgeLabel?: string;
  collegeName?: string;
  isTyping?: boolean;
  transparentBg?: boolean;
  bubblePosition?: 'top' | 'top-right' | 'right';
  guideType?: 'host' | 'search' | 'student';
  showCloseButton?: boolean;
  disableTyping?: boolean;
}

export const KerbyMascot: React.FC<KerbyMascotProps> = ({
  pose = "waving",
  outfitMode = "casual",
  speechText = "Mabuhay! Let's find your ideal home near TAU!",
  badgeLabel,
  collegeName,
  transparentBg = false,
  bubblePosition = 'top',
  guideType = 'host',
  showCloseButton = true,
  disableTyping = false,
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [isBubbleOpen, setIsBubbleOpen] = useState(true);

  useEffect(() => {
    preloadKerbyAssets();
  }, []);

  // Typewriter Effect with Safe Interval Cleanup
  useEffect(() => {
    if (!speechText) {
      setDisplayedText("");
      setIsTypingComplete(true);
      return;
    }
    if (disableTyping || process.env.NODE_ENV === 'test') {
      setDisplayedText(speechText);
      setIsTypingComplete(true);
      return;
    }

    setDisplayedText("");
    setIsTypingComplete(false);
    let index = 0;
    const intervalId = setInterval(() => {
      index++;
      if (index <= speechText.length) {
        setDisplayedText(speechText.slice(0, index));
        if (index === speechText.length) {
          setIsTypingComplete(true);
        }
      } else {
        clearInterval(intervalId);
      }
    }, 22);

    return () => {
      clearInterval(intervalId);
    };
  }, [speechText, disableTyping]);

  const assetSrc = `/assets/mascot/kerby-${outfitMode}-${pose}.png`;

  const isNortheast = bubblePosition === 'top-right' || bubblePosition === 'right';

  return (
    <div className={cn(
      "relative select-none transition-colors duration-300 flex flex-col items-center justify-end w-full h-full",
      transparentBg 
        ? "p-0 bg-transparent border-0 shadow-none overflow-visible" 
        : "p-6 rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-slate-900/60 backdrop-blur-xl shadow-lg"
    )}>
      {/* Top Header Badge */}
      {collegeName && !transparentBg && (
        <div className="w-full flex items-center justify-end z-10 mb-2">
          <div className="px-3.5 py-1.5 rounded-full bg-[#2f7d6d]/15 text-[#2f7d6d] dark:text-emerald-300 border border-[#2f7d6d]/30 text-xs font-bold truncate max-w-[220px] shadow-sm flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 shrink-0 text-[#2f7d6d] dark:text-emerald-400" />
            <span className="truncate">{collegeName}</span>
          </div>
        </div>
      )}

      {/* Cloud-Shaped Speech / Dialogue Bubble */}
      <AnimatePresence>
        {isBubbleOpen ? (
          <div className={cn(
            "transition-all duration-300 pointer-events-auto w-full flex flex-col items-center",
            isNortheast ? "z-[99999] absolute bottom-[420px] left-[230px] sm:left-[250px] w-80 sm:w-96" : "relative z-20 mb-1"
          )}>
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: isNortheast ? 15 : -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: isNortheast ? 15 : -10 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              className={cn(
                "relative shadow-md transition-colors duration-300 w-full",
                transparentBg 
                  ? "p-5 rounded-[26px] bg-white dark:bg-[#0E1A1E] border-2 border-slate-200 dark:border-[#2f7d6d]/50 text-slate-800 dark:text-white" 
                  : "p-5 rounded-[28px] bg-white dark:bg-[#0E1A1E] border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              )}
            >
              {/* Close Button on Speech Bubble */}
              {showCloseButton && (
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsBubbleOpen(false);
                  }}
                  className="absolute top-3.5 right-3.5 p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer z-30"
                  title="Close chat bubble"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* 45-Degree Diagonal Slant Thought Bubble Trail (ONLY FOR FLOATING SIDEBAR NORTHEAST BUBBLE) */}
              {isNortheast && (
                <div className="absolute -left-12 -bottom-10 w-20 h-20 pointer-events-none z-20">
                  <div className="absolute left-0 bottom-0 w-2.5 h-2.5 rounded-full bg-white dark:bg-[#0E1A1E] border border-slate-300 dark:border-[#2f7d6d]/50 shadow-sm" />
                  <div className="absolute left-5 bottom-4 w-3.5 h-3.5 rounded-full bg-white dark:bg-[#0E1A1E] border border-slate-300 dark:border-[#2f7d6d]/50 shadow-md" />
                  <div className="absolute left-10 bottom-8 w-5.5 h-5.5 rounded-full bg-white dark:bg-[#0E1A1E] border-2 border-slate-300 dark:border-[#2f7d6d]/50 shadow-lg" />
                </div>
              )}

              {/* Cloud Header Accent */}
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#2f7d6d] mb-2 pr-6">
                <Sparkles className="w-3.5 h-3.5 text-[#2f7d6d] shrink-0" />
                <span className="tracking-wider font-mono text-[10px] uppercase">Kerby Guide</span>
              </div>

              {/* Typing Text Container with Generous Right Padding to Prevent Close Button Overlap */}
              <p className={cn(
                "text-xs sm:text-sm font-semibold leading-relaxed tracking-wide min-h-[44px] font-sans text-slate-800 dark:text-slate-100",
                showCloseButton ? "pr-8" : "pr-2"
              )}>
                {displayedText}
                {!isTypingComplete && (
                  <span className="inline-block w-1.5 h-3.5 bg-[#2f7d6d] ml-1 translate-y-0.5 animate-pulse rounded-xs" />
                )}
              </p>

              {badgeLabel && (
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-[11px] text-[#2f7d6d] font-medium">
                  <span className="font-bold text-[#2f7d6d]">{badgeLabel}</span>
                  <div className="flex items-center gap-1 text-[9px] text-[#2f7d6d]/80 font-mono uppercase">
                    <Sparkles className="w-3 h-3 text-[#2f7d6d] shrink-0" />
                    <span>{guideType === "host" ? "Host Guide" : "Search Guide"}</span>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Slant Connecting Thought Dots: Small Circle (bottom-left near Kerby's ear) -> Medium -> Large Circle (top-right touching speech bubble) */}
            {!isNortheast && (
              <div className="w-full flex justify-end pr-14 sm:pr-20 -mb-3.5 mt-1 pointer-events-none z-10">
                <div className="flex flex-col items-end gap-1">
                  {/* Top Right: Large Circle */}
                  <div className="w-4 h-4 rounded-full bg-white dark:bg-[#0E1A1E] border-2 border-slate-300 dark:border-[#2f7d6d]/50 shadow-sm" />
                  {/* Middle: Medium Circle (slanted left ↙) */}
                  <div className="w-2.5 h-2.5 rounded-full bg-white dark:bg-[#0E1A1E] border border-slate-300 dark:border-[#2f7d6d]/50 shadow-2xs -translate-x-2" />
                  {/* Bottom Left: Small Circle (closest to Kerby's ear) */}
                  <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-[#0E1A1E] border border-slate-300 dark:border-[#2f7d6d]/50 shadow-2xs -translate-x-4" />
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Minimized State: Floating Top-Most z-[99999] Position */
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsBubbleOpen(true)}
            className="absolute bottom-[410px] left-[240px] sm:left-[255px] z-[99999] flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white dark:bg-[#0E1A1E] border-2 border-slate-200 dark:border-[#2f7d6d]/50 text-slate-800 dark:text-white shadow-2xl cursor-pointer group pointer-events-auto whitespace-nowrap"
            title="Click to view Kerby's tip"
          >
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#2f7d6d] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-[#2f7d6d] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-[#2f7d6d] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-[10px] font-black tracking-wider uppercase text-[#2f7d6d] ml-0.5">Tip</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mascot Character Image Frame with Floating 3D Physics */}
      <div 
        onClick={() => !isBubbleOpen && setIsBubbleOpen(true)}
        className={cn(
          "relative flex-1 flex items-center justify-center w-full my-auto overflow-visible py-3",
          !isBubbleOpen && "cursor-pointer"
        )}
      >
        {/* Soft Ambient Glow */}
        <div className="absolute w-56 h-56 rounded-full bg-emerald-500/20 blur-2xl" />

        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: 3.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative z-10 flex items-center justify-center w-full h-full"
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={assetSrc}
              src={assetSrc}
              alt={`Kerby mascot - ${outfitMode} ${pose}`}
              initial={{ opacity: 0, scale: 0.85, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "object-contain filter drop-shadow-[0_25px_35px_rgba(0,0,0,0.45)] transition-transform duration-300",
                transparentBg
                  ? "w-[280px] h-[280px] sm:w-[330px] sm:h-[330px] max-w-none transform scale-110 sm:scale-125"
                  : "w-full max-w-[290px] sm:max-w-[340px] md:max-w-[380px] lg:max-w-[410px] h-auto max-h-[440px] transform scale-105"
              )}
            />
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Footer Branding */}
      {!transparentBg && (
        <div className="w-full text-center z-10 pt-2 border-t border-slate-200 dark:border-white/10">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
            Official TAU Mascot • <span className="text-[#2f7d6d] dark:text-emerald-400 font-bold">Kerby the Carabao</span>
          </p>
        </div>
      )}
    </div>
  );
};

"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi, RefreshCcw, SignalLow, CheckCircle2, X } from "lucide-react";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { useRouter } from "next/navigation";
import { ErrorPageMascotPanel } from "@/components/error/ErrorPageMascotPanel";
import { KERBY_OFFLINE_DATA_URI } from "./kerbyOfflineDataUri";

export function NetworkStatusManager() {
  const isOnline = useNetworkStatus();
  const [showToast, setShowToast] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setShowToast(false);
    } else if (isOnline && wasOffline) {
      // Show "Back Online" modern toast notification
      setShowToast(true);
      const timer = setTimeout(() => {
        setShowToast(false);
        setWasOffline(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  // Lock body scroll when offline to prevent background scrolling
  useEffect(() => {
    if (!isOnline) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOnline]);

  // Full Screen Offline Overlay
  if (!isOnline) {
    return (
      <div data-error-page="true" className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8 bg-slate-50 dark:bg-slate-950 animate-in fade-in duration-500 overflow-y-auto font-sans">
        {/* Background ambient light (Dark mode only) */}
        <div className="hidden dark:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#2f7d6d]/15 rounded-full blur-[160px] pointer-events-none" />

        <div className="w-full max-w-[1700px] mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch relative z-10 my-auto">
          {/* Left Column: Kerby Hero Mascot Panel */}
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col h-full min-h-[320px] sm:min-h-[420px]">
            <ErrorPageMascotPanel
              imageSrc={KERBY_OFFLINE_DATA_URI}
              altText="Kerby No Internet Mascot"
              speechText="Uh oh! I lost connection to the BoardTAU network! Please check your Wi-Fi or cellular settings."
              speechIcon={<WifiOff className="w-4 h-4 text-[#2f7d6d] dark:text-emerald-400" />}
            />
          </div>

          {/* Right Column: Error Code, Notice & Action Controls */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-between p-6 sm:p-8 md:p-12 lg:p-14 rounded-3xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 backdrop-blur-2xl shadow-2xl h-full min-h-[300px] sm:min-h-[420px] relative overflow-hidden">
            <div>
              {/* Top Status Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-4 sm:mb-6">
                <WifiOff className="w-4 h-4" />
                <span>System Status • Network Offline</span>
              </div>

              {/* Title with Responsive OFFLINE Watermark */}
              <div className="relative mb-4 sm:mb-8">
                <div className="absolute -top-6 sm:-top-10 left-0 pointer-events-none select-none overflow-hidden opacity-25 dark:opacity-20">
                  <span className="text-4xl sm:text-8xl md:text-[140px] lg:text-[160px] font-black text-slate-400 dark:text-slate-600 leading-none font-mono tracking-tighter uppercase">
                    OFFLINE
                  </span>
                </div>
                <h2 className="relative z-10 text-xl sm:text-4xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight font-outfit pt-3 sm:pt-8">
                  No Internet Connection
                </h2>
              </div>

              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-lg md:text-2xl leading-relaxed mb-4 sm:mb-8 max-w-2xl font-normal">
                Please check your Wi-Fi router, network cables, or cellular data signal to reconnect to BoardTAU.
              </p>

              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3.5 sm:p-5 md:p-6 mb-4 sm:mb-8 flex items-start gap-3 sm:gap-4">
                <SignalLow className="text-emerald-500 shrink-0 mt-0.5 w-5 h-5 sm:w-7 sm:h-7" />
                <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-base md:text-lg leading-relaxed font-medium">
                  Once your network connection is restored, click the button below to reload your page automatically.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 pt-4 sm:pt-8 border-t border-slate-200/80 dark:border-slate-800">
              <button
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 sm:gap-2.5 px-6 sm:px-9 py-3 sm:py-4 bg-[#2f7d6d] hover:bg-[#256356] text-white font-semibold text-sm sm:text-base rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl transition-all duration-200 active:scale-95 sm:ml-auto"
              >
                <RefreshCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Refresh Page</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Modern "Back Online" Toast Notification
  return (
    <AnimatePresence>
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 450, damping: 25 }}
          className="fixed top-5 left-4 right-4 sm:left-auto sm:right-6 z-[10000] pointer-events-none flex justify-center sm:justify-end font-sans"
        >
          <div className="pointer-events-auto flex items-center gap-3 px-4 sm:px-5 py-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white border border-emerald-500/40 shadow-[0_10px_35px_rgba(47,125,109,0.25)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl max-w-md w-full sm:w-auto">
            {/* Glowing Icon Badge */}
            <div className="relative p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
              <Wifi className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            </div>

            <div className="flex-1 min-w-0 pr-2">
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 leading-tight">
                <span>Connection Restored</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                You are back online. All features are active.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowToast(false)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors shrink-0"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

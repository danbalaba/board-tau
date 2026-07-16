"use client";

import React from "react";
import Link from "next/link";
import { WifiOff, ArrowLeft, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function OfflinePage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center text-center relative overflow-hidden"
      >
        {/* Decorative top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

        <motion.div 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 15,
            delay: 0.2
          }}
          className="relative mb-8"
        >
          <div className="w-24 h-24 bg-rose-500/10 dark:bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center border border-rose-500/20 shadow-inner">
            <WifiOff size={40} strokeWidth={2.5} />
          </div>
          {/* Pulsing ring */}
          <motion.div 
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full border-2 border-rose-500/30"
          />
        </motion.div>

        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3 font-outfit">
          You're offline
        </h1>
        
        <p className="text-slate-500 dark:text-slate-400 text-[15px] leading-relaxed mb-8 px-4">
          It looks like you've lost your internet connection. You can still view some of your previously loaded content, or try reconnecting.
        </p>

        <div className="w-full flex flex-col gap-3">
          <button
            onClick={handleRefresh}
            className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-primary/25"
          >
            <RefreshCw size={18} />
            Try again
          </button>
          
          <Link
            href="/"
            className="w-full py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>
        </div>
      </motion.div>
      
      <div className="fixed bottom-8 text-slate-400 dark:text-slate-600 text-xs font-bold tracking-[0.2em] uppercase">
        BoardTAU • PWA
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { WifiOff, Wifi, X } from "lucide-react";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export function NetworkStatusManager() {
  const isOnline = useNetworkStatus();
  const [showBanner, setShowBanner] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isOnline) {
      setShowBanner(true);
      setWasOffline(true);
    } else if (isOnline && wasOffline) {
      // Show "Back Online" success message briefly
      setShowBanner(true);
      const timer = setTimeout(() => {
        setShowBanner(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  // Lock body scroll when offline to prevent background scrolling
  useEffect(() => {
    if (!isOnline) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOnline]);

  if (!showBanner && isOnline) return null;

  // If offline, we show the full-screen overlay
  if (!isOnline) {
    return (
      <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-between bg-white dark:bg-slate-900 animate-in fade-in duration-500 overflow-hidden">
        
        {/* Top Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full flex flex-col items-center pt-16 md:pt-24 px-6 z-10"
        >
          <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400 dark:to-emerald-300 font-black tracking-widest uppercase text-lg md:text-xl mb-12 font-outfit drop-shadow-sm">
            No internet connection
          </h2>

          {/* Illustration & Custom SVG Wifi */}
          <div className="relative w-80 h-80 md:w-[450px] md:h-[450px] flex flex-col items-center">
            
            {/* Animated SVG Wifi Icon */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="absolute -top-16 md:-top-20 left-1/2 -translate-x-1/2 w-32 h-32 md:w-48 md:h-48 text-primary/80 dark:text-primary/60 flex items-end justify-center pointer-events-none z-0"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full drop-shadow-sm">
                <motion.path 
                  d="M5 12.55a11 11 0 0 1 14.08 0" 
                  initial={{ opacity: 0.2 }}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 0.6, ease: "easeInOut" }}
                />
                <motion.path 
                  d="M1.42 9a16 16 0 0 1 21.16 0" 
                  initial={{ opacity: 0.2 }}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 0.8, ease: "easeInOut" }}
                />
                <motion.path 
                  d="M8.53 16.11a6 6 0 0 1 6.95 0" 
                  initial={{ opacity: 0.2 }}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 0.4, ease: "easeInOut" }}
                />
                {/* The Dot */}
                <motion.circle 
                  cx="12" cy="20" r="1.5" fill="currentColor" stroke="none"
                  initial={{ opacity: 0.2 }}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 0.2, ease: "easeInOut" }}
                />
              </svg>
            </motion.div>

            {/* Light Mode Illustration */}
            <motion.img 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
              src="/images/illustration_no_bg_light_mode.png" 
              alt="No Internet (Light)" 
              className="w-full h-full object-contain drop-shadow-2xl dark:hidden relative z-10"
            />
            {/* Dark Mode Illustration */}
            <motion.img 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
              src="/images/illustration_no_bg_dark_mode.png" 
              alt="No Internet (Dark)" 
              className="w-full h-full object-contain drop-shadow-2xl hidden dark:block relative z-10"
            />
          </div>

          {/* Text and Button pushed closer to the image */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col items-center mt-8 md:mt-12 z-20"
          >
            <p className="text-slate-700 dark:text-slate-200 text-center mb-8 max-w-[300px] text-lg font-outfit font-medium leading-relaxed drop-shadow-sm">
              Please check your connection again, or connect to Wi-Fi
            </p>

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="w-full max-w-[280px] py-4 bg-primary hover:bg-primary-dark text-white rounded-full font-bold text-lg shadow-xl shadow-primary/30 flex items-center justify-center gap-2 font-outfit tracking-wide"
            >
              Refresh Page
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Decorative Waves at the absolute bottom */}
        <div className="absolute bottom-0 left-0 right-0 w-full h-[40vh] overflow-hidden -z-10 pointer-events-none">
          {/* Back Wave */}
          <motion.svg 
            animate={{ y: [0, -15, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-[120%] object-cover origin-bottom" preserveAspectRatio="none"
          >
            <path fill="rgba(47, 125, 109, 0.15)" fillOpacity="1" d="M0,224L60,202.7C120,181,240,139,360,138.7C480,139,600,181,720,181.3C840,181,960,139,1080,122.7C1200,107,1320,117,1380,122.7L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
          </motion.svg>
          
          {/* Middle Wave */}
          <motion.svg 
            animate={{ y: [0, -25, 0] }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut", delay: 1 }}
            viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-[80%] object-cover origin-bottom" preserveAspectRatio="none"
          >
            <path fill="rgba(47, 125, 109, 0.4)" fillOpacity="1" d="M0,128L48,149.3C96,171,192,213,288,213.3C384,213,480,171,576,149.3C672,128,768,128,864,154.7C960,181,1056,235,1152,245.3C1248,256,1344,224,1392,208L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </motion.svg>
          
          {/* Front Wave */}
          <motion.svg 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 2 }}
            viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-[50%] object-cover origin-bottom" preserveAspectRatio="none"
          >
            <path fill="var(--primary-color)" fillOpacity="1" d="M0,192L60,197.3C120,203,240,213,360,197.3C480,181,600,139,720,138.7C840,139,960,181,1080,197.3C1200,213,1320,203,1380,197.3L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
          </motion.svg>
        </div>
      </div>
    );
  }

  // If back online, show the success toast
  return (
    <div className="fixed top-6 left-0 right-0 z-[10000] flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-4 px-6 py-3 rounded-2xl bg-emerald-500 text-white shadow-2xl animate-in slide-in-from-top-10 duration-500">
        <Wifi size={20} />
        <span className="font-bold text-sm">Back Online!</span>
      </div>
    </div>
  );
}

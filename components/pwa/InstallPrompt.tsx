"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InstallPrompt() {
  const [isReady, setIsReady] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setIsReady(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsReady(false);
  };

  const handleClose = () => {
    setIsReady(false);
  };

  return (
    <AnimatePresence>
      {isReady && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-[400px] z-[100] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xl flex items-start gap-4"
        >
          <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-xl">
            <Download size={24} />
          </div>
          
          <div className="flex-1">
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Install BoardTAU App
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Add our app to your home screen for a faster, full-screen experience and offline access!
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleInstallClick}
                className="flex-1 bg-primary hover:bg-primary-dark text-white text-sm font-semibold py-2 rounded-lg transition-colors"
              >
                Install Now
              </button>
            </div>
          </div>

          <button 
            onClick={handleClose}
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
          >
            <X size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

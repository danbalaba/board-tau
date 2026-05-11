"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, CheckCircle2, Cpu, ShieldCheck } from "lucide-react";

interface UltimateLogoutOverlayProps {
  userName?: string | null;
}

const UltimateLogoutOverlay: React.FC<UltimateLogoutOverlayProps> = ({ userName }) => {
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setProgress(prev => (prev < 100 ? prev + 1 : 100));
    }, 250); // Slower, more deliberate progress for premium feel
    return () => {
      setMounted(false);
      clearInterval(interval);
    };
  }, []);

  if (!mounted) return null;

  const firstName = userName?.split(' ')[0] || 'User';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[2147483647] flex flex-col items-center justify-center overflow-hidden transition-colors duration-700 bg-[#F8FAF9] dark:bg-[#020817]"
      >
        {/* --- DYNAMIC MESH GRADIENT --- */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div 
            animate={{ 
              scale: [1, 1.4, 1],
              rotate: [0, 90, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[20%] -left-[20%] w-[80%] h-[80%] rounded-full blur-[160px] bg-primary/10 dark:bg-primary/20 transition-colors duration-1000"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.5, 1],
              rotate: [0, -90, 0]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 2 }}
            className="absolute -bottom-[20%] -right-[20%] w-[80%] h-[80%] rounded-full blur-[160px] bg-emerald-500/10 dark:bg-emerald-500/15 transition-colors duration-1000"
          />
          
          {/* Tech Grid */}
          <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.03]" 
               style={{ 
                 backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)', 
                 backgroundSize: '40px 40px' 
               }} 
          />
        </div>

        {/* --- CENTRAL CONTENT HUB --- */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex flex-col items-center"
        >
          {/* The Main Icon Card */}
          <div className="relative mb-12">
            {/* Pulsing Aura */}
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -inset-10 bg-primary/30 rounded-full blur-3xl"
            />
            
            <motion.div
              className="relative w-32 h-32 backdrop-blur-3xl rounded-[40px] border flex items-center justify-center group bg-white/60 dark:bg-white/10 border-black/5 dark:border-white/20 shadow-2xl transition-all duration-700"
            >
              <LogOut className="w-12 h-12 text-primary dark:text-white" />
              
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: "spring" }}
                className="absolute -bottom-1 -right-1"
              >
                <div className="bg-emerald-500 rounded-xl p-1.5 border-2 border-[#F8FAF9] dark:border-[#020817]">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Text Reveal */}
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="space-y-2">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900 dark:text-white">
                Board<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">TAU</span>
              </h2>
              <div className="flex items-center justify-center gap-2 text-gray-400 dark:text-white/40 text-[10px] font-bold uppercase tracking-[0.4em]">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                Safe Disconnect
              </div>
            </div>

            <div className="text-2xl md:text-3xl font-light text-gray-700 dark:text-white/80">
              See you soon, <span className="font-bold text-primary dark:text-white">{firstName}</span>
            </div>

            {/* --- THE CENTERED PROGRESS PILL --- */}
            <div className="mt-10 w-full max-w-[200px] flex flex-col items-center gap-3">
              <div className="flex items-center justify-between w-full px-1">
                 <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-white/20">
                    Progress
                 </span>
                 <span className="text-xs font-black text-gray-900 dark:text-white tabular-nums">
                    {progress}%
                 </span>
              </div>
              
              <div className="h-1.5 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden border border-black/5 dark:border-white/5 relative">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${progress}%` }}
                   className="h-full bg-gradient-to-r from-primary to-emerald-400 relative z-10"
                 />
                 {/* Glowing trail effect */}
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${progress}%` }}
                   className="absolute inset-y-0 left-0 bg-primary/30 blur-md z-0"
                 />
              </div>

              <motion.div 
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center gap-1.5"
              >
                 <Cpu className="w-3 h-3 text-emerald-500" />
                 <span className="text-[8px] font-bold text-emerald-600/80 dark:text-emerald-400/60 uppercase tracking-widest">
                    Cleaning Session Cache
                 </span>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Scanlines Overlay */}
        <div className="absolute inset-0 z-50 pointer-events-none opacity-20 dark:opacity-40 bg-[length:100%_4px,3px_100%] bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.02)_50%),linear-gradient(90deg,rgba(0,0,0,0.01),rgba(0,0,0,0.01),rgba(0,0,0,0.01))] dark:bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))]" />
      </motion.div>
    </AnimatePresence>
  );
};

export default UltimateLogoutOverlay;

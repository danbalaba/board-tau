"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Timer, RefreshCcw, Home, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const BlockedPage = () => {
  const router = useRouter();
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#050B18] flex items-center justify-center p-4 overflow-hidden relative">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-600/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-xl w-full bg-[#0A1224]/80 backdrop-blur-2xl border border-white/5 p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative z-10 text-center"
      >
        {/* Shield Icon with Pulse */}
        <div className="relative inline-block mb-8">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute inset-0 bg-rose-500 rounded-full blur-2xl"
          />
          <div className="relative bg-rose-500/10 border border-rose-500/20 p-6 rounded-3xl">
            <ShieldAlert className="w-12 h-12 text-rose-500" />
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
          Security <span className="text-rose-500">Threshold</span> Reached
        </h1>
        
        <p className="text-gray-400 text-lg mb-10 font-medium leading-relaxed">
          Our systems detected an unusual number of requests from your location. For your security, access has been temporarily restricted.
        </p>

        {/* Status Grid */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-white/5 border border-white/10 p-5 rounded-3xl flex flex-col items-center">
            <Timer className="w-5 h-5 text-blue-400 mb-2" />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Cooling Down</span>
            <span className="text-xl font-bold text-white tabular-nums">{countdown}s</span>
          </div>
          <div className="bg-white/5 border border-white/10 p-5 rounded-3xl flex flex-col items-center">
            <RefreshCcw className="w-5 h-5 text-green-400 mb-2" />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Auto Unlock</span>
            <span className="text-xl font-bold text-white">{countdown === 0 ? "Ready" : "Waiting"}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-4">
          <button
            onClick={() => router.refresh()}
            className="flex-1 bg-white text-black h-14 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-all active:scale-95"
          >
            <RefreshCcw className="w-4 h-4" />
            Try Refreshing
          </button>
          <Link 
            href="/"
            className="flex-1 bg-white/5 text-white border border-white/10 h-14 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
        </div>

        <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-center gap-6">
          <Link href="/legal/help" className="text-[11px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2">
            <MessageSquare className="w-3 h-3" />
            Support
          </Link>
          <div className="w-1 h-1 bg-white/10 rounded-full" />
          <span className="text-[11px] font-black text-gray-600 uppercase tracking-widest italic">
            Error Code: 429_RATE_LIMIT
          </span>
        </div>
      </motion.div>

      {/* Decorative Text */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[100px] font-black text-white/[0.02] select-none pointer-events-none whitespace-nowrap">
        BOARDTAU SECURITY PROTOCOL
      </div>
    </div>
  );
};

export default BlockedPage;

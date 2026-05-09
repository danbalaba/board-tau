"use client";

import React, { useEffect, useState } from "react";
import { WifiOff, Wifi, X } from "lucide-react";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { useRouter } from "next/navigation";

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

  if (!showBanner && isOnline) return null;

  // If offline, we show the full-screen overlay
  if (!isOnline) {
    return (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 animate-in fade-in duration-500">
        {/* Deep Glassmorphism Blur */}
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-2xl" />
        
        <div className="relative bg-[rgb(var(--surface-rgb))] max-w-md w-full p-10 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] border border-white/10 text-center animate-in zoom-in-95 duration-500">
          {/* Artistic Mascot Composition */}
          <div className="mb-14 mx-auto w-fit relative group">
             {/* Sharper Signal Glow */}
             <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 via-orange-500/20 to-primary/40 blur-[40px] rounded-full animate-pulse-slow opacity-60" />
             
             {/* Floating Particles (Smaller & Sharper) */}
             <div className="absolute inset-0 overflow-visible pointer-events-none">
                {[...Array(12)].map((_, i) => (
                  <div 
                    key={i}
                    className="absolute w-1 h-1 bg-primary/60 rounded-full animate-float-particle"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${i * 0.5}s`,
                      animationDuration: `${2 + Math.random() * 3}s`
                    }}
                  />
                ))}
             </div>

             <svg width="260" height="260" viewBox="0 0 240 240" fill="none" className="drop-shadow-[0_15px_30px_rgba(0,0,0,0.4)] animate-super-float">
                <defs>
                  <linearGradient id="houseGradient" x1="40" y1="40" x2="200" y2="200" gradientUnits="userSpaceOnUse">
                    <stop stopColor="rgb(var(--surface-rgb))" />
                    <stop offset="1" stopColor="rgb(var(--background-rgb))" />
                  </linearGradient>
                  <linearGradient id="roofGradient" x1="30" y1="40" x2="210" y2="110" gradientUnits="userSpaceOnUse">
                    <stop stopColor="rgb(var(--primary-color))" />
                    <stop offset="1" stopColor="#1e5146" />
                  </linearGradient>
                </defs>

                {/* Radiating Signal Waves (Clean Strokes) */}
                <g className="signal-waves">
                  <circle cx="210" cy="50" r="12" stroke="rgb(var(--primary-color))" strokeWidth="1.5" className="animate-signal-1" />
                  <circle cx="210" cy="50" r="28" stroke="rgb(var(--primary-color))" strokeWidth="1" className="animate-signal-2" />
                </g>

                {/* House Body (Crisp Lines) */}
                <path d="M40 100L120 40L200 100V180C200 191.046 191.046 200 180 200H60C48.9543 200 40 191.046 40 180V100Z" fill="url(#houseGradient)" stroke="currentColor" strokeWidth="2" opacity="0.8"/>
                <path d="M30 110L120 40L210 110" stroke="url(#roofGradient)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
                
                {/* Window Eye */}
                <circle cx="90" cy="120" r="16" fill="rgba(0,0,0,0.1)" stroke="currentColor" strokeWidth="1" opacity="0.2"/>
                <circle cx="90" cy="120" r="7" fill="currentColor" className="animate-blink" />
                
                {/* Door Mouth */}
                <path d="M115 170C115 175 145 175 145 170" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
                
                {/* Animated Antenna (High Contrast) */}
                <g className="animate-antenna-wiggle">
                  <path d="M180 80L210 50" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                  <circle cx="210" cy="50" r="6" fill="rgb(var(--primary-color))" className="animate-pulse" />
                </g>
                
                {/* Disconnected Cable */}
                <path d="M60 200C60 220 40 215 30 230" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5" />
                <rect x="15" y="222" width="16" height="10" rx="3" fill="currentColor" className="animate-plug-glow" />
             </svg>
          </div>

          <h1 className="text-6xl font-black bg-gradient-to-b from-orange-400 to-orange-600 bg-clip-text text-transparent mb-6 uppercase italic tracking-tighter drop-shadow-md">Ops!</h1>
          <h2 className="text-2xl font-bold mb-3 tracking-tight opacity-90">Lost in Space</h2>
          <p className="text-[rgb(var(--text-secondary))] mb-12 text-lg leading-relaxed px-6 max-w-sm mx-auto">
            Our signal has drifted into the void. We're working on bringing your boarding house back to earth.
          </p>

          <button 
            onClick={() => window.location.reload()}
            className="group relative w-full py-5 bg-primary hover:bg-primary-dark text-white rounded-[2rem] font-black text-xl tracking-wide transition-all active:scale-95 shadow-[0_20px_50px_-10px_rgba(47,125,109,0.4)] flex items-center justify-center gap-3 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <WifiOff size={24} className="relative z-10" />
            <span className="relative z-10">Reconnect System</span>
          </button>
        </div>

        <style jsx global>{`
          @keyframes super-float {
            0%, 100% { transform: translateY(0) rotate(-2deg) scale(1); }
            50% { transform: translateY(-30px) rotate(3deg) scale(1.05); }
          }
          @keyframes float-particle {
            0% { transform: translate(0, 0) scale(0); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translate(40px, -40px) scale(0); opacity: 0; }
          }
          @keyframes plug-glow {
            0%, 100% { fill: currentColor; opacity: 0.8; }
            50% { fill: #ef4444; opacity: 1; filter: blur(2px); }
          }
          .animate-super-float { animation: super-float 6s ease-in-out infinite; }
          .animate-float-particle { animation: float-particle linear infinite; }
          .animate-plug-glow { animation: plug-glow 2s ease-in-out infinite; }
          /* ... rest of previous animations ... */
          @keyframes signal-pulse {
            0% { transform: scale(0.5); opacity: 0; }
            50% { opacity: 0.5; }
            100% { transform: scale(2.5); opacity: 0; }
          }
          @keyframes antenna-wiggle {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(8deg); }
          }
          @keyframes blink {
            0%, 90%, 100% { transform: scaleY(1); }
            95% { transform: scaleY(0.1); }
          }
          .animate-signal-1 { animation: signal-pulse 2.5s infinite; transform-origin: 210px 50px; }
          .animate-signal-2 { animation: signal-pulse 2.5s infinite 1.2s; transform-origin: 210px 50px; }
          .animate-antenna-wiggle { animation: antenna-wiggle 4s ease-in-out infinite; transform-origin: 180px 80px; }
          .animate-blink { animation: blink 5s infinite; transform-origin: 90px 120px; }
          .animate-pulse-slow { animation: pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        `}</style>
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

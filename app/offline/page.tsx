"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { RefreshCcw, ArrowLeft } from "lucide-react";

export default function OfflinePage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[rgb(var(--background-rgb))] text-[rgb(var(--foreground-rgb))] p-6 text-center transition-colors duration-300">
      <div className="max-w-md w-full animate-in fade-in zoom-in duration-700">
        {/* Custom SVG Mascot (Transparent, No Background) */}
        <div className="relative mb-12 mx-auto w-fit animate-float">
          <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full -z-10" />
          <svg
            width="240"
            height="240"
            viewBox="0 0 240 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-2xl"
          >
            {/* House Body */}
            <path d="M40 100L120 40L200 100V180C200 191.046 191.046 200 180 200H60C48.9543 200 40 191.046 40 180V100Z" fill="rgb(var(--surface-rgb))" stroke="currentColor" strokeWidth="4"/>
            <path d="M30 110L120 40L210 110" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
            
            {/* Window Eye */}
            <circle cx="90" cy="120" r="15" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="2"/>
            <circle cx="90" cy="120" r="5" fill="currentColor"/>
            
            {/* Door Mouth */}
            <rect x="115" y="150" width="30" height="40" rx="4" stroke="currentColor" strokeWidth="3" fill="currentColor" opacity="0.05"/>
            <circle cx="138" cy="170" r="2" fill="currentColor"/>
            
            {/* Antenna */}
            <path d="M180 80L210 50" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="210" cy="50" r="4" fill="currentColor"/>
            <path d="M200 65C205 60 215 60 220 65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
            
            {/* Disconnected Plug */}
            <path d="M60 200V230H30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none"/>
            <rect x="15" y="222" width="15" height="15" rx="2" fill="currentColor"/>
            <path d="M10 226V233" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M5 226V233" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Text Content */}
        <div className="space-y-4 mb-10">
          <h1 className="text-6xl font-black text-orange-500 tracking-tighter uppercase italic">
            Ops!
          </h1>
          <h2 className="text-2xl font-bold font-outfit">
            Something went wrong
          </h2>
          <p className="text-[rgb(var(--text-secondary))] text-lg leading-relaxed max-w-[300px] mx-auto">
            Try refreshing the page or checking your internet connection.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 w-full max-w-[280px] mx-auto">
          <button
            onClick={handleRefresh}
            className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-primary/20"
          >
            <RefreshCcw size={20} />
            Refresh page
          </button>
          
          <Link
            href="/"
            className="flex items-center justify-center gap-2 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--foreground-rgb))] transition-colors font-medium"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </div>
      
      {/* Aesthetic Footer */}
      <div className="fixed bottom-8 text-[rgb(var(--text-light))] text-sm font-medium tracking-widest uppercase opacity-50">
        BoardTAU • Offline Mode
      </div>

      <style jsx global>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

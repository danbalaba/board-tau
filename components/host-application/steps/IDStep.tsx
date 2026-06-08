"use client";

import React from "react";
import Webcam from "react-webcam";
import { motion, AnimatePresence } from "framer-motion";
import SafeImage from "../../common/SafeImage";
import { 
  CreditCard, 
  RefreshCcw, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Scan,
  Maximize,
  Info,
  ShieldAlert
} from "lucide-react";
import { FaCamera, FaTimes } from "react-icons/fa";

interface IDStepProps {
  capturedID: string | null;
  setCapturedID: (val: string | null) => void;
  webcamRef: React.RefObject<Webcam>;
  facingMode: "user" | "environment";
  isIDAligned: boolean;
  setIsIDAligned: (val: boolean) => void;
  isProcessing: boolean;
  isFlashActive: boolean;
  toggleCamera: () => void;
  handleCaptureID: () => void;
  isPhoneDetected: boolean;
}

const IDStep: React.FC<IDStepProps> = ({
  capturedID,
  setCapturedID,
  webcamRef,
  facingMode,
  isIDAligned,
  isProcessing,
  isFlashActive,
  toggleCamera,
  handleCaptureID,
  isPhoneDetected,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="text-center">
        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-1">ID Document Scan</h3>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest opacity-70">Capture your primary government ID</p>
      </div>

      <div className="relative mx-auto w-full aspect-[1.6/1] max-w-[500px] rounded-3xl overflow-hidden border-4 border-gray-100 dark:border-gray-800 bg-black shadow-2xl group ring-4 ring-white/5">
        {!capturedID ? (
          <>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode, aspectRatio: 1.586, width: 640, height: 480 }}
              className="w-full h-full object-cover grayscale-[0.1]"
            />
            
            {/* Professional Document Mask */}
            <div className="absolute inset-0 pointer-events-none">
              <svg viewBox="0 0 160 100" className={`w-full h-full transition-colors duration-500 ${isIDAligned ? 'text-blue-500/5' : 'text-black/60'} fill-current`}>
                <defs>
                  <mask id="cardMask">
                    <rect width="160" height="100" fill="white" />
                    <rect x="8" y="8" width="144" height="84" rx="4" fill="black" />
                  </mask>
                </defs>
                <rect width="160" height="100" mask="url(#cardMask)" />
                
                <motion.rect 
                  x="8" y="8" width="144" height="84" rx="4"
                  fill="none" 
                  stroke={isIDAligned ? "#3b82f6" : "rgba(255,255,255,0.4)"} 
                  strokeWidth="1.5" 
                  strokeDasharray={isIDAligned ? "none" : "6 4"}
                  animate={isIDAligned ? { scale: [1, 1.02, 1] } : { strokeDashoffset: [0, -20] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />

                {!isProcessing && (
                  <motion.line 
                    x1="10" y1="0" x2="150" y2="0"
                    stroke="#3b82f6"
                    strokeWidth="1"
                    initial={{ y: 0, opacity: 0 }}
                    animate={{ 
                      y: [15, 85, 15],
                      opacity: [0, 1, 0]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                  />
                )}
              </svg>
            </div>

            {/* Status Indicator */}
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
               <span className="text-[8px] font-bold text-white uppercase tracking-widest">AI Scanner Active</span>
            </div>

            {/* Top-Middle Notification System */}
            <div className="absolute top-0 left-0 right-0 z-50 pointer-events-none flex justify-center">
              <AnimatePresence mode="wait">
                {isPhoneDetected ? (
                  <motion.div 
                    key="phone-alert"
                    initial={{ y: -60, opacity: 0 }}
                    animate={{ y: 12, opacity: 1 }}
                    exit={{ y: -60, opacity: 0 }}
                    className="bg-rose-600/90 backdrop-blur-xl text-white px-6 py-2.5 rounded-2xl border border-rose-400/30 flex items-center justify-center gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.3)] min-w-[250px]"
                  >
                     <ShieldAlert className="w-4 h-4 animate-pulse" />
                     <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Physical Presence Required</span>
                        <span className="text-[8px] opacity-80 font-medium whitespace-nowrap">Digital screens or photos detected</span>
                     </div>
                  </motion.div>
                ) : isIDAligned && !isProcessing ? (
                  <motion.div 
                    key="id-aligned"
                    initial={{ y: -60, opacity: 0 }}
                    animate={{ y: 12, opacity: 1 }}
                    exit={{ y: -60, opacity: 0 }}
                    className="bg-blue-600/90 backdrop-blur-xl text-white px-6 py-2.5 rounded-2xl border border-blue-400/30 flex items-center justify-center gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.3)] min-w-[200px]"
                  >
                     <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-center">Ready to Scan</span>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            {/* Flash Effect */}
            <AnimatePresence>
              {isFlashActive && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white z-50" />
              )}
            </AnimatePresence>

            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/40 backdrop-blur-sm">
                 <div className="relative">
                    <motion.div 
                      animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 bg-blue-500/30 rounded-full"
                    />
                    <div className="bg-blue-600 p-4 rounded-full shadow-2xl relative z-10">
                       <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                 </div>
              </div>
            )}
          </>
        ) : (
          <SafeImage src={capturedID} alt="Captured ID" />
        )}
      </div>

      <div className="flex flex-col gap-4">
        {!capturedID ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-6">
              <button 
                onClick={toggleCamera}
                className="p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <RefreshCcw size={20} />
              </button>
              
              <button
                onClick={handleCaptureID}
                disabled={isProcessing || isPhoneDetected}
                className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all ${
                  isIDAligned && !isPhoneDetected
                    ? "border-primary bg-primary text-white scale-110 shadow-xl shadow-primary/30" 
                    : "border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed"
                }`}
              >
                {isProcessing ? <Loader2 className="animate-spin" /> : <FaCamera size={32} />}
              </button>

              <div className="w-12 h-12" />
            </div>

            <div className="flex justify-center">
               <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${
                 isIDAligned ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
               }`}>
                 {isIDAligned ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                 {isIDAligned ? "ID Detected" : "Align ID inside frame"}
               </div>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setCapturedID(null)}
            className="flex items-center justify-center gap-2 w-full p-4 bg-rose-50 dark:bg-rose-900/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/20 transition-all border border-rose-100 dark:border-rose-900/20 shadow-sm shadow-rose-500/5"
          >
            <RotateCcw size={16} /> Retake ID Scan
          </button>
        )}
      </div>

      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 flex gap-3">
        <Info size={16} className="text-gray-400 shrink-0 mt-0.5" />
        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight leading-relaxed">
          Ensure all 4 corners of the ID are visible and text is readable. Avoid glare from lights.
        </p>
      </div>
    </div>
  );
};

export default IDStep;

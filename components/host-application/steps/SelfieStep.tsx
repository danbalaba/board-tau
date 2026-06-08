"use client";

import React from "react";
import Webcam from "react-webcam";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Camera, 
  RefreshCcw, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Eye
} from "lucide-react";
import { FaCamera, FaTimes } from "react-icons/fa";
import SafeImage from "@/components/common/SafeImage";

interface SelfieStepProps {
  capturedSelfie: string | null;
  setCapturedSelfie: (val: string | null) => void;
  webcamRef: React.RefObject<Webcam>;
  facingMode: "user" | "environment";
  isFaceAligned: boolean;
  hasUserBlinked: boolean;
  setIsFaceAligned: (val: boolean) => void;
  isProcessing: boolean;
  isFlashActive: boolean;
  toggleCamera: () => void;
  handleCaptureSelfie: () => void;
}

const SelfieStep: React.FC<SelfieStepProps> = ({
  capturedSelfie,
  setCapturedSelfie,
  webcamRef,
  facingMode,
  isFaceAligned,
  hasUserBlinked,
  setIsFaceAligned,
  isProcessing,
  isFlashActive,
  toggleCamera,
  handleCaptureSelfie,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="text-center">
        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-1">Live Face Scan</h3>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest opacity-70">Prove your identity with a biometric selfie</p>
      </div>

      <div className="relative mx-auto aspect-[3/4] max-w-[320px] rounded-[3rem] overflow-hidden border-4 border-gray-100 dark:border-gray-800 bg-black shadow-2xl group ring-4 ring-white/5">
        {!capturedSelfie ? (
          <>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode, width: 640, height: 480 }}
              className="w-full h-full object-cover grayscale-[0.2]"
            />
            
            {/* Professional Biometric Oval Mask */}
            <div className="absolute inset-0 pointer-events-none">
              <svg viewBox="0 0 100 133" className={`w-full h-full transition-colors duration-500 ${isFaceAligned ? 'text-primary/10' : 'text-black/60'} fill-current`}>
                <defs>
                  <mask id="faceMask">
                    <rect width="100" height="133" fill="white" />
                    <ellipse cx="50" cy="55" rx="30" ry="42" fill="black" />
                  </mask>
                </defs>
                <rect width="100" height="133" mask="url(#faceMask)" />

                <motion.ellipse
                  cx="50" cy="55" rx="30" ry="42"
                  fill="none"
                  stroke={isFaceAligned ? "#10b981" : "rgba(255,255,255,0.3)"}
                  strokeWidth="1"
                  strokeDasharray="4 2"
                  animate={{ strokeDashoffset: [0, 10] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />

                {!isProcessing && (
                  <motion.line
                    x1="20" y1="20" x2="80" y2="20"
                    stroke="#10b981"
                    strokeWidth="0.5"
                    initial={{ y: 0, opacity: 0 }}
                    animate={{
                      y: [30, 90, 30],
                      opacity: [0, 0.6, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
              </svg>
            </div>

            {/* Top-Middle Notification System */}
            <div className="absolute top-0 left-0 right-0 z-50 pointer-events-none flex justify-center">
              <AnimatePresence mode="wait">
                {isFaceAligned && hasUserBlinked && !isProcessing ? (
                  <motion.div 
                    key="face-centered"
                    initial={{ y: -60, opacity: 0 }}
                    animate={{ y: 12, opacity: 1 }}
                    exit={{ y: -60, opacity: 0 }}
                    className="bg-emerald-600/90 backdrop-blur-xl text-white px-6 py-2.5 rounded-2xl border border-emerald-400/30 flex items-center justify-center gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.3)] min-w-[200px]"
                  >
                     <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                     <span className="text-[10px] font-black uppercase tracking-[0.2em]">Liveness Confirmed ✓</span>
                  </motion.div>
                ) : isFaceAligned && !hasUserBlinked && !isProcessing ? (
                  <motion.div
                    key="blink-prompt"
                    initial={{ y: -60, opacity: 0 }}
                    animate={{ y: 12, opacity: 1 }}
                    exit={{ y: -60, opacity: 0 }}
                    className="bg-amber-500/90 backdrop-blur-xl text-white px-6 py-2.5 rounded-2xl border border-amber-400/30 flex items-center justify-center gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.3)] min-w-[200px]"
                  >
                    <motion.span
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="flex items-center justify-center"
                    >
                      <Eye size={20} className="text-white" />
                    </motion.span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Please Blink to Continue</span>
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
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-primary/30 rounded-full"
                    />
                    <div className="bg-primary p-4 rounded-full shadow-2xl relative z-10">
                       <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                 </div>
              </div>
            )}
          </>
        ) : (
          <SafeImage src={capturedSelfie} alt="Captured" />
        )}
      </div>

      <div className="flex flex-col gap-4">
        {!capturedSelfie ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-6">
              <button 
                onClick={toggleCamera}
                className="p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <RefreshCcw size={20} />
              </button>
              
              <button
                onClick={handleCaptureSelfie}
                disabled={isProcessing || !hasUserBlinked}
                className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all ${
                  isFaceAligned && hasUserBlinked 
                    ? "border-primary bg-primary text-white scale-110 shadow-xl shadow-primary/30" 
                    : "border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed"
                }`}
              >
                {isProcessing ? <Loader2 className="animate-spin" /> : <Camera size={32} />}
              </button>

              <div className="w-12 h-12" /> {/* Placeholder for balance */}
            </div>

            <div className="flex justify-center">
               <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${
                 isFaceAligned ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
               }`}>
                 {isFaceAligned ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                 {isFaceAligned ? "Face Aligned" : "Position Face in Oval"}
               </div>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setCapturedSelfie(null)}
            className="flex items-center justify-center gap-2 w-full p-4 bg-rose-50 dark:bg-rose-900/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/20 transition-all border border-rose-100 dark:border-rose-900/20 shadow-sm shadow-rose-500/5"
          >
            <RotateCcw size={16} /> Retake Photo
          </button>
        )}
      </div>
    </div>
  );
};

export default SelfieStep;

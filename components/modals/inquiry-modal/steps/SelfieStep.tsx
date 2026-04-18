import React from "react";
import Webcam from "react-webcam";
import { motion, AnimatePresence } from "framer-motion";
import { User, RefreshCcw, Loader2 } from "lucide-react";
import { FaCamera, FaTimes } from "react-icons/fa";

interface SelfieStepProps {
  capturedSelfie: string | null;
  setCapturedSelfie: (val: string | null) => void;
  webcamRef: React.RefObject<Webcam | null>;
  facingMode: "user" | "environment";
  isFaceAligned: boolean;
  setIsFaceAligned: (val: boolean) => void;
  isProcessing: boolean;
  isFlashActive: boolean;
  toggleCamera: () => void;
  handleCaptureSelfie: () => void;
}

const SelfieStep: React.FC<SelfieStepProps> = ({
  capturedSelfie, setCapturedSelfie,
  webcamRef, facingMode,
  isFaceAligned, setIsFaceAligned,
  isProcessing, isFlashActive,
  toggleCamera, handleCaptureSelfie
}) => {
  return (
    <div className="space-y-6">
       <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <User className="text-primary" size={20} />
            Step 1: Capture Your Selfie
          </h3>
          <p className="text-xs text-gray-500">Position your face within the oval and look straight at the camera.</p>
       </div>

       <div className="relative aspect-[3/4] max-w-[320px] mx-auto rounded-[2.5rem] overflow-hidden shadow-2xl bg-black group transition-all duration-300 ring-4 ring-white/5">
          {!capturedSelfie ? (
            <>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: facingMode }}
                className="w-full h-full object-cover grayscale-[0.2]"
              />

              {/* Professional Biometric Mask */}
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
                  {isFaceAligned && !isProcessing ? (
                    <motion.div 
                      key="face-centered"
                      initial={{ y: -60, opacity: 0 }}
                      animate={{ y: 12, opacity: 1 }}
                      exit={{ y: -60, opacity: 0 }}
                      className="bg-emerald-600/90 backdrop-blur-xl text-white px-6 py-2.5 rounded-2xl border border-emerald-400/30 flex items-center justify-center gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.3)] min-w-[200px]"
                    >
                       <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                       <span className="text-[10px] font-black uppercase tracking-[0.2em]">Face Aligned & Centered</span>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              <button
                type="button"
                onClick={toggleCamera}
                className="absolute top-6 left-6 bg-white/10 backdrop-blur-xl text-white p-3 rounded-full hover:bg-white/20 transition-all border border-white/20"
                title="Switch Camera"
              >
                <RefreshCcw size={18} className={facingMode === 'environment' ? 'rotate-180 transition-transform' : ''} />
              </button>

              <AnimatePresence>
                {isFlashActive && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white z-50"
                  />
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

              <div className="absolute bottom-8 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <button
                  type="button"
                  onClick={handleCaptureSelfie}
                  disabled={isProcessing}
                  className={`bg-white text-gray-900 px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-3 hover:bg-primary hover:text-white transition-all transform hover:scale-110 active:scale-95 border-4 border-white/10 ${isProcessing ? 'opacity-0 scale-50' : ''}`}
                 >
                   <FaCamera size={16} />
                   Capture Selfie
                 </button>
              </div>
            </>
          ) : (
            <div className="relative w-full h-full">
              <img src={capturedSelfie} className="w-full h-full object-cover" alt="Captured Selfie" />
              <button
                type="button"
                onClick={() => {
                  setCapturedSelfie(null);
                  setIsFaceAligned(false);
                }}
                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-red-500 transition-colors"
              >
                <FaTimes />
              </button>
              <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                 <motion.span
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="bg-emerald-500/90 backdrop-blur-md text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl border border-white/20"
                 >
                   Verified Biometric
                 </motion.span>
              </div>
            </div>
          )}
       </div>
    </div>
  );
};

export default SelfieStep;

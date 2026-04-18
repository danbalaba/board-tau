import React from "react";
import Webcam from "react-webcam";
import { motion, AnimatePresence } from "framer-motion";
import { FaIdCard, FaCamera, FaTimes } from "react-icons/fa";
import { RefreshCcw, ShieldAlert, Loader2 } from "lucide-react";

interface IDStepProps {
  capturedID: string | null;
  setCapturedID: (val: string | null) => void;
  webcamRef: React.RefObject<Webcam | null>;
  facingMode: "user" | "environment";
  isIDAligned: boolean;
  setIsIDAligned: (val: boolean) => void;
  isPhoneDetected: boolean;
  setIsPhoneDetected: (val: boolean) => void;
  isProcessing: boolean;
  toggleCamera: () => void;
  handleCaptureID: () => void;
}

const IDStep: React.FC<IDStepProps> = ({
  capturedID, setCapturedID,
  webcamRef, facingMode,
  isIDAligned, setIsIDAligned,
  isPhoneDetected, setIsPhoneDetected,
  isProcessing, toggleCamera, handleCaptureID
}) => {
  return (
    <div className="space-y-6">
       <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FaIdCard className="text-primary" />
            Step 2: Capture Your ID Card
          </h3>
          <p className="text-xs text-gray-500">Align your ID card with the rectangle. Ensure text is clear and readable.</p>
       </div>

       <div className="relative aspect-[1.6/1] max-w-[500px] mx-auto rounded-3xl overflow-hidden shadow-2xl bg-black group transition-all duration-300 ring-4 ring-white/5">
          {!capturedID ? (
            <>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: facingMode }}
                className="w-full h-full object-cover grayscale-[0.1]"
              />

              {/* Professional Document Mask - EXPANED for Passport Support */}
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
                          <span className="text-[8px] opacity-80 font-medium">Digital screens or photos detected</span>
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
                       <span className="text-[10px] font-black uppercase tracking-[0.2em]">Document Aligned & Detected</span>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              <button 
                type="button"
                onClick={toggleCamera}
                className="absolute top-4 left-4 bg-white/10 backdrop-blur-xl text-white p-2.5 rounded-full hover:bg-white/20 transition-all border border-white/20"
                title="Switch Camera"
              >
                <RefreshCcw size={18} className={facingMode === 'environment' ? 'rotate-180 transition-transform' : ''} />
              </button>

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

              <div className="absolute bottom-6 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <button 
                  type="button"
                  onClick={handleCaptureID}
                  disabled={isProcessing}
                  className={`bg-white text-gray-900 px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-3 hover:bg-blue-600 hover:text-white transition-all transform hover:scale-105 active:scale-95 border-4 border-white/10 ${isProcessing ? 'opacity-0 scale-50' : ''}`}
                 >
                   <FaCamera size={14} />
                   Scan ID Card
                 </button>
              </div>
            </>
          ) : (
            <div className="relative w-full h-full">
              <img src={capturedID} className="w-full h-full object-cover" alt="Captured ID" />
              <button 
                type="button"
                onClick={() => {
                  setCapturedID(null);
                  setIsIDAligned(false);
                  setIsPhoneDetected(false);
                }}
                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-red-500 transition-colors"
              >
                <FaTimes />
              </button>
              <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                 <motion.span 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl border border-white/20"
                 >
                   Verified ID Document
                 </motion.span>
              </div>
            </div>
          )}
       </div>
    </div>
  );
};

export default IDStep;

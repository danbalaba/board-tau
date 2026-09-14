"use client";

import React from "react";
import Webcam from "react-webcam";
import { motion, AnimatePresence } from "framer-motion";
import { User, RefreshCcw, Loader2, Eye } from "lucide-react";
import { FaCamera, FaTimes } from "react-icons/fa";
import { cn } from "@/utils/helper";
import { sanitizeImgUrl } from "@/lib/security/sanitize";
import SafeImage from "@/components/common/SafeImage";

interface SelfieStepProps {
  capturedSelfie: string | null;
  setCapturedSelfie: (val: string | null) => void;
  webcamRef: React.RefObject<Webcam>;
  facingMode: "user" | "environment";
  isFaceAligned: boolean;
  livenessStatus: 'idle' | 'passed';
  activeChallenge: 'blink' | 'smile' | 'turnLeft' | 'turnRight' | 'openMouth' | 'raiseEyebrows';
  setIsFaceAligned: (val: boolean) => void;
  isProcessing: boolean;
  isEngineReady: boolean;
  isFlashActive: boolean;
  toggleCamera: () => void;
  handleCaptureSelfie: () => void;
  hideHeader?: boolean;
}

const SelfieStep: React.FC<SelfieStepProps> = ({
  capturedSelfie,
  setCapturedSelfie,
  webcamRef,
  facingMode,
  isFaceAligned,
  livenessStatus,
  activeChallenge,
  setIsFaceAligned,
  isProcessing,
  isEngineReady,
  isFlashActive,
  toggleCamera,
  handleCaptureSelfie,
  hideHeader = false,
}) => {
  const selfieImgRef = React.useRef<HTMLImageElement>(null);
  const [videoDevices, setVideoDevices] = React.useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    const getDevices = async () => {
      try {
        if (typeof window !== 'undefined' && navigator?.mediaDevices?.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoInputs = devices.filter((device) => device.kind === "videoinput");
          if (isMounted && videoInputs.length > 0) {
            setVideoDevices(videoInputs);
          }
        }
      } catch (err) {
        console.error("Error enumerating video devices:", err);
      }
    };
    getDevices();
    return () => { isMounted = false; };
  }, []);

  const handleToggleCamera = () => {
    if (videoDevices.length > 1) {
      const currentIndex = videoDevices.findIndex((d) => d.deviceId === selectedDeviceId);
      const nextIndex = (currentIndex + 1) % videoDevices.length;
      const nextDevice = videoDevices[nextIndex];
      if (nextDevice && nextDevice.deviceId) {
        setSelectedDeviceId(nextDevice.deviceId);
        return;
      }
    }
    toggleCamera();
  };

  React.useEffect(() => {
    if (selfieImgRef.current) {
      selfieImgRef.current.src = sanitizeImgUrl(capturedSelfie) ?? '';
    }
  }, [capturedSelfie]);

  return (
    <div className="space-y-3.5 animate-in fade-in duration-500">
      {!hideHeader && (
        <div className="text-center space-y-0.5">
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center justify-center gap-2">
            <User className="text-primary" size={20} />
            <span>Live Face Scan</span>
          </h3>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Position your face within the oval and follow the prompts
          </p>
        </div>
      )}

      <div className={cn(
        "relative aspect-[3/4] mx-auto rounded-[2.5rem] overflow-hidden shadow-2xl bg-black group transition-all duration-300 ring-4 ring-white/5 border-4 border-slate-100 dark:border-slate-800",
        "w-full max-w-[350px] sm:max-w-[380px] max-h-[430px] sm:max-h-[460px]"
      )}>
        {!capturedSelfie ? (
          <>
            <Webcam
              key={selectedDeviceId || facingMode}
              audio={false}
              ref={webcamRef as any}
              screenshotFormat="image/jpeg"
              videoConstraints={
                selectedDeviceId
                  ? { deviceId: { exact: selectedDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
                  : { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }
              }
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
                  stroke={isFaceAligned ? "#2f7d6d" : "rgba(255,255,255,0.3)"}
                  strokeWidth="1"
                  strokeDasharray="4 2"
                  animate={{ strokeDashoffset: [0, 10] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />

                {!isProcessing && (
                  <motion.line
                    x1="20" y1="20" x2="80" y2="20"
                    stroke="#2f7d6d"
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
                {isFaceAligned && livenessStatus === 'passed' && !isProcessing ? (
                  <motion.div
                    key="face-centered"
                    initial={{ y: -60, opacity: 0 }}
                    animate={{ y: 12, opacity: 1 }}
                    exit={{ y: -60, opacity: 0 }}
                    className="bg-primary/90 backdrop-blur-xl text-white px-6 py-2.5 rounded-2xl border border-primary/30 flex items-center justify-center gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.3)] min-w-[200px]"
                  >
                    <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Liveness Confirmed ✓</span>
                  </motion.div>
                ) : isFaceAligned && livenessStatus === 'idle' && !isProcessing ? (
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
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                      {activeChallenge === 'blink' && 'Please Blink to Continue'}
                      {activeChallenge === 'smile' && 'Please Smile to Continue'}
                      {activeChallenge === 'turnLeft' && 'Turn Head Left to Continue'}
                      {activeChallenge === 'turnRight' && 'Turn Head Right to Continue'}
                      {activeChallenge === 'openMouth' && 'Open Mouth Slightly to Continue'}
                      {activeChallenge === 'raiseEyebrows' && 'Raise Eyebrows to Continue'}
                    </span>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            {/* Switch Camera Button */}
            <button
              type="button"
              onClick={handleToggleCamera}
              className="absolute top-6 left-6 bg-white/10 backdrop-blur-xl text-white p-3 rounded-full hover:bg-white/20 transition-all border border-white/20 z-40 cursor-pointer"
              title="Switch Camera"
            >
              <RefreshCcw size={18} className={facingMode === 'environment' || Boolean(selectedDeviceId) ? 'rotate-180 transition-transform' : ''} />
            </button>

            {/* Flash Overlay */}
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

            {/* Engine Initializing Overlay */}
            {!isEngineReady && !isProcessing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-[60] bg-black/70 backdrop-blur-md gap-3">
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="w-14 h-14 rounded-full border-4 border-white/10 border-t-primary"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  </div>
                </div>
                <span className="text-white text-[10px] font-black uppercase tracking-widest animate-pulse">Initializing AI...</span>
                <span className="text-white/50 text-[9px] tracking-wide">Preparing biometric scanner</span>
              </div>
            )}

            {/* Processing Spinner */}
            {isProcessing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-[60] bg-black/60 backdrop-blur-md gap-4">
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
                <span className="text-white text-[10px] font-black uppercase tracking-widest animate-pulse">Verifying...</span>
              </div>
            )}

            {/* Camera Overlay Shutter Capture Button (Matches InquiryModal SelfieStep) */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center transition-all duration-300 z-40">
              <button
                type="button"
                onClick={handleCaptureSelfie}
                disabled={isProcessing || !isEngineReady || !isFaceAligned || livenessStatus !== 'passed'}
                className={cn(
                  "px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-2 transition-all transform active:scale-95 border-2 border-white/20 select-none cursor-pointer",
                  isProcessing ? "opacity-0 scale-50" :
                  (isFaceAligned && livenessStatus === 'passed')
                    ? "bg-primary text-white hover:bg-primary-hover hover:scale-105 shadow-primary/30"
                    : "bg-black/50 backdrop-blur-md text-white/50 cursor-not-allowed scale-95 border-white/10"
                )}
              >
                <FaCamera size={13} />
                <span>
                  {isFaceAligned && livenessStatus === 'passed' 
                    ? 'Capture Selfie Now' 
                    : isFaceAligned && livenessStatus === 'idle'
                    ? 'Follow Prompt'
                    : 'Follow Prompt to Capture'}
                </span>
              </button>
            </div>
          </>
        ) : (
          <div className="relative w-full h-full">
            <SafeImage 
              src={sanitizeImgUrl(capturedSelfie)}
              alt="Captured Selfie" 
              fill
              className="object-cover" 
            />
            <button
              type="button"
              onClick={() => {
                setCapturedSelfie(null);
                setIsFaceAligned(false);
              }}
              className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-red-500 transition-colors z-30 cursor-pointer"
            >
              <FaTimes />
            </button>
            <div className="absolute bottom-6 left-0 right-0 flex justify-center z-30">
              <motion.span
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-primary/90 backdrop-blur-md text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl border border-white/20"
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

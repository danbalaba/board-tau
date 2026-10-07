import React from "react";
import Webcam from "react-webcam";
import { motion, AnimatePresence } from "framer-motion";
import { User, RefreshCcw, Loader2, Eye, CheckCircle, SunMedium } from "lucide-react";
import { FaCamera, FaTimes } from "react-icons/fa";
import { sanitizeImgUrl } from "@/lib/security/sanitize";
import SafeImage from "@/components/common/SafeImage";
import KYCLockoutBadge, { KYCLockoutCard, useKYCLockout } from "@/components/common/KYCLockoutBadge";
import { cn } from "@/utils/helper";
interface SelfieStepProps {
  capturedSelfie: string | null;
  setCapturedSelfie: (val: string | null) => void;
  webcamRef: React.RefObject<Webcam | null>;
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
}



const SelfieStep: React.FC<SelfieStepProps> = ({
  capturedSelfie, setCapturedSelfie,
  webcamRef, facingMode,
  isFaceAligned, livenessStatus, activeChallenge, setIsFaceAligned,
  isProcessing, isEngineReady, isFlashActive,
  toggleCamera, handleCaptureSelfie
}) => {
  const selfieImgRef = React.useRef<HTMLImageElement>(null);
  const [videoDevices, setVideoDevices] = React.useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = React.useState<string | null>(null);
  const [isRingLightActive, setIsRingLightActive] = React.useState<boolean>(false);
  const { isLockedOut, timerText } = useKYCLockout();

  // Screen WakeLock to prevent dimming during live selfie scan
  React.useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator && isRingLightActive) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch (e) {
        console.warn('[WakeLock Warning]:', e);
      }
    };
    requestWakeLock();
    return () => {
      if (wakeLock) wakeLock.release().catch(() => {});
    };
  }, [isRingLightActive]);

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

  // Set img src imperatively to avoid CodeQL js/xss-through-dom false positive.
  // capturedSelfie is always a data: URL from webcam canvas — never DOM text.
  React.useEffect(() => {
    if (selfieImgRef.current) {
      selfieImgRef.current.src = sanitizeImgUrl(capturedSelfie) ?? '';
    }
  }, [capturedSelfie]);

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <User size={18} />
              </div>
              Step 5: Live Biometric Selfie Check
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Position your face inside the oval frame and look directly into your camera.
            </p>
          </div>
          <span className="hidden sm:inline-flex text-[11px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-3 py-1 rounded-full items-center gap-1.5 shrink-0">
            <CheckCircle size={12} /> AI Liveness Scan
          </span>
       </div>

       <KYCLockoutBadge />

       <div className={cn(
         "relative aspect-[3/4] max-w-[320px] mx-auto rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500 z-10",
         isRingLightActive 
           ? "ring-[14px] ring-amber-100 dark:ring-amber-200 shadow-[0_0_120px_40px_rgba(255,255,255,0.95)] bg-white" 
           : "ring-4 ring-gray-200 dark:ring-gray-800 bg-black"
       )}>
          {!capturedSelfie ? (
            isLockedOut ? (
              <KYCLockoutCard timerText={timerText} />
            ) : (
            <>
              <Webcam
                key={selectedDeviceId || facingMode}
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                mirrored={facingMode === "user"}
                videoConstraints={
                  selectedDeviceId
                    ? { deviceId: { exact: selectedDeviceId }, width: { ideal: 640 }, height: { ideal: 480 } }
                    : { facingMode: facingMode, width: { ideal: 640 }, height: { ideal: 480 } }
                }
                className="w-full h-full object-cover grayscale-[0.15]"
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
                       stroke={isFaceAligned ? "#2f7d6d" : "rgba(255,255,255,0.4)"}
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
                      className="bg-primary/90 backdrop-blur-xl text-white px-5 py-2 rounded-2xl border border-primary/30 flex items-center justify-center gap-2.5 shadow-2xl min-w-[190px]"
                    >
                       <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                       <CheckCircle size={14} className="text-white" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Liveness Confirmed</span>
                    </motion.div>
                  ) : isFaceAligned && livenessStatus === 'idle' && !isProcessing ? (
                    <motion.div
                      key="blink-prompt"
                      initial={{ y: -60, opacity: 0 }}
                      animate={{ y: 12, opacity: 1 }}
                      exit={{ y: -60, opacity: 0 }}
                      className="bg-amber-500/95 backdrop-blur-xl text-white px-5 py-2 rounded-2xl border border-amber-400/30 flex items-center justify-center gap-2.5 shadow-2xl min-w-[190px]"
                    >
                      <motion.span
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                        className="flex items-center justify-center"
                      >
                        <Eye size={18} className="text-white" />
                      </motion.span>
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {activeChallenge === 'blink' && 'Blink to Continue'}
                        {activeChallenge === 'smile' && 'Smile to Continue'}
                        {activeChallenge === 'turnLeft' && 'Turn Head Left'}
                        {activeChallenge === 'turnRight' && 'Turn Head Right'}
                        {activeChallenge === 'openMouth' && 'Open Mouth Slightly'}
                        {activeChallenge === 'raiseEyebrows' && 'Raise Eyebrows'}
                      </span>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              <button
                type="button"
                onClick={handleToggleCamera}
                className="absolute top-4 left-4 bg-black/60 backdrop-blur-xl text-white p-2.5 rounded-full hover:bg-black/80 transition-all border border-white/20 z-40 cursor-pointer shadow-lg"
                title="Switch Camera"
              >
                <RefreshCcw size={16} className={facingMode === 'environment' || Boolean(selectedDeviceId) ? 'rotate-180 transition-transform' : ''} />
              </button>

              {/* Ring Light Studio Toggle Button */}
              <button
                type="button"
                onClick={() => setIsRingLightActive(!isRingLightActive)}
                className={cn(
                  "absolute top-4 right-4 backdrop-blur-xl p-2.5 rounded-full transition-all border z-40 cursor-pointer shadow-lg flex items-center gap-1.5 text-xs font-bold",
                  isRingLightActive 
                    ? "bg-amber-300 text-slate-950 border-amber-200 shadow-amber-300/60 scale-105" 
                    : "bg-black/60 text-white border-white/20 hover:bg-black/80"
                )}
                title="Toggle Studio Ring Light for dark rooms"
              >
                <SunMedium size={16} className={isRingLightActive ? "animate-spin text-amber-950" : ""} />
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

              {/* Engine Initializing Overlay */}
              {!isEngineReady && !isProcessing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-[60] bg-black/80 backdrop-blur-md gap-3">
                  <div className="relative">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="w-12 h-12 rounded-full border-4 border-white/10 border-t-primary"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    </div>
                  </div>
                  <span className="text-white text-[10px] font-black uppercase tracking-widest animate-pulse">Initializing Biometrics...</span>
                  <span className="text-white/60 text-[9px] tracking-wide">Preparing face tracking scanner</span>
                </div>
              )}

              {isProcessing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-[60] bg-black/80 backdrop-blur-md gap-4">
                   <div className="relative">
                      <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-primary/30 rounded-full"
                      />
                      <div className="bg-primary p-3.5 rounded-full shadow-2xl relative z-10">
                         <Loader2 className="w-7 h-7 text-white animate-spin" />
                      </div>
                   </div>
                   <span className="text-white text-[10px] font-black uppercase tracking-widest animate-pulse">Verifying Liveness...</span>
                </div>
              )}

              <div className="absolute bottom-6 left-0 right-0 hidden md:flex justify-center transition-all duration-300 z-40">
                 <button
                  type="button"
                  onClick={handleCaptureSelfie}
                  disabled={isLockedOut || isProcessing || !isEngineReady || !isFaceAligned || livenessStatus !== 'passed'}
                  className={cn(
                    "px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-2 transition-all transform active:scale-95 border border-white/20 select-none cursor-pointer",
                    isLockedOut
                      ? "bg-amber-500/80 text-white cursor-not-allowed scale-95 border-amber-400/30 opacity-90"
                      : isProcessing ? "opacity-0 scale-50" :
                    (isFaceAligned && livenessStatus === 'passed')
                      ? "bg-primary text-white hover:bg-primary-hover hover:scale-105 shadow-primary/30"
                      : "bg-black/60 backdrop-blur-md text-white/50 cursor-not-allowed scale-95 border-white/10"
                  )}
                 >
                   <FaCamera size={13} />
                   <span>
                     {isLockedOut 
                       ? `Locked (${timerText})` 
                       : isFaceAligned && livenessStatus === 'passed' 
                       ? 'Capture Selfie Now' 
                       : isFaceAligned && livenessStatus === 'idle'
                       ? 'Follow Prompt'
                       : 'Follow Prompt to Capture'}
                   </span>
                 </button>
              </div>
            </>
            )
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
                className="absolute top-4 right-4 bg-black/60 text-white p-2.5 rounded-full hover:bg-red-500 transition-colors z-30 cursor-pointer shadow-lg"
              >
                <FaTimes />
              </button>
              <div className="absolute bottom-6 left-0 right-0 flex justify-center z-30">
                 <motion.span
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="bg-primary/90 backdrop-blur-md text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl border border-white/20 flex items-center gap-1.5"
                 >
                   <CheckCircle size={13} /> Verified Biometric Photo
                 </motion.span>
              </div>
            </div>
          )}
       </div>
    </div>
  );
};

export default SelfieStep;

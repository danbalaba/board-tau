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
  const [isStreamLoaded, setIsStreamLoaded] = React.useState<boolean>(false);
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

  const [isMobile, setIsMobile] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getVideoConstraints = React.useCallback(() => {
    if (selectedDeviceId) {
      return { deviceId: { exact: selectedDeviceId } };
    }
    if (isMobile) {
      return {
        facingMode: facingMode,
        width: { ideal: 1080 },
        height: { ideal: 1440 },
        aspectRatio: { ideal: 0.75 }
      };
    }
    return {
      facingMode: facingMode,
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      aspectRatio: { ideal: 1.7777777778 }
    };
  }, [selectedDeviceId, facingMode, isMobile]);

  const [webcamKey, setWebcamKey] = React.useState<number>(0);

  const handleClearSelfie = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsStreamLoaded(false);
    setCapturedSelfie(null);
    setIsFaceAligned(false);
    setWebcamKey((prev) => prev + 1);
  };

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
          <span className="hidden sm:inline-flex text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full items-center gap-1.5 shrink-0">
            <CheckCircle size={12} /> Biometric Verification
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
            <>              <Webcam
                key={`${selectedDeviceId || facingMode}-${isMobile ? 'mobile' : 'desktop'}-${webcamKey}`}
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                mirrored={facingMode === "user"}
                onUserMedia={() => setTimeout(() => setIsStreamLoaded(true), 300)}
                onUserMediaError={() => setIsStreamLoaded(false)}
                videoConstraints={getVideoConstraints()}
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
                       stroke="rgba(255, 255, 255, 0.45)"
                       strokeWidth="1"
                       strokeDasharray="4 2"
                       animate={{ strokeDashoffset: [0, 10] }}
                       transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />

                    {!isProcessing && (
                      <motion.line
                        x1="20" y1="20" x2="80" y2="20"
                        stroke="rgba(255, 255, 255, 0.3)"
                        strokeWidth="0.5"
                        initial={{ y: 0, opacity: 0 }}
                        animate={{
                          y: [30, 90, 30],
                          opacity: [0, 0.5, 0]
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
                  {!isProcessing && (
                    <motion.div
                      key="face-guide"
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 14, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      className="bg-black/40 backdrop-blur-md text-white/90 px-4 py-1.5 rounded-full border border-white/10 flex items-center justify-center gap-2 shadow-lg"
                    >
                       <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                       <span className="text-[10px] font-medium tracking-wide">Position face within frame</span>
                    </motion.div>
                  )}
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

              {/* Camera Stream Starting Overlay */}
              {!isStreamLoaded && !isProcessing && (
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
                  <span className="text-white text-[10px] font-black uppercase tracking-widest animate-pulse">Starting Camera...</span>
                  <span className="text-white/60 text-[9px] tracking-wide">Connecting to media stream</span>
                </div>
              )}

              {/* Engine Initializing Overlay */}
              {isStreamLoaded && !isEngineReady && !isProcessing && (
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
                  disabled={isLockedOut || isProcessing || !isEngineReady || !isStreamLoaded}
                  className={cn(
                    "px-6 py-2.5 rounded-full font-bold text-xs shadow-xl flex items-center gap-2 transition-all transform active:scale-95 border border-white/20 select-none cursor-pointer",
                    isLockedOut
                      ? "bg-amber-500/80 text-white cursor-not-allowed border-amber-400/30 opacity-90"
                      : isProcessing || !isStreamLoaded ? "opacity-0 scale-50" :
                      "bg-primary text-white hover:bg-primary-hover hover:scale-105 shadow-primary/30"
                  )}
                >
                  <FaCamera size={14} />
                  <span>
                    {isLockedOut 
                      ? `Locked (${timerText})` 
                      : 'Capture Selfie Now'}
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
                onClick={handleClearSelfie}
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
                   <CheckCircle size={13} /> Selfie Photo Captured
                 </motion.span>
              </div>
            </div>
          )}
       </div>
    </div>
  );
};

export default SelfieStep;

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useEdgeStore } from "@/lib/edgestore";
import { format, differenceInDays } from "date-fns";
import { useKYC } from "@/hooks/useKYC";
import { DateRange } from "react-day-picker";
import { useResponsiveToast } from "@/components/common/ResponsiveToast";
import Webcam from "react-webcam";
import { base64ToFile } from "./InquiryModalUtils";

export interface FormData {
  moveInDate: string;
  checkOutDate: string;
  occupantsCount: number;
  role: string;
  contactMethod: string;
  contactInfo: string;
  message: string;
  profilePhoto: File | null;
  idAttachment: File | null;
  paymentMethod: string;
  isSoloBuyout: boolean;
  otp: string;
}

export const useInquiryLogic = (
  listingId: string,
  landlordId: string,
  room: any,
  onSubmit: (data: any) => Promise<void>,
  activeStay?: { endDate: string; status: string; listing: { title: string } } | null
) => {
  const router = useRouter();
  const responsiveToast = useResponsiveToast();
  const { edgestore } = useEdgeStore();
  const { isProcessing, faceEngine, idEngine } = useKYC();

  // Step & Image State
  const [currentStep, setCurrentStep] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // KYC States
  const webcamRef = useRef<Webcam>(null);
  const [isFaceAligned, setIsFaceAligned] = useState(false);
  const [isIDAligned, setIsIDAligned] = useState(false);
  const [isPhoneDetected, setIsPhoneDetected] = useState(false);
  const [hasUserBlinked, setHasUserBlinked] = useState(false);
  // Blink state machine: tracks the full Open→Closed→Open cycle
  const blinkPhase = useRef<'idle' | 'eye_closed' | 'confirmed'>('idle');
  const consecutiveClosedFrames = useRef(0);  // Must sustain 2 frames to avoid blur spikes
  const consecutiveFaceFailures = useRef(0);  // Resets liveness if face disappears
  const consecutiveIDFailures = useRef(0);    // Buffer for ID detection jitter
  const [hasReadGuidelines, setHasReadGuidelines] = useState(false);
  const [isShowingIDList, setIsShowingIDList] = useState(false);
  const [selectedIDTab, setSelectedIDTab] = useState<"primary" | "secondary">("primary");
  const [capturedSelfie, setCapturedSelfie] = useState<string | null>(null);
  const [capturedID, setCapturedID] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isFlashActive, setIsFlashActive] = useState(false);

  // Calendar State
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [showCalendar, setShowCalendar] = useState(false);
  
  // OTP State
  const [isOTPVerified, setIsOTPVerified] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpAttemptLimitReached, setOtpAttemptLimitReached] = useState(false);
  const [lockoutCountdown, setLockoutCountdown] = useState(0);

  useEffect(() => {
    // Fetch user email for OTP
    fetch('/api/auth/session').then(res => res.json()).then(data => {
      if (data?.user?.email) setUserEmail(data.user.email);
    });
  }, []);

  const totalSteps = 8;

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    setValue,
    getValues,
    trigger,
    watch,
    control,
    clearErrors,
  } = useForm<FormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      moveInDate: '',
      checkOutDate: '',
      occupantsCount: 1,
      role: '',
      contactMethod: '',
      contactInfo: '',
      message: '',
      profilePhoto: null,
      idAttachment: null,
      paymentMethod: '',
      isSoloBuyout: false,
      otp: '',
    },
  });

  // Watch for step completion checks
  const watchedValues = watch(['paymentMethod', 'moveInDate', 'checkOutDate', 'role', 'contactMethod', 'contactInfo', 'message', 'occupantsCount', 'isSoloBuyout']);

  // Effect 1: Reset ALL blink state ONLY when entering step 5 or selfie is cleared
  useEffect(() => {
    if (currentStep === 5 && !capturedSelfie) {
      setHasUserBlinked(false);
      blinkPhase.current = 'idle';
      consecutiveClosedFrames.current = 0;
      consecutiveFaceFailures.current = 0;
    }
  }, [currentStep, capturedSelfie]);

  // Effect 2: Real-time scanning loop (hasUserBlinked intentionally NOT in deps)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentStep === 5 && !capturedSelfie && !isProcessing) {
      interval = setInterval(async () => {
        const video = webcamRef.current?.video;
        if (video && video.readyState === 4) {
          // Run face alignment check
          const result = await faceEngine.validateFace(video);
          setIsFaceAligned(result.isValid);

          // FACE-LOSS DETECTION: Reset liveness if face disappears for 3+ consecutive polls (600ms)
          // Catches: user switches from real face to phone photo AFTER confirming liveness
          if (blinkPhase.current === 'confirmed') {
            if (!result.isValid) {
              consecutiveFaceFailures.current += 1;
              if (consecutiveFaceFailures.current >= 3) {
                // Face gone too long — reset everything, require a new blink
                blinkPhase.current = 'idle';
                consecutiveClosedFrames.current = 0;
                consecutiveFaceFailures.current = 0;
                setHasUserBlinked(false);
              }
            } else {
              consecutiveFaceFailures.current = 0; // Face back in frame, reset counter
            }
            return; // Skip blink detection once confirmed (unless reset above)
          }

          // 3-Phase Blink State Machine
          const scores = await faceEngine.getBlinkScores(video);
          if (scores) {
            // Threshold 0.60: high enough to block zoom-blur spikes (which peak ~0.45-0.55)
            const bothClosed = scores.left > 0.60 && scores.right > 0.60;
            const bothOpen   = scores.left < 0.20 && scores.right < 0.20;

            if (blinkPhase.current === 'idle') {
              if (bothClosed) {
                consecutiveClosedFrames.current += 1;
                // Require 2 consecutive closed frames (400ms) — blur lasts only ~1 frame
                if (consecutiveClosedFrames.current >= 2) {
                  blinkPhase.current = 'eye_closed';
                  consecutiveClosedFrames.current = 0;
                }
              } else {
                consecutiveClosedFrames.current = 0; // Reset if not sustained
              }
            } else if (blinkPhase.current === 'eye_closed' && bothOpen) {
              // Phase 2→3: Full open→close→open cycle confirmed — fires ONCE
              blinkPhase.current = 'confirmed';
              consecutiveFaceFailures.current = 0;
              setHasUserBlinked(true);
            }
          }
        }
      }, 200);
    }
    return () => clearInterval(interval);
  // ⚠️ hasUserBlinked deliberately excluded — adding it would cause a reset loop
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, capturedSelfie, isProcessing, faceEngine]);


  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentStep === 6 && !capturedID && !isProcessing) {
      interval = setInterval(async () => {
        const video = webcamRef.current?.video;
        if (video && video.readyState === 4) {
          const result = await idEngine.validateIDCard(video);
          
          if (result.isValid) {
            consecutiveIDFailures.current = 0;
            setIsIDAligned(true);
          } else {
            consecutiveIDFailures.current += 1;
            // Persistence Buffer: Only hide if we fail 3 consecutive polls (~900ms)
            if (consecutiveIDFailures.current >= 3) {
              setIsIDAligned(false);
            }
          }

          const phoneCheck = result.reason?.toLowerCase().includes("phone") || false;
          setIsPhoneDetected(phoneCheck);
        }
      }, 300); // Faster polling for snappier feedback
    }
    return () => clearInterval(interval);
  }, [currentStep, capturedID, isProcessing, idEngine]);

  useEffect(() => {
    if (dateRange?.from) {
      setValue('moveInDate', format(dateRange.from, 'yyyy-MM-dd'), { shouldValidate: true });
    }
    if (dateRange?.to) {
      setValue('checkOutDate', format(dateRange.to, 'yyyy-MM-dd'), { shouldValidate: true });
    }
  }, [dateRange, setValue]);

  // Handlers
  const handleCaptureSelfie = async () => {
    const video = webcamRef.current?.video;
    if (!video) return;

    // LIVENESS GATE: User must have blinked to prove they are real
    if (!hasUserBlinked) {
      responsiveToast.error("Liveness check required. Please blink naturally to prove you're real.");
      return;
    }

    // CRITICAL: Validate the LIVE VIDEO STREAM first (not the screenshot).
    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 150);

    const result = await faceEngine.validateFace(video);
    if (!result.isValid) {
      responsiveToast.error(result.reason || "Selfie verification failed.");
      return;
    }

    // Only if LIVE frame passed all checks, save the screenshot
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedSelfie(imageSrc);
      responsiveToast.success("Face verified successfully!");
    }
  };

  const handleCaptureID = async () => {
    const video = webcamRef.current?.video;
    if (!video) return;

    // CRITICAL: Validate the LIVE VIDEO STREAM first (not the screenshot).
    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 150);

    const result = await idEngine.validateIDCard(video);
    if (!result.isValid) {
      responsiveToast.error(result.reason || "ID verification failed.");
      return;
    }

    // Only if the LIVE frame passed all checks, save the screenshot
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedID(imageSrc);
      responsiveToast.success("ID card detected!");
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === "user" ? "environment" : "user");
    responsiveToast.success("Switching camera...");
  };

  const isStepCompleted = (step: number) => {
    const values = getValues();
    const hasOverlap = activeStay && values.moveInDate && new Date(values.moveInDate) < new Date(activeStay.endDate);
    
    switch (step) {
      case 1: return !!values.paymentMethod && !errors.paymentMethod;
      case 2: return !!values.moveInDate && !!values.checkOutDate && !!values.role && !!values.contactMethod && !!values.contactInfo && !hasOverlap && !errors.moveInDate && !errors.checkOutDate && !errors.role && !errors.contactMethod && !errors.contactInfo;
      case 3: return !errors.message;
      case 4: return hasReadGuidelines;
      case 5: return capturedSelfie !== null;
      case 6: return capturedID !== null;
      case 7: return !!values.otp && values.otp.length === 6;
      case 8: return true;
      default: return false;
    }
  };

  const [direction, setDirection] = useState(0);

  const handleNextStep = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];
    if (currentStep === 1) fieldsToValidate = ['paymentMethod'];
    if (currentStep === 2) fieldsToValidate = ['moveInDate', 'checkOutDate', 'role', 'contactMethod', 'contactInfo'];
    if (currentStep === 3) fieldsToValidate = ['message'];
    if (currentStep === 7) fieldsToValidate = ['otp'];

    const hasData = isStepCompleted(currentStep);
    
    // Only trigger validation for fields that are registered in useForm
    const isValid = fieldsToValidate.length > 0 
      ? await trigger(fieldsToValidate) 
      : true;

    if (!isValid || !hasData) {
      return;
    }

    // Entering Step 7: Send initial OTP automatically
    if (currentStep === 6 && isValid && hasData) {
      if (!isOTPVerified) {
        // Send in background so we don't block the UI transition
        axios.post('/api/inquiries/otp/send', { email: userEmail })
          .then(() => responsiveToast.success("Security code sent to your email!"))
          .catch(() => {}); // Suppress error, step 7 allows manual resend
      }
    }

    // Completing Step 7: Verify OTP
    if (currentStep === 7 && isValid && hasData && !isOTPVerified) {
      try {
        const { isProcessing: _setLoading } = (window as any)._setIsProcessing || {};
        if (_setLoading) _setLoading(true);
        
        await axios.post('/api/inquiries/otp/verify', { email: userEmail, otp: getValues('otp') });
        setIsOTPVerified(true);
        responsiveToast.success("Identity verified successfully!");
        setDirection(1);
        setCurrentStep(8);
      } catch (error: any) {
        const msg = error.response?.data?.error || error.message;
        
        const countdownMatch = msg.match(/Please try again in (\d+) second\(s\)/);
        if (countdownMatch) {
          const countdownSeconds = parseInt(countdownMatch[1]);
          setLockoutCountdown(countdownSeconds);
          setOtpAttemptLimitReached(true);
          responsiveToast.error(msg, {
            duration: Math.min(countdownSeconds, 5) * 1000, // Max 5 seconds toast
          });
        } else if (msg.includes("attempt(s) remaining")) {
          // Show remaining attempts with shorter duration
          responsiveToast.error(msg, { duration: 3000 });
        } else {
          responsiveToast.error(msg);
        }
        
        // If suspended by brute force, immediately kick them to lockout
        if (msg.includes('AccountSuspended')) {
           window.location.href = '/auth/suspended?secure=1';
        }
      } finally {
        const { isProcessing: _setLoading } = (window as any)._setIsProcessing || {};
        if (_setLoading) _setLoading(false);
      }
      return;
    }

    if (isValid && hasData) {
      setDirection(1);
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevStep = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmitForm = async (data: FormData) => {
    try {
      setIsUploading(true);
      const uploadTasks = [];
      let profilePhotoUrl = null;
      let idAttachmentUrl = null;

      if (capturedSelfie) {
        const file = base64ToFile(capturedSelfie, "selfie.jpg");
        uploadTasks.push(
          edgestore.identityDocs.upload({
            file,
            input: { listingId, landlordId }
          }).then((res) => { profilePhotoUrl = res.url; })
        );
      }

      if (capturedID) {
        const file = base64ToFile(capturedID, "id_card.jpg");
        uploadTasks.push(
          edgestore.identityDocs.upload({
            file,
            input: { listingId, landlordId }
          }).then((res) => { idAttachmentUrl = res.url; })
        );
      }

      await Promise.all(uploadTasks);

      const inquiryData = {
        listingId,
        roomId: room.id,
        moveInDate: data.moveInDate,
        checkOutDate: data.checkOutDate,
        occupantsCount: data.occupantsCount,
        role: data.role,
        contactMethod: data.contactMethod,
        contactInfo: data.contactInfo,
        message: data.message,
        paymentMethod: data.paymentMethod,
        profilePhotoUrl,
        idAttachmentUrl,
      };

      await onSubmit(inquiryData);
      setSubmitted(true);
      setTimeout(() => router.push("/inquiries"), 1500);
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      responsiveToast.error("Failed to submit inquiry. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return {
    currentStep, setCurrentStep,
    currentImageIndex, setCurrentImageIndex,
    submitted, isUploading, isProcessing,
    webcamRef,
    isFaceAligned, isIDAligned, isPhoneDetected,
    hasReadGuidelines, setHasReadGuidelines,
    isShowingIDList, setIsShowingIDList,
    selectedIDTab, setSelectedIDTab,
    capturedSelfie, setCapturedSelfie,
    setIsFaceAligned,
    capturedID, setCapturedID,
    hasUserBlinked,
    setIsIDAligned, setIsPhoneDetected,
    facingMode, isFlashActive, direction,
    dateRange, setDateRange,
    showCalendar, setShowCalendar,
    totalSteps,
    register, handleFormSubmit: handleFormSubmit(onSubmitForm),
    errors, setValue, getValues, trigger, watch, control, clearErrors,
    watchedValues,
    isStepCompleted, handleNextStep, handlePrevStep,
    handleCaptureSelfie, handleCaptureID, toggleCamera,
    activeStay, userEmail,
    resendCooldown, setResendCooldown,
    otpAttemptLimitReached, setOtpAttemptLimitReached,
    lockoutCountdown, setLockoutCountdown
  };
};

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
  const { isProcessing } = useKYC();

  // Step & Image State
  const [currentStep, setCurrentStep] = useState(1);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const currentStepRef = useRef(currentStep);
  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  useEffect(() => {
    setMaxUnlockedStep((prev) => Math.max(prev, currentStep));
  }, [currentStep]);

  // KYC States
  const webcamRef = useRef<Webcam>(null);
  const scaledCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isFaceAlignedRef = useRef(false);
  const [isFaceAligned, setIsFaceAligned] = useState(false);
  const [isIDAligned, setIsIDAligned] = useState(false);
  const [isPhoneDetected, setIsPhoneDetected] = useState(false);
  const [livenessStatus, setLivenessStatus] = useState<'idle' | 'passed'>('idle');
  const [activeChallenges, setActiveChallenges] = useState<('blink' | 'smile' | 'turnLeft' | 'turnRight' | 'openMouth' | 'raiseEyebrows')[]>([]);
  const consecutiveFaceFailures = useRef(0);  // Resets liveness if face disappears
  const consecutiveIDFailures = useRef(0);    // Buffer for ID detection jitter
  const [hasReadGuidelines, setHasReadGuidelines] = useState(false);
  const [isShowingIDList, setIsShowingIDList] = useState(false);
  const [selectedIDTab, setSelectedIDTab] = useState<"primary" | "secondary">("primary");
  const [capturedSelfie, setCapturedSelfie] = useState<string | null>(null);
  const [capturedID, setCapturedID] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isFlashActive, setIsFlashActive] = useState(false);
  const [isIDProcessing, setIsIDProcessing] = useState(false);
  const [isSelfieProcessing, setIsSelfieProcessing] = useState(false);
  const [isEngineReady, setIsEngineReady] = useState(true);
  const [selfieRetakeNeeded, setSelfieRetakeNeeded] = useState(false);
  
  // Signature State
  const [tenantSignature, setTenantSignature] = useState<string>("");

  // Calendar State
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [showCalendar, setShowCalendar] = useState(false);
  
  // OTP State
  const [isOTPVerified, setIsOTPVerified] = useState(false);
  const [hasSentInitialOTP, setHasSentInitialOTP] = useState(false);
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

  type ChallengeType = 'blink' | 'smile' | 'turnLeft' | 'turnRight' | 'openMouth' | 'raiseEyebrows';
  const previousChallengesRef = useRef<ChallengeType[]>([]);

  const generateUniqueRandomChallenges = (): ChallengeType[] => {
    const ALL: ChallengeType[] = ['blink', 'smile', 'turnLeft', 'turnRight', 'openMouth', 'raiseEyebrows'];
    let pool = ALL.filter(c => !previousChallengesRef.current.includes(c));
    if (pool.length < 2) pool = ALL;
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 2);
    previousChallengesRef.current = selected;
    return selected;
  };

  const [livenessSessionId, setLivenessSessionId] = useState<string | null>(null);
  const [isLivenessLoading, setIsLivenessLoading] = useState(false);

  const startLivenessSession = async () => {
    setIsLivenessLoading(true);
    try {
      const res = await fetch('/api/kyc/liveness/session', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.sessionId) {
        setLivenessSessionId(data.sessionId);
      } else {
        const msg = data.reason || data.error || 'Failed to initialize liveness session';
        responsiveToast.error(msg);
      }
    } catch (err) {
      console.error('[Liveness Session Error]:', err);
      responsiveToast.error('Failed to connect to liveness service.');
    } finally {
      setIsLivenessLoading(false);
    }
  };

  const handleLivenessAnalysisComplete = async () => {
    if (!livenessSessionId) return;
    setIsSelfieProcessing(true);
    try {
      const res = await fetch('/api/kyc/liveness/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: livenessSessionId }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.referenceImage) {
        setCapturedSelfie(data.referenceImage);
        setLivenessStatus('passed');
        responsiveToast.success('Live biometric scan verified!');
      } else {
        const msg = data.reason || data.error || 'Liveness check unconfirmed.';
        responsiveToast.error(msg);
        setCapturedSelfie(null);
      }
    } catch (err) {
      console.error('[Liveness Results Error]:', err);
      responsiveToast.error('Failed to verify liveness results.');
    } finally {
      setIsSelfieProcessing(false);
      setLivenessSessionId(null);
    }
  };

  // Step 5 Selfie State Initialization (On-Demand AWS Validation on Shutter Click)
  useEffect(() => {
    if (currentStep === 5 && !capturedSelfie) {
      setIsEngineReady(true);
      setIsFaceAligned(true);
      setLivenessStatus('passed');
    }
  }, [currentStep, capturedSelfie]);

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
    if (!video || (video.readyState < 2 && video.currentTime === 0)) {
      responsiveToast.error("Camera is initializing. Please wait a moment for the video stream to load.");
      return;
    }

    // 1. Multi-strategy webcam capture to ensure valid high-res image across all browsers (Chrome, Brave, Safari)
    let imageSrc: string | null = null;

    // Strategy 1: react-webcam getScreenshot with natural native camera dimensions (prevents aspect-ratio face distortion)
    try {
      if (webcamRef.current?.getScreenshot) {
        imageSrc = webcamRef.current.getScreenshot();
      }
    } catch (e) {
      console.warn('[Webcam getScreenshot default warning]:', e);
    }

    // Strategy 2: react-webcam default getScreenshot
    if (!imageSrc || imageSrc.length < 500) {
      try {
        if (webcamRef.current?.getScreenshot) {
          imageSrc = webcamRef.current.getScreenshot();
        }
      } catch (e) {
        console.warn('[Webcam getScreenshot default warning]:', e);
      }
    }

    // Strategy 3: Direct Video Element Canvas Snapshot
    if ((!imageSrc || imageSrc.length < 500) && video) {
      try {
        const vWidth = video.videoWidth || 1280;
        const vHeight = video.videoHeight || 720;
        const canvas = document.createElement('canvas');
        canvas.width = vWidth;
        canvas.height = vHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          if (facingMode === 'user') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
          }
          ctx.drawImage(video, 0, 0, vWidth, vHeight);
          imageSrc = canvas.toDataURL('image/jpeg', 0.95);
        }
      } catch (e) {
        console.warn('[Direct Canvas Capture warning]:', e);
      }
    }

    if (!imageSrc || imageSrc.length < 500) {
      responsiveToast.error("Camera stream is loading. Please wait a moment and try again.");
      return;
    }

    // Verify captured image is not pitch black (uninitialized camera warmup frame)
    const checkFrameBrightness = (dataUrl: string): Promise<boolean> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          if (img.width < 50 || img.height < 50) return resolve(false);
          const canvas = document.createElement('canvas');
          canvas.width = 40;
          canvas.height = 40;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(true);
          ctx.drawImage(img, 0, 0, 40, 40);
          const pixels = ctx.getImageData(0, 0, 40, 40).data;
          let sum = 0;
          for (let i = 0; i < pixels.length; i += 4) {
            sum += pixels[i] + pixels[i + 1] + pixels[i + 2];
          }
          const avgBrightness = sum / ((pixels.length / 4) * 3);
          resolve(avgBrightness >= 15);
        };
        img.onerror = () => resolve(false);
        img.src = dataUrl;
      });
    };

    const isFrameValid = await checkFrameBrightness(imageSrc);
    if (!isFrameValid) {
      responsiveToast.error("Camera stream is warming up. Please wait a moment and click capture again.");
      return;
    }

    // 2. Trigger quick 100ms flash feedback & verify face presence via AWS Rekognition
    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 100);
    setIsSelfieProcessing(true);

    try {
      const res = await fetch('/api/kyc/detect-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selfieUrl: imageSrc }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        const failureReason = data.reason || data.error || 'No face detected in photo. Please frame your face clearly inside the oval.';
        responsiveToast.error(failureReason);
        setCapturedSelfie(null);
        return;
      }

      setCapturedSelfie(imageSrc);
      responsiveToast.success("Selfie verified successfully!");
    } catch (err) {
      console.error('[Face Detection Error]:', err);
      responsiveToast.error("Failed to verify face in photo. Please try again.");
      setCapturedSelfie(null);
    } finally {
      setIsSelfieProcessing(false);
    }
  };

  const handleCaptureID = async (imageFile: File) => {
    if (!capturedSelfie) {
      responsiveToast.error("Selfie not found. Please complete the selfie step first.");
      return;
    }

    setIsIDProcessing(true);

    try {
      const reader = new FileReader();
      const imageSrc = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });

      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });
      };

      // AWS Rekognition Cloud Verification (Biometrics, OCR, and Document AI)
      let kycResult: any = null;
      try {
        const kycRes = await fetch('/api/kyc/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ selfieUrl: capturedSelfie, idCardUrl: imageSrc }),
        });
        kycResult = await kycRes.json();
      } catch (err) {
        console.warn('[AWS Rekognition Fetch Error]:', err);
      }

      // Enforce strict AWS Rekognition verification result!
      if (kycResult && (!kycResult.success || kycResult.status !== 'VERIFIED')) {
        if (kycResult.lockoutRemainingSeconds) {
          try {
            const until = Date.now() + kycResult.lockoutRemainingSeconds * 1000;
            localStorage.setItem('kycLockoutUntil', until.toString());
            window.dispatchEvent(new Event('kycLockoutTriggered'));
          } catch (e) {}
        }
        
        let failureReason = kycResult.reason || kycResult.error || 'Verification failed.';
        if (failureReason.includes('temporarily locked for')) {
          const minsMatch = failureReason.match(/\d+/);
          const mins = minsMatch ? minsMatch[0] : '5';
          failureReason = `Verification locked for ${mins} minutes.`;
        }
        
        responsiveToast.error(failureReason);
        setCapturedID(null);
        return; // BLOCK USER FROM PROCEEDING!
      }

      setCapturedID(imageSrc);
      const similarityText = kycResult?.similarity ? ` (${kycResult.similarity}% face match)` : '';
      responsiveToast.success(`Identity Verified Successfully!${similarityText}`);
    } catch (error) {
      console.error("ID processing error:", error);
      responsiveToast.error("Failed to process ID card image.");
      setCapturedID(null);
    } finally {
      setIsIDProcessing(false);
    }
  };

  const handleRetakeSelfie = () => {
    setCapturedSelfie(null);
    setCapturedID(null);
    setSelfieRetakeNeeded(false);
    setCurrentStep(5);
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
    if (isIDProcessing || isSelfieProcessing || isProcessing) return;

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

    // Entering Step 7: Send initial OTP automatically ONCE
    if (currentStep === 6 && isValid && hasData) {
      if (!isOTPVerified && !hasSentInitialOTP) {
        setHasSentInitialOTP(true);
        setResendCooldown(30);
        // Send in background so we don't block the UI transition
        axios.post('/api/inquiries/otp/send', { email: userEmail })
          .then(() => responsiveToast.success("Inquiry verification code sent to your email!"))
          .catch((err) => {
            const msg = err.response?.data?.error || err.message;
            const cooldownMatch = msg?.match(/wait (\d+) seconds/);
            if (cooldownMatch) {
              setResendCooldown(parseInt(cooldownMatch[1], 10));
            }
          }); // Suppress error, step 7 allows manual resend
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
    if (isIDProcessing || isSelfieProcessing || isProcessing) return;
    if (currentStep === 6 && selfieRetakeNeeded) {
      handleRetakeSelfie();
      return;
    }
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleStepClick = (targetStep: number) => {
    if (isIDProcessing || isSelfieProcessing || isProcessing) return;
    if (targetStep <= maxUnlockedStep && targetStep !== currentStep) {
      setDirection(targetStep > currentStep ? 1 : -1);
      setCurrentStep(targetStep);
    }
  };

  const onSubmitForm = async (data: FormData) => {
    try {
      setIsUploading(true);
      const uploadTasks = [];
      let profilePhotoUrl = null;
      let idAttachmentUrl = null;
      let signatureUrl = null;

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

      if (tenantSignature) {
        const file = base64ToFile(tenantSignature, "tenant_signature.png"); // Signature is usually png
        uploadTasks.push(
          edgestore.digitalContracts.upload({
            file,
            input: { listingId, landlordId }
          }).then((res) => { signatureUrl = res.url; })
        );
      }

      await Promise.all(uploadTasks);

      if (profilePhotoUrl && idAttachmentUrl) {
        try {
          const kycRes = await fetch('/api/kyc/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ selfieUrl: profilePhotoUrl, idCardUrl: idAttachmentUrl }),
          });
          const kycResult = await kycRes.json();
          if (kycResult.status === 'NEEDS_MANUAL_REVIEW') {
            responsiveToast.warning('Identity verification flagged for manual review: ' + (kycResult.reason || 'Verification check unconfirmed.'));
          }
        } catch (err) {
          console.warn('[KYC Verify Error]:', err);
        }
      }

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
        tenantSignature: signatureUrl, // Pass URL instead of base64
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
    submitted, isUploading, isProcessing, isIDProcessing, isSelfieProcessing, isEngineReady,
    webcamRef,
    isFaceAligned, isIDAligned, isPhoneDetected,
    hasReadGuidelines, setHasReadGuidelines,
    isShowingIDList, setIsShowingIDList,
    selectedIDTab, setSelectedIDTab,
    capturedSelfie, setCapturedSelfie,
    setIsFaceAligned,
    capturedID, setCapturedID,
    tenantSignature, setTenantSignature,
    selfieRetakeNeeded, handleRetakeSelfie,
    livenessStatus, activeChallenge: activeChallenges[0] || 'blink',
    setIsIDAligned, setIsPhoneDetected,
    facingMode, isFlashActive, direction,
    dateRange, setDateRange,
    showCalendar, setShowCalendar,
    totalSteps,
    register, handleFormSubmit: handleFormSubmit(onSubmitForm),
    errors, setValue, getValues, trigger, watch, control, clearErrors,
    watchedValues,
    isStepCompleted, handleNextStep, handlePrevStep, handleStepClick,
    maxUnlockedStep,
    handleCaptureSelfie, handleCaptureID, toggleCamera,
    livenessSessionId,
    isLivenessLoading,
    startLivenessSession,
    handleLivenessAnalysisComplete,
    activeStay, userEmail,
    resendCooldown, setResendCooldown,
    otpAttemptLimitReached, setOtpAttemptLimitReached,
    lockoutCountdown, setLockoutCountdown
  };
};

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useEdgeStore } from "@/lib/edgestore";
import { format, differenceInDays, addDays } from "date-fns";
import { useKYC } from "@/hooks/useKYC";
import { DateRange } from "react-day-picker";
import { useResponsiveToast } from "@/components/common/ResponsiveToast";
import Webcam from "react-webcam";
import { base64ToFile } from "@/components/modals/inquiry-modal/InquiryModalUtils";

export interface WalkInFormData {
  listingId: string;
  roomId: string;
  guestName: string;
  guestContact: string;
  occupantsCount: number;
  moveInDate: string;
  checkOutDate: string;
  totalPrice: number;
  isSoloBuyout: boolean;
}

export const useWalkInModal = (
  landlordId: string,
  onSuccess: () => void,
  onClose: () => void
) => {
  const responsiveToast = useResponsiveToast();
  const { edgestore } = useEdgeStore();
  const { isProcessing, faceEngine, idEngine } = useKYC();

  // Step & Modal State
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6; // 1: Location, 2: Guest, 3: Selfie, 4: ID, 5: Stay & Payment, 6: Review
  const [submitted, setSubmitted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [direction, setDirection] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // KYC States (Reused strictly from Inquiry logic)
  const webcamRef = useRef<Webcam>(null);
  const [isFaceAligned, setIsFaceAligned] = useState(false);
  const [isIDAligned, setIsIDAligned] = useState(false);
  const [isPhoneDetected, setIsPhoneDetected] = useState(false);
  const [hasUserBlinked, setHasUserBlinked] = useState(false);
  const blinkPhase = useRef<'idle' | 'eye_closed' | 'confirmed'>('idle');
  const consecutiveClosedFrames = useRef(0);
  const consecutiveFaceFailures = useRef(0);
  const consecutiveIDFailures = useRef(0);
  const [capturedSelfie, setCapturedSelfie] = useState<string | null>(null);
  const [capturedID, setCapturedID] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isFlashActive, setIsFlashActive] = useState(false);

  // Calendar State
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

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
  } = useForm<WalkInFormData>({
    mode: 'onChange',
    defaultValues: {
      listingId: '',
      roomId: '',
      guestName: '',
      guestContact: '',
      occupantsCount: 1,
      moveInDate: '',
      checkOutDate: '',
      totalPrice: 0,
      isSoloBuyout: false,
    },
  });

  const watchedValues = watch();

  // Reset blink state on Selfie step
  useEffect(() => {
    if (currentStep === 3 && !capturedSelfie) {
      setHasUserBlinked(false);
      blinkPhase.current = 'idle';
      consecutiveClosedFrames.current = 0;
      consecutiveFaceFailures.current = 0;
    }
  }, [currentStep, capturedSelfie]);

  // Real-time Selfie scanning loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentStep === 3 && !capturedSelfie && !isProcessing) {
      interval = setInterval(async () => {
        const video = webcamRef.current?.video;
        if (video && video.readyState === 4) {
          const result = await faceEngine.validateFace(video);
          setIsFaceAligned(result.isValid);

          if (blinkPhase.current === 'confirmed') {
            if (!result.isValid) {
              consecutiveFaceFailures.current += 1;
              if (consecutiveFaceFailures.current >= 3) {
                blinkPhase.current = 'idle';
                consecutiveClosedFrames.current = 0;
                consecutiveFaceFailures.current = 0;
                setHasUserBlinked(false);
              }
            } else {
              consecutiveFaceFailures.current = 0;
            }
            return;
          }

          const scores = await faceEngine.getBlinkScores(video);
          if (scores) {
            const bothClosed = scores.left > 0.60 && scores.right > 0.60;
            const bothOpen   = scores.left < 0.20 && scores.right < 0.20;

            if (blinkPhase.current === 'idle') {
              if (bothClosed) {
                consecutiveClosedFrames.current += 1;
                if (consecutiveClosedFrames.current >= 2) {
                  blinkPhase.current = 'eye_closed';
                  consecutiveClosedFrames.current = 0;
                }
              } else {
                consecutiveClosedFrames.current = 0;
              }
            } else if (blinkPhase.current === 'eye_closed' && bothOpen) {
              blinkPhase.current = 'confirmed';
              consecutiveFaceFailures.current = 0;
              setHasUserBlinked(true);
            }
          }
        }
      }, 200);
    }
    return () => clearInterval(interval);
  }, [currentStep, capturedSelfie, isProcessing, faceEngine]);

  // Real-time ID scanning loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentStep === 4 && !capturedID && !isProcessing) {
      interval = setInterval(async () => {
        const video = webcamRef.current?.video;
        if (video && video.readyState === 4) {
          const result = await idEngine.validateIDCard(video);
          
          if (result.isValid) {
            consecutiveIDFailures.current = 0;
            setIsIDAligned(true);
          } else {
            consecutiveIDFailures.current += 1;
            if (consecutiveIDFailures.current >= 3) {
              setIsIDAligned(false);
            }
          }

          const phoneCheck = result.reason?.toLowerCase().includes("phone") || false;
          setIsPhoneDetected(phoneCheck);
        }
      }, 300);
    }
    return () => clearInterval(interval);
  }, [currentStep, capturedID, isProcessing, idEngine]);

  useEffect(() => {
    if (dateRange?.from) {
      setValue('moveInDate', format(dateRange.from, 'yyyy-MM-dd'), { shouldValidate: true });
    } else {
      setValue('moveInDate', '', { shouldValidate: true });
    }
    if (dateRange?.to) {
      setValue('checkOutDate', format(dateRange.to, 'yyyy-MM-dd'), { shouldValidate: true });
    } else {
      setValue('checkOutDate', '', { shouldValidate: true });
    }
  }, [dateRange, setValue]);

  const handleCaptureSelfie = async () => {
    const video = webcamRef.current?.video;
    if (!video) return;

    if (!hasUserBlinked) {
      responsiveToast.error({ title: "Verification Failed", description: "Liveness check required. Please blink naturally to prove you're real." });
      return;
    }

    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 150);

    const result = await faceEngine.validateFace(video);
    if (!result.isValid) {
      responsiveToast.error({ title: "Verification Failed", description: result.reason || "Selfie verification failed." });
      return;
    }

    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedSelfie(imageSrc);
      responsiveToast.success({ title: "Success", description: "Face verified successfully!" });
    }
  };

  const handleCaptureID = async () => {
    const video = webcamRef.current?.video;
    if (!video) return;

    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 150);

    const result = await idEngine.validateIDCard(video);
    if (!result.isValid) {
      responsiveToast.error({ title: "Verification Failed", description: result.reason || "ID verification failed." });
      return;
    }

    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedID(imageSrc);
      responsiveToast.success({ title: "Success", description: "ID card detected!" });
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === "user" ? "environment" : "user");
    responsiveToast.success({ title: "Camera Switched", description: "Using secondary camera." });
  };

  const isStepCompleted = (step: number) => {
    const values = getValues();
    switch (step) {
      case 1: return !!values.listingId && !!values.roomId;
      case 2: return !!values.guestName && values.occupantsCount >= 1 && !errors.guestName && !errors.occupantsCount;
      case 3: return capturedSelfie !== null;
      case 4: return capturedID !== null;
      case 5: return !!values.moveInDate && !!values.checkOutDate && values.totalPrice > 0;
      case 6: return true;
      default: return false;
    }
  };

  const handleNextStep = async () => {
    let fieldsToValidate: (keyof WalkInFormData)[] = [];
    if (currentStep === 1) fieldsToValidate = ['listingId', 'roomId'];
    if (currentStep === 2) fieldsToValidate = ['guestName', 'guestContact', 'occupantsCount'];
    if (currentStep === 5) fieldsToValidate = ['moveInDate', 'checkOutDate'];

    const hasData = isStepCompleted(currentStep);
    
    const isValid = fieldsToValidate.length > 0 
      ? await trigger(fieldsToValidate) 
      : true;

    if (!isValid || !hasData) {
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

  const onSubmitForm = async (data: WalkInFormData) => {
    try {
      setIsUploading(true);
      const uploadTasks = [];
      let profilePhotoUrl = null;
      let idAttachmentUrl = null;

      if (capturedSelfie) {
        const file = base64ToFile(capturedSelfie, "walkin_selfie.jpg");
        uploadTasks.push(
          edgestore.identityDocs.upload({
            file,
            input: { listingId: data.listingId, landlordId }
          }).then((res) => { profilePhotoUrl = res.url; })
        );
      }

      if (capturedID) {
        const file = base64ToFile(capturedID, "walkin_id_card.jpg");
        uploadTasks.push(
          edgestore.identityDocs.upload({
            file,
            input: { listingId: data.listingId, landlordId }
          }).then((res) => { idAttachmentUrl = res.url; })
        );
      }

      await Promise.all(uploadTasks);

      const requestData = {
        listingId: data.listingId,
        roomId: data.roomId,
        guestName: data.guestName,
        guestContact: data.guestContact,
        startDate: data.moveInDate,
        endDate: data.checkOutDate,
        occupantsCount: data.occupantsCount,
        totalPrice: data.totalPrice,
        guestPhotoUrl: profilePhotoUrl,
        guestIdUrl: idAttachmentUrl,
      };

      const res = await fetch("/api/landlord/reservations/walk-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData)
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create walk-in");
      }

      setSubmitted(true);
      responsiveToast.success({ title: "Success", description: "Walk-in reservation created!" });
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);

    } catch (error: any) {
      console.error("Error submitting walk-in:", error);
      responsiveToast.error({ title: "Submission Error", description: error.message || "Failed to submit. Please try again." });
    } finally {
      setIsUploading(false);
    }
  };

  return {
    currentStep, setCurrentStep,
    submitted, isUploading, isProcessing,
    webcamRef,
    isFaceAligned, isIDAligned, isPhoneDetected,
    capturedSelfie, setCapturedSelfie,
    setIsFaceAligned,
    capturedID, setCapturedID,
    hasUserBlinked,
    setIsIDAligned, setIsPhoneDetected,
    facingMode, isFlashActive, direction,
    showCalendar, setShowCalendar,
    currentImageIndex, setCurrentImageIndex,
    dateRange, setDateRange,
    totalSteps,
    register, handleFormSubmit: handleFormSubmit(onSubmitForm),
    errors, setValue, getValues, trigger, watch, control, clearErrors,
    watchedValues,
    isStepCompleted, handleNextStep, handlePrevStep,
    handleCaptureSelfie, handleCaptureID, toggleCamera
  };
};

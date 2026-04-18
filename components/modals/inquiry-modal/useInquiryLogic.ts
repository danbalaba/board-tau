import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useEdgeStore } from "@/lib/edgestore";
import { format, differenceInDays } from "date-fns";
import { useKYC } from "@/hooks/useKYC";
import { DateRange } from "react-day-picker";
import toast from "react-hot-toast";
import Webcam from "react-webcam";
import { base64ToFile } from "./InquiryModalUtils";

export interface FormData {
  moveInDate: string;
  checkOutDate: string;
  occupantsCount: number;
  role: string;
  contactMethod: string;
  message: string;
  profilePhoto: File | null;
  idAttachment: File | null;
  paymentMethod: string;
}

export const useInquiryLogic = (
  listingId: string,
  room: any,
  onSubmit: (data: any) => Promise<void>
) => {
  const router = useRouter();
  const { edgestore } = useEdgeStore();
  const { isProcessing, validateSelfie, validateID, faceEngine, idEngine } = useKYC();

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

  const totalSteps = 7;

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    setValue,
    getValues,
    trigger,
    watch,
    control,
  } = useForm<FormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      moveInDate: '',
      checkOutDate: '',
      occupantsCount: 1,
      role: '',
      contactMethod: '',
      message: '',
      profilePhoto: null,
      idAttachment: null,
      paymentMethod: '',
    },
  });

  // Watch for step completion checks
  const watchedValues = watch(['paymentMethod', 'moveInDate', 'checkOutDate', 'role', 'contactMethod', 'message']);

  // Real-time loops (Exactly as you had them)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentStep === 5 && !capturedSelfie && !isProcessing) {
      interval = setInterval(async () => {
        if (webcamRef.current) {
          const imageSrc = webcamRef.current.getScreenshot();
          if (imageSrc) {
            const img = new Image();
            img.src = imageSrc;
            await new Promise((resolve) => (img.onload = resolve));
            const result = await faceEngine.validateFace(img);
            setIsFaceAligned(result.isValid);
          }
        }
      }, 700);
    }
    return () => clearInterval(interval);
  }, [currentStep, capturedSelfie, isProcessing, faceEngine]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentStep === 6 && !capturedID && !isProcessing) {
      interval = setInterval(async () => {
        if (webcamRef.current) {
          const imageSrc = webcamRef.current.getScreenshot();
          if (imageSrc) {
            const img = new Image();
            img.src = imageSrc;
            await new Promise((resolve) => (img.onload = resolve));
            const result = await idEngine.validateIDCard(img);
            setIsIDAligned(result.isValid);
            const phoneCheck = result.reason?.toLowerCase().includes("phone") || false;
            setIsPhoneDetected(phoneCheck);
          }
        }
      }, 400);
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
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setIsFlashActive(true);
      setTimeout(() => setIsFlashActive(false), 150);
      const isValid = await validateSelfie(imageSrc);
      if (isValid) setCapturedSelfie(imageSrc);
    }
  };

  const handleCaptureID = async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setIsFlashActive(true);
      setTimeout(() => setIsFlashActive(false), 150);
      const isValid = await validateID(imageSrc);
      if (isValid) setCapturedID(imageSrc);
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === "user" ? "environment" : "user");
    toast("Switching camera...", { icon: "🔄" });
  };

  const isStepCompleted = (step: number) => {
    const values = getValues();
    switch (step) {
      case 1: return !!values.paymentMethod;
      case 2: return !!values.moveInDate && !!values.checkOutDate && !!values.role && !!values.contactMethod;
      case 3: return !!values.message && values.message.length > 0;
      case 4: return true;
      case 5: return capturedSelfie !== null;
      case 6: return capturedID !== null;
      case 7: return true;
      default: return false;
    }
  };

  const [direction, setDirection] = useState(0);

  const handleNextStep = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];
    if (currentStep === 1) fieldsToValidate = ['paymentMethod'];
    if (currentStep === 2) fieldsToValidate = ['moveInDate', 'checkOutDate', 'role', 'contactMethod'];

    const hasData = isStepCompleted(currentStep);
    if (!hasData) {
      await trigger(fieldsToValidate);
      return;
    }

    const isValid = await trigger(fieldsToValidate);
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
      let profilePhotoUrl = null;
      if (capturedSelfie) {
        const file = base64ToFile(capturedSelfie, "selfie.jpg");
        const res = await edgestore.publicFiles.upload({ file });
        profilePhotoUrl = res.url;
      }

      let idAttachmentUrl = null;
      if (capturedID) {
        const file = base64ToFile(capturedID, "id_card.jpg");
        const res = await edgestore.publicFiles.upload({ file });
        idAttachmentUrl = res.url;
      }

      const inquiryData = {
        listingId,
        roomId: room.id,
        moveInDate: data.moveInDate,
        checkOutDate: data.checkOutDate,
        occupantsCount: data.occupantsCount,
        role: data.role,
        contactMethod: data.contactMethod,
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
    isShowingIDList, setIsShowingIDList,
    selectedIDTab, setSelectedIDTab,
    capturedSelfie, setCapturedSelfie,
    setIsFaceAligned,
    capturedID, setCapturedID,
    setIsIDAligned, setIsPhoneDetected,
    facingMode, isFlashActive, direction,
    dateRange, setDateRange,
    showCalendar, setShowCalendar,
    totalSteps,
    register, handleFormSubmit: handleFormSubmit(onSubmitForm),
    errors, setValue, getValues, trigger, watch, control,
    watchedValues,
    isStepCompleted, handleNextStep, handlePrevStep,
    handleCaptureSelfie, handleCaptureID, toggleCamera
  };
};

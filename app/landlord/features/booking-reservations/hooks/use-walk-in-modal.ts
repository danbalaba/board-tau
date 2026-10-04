import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { useResponsiveToast } from "@/components/common/ResponsiveToast";

export type WalkInPaymentType = 'DIRECT_RENT' | 'RESERVATION_FEE';

export interface WalkInFormData {
  listingId: string;
  roomId: string;
  guestName: string;
  guestContact: string;
  guestEmail?: string;
  occupantsCount: number;
  moveInDate: string;
  checkOutDate: string;
  paymentType: WalkInPaymentType;
  securityDeposit: number;
  totalPrice: number;
  isSoloBuyout: boolean;
  notes?: string;
}

export const useWalkInModal = (
  landlordId: string,
  onSuccess: () => void,
  onClose: () => void
) => {
  const responsiveToast = useResponsiveToast();

  // Step & Modal State
  const [currentStep, setCurrentStep] = useState(1);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(1);
  const totalSteps = 4; // 1: Room, 2: Guest, 3: Stay & Payment, 4: Review
  const [submitted, setSubmitted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [direction, setDirection] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
    reset,
  } = useForm<WalkInFormData>({
    mode: 'onChange',
    defaultValues: {
      listingId: '',
      roomId: '',
      guestName: '',
      guestContact: '',
      guestEmail: '',
      occupantsCount: 1,
      moveInDate: '',
      checkOutDate: '',
      paymentType: 'DIRECT_RENT',
      securityDeposit: 0,
      totalPrice: 0,
      isSoloBuyout: false,
      notes: '',
    },
  });

  const watchedValues = watch();

  const resetState = () => {
    reset();
    setCurrentStep(1);
    setMaxUnlockedStep(1);
    setSubmitted(false);
    setIsUploading(false);
    setDirection(0);
    setShowCalendar(false);
    setCurrentImageIndex(0);
    setDateRange({ from: undefined, to: undefined });
  };

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

  const isStepCompleted = (step: number) => {
    const values = getValues();
    switch (step) {
      case 1: return !!values.listingId && !!values.roomId;
      case 2: return !!values.guestName && values.occupantsCount >= 1 && !errors.guestName && !errors.occupantsCount;
      case 3: return !!values.moveInDate && !!values.checkOutDate && values.totalPrice >= 0;
      case 4: return true;
      default: return false;
    }
  };

  const handleStepClick = (stepId: number) => {
    if (stepId <= maxUnlockedStep) {
      setDirection(stepId > currentStep ? 1 : -1);
      setCurrentStep(stepId);
    }
  };

  const handleNextStep = async () => {
    let fieldsToValidate: (keyof WalkInFormData)[] = [];
    if (currentStep === 1) fieldsToValidate = ['listingId', 'roomId'];
    if (currentStep === 2) fieldsToValidate = ['guestName', 'guestContact', 'occupantsCount'];
    if (currentStep === 3) fieldsToValidate = ['moveInDate', 'checkOutDate'];

    const hasData = isStepCompleted(currentStep);
    
    const isValid = fieldsToValidate.length > 0 
      ? await trigger(fieldsToValidate) 
      : true;

    if (!isValid || !hasData) {
      return;
    }

    if (isValid && hasData) {
      const nextStep = Math.min(currentStep + 1, totalSteps);
      setDirection(1);
      setCurrentStep(nextStep);
      setMaxUnlockedStep((prev) => Math.max(prev, nextStep));
    }
  };

  const handlePrevStep = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmitForm = async (data: WalkInFormData) => {
    try {
      setIsUploading(true);

      const requestData = {
        listingId: data.listingId,
        roomId: data.roomId,
        guestName: data.guestName,
        guestContact: data.guestContact,
        guestEmail: data.guestEmail || null,
        startDate: data.moveInDate,
        endDate: data.checkOutDate,
        occupantsCount: data.occupantsCount,
        paymentType: data.paymentType,
        securityDeposit: Number(data.securityDeposit) || 0,
        totalPrice: data.totalPrice,
        isSoloBuyout: data.isSoloBuyout,
        notes: data.notes || null,
      };

      const res = await fetch("/api/landlord/reservations/walk-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData)
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create walk-in reservation");
      }

      setSubmitted(true);
      responsiveToast.success({ 
        title: data.paymentType === 'DIRECT_RENT' ? "Walk-In Check-In Recorded!" : "Walk-In Reservation Recorded!", 
        description: "The walk-in record has been saved into your property portal." 
      });
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
    maxUnlockedStep, handleStepClick,
    submitted, isUploading,
    direction,
    showCalendar, setShowCalendar,
    currentImageIndex, setCurrentImageIndex,
    dateRange, setDateRange,
    totalSteps,
    register, handleFormSubmit: handleFormSubmit(onSubmitForm),
    errors, setValue, getValues, trigger, watch, control, clearErrors,
    watchedValues,
    isStepCompleted, handleNextStep, handlePrevStep,
    resetState
  };
};

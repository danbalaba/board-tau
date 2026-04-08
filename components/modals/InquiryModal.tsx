"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Modal from "./Modal";
import Button from "@/components/common/Button";
import FileUpload from "@/components/common/FileUpload";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronLeft, FaChevronRight, FaCheck, FaCamera, FaIdCard, FaCreditCard, FaMobileAlt, FaEnvelope, FaUser, FaComment, FaCalendar, FaUpload, FaTimes } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { useEdgeStore } from "@/lib/edgestore";
import { format, addDays, differenceInDays } from "date-fns";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import { Loader2, Info, Lightbulb, User, ShieldCheck, CreditCard, ChevronLeft } from "lucide-react";
import toast from "react-hot-toast";
import Webcam from "react-webcam";

/**
 * Only allow blob URLs generated from validated File objects as image sources.
 * Prevents DOM text reinterpretation and XSS via src attribute injection.
 */
const getSafeImageSrc = (file: File | null): string => {
  if (!file || !(file instanceof File)) return '';
  
  // 1. Strict MIME allow-list (blocks SVG and executables)
  const safeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
  if (!safeTypes.includes(file.type)) return '';

  try {
    const rawUrl = URL.createObjectURL(file);
    
    // 2. Strict character whitelist to satisfy aggressive CodeQL analysis
    // Hyphen is placed at the start of the character class to prevent unintended ranges
    const safeUrl = rawUrl.split('').filter(c => /^[-a-zA-Z0-9:/_. ]$/.test(c)).join('');
    
    if (safeUrl.startsWith('blob:') && safeUrl.length < 2048 && safeUrl === rawUrl) {
      return safeUrl;
    }
  } catch (error) {
    return '';
  }
  
  return '';
};

/**
 * Validates and sanitizes image sources from URI strings using a strict whitelist.
 */
const getSafeImageSrcString = (image: string | null | undefined): string => {
  if (!image || typeof image !== 'string' || image.length > 2048) return '';
  
  const lower = image.toLowerCase();
  const isSafeProtocol = lower.startsWith('http://') || lower.startsWith('https://') || lower.startsWith('blob:');
  const isRelative = image.startsWith('/');

  if (isSafeProtocol || isRelative) {
    // Whitelist approach: Reconstruct the string using only safe characters
    // Hyphen is placed at the start of the character class to prevent unintended ranges
    const safeUrl = image.split('').filter(c => /^[-a-zA-Z0-9:/_. ?#&%=]$/.test(c)).join('');
    if (safeUrl === image) {
      return safeUrl;
    }
  }
  
  return '';
};

interface Room {
  id: string;
  name: string;
  price: number;
  capacity: number;
  availableSlots: number;
  images: {
    id: string;
    url: string;
    caption?: string;
    order?: number;
  }[];
  roomType: string;
  status: string;
  reservationFee: number;
}

interface InquiryModalProps {
  listingName: string;
  listingId: string;
  room: Room;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

interface FormData {
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

const InquiryModal: React.FC<InquiryModalProps> = ({
  listingName,
  listingId,
  room,
  onSubmit,
  isLoading,
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [idAttachment, setIdAttachment] = useState<File | null>(null);
  
  // KYC / Verification specific state
  const [isShowingIDList, setIsShowingIDList] = useState(false);
  const [selectedIDTab, setSelectedIDTab] = useState<"primary" | "secondary">("primary");
  const [capturedSelfie, setCapturedSelfie] = useState<string | null>(null);
  const [capturedID, setCapturedID] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const { edgestore } = useEdgeStore();
  
  const webcamRef = useRef<Webcam>(null);

  // Helper to convert base64 to File for EdgeStore
  const base64ToFile = (base64: string, filename: string) => {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const captureSelfie = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedSelfie(imageSrc);
      toast.success("Selfie captured!");
    }
  }, [webcamRef]);

  const captureID = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedID(imageSrc);
      toast.success("ID captured!");
    }
  }, [webcamRef]);

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
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

  // Watch form values for step completion
  const watchedValues = watch(['paymentMethod', 'moveInDate', 'checkOutDate', 'role', 'contactMethod', 'message']);

  // Derive step completion state directly from watched values and file attachments
  // This avoids infinite re-renders caused by useEffect updating state
  const stepCompleted = {
    step1: !!watchedValues[0], // paymentMethod
    step2: !!(watchedValues[1] && watchedValues[2] && watchedValues[3] && watchedValues[4]), // moveInDate, checkOutDate, role, contactMethod
    step3: !!(watchedValues[5] && watchedValues[5].trim().length > 0), // message
    step4: true, // Verification Guidelines matches always
    step5: capturedSelfie !== null,
    step6: capturedID !== null,
    step7: true, // Review
  };

  const totalSteps = 7;

  // Check if current step is completed
  const isStepCompleted = (step: number) => {
    const values = getValues();
    switch (step) {
      case 1:
        return !!values.paymentMethod;
      case 2:
        return !!values.moveInDate && !!values.checkOutDate && !!values.role && !!values.contactMethod;
      case 3:
        return !!values.message && values.message.length > 0;
      case 4:
        return true; // Guidelines page
      case 5:
        return capturedSelfie !== null;
      case 6:
        return capturedID !== null;
      case 7:
        return true;
      default:
        return false;
    }
  };

  // Handle dates from range
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const [showCalendar, setShowCalendar] = useState(false);

  // Sync range to form fields
  useEffect(() => {
    if (dateRange?.from) {
      setValue('moveInDate', format(dateRange.from, 'yyyy-MM-dd'), { shouldValidate: true });
    }
    if (dateRange?.to) {
      setValue('checkOutDate', format(dateRange.to, 'yyyy-MM-dd'), { shouldValidate: true });
    }
  }, [dateRange, setValue]);

  // Handle next step
  const handleNextStep = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = ['paymentMethod'];
        break;
      case 2:
        fieldsToValidate = ['moveInDate', 'checkOutDate', 'role', 'contactMethod'];
        break;
      case 4:
      case 5:
      case 6:
      case 7:
        fieldsToValidate = [];
        break;
    }

    // Check if fields have values using the latest form state
    const hasData = isStepCompleted(currentStep);

    if (!hasData) {
      // If no data, trigger validation to show errors
      await trigger(fieldsToValidate);
      return;
    }

    // Validate the fields
    const isValid = await trigger(fieldsToValidate);

    if (isValid && hasData) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  // Handle previous step
  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Image slider handlers
  const handleImagePrev = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? (room.images?.length - 1 || 0) : prev - 1
    );
  };

  const handleImageNext = () => {
    setCurrentImageIndex((prev) =>
      prev === (room.images?.length - 1 || 0) ? 0 : prev + 1
    );
  };

  const handleImageSelect = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleOccupantsChange = (value: number) => {
    setValue('occupantsCount', value, { shouldValidate: true });
  };

  const onSubmitForm = async (data: FormData) => {
    try {
      setIsUploading(true);

      let profilePhotoUrl = null;
      if (capturedSelfie) {
        const file = base64ToFile(capturedSelfie, "selfie.jpg");
        const res = await edgestore.publicFiles.upload({
          file: file,
        });
        profilePhotoUrl = res.url;
      }

      let idAttachmentUrl = null;
      if (capturedID) {
        const file = base64ToFile(capturedID, "id_card.jpg");
        const res = await edgestore.publicFiles.upload({
          file: file,
        });
        idAttachmentUrl = res.url;
      }

      // Create JSON object for API submission
      const inquiryData = {
        listingId: listingId, // Use the correct listingId prop
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
      setTimeout(() => {
        router.push("/inquiries");
      }, 1500);
    } catch (error) {
      console.error("Error submitting inquiry:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Render step indicator
  const renderStepIndicator = () => {
    return (
      <div className="relative mb-8 bg-white dark:bg-gray-800/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50 overflow-hidden">
        {/* Track line behind circles */}
        <div className="absolute top-9 left-[10%] right-[10%] h-[1.5px] bg-gray-100 dark:bg-gray-700 -z-0" />
        {/* Progress fill */}
        <div 
          className="absolute top-9 left-[10%] h-[1.5px] bg-primary transition-all duration-700 ease-in-out -z-0" 
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 80}%` }}
        />
        
        <div className="flex justify-between items-center relative z-10">
          {[1, 2, 3, 4, 5, 6, 7].map((step) => {
            const isCompleted = currentStep > step;
            const isActive = currentStep === step;
            return (
              <div key={step} className="flex flex-col items-center gap-2.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 transform ${
                  isActive 
                    ? "bg-primary text-white scale-110 shadow-md shadow-primary/20 ring-2 ring-primary/10" 
                    : isCompleted
                    ? "bg-primary text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-400"
                }`}>
                  {isCompleted ? <FaCheck size={12} /> : step}
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-widest hidden md:block transition-colors duration-300 ${
                  isActive ? "text-primary" : isCompleted ? "text-primary/60" : "text-gray-400"
                }`}>
                  {step === 1 ? "Pay" : step === 2 ? "Stay" : step === 3 ? "Note" : step === 4 ? "Prepare" : step === 5 ? "Selfie" : step === 6 ? "ID" : "Review"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary dark:text-gray-100">
              <FaCreditCard className="inline mr-2" />
              1. Select Payment Method
              <span className="text-red-500 ml-1">*</span>
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${getValues('paymentMethod') === 'stripe' ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                <input
                  type="radio"
                  value="stripe"
                  {...register('paymentMethod', { required: "Payment method is required" })}
                  className="accent-primary"
                />
                <div className="flex-1">
                  <p className="font-medium">Credit/Debit Card (Stripe)</p>
                  <p className="text-sm text-text-secondary dark:text-gray-400">Pay with Visa, Mastercard, or AMEX</p>
                </div>
              </label>
              <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${getValues('paymentMethod') === 'gcash' ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                <input
                  type="radio"
                  value="gcash"
                  {...register('paymentMethod', { required: "Payment method is required" })}
                  className="accent-primary"
                />
                <div className="flex-1">
                  <p className="font-medium">GCash</p>
                  <p className="text-sm text-text-secondary dark:text-gray-400">Mobile wallet payment</p>
                </div>
              </label>
              <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${getValues('paymentMethod') === 'maya' ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                <input
                  type="radio"
                  value="maya"
                  {...register('paymentMethod', { required: "Payment method is required" })}
                  className="accent-primary"
                />
                <div className="flex-1">
                  <p className="font-medium">Maya</p>
                  <p className="text-sm text-text-secondary dark:text-gray-400">Mobile wallet payment</p>
                </div>
              </label>
            </div>
            {errors.paymentMethod && (
              <p className="text-sm text-red-500">{errors.paymentMethod.message}</p>
            )}
            <p className="text-xs text-text-secondary dark:text-gray-400">
              Note: Payment won't be processed until your inquiry is approved by the host.
            </p>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary dark:text-gray-100">
              <FaCalendar className="inline mr-2" />
              2. Stay Details (Stay Duration & Dates)
              <span className="text-red-500 ml-1">*</span>
            </h3>
            
            <div className="space-y-4">
              <div className="relative">
                <label className="block font-semibold text-sm mb-2 text-text-primary dark:text-gray-100">
                  Stay Range (Check-in to Check-out)
                </label>
                <div 
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="flex items-center gap-2 w-full p-4 border border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer bg-white dark:bg-gray-900 group hover:border-primary transition-all"
                >
                  <FaCalendar className="text-gray-400 group-hover:text-primary" />
                  <div className="flex-1">
                    {dateRange?.from ? (
                      <span className="text-text-primary dark:text-gray-100">
                        {format(dateRange.from, 'MMM dd, yyyy')} - {dateRange.to ? format(dateRange.to, 'MMM dd, yyyy') : '...'}
                      </span>
                    ) : (
                      <span className="text-gray-400">Select dates</span>
                    )}
                  </div>
                  {dateRange?.to && dateRange?.from && (
                    <div className="text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-md shadow-sm border border-blue-200 dark:border-blue-800/50">
                      {differenceInDays(dateRange.to, dateRange.from)} nights
                    </div>
                  )}
                </div>

                {showCalendar && (
                  <div className="absolute top-full left-0 z-50 mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200 ring-1 ring-black/5">
                    <style>{`
                      .rdp-root {
                        --rdp-accent-color: var(--primary-color);
                        --rdp-accent-text-color: #fff;
                        --rdp-range_start-color: var(--primary-color);
                        --rdp-range_end-color: var(--primary-color);
                        --rdp-range_middle-background-color: var(--primary-light-color);
                        --rdp-cell-size: 34px;
                        --rdp-caption-font-size: 14px;
                        font-size: 13px;
                        margin: 0;
                      }
                      .dark .rdp-root {
                        --rdp-range_middle-background-color: var(--primary-dark-color);
                        color: #e5e7eb;
                      }
                      .rdp-day_selected {
                        background-color: var(--rdp-accent-color) !important;
                      }
                      .rdp-day_range_middle {
                        background-color: var(--rdp-range_middle-background-color) !important;
                        color: inherit !important;
                      }
                    `}</style>
                    <DayPicker
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      min={1}
                      disabled={{ before: new Date() }}
                      className="m-0"
                    />
                    <div className="flex justify-end p-2 border-t border-gray-100 dark:border-gray-700 mt-2">
                      <Button size="small" onClick={() => setShowCalendar(false)}>Done</Button>
                    </div>
                  </div>
                )}
                
                {(errors.moveInDate || errors.checkOutDate) && (
                  <p className="text-sm text-red-500 mt-1">Please select both check-in and check-out dates.</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-sm mb-2 text-text-primary dark:text-gray-100">
                    Number of Occupants
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => handleOccupantsChange(Math.max(1, getValues('occupantsCount') - 1))}
                      disabled={getValues('occupantsCount') <= 1}
                      className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FaChevronLeft size={14} />
                    </button>
                    <span className="text-xl font-semibold min-w-[50px] text-center">
                      {getValues('occupantsCount')}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOccupantsChange(Math.min(room.capacity, getValues('occupantsCount') + 1))}
                      disabled={getValues('occupantsCount') >= room.capacity}
                      className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FaChevronRight size={14} />
                    </button>
                    <span className="text-sm text-gray-500">/ {room.capacity} (Max)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-sm mb-2 text-text-primary dark:text-gray-100">
                  Role
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Controller
                  name="role"
                  control={control}
                  rules={{ required: "Role is required" }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={[
                        { value: 'student', label: 'Student' },
                        { value: 'staff', label: 'Staff' },
                        { value: 'faculty', label: 'Faculty' },
                        { value: 'other', label: 'Other' },
                      ]}
                      value={field.value ? { value: field.value, label: field.value.charAt(0).toUpperCase() + field.value.slice(1) } : null}
                      onChange={(val: any) => field.onChange(val?.value)}
                      placeholder="Select your role..."
                      classNames={{
                        control: (state) => `!bg-white dark:!bg-gray-900 !border ${state.isFocused ? '!border-primary dark:!border-primary !ring-1 !ring-primary' : '!border-gray-300 dark:!border-gray-700'} !rounded-lg !p-1.5 !shadow-none transition-all`,
                        singleValue: () => `!text-text-primary dark:!text-gray-100`,
                        menu: () => `!bg-white dark:!bg-gray-900 !border !border-gray-200 dark:!border-gray-700 !shadow-xl !rounded-lg !mt-1 z-50 overflow-hidden`,
                        menuList: () => `!p-0`,
                        option: (state) => `!cursor-pointer ${state.isSelected ? '!bg-primary/10 !text-primary dark:!text-primary font-medium' : state.isFocused ? '!bg-gray-100 dark:!bg-gray-800 !text-text-primary dark:!text-gray-100' : '!bg-transparent dark:!bg-transparent !text-text-primary dark:!text-gray-100'} !px-3 !py-1.5 !text-sm transition-colors`,
                        indicatorSeparator: () => `!bg-gray-200 dark:!bg-gray-700`,
                        dropdownIndicator: () => `!text-gray-400 dark:!text-gray-500 hover:!text-primary`,
                        placeholder: () => `!text-gray-400 dark:!text-gray-500`,
                        input: () => `dark:!text-gray-100`
                      }}
                      menuPlacement="auto"
                      instanceId="role-select"
                    />
                  )}
                />
                {errors.role && (
                  <p className="text-sm text-red-500 mt-1">{errors.role.message}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-sm mb-2 text-text-primary dark:text-gray-100">
                  Preferred Contact Method
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Controller
                  name="contactMethod"
                  control={control}
                  rules={{ required: "Contact method is required" }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={[
                        { value: 'email', label: 'Email' },
                        { value: 'phone', label: 'Phone' },
                        { value: 'sms', label: 'SMS' },
                      ]}
                      value={field.value ? { value: field.value, label: field.value === 'sms' ? 'SMS' : field.value.charAt(0).toUpperCase() + field.value.slice(1) } : null}
                      onChange={(val: any) => field.onChange(val?.value)}
                      placeholder="Select a contact method..."
                      classNames={{
                        control: (state) => `!bg-white dark:!bg-gray-900 !border ${state.isFocused ? '!border-primary dark:!border-primary !ring-1 !ring-primary' : '!border-gray-300 dark:!border-gray-700'} !rounded-lg !p-1.5 !shadow-none transition-all`,
                        singleValue: () => `!text-text-primary dark:!text-gray-100`,
                        menu: () => `!bg-white dark:!bg-gray-900 !border !border-gray-200 dark:!border-gray-700 !shadow-xl !rounded-lg !mt-1 z-50 overflow-hidden`,
                        menuList: () => `!p-0`,
                        option: (state) => `!cursor-pointer ${state.isSelected ? '!bg-primary/10 !text-primary dark:!text-primary font-medium' : state.isFocused ? '!bg-gray-100 dark:!bg-gray-800 !text-text-primary dark:!text-gray-100' : '!bg-transparent dark:!bg-transparent !text-text-primary dark:!text-gray-100'} !px-3 !py-1.5 !text-sm transition-colors`,
                        indicatorSeparator: () => `!bg-gray-200 dark:!bg-gray-700`,
                        dropdownIndicator: () => `!text-gray-400 dark:!text-gray-500 hover:!text-primary`,
                        placeholder: () => `!text-gray-400 dark:!text-gray-500`,
                        input: () => `dark:!text-gray-100`
                      }}
                      menuPlacement="auto"
                      instanceId="contact-method-select"
                    />
                  )}
                />
                {errors.contactMethod && (
                  <p className="text-sm text-red-500 mt-1">{errors.contactMethod.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary dark:text-gray-100">
              <FaComment className="inline mr-2" />
              3. Message to Host
              <span className="text-red-500 ml-1">*</span>
            </h3>
            <div>
              <label className="block font-semibold text-sm mb-2 text-text-primary dark:text-gray-100">
                Tell the host about yourself and why you're interested in this room
              </label>
              <textarea
                rows={5}
                {...register('message', { 
                  required: "Message is required",
                  minLength: {
                    value: 10,
                    message: "Message must be at least 10 characters long.",
                  },
                  validate: {
                    noXss: (value) => !/[<>]/.test(value) || "Special characters like (< >) are not allowed for security reasons.",
                    noSql: (value) => !/(\b(SELECT|UPDATE|DELETE|INSERT|DROP|ALTER|EXEC|UNION)\b)/i.test(value) || "Invalid input detected for security reasons."
                  }
                })}
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:border-primary dark:focus:border-primary bg-white dark:bg-gray-900 text-text-primary dark:text-gray-100"
                placeholder="Hello! I'm a [student/staff] at TAU looking for a place near the university. Please let me know if this is available..."
              />
              {errors.message && (
                <p className="text-sm text-red-500 mt-1">{errors.message.message}</p>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="relative overflow-hidden min-h-[400px]">
            <AnimatePresence mode="wait">
              {!isShowingIDList ? (
                <motion.div 
                  key="guidelines"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                      Identity Verification
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      We'll verify your identity with these details. Make sure they match the information on your ID.
                    </p>
                  </div>

                  <div className="bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50">
                    <div className="text-sm font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      Please prepare a valid ID and make sure your camera is turned on.
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                    <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/50 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg text-primary shrink-0">
                          <ShieldCheck size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-800 dark:text-gray-200">Have your valid ID ready</p>
                          <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">Confirm your identity as the authorized representative.</p>
                          <button 
                            type="button"
                            onClick={() => setIsShowingIDList(true)}
                            className="text-[10px] font-bold text-primary mt-1 hover:underline flex items-center gap-1"
                          >
                            <Info size={10} /> List of accepted IDs
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/50 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg text-primary shrink-0">
                          <FaCamera size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-800 dark:text-gray-200">Check your camera</p>
                          <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">Ensure your laptop or desktop has a working webcam.</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/50 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg text-primary shrink-0">
                          <FaIdCard size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-800 dark:text-gray-200">Use your physical ID</p>
                          <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">Capture the original document. Avoid digital screens.</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/50 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg text-primary shrink-0">
                          <FaCheck size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-800 dark:text-gray-200">Keep your face clear</p>
                          <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">Ensure features are not obstructed during liveness check.</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/50 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg text-primary shrink-0">
                          <Info size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-800 dark:text-gray-200">Show details clearly</p>
                          <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">Your ID must be fully visible and readable. No redacting.</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/50 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg text-primary shrink-0">
                          <Lightbulb size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-800 dark:text-gray-200">Find good lighting</p>
                          <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">Stay in a well-lit area with a plain background.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-6 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-[10px] text-gray-500 italic">
                      Note: Identity verification is part of our Know Your Customer (KYC) process. You won't be able to proceed until this step is completed.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="idList"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button 
                        type="button"
                        onClick={() => setIsShowingIDList(false)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                      >
                        <ChevronLeft />
                      </button>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">List of valid IDs</h3>
                    </div>
                    <button onClick={() => setIsShowingIDList(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                       <FaTimes />
                    </button>
                  </div>

                  {/* Tab Switcher */}
                  <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6">
                    <button 
                      type="button"
                      onClick={() => setSelectedIDTab("primary")}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${selectedIDTab === 'primary' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                      Primary IDs
                    </button>
                    <button 
                      type="button"
                      onClick={() => setSelectedIDTab("secondary")}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${selectedIDTab === 'secondary' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                      Secondary IDs
                    </button>
                  </div>

                  <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    <AnimatePresence mode="wait">
                      <motion.div 
                        key={selectedIDTab}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-2 lg:grid-cols-3 gap-3"
                      >
                        {selectedIDTab === 'primary' ? (
                          <>
                            {[
                              { name: "Driver's License", src: "/images/id-license.png" },
                              { name: "SSS / UMID ID", src: "/images/id-sss.png" },
                              { name: "Passport", src: "/images/id-passport.png" },
                              { name: "National ID", src: "/images/id-national-id.png" },
                              { name: "PRC ID", src: "/images/id-prc.png" },
                              { name: "Voter's ID", src: "/images/id-voters.png" },
                            ].map((id) => (
                              <div key={id.name} className="group p-2.5 rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-primary transition-all shadow-sm flex flex-col items-center gap-3 text-center">
                                <div className="w-full aspect-[1.6/1] rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900 shadow-inner">
                                   <img 
                                    src={id.src} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    alt={id.name}
                                   />
                                </div>
                                <p className="text-[9px] font-black uppercase tracking-tighter text-gray-700 dark:text-gray-300 leading-tight">
                                  {id.name}
                                </p>
                              </div>
                            ))}
                          </>
                        ) : (
                          <>
                            {[
                              { name: "Student ID (COR)", icon: <User size={20} />, color: "bg-blue-600 shadow-blue-200", src: "/images/id-secondary-studentID.png" },
                              { name: "Staff ID", icon: <User size={20} />, color: "bg-indigo-600 shadow-indigo-200", src: "/images/id-secondary-staffID.png" },
                              { name: "Faculty ID", icon: <User size={20} />, color: "bg-emerald-600 shadow-emerald-200", src: "/images/id-secondary-facultyID.png" },
                              { name: "Pag-IBIG ID", icon: <Info size={20} />, color: "bg-gradient-to-br from-blue-500/10 to-blue-600/20 text-blue-600", src: "/images/id-secondary-pag-ibig.png" },
                              { name: "Police Clearance", icon: <ShieldCheck size={20} />, color: "bg-blue-50 text-blue-600", src: "/images/id-secondary-police-clearance.png" },
                              { name: "NBI Clearance", icon: <Info size={20} />, color: "bg-green-50 text-green-600", src: "/images/id-secondary-nbi-clearance.png" },
                              { name: "PhilHealth ID", icon: <Info size={20} />, color: "bg-teal-50 text-teal-600", src: "/images/id-secondary-philhealth.png" },
                              { name: "Postal ID", icon: <CreditCard size={20} />, color: "bg-rose-50 text-rose-600", src: "/images/id-secondary-postal-id.png" },
                              { name: "TIN ID", icon: <CreditCard size={20} />, color: "bg-orange-50 text-orange-600", src: "/images/id-secondary-tin-id.png" },
                            ].map((id: { name: string, icon?: any, color?: string, src?: string }) => (
                              <div key={id.name} className="group p-2.5 rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-primary transition-all shadow-sm flex flex-col items-center gap-3 text-center">
                                <div className="w-full aspect-[1.6/1] rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900 shadow-inner flex items-center justify-center">
                                   {id.src ? (
                                     <img 
                                      src={id.src} 
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                      alt={id.name}
                                     />
                                   ) : (
                                     <div className={`w-full h-full ${id.color} flex flex-col items-center justify-center text-white p-3 gap-1 group-hover:scale-110 transition-transform duration-500`}>
                                       {id.icon}
                                       <span className="text-[7px] font-black uppercase tracking-tighter opacity-70">Official Doc</span>
                                     </div>
                                   )}
                                </div>
                                <p className="text-[9px] font-black uppercase tracking-tighter text-gray-700 dark:text-gray-300 leading-tight">
                                  {id.name}
                                </p>
                              </div>
                            ))}
                          </>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <div className="p-4 bg-primary/5 dark:bg-primary/10 border border-primary/10 rounded-2xl">
                    <p className="text-[10px] text-primary font-bold flex items-center gap-2">
                      <ShieldCheck size={14} />
                      Only clear, original documents will be accepted for verification.
                    </p>
                  </div>

                  <div className="flex justify-center pt-2">
                    <button 
                       type="button"
                       onClick={() => setIsShowingIDList(false)}
                       className="text-xs font-bold text-gray-500 hover:text-primary transition-colors underline underline-offset-4"
                     >
                      Understood, let's continue
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
             <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <User className="text-primary" size={20} />
                  Step 1: Capture Your Selfie
                </h3>
                <p className="text-xs text-gray-500">Position your face within the oval and look straight at the camera.</p>
             </div>

             <div className="relative aspect-[3/4] max-w-[300px] mx-auto rounded-3xl overflow-hidden shadow-2xl bg-black group">
                {!capturedSelfie ? (
                  <>
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{ facingMode: "user" }}
                      className="w-full h-full object-cover"
                    />
                    {/* Oval Overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                       <svg viewBox="0 0 100 100" className="w-full h-full text-black/60 fill-current">
                          <path d="M 0 0 L 100 0 L 100 100 L 0 100 Z M 50 15 C 30 15 15 35 15 50 C 15 65 30 85 50 85 C 70 85 85 65 85 50 C 85 35 70 15 50 15 Z" fillRule="evenodd" />
                          <ellipse cx="50" cy="50" rx="35" ry="35" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="2 2" />
                       </svg>
                    </div>
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                        type="button"
                        onClick={captureSelfie}
                        className="bg-white/90 backdrop-blur-md text-gray-900 px-6 py-2.5 rounded-full font-bold text-xs shadow-lg flex items-center gap-2 hover:bg-white transition-all transform hover:scale-105"
                       >
                         <FaCamera /> Capture Selfie
                       </button>
                    </div>
                  </>
                ) : (
                  <div className="relative w-full h-full">
                    <img src={capturedSelfie} className="w-full h-full object-cover" alt="Captured Selfie" />
                    <button 
                      type="button"
                      onClick={() => setCapturedSelfie(null)}
                      className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-red-500 transition-colors"
                    >
                      <FaTimes />
                    </button>
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                       <span className="bg-green-500 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">Good Image!</span>
                    </div>
                  </div>
                )}
             </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
             <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <FaIdCard className="text-primary" />
                  Step 2: Capture Your ID Card
                </h3>
                <p className="text-xs text-gray-500">Align your ID card with the rectangle. Ensure text is clear and readable.</p>
             </div>

             <div className="relative aspect-[3/4] max-w-[300px] mx-auto rounded-3xl overflow-hidden shadow-2xl bg-black group">
                {!capturedID ? (
                  <>
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{ facingMode: "environment" }}
                      className="w-full h-full object-cover"
                    />
                    {/* Card Overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                       <svg viewBox="0 0 100 100" className="w-full h-full text-black/60 fill-current">
                          <path d="M 0 0 L 100 0 L 100 100 L 0 100 Z M 15 35 L 85 35 L 85 65 L 15 65 Z" fillRule="evenodd" />
                          <rect x="15" y="35" width="70" height="30" rx="3" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="2 2" />
                       </svg>
                    </div>
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                        type="button"
                        onClick={captureID}
                        className="bg-white/90 backdrop-blur-md text-gray-900 px-6 py-2.5 rounded-full font-bold text-xs shadow-lg flex items-center gap-2 hover:bg-white transition-all transform hover:scale-105"
                       >
                         <FaCamera /> Capture ID
                       </button>
                    </div>
                  </>
                ) : (
                  <div className="relative w-full h-full">
                    <img src={capturedID} className="w-full h-full object-cover" alt="Captured ID" />
                    <button 
                      type="button"
                      onClick={() => setCapturedID(null)}
                      className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-red-500 transition-colors"
                    >
                      <FaTimes />
                    </button>
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                       <span className="bg-green-500 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">Good Image!</span>
                    </div>
                  </div>
                )}
             </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <FaCheck className="text-primary" />
              Final Summary & Review
            </h3>
            
            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 space-y-5">
              <div className="grid grid-cols-2 gap-6 text-xs">
                <div>
                   <p className="text-gray-400 uppercase font-black tracking-widest mb-1">Check In</p>
                   <p className="font-bold">{watchedValues[1] ? format(new Date(watchedValues[1]), 'MMM dd, yyyy') : '-'}</p>
                </div>
                <div>
                   <p className="text-gray-400 uppercase font-black tracking-widest mb-1">Payment</p>
                   <p className="font-bold capitalize">{watchedValues[0]}</p>
                </div>
              </div>

              <div className="flex gap-4">
                 <div className="flex-1 space-y-1">
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Your Selfie</p>
                    <div className="aspect-square rounded-2xl border-2 border-primary/20 overflow-hidden bg-gray-200 shadow-inner">
                       {capturedSelfie ? <img src={capturedSelfie} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><FaUser className="text-gray-300 text-2xl" /></div>}
                    </div>
                 </div>
                 <div className="flex-1 space-y-1">
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Valid ID</p>
                    <div className="aspect-square rounded-2xl border-2 border-primary/20 overflow-hidden bg-gray-200 shadow-inner">
                       {capturedID ? <img src={capturedID} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><FaIdCard className="text-gray-300 text-2xl" /></div>}
                    </div>
                 </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                   <div>
                      <span className="text-[10px] text-blue-500 uppercase font-black tracking-widest block opacity-70 mb-0.5">Verification Fee Included</span>
                      <span className="font-black text-blue-600 dark:text-blue-400 text-xl tracking-tighter">₱ {room.reservationFee.toLocaleString()}</span>
                   </div>
                   <div className="bg-blue-600 text-white p-2 rounded-xl">
                      <ShieldCheck size={24} />
                   </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} width="xl">
      <div className="max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-text-primary dark:text-gray-100">
            {submitted ? "Inquiry Sent!" : "Send Inquiry"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <FaTimes className="text-xl text-gray-500" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {renderStepIndicator()}
                {renderStepContent()}

                <div className="flex justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    disabled={currentStep === 1}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      currentStep === 1
                        ? 'opacity-50 cursor-not-allowed text-gray-400 border-gray-200 dark:border-gray-700'
                        : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-text-primary dark:text-gray-100'
                    }`}
                  >
                    <FaChevronLeft size={14} />
                    Previous
                  </button>

                  {currentStep < totalSteps ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      disabled={!isStepCompleted(currentStep)}
                      className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                        isStepCompleted(currentStep)
                          ? 'bg-primary hover:bg-primary-dark text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Next
                      <FaChevronRight size={14} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleFormSubmit(onSubmitForm)}
                      disabled={!isStepCompleted(currentStep) || isUploading}
                      className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                        isStepCompleted(currentStep)
                          ? 'bg-primary hover:bg-primary-dark text-white shadow-md'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Uploading Docs...
                        </>
                      ) : (
                        <>
                          Send Inquiry
                          <FaCheck size={14} />
                        </>
                      )}
                    </button>
                  )}
                </div>

                <p className="text-xs text-center text-gray-500 mt-4">
                  By sending this inquiry, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="relative">
                      <div className="aspect-[4/3] w-full overflow-hidden">
                        {(room.images && room.images.length > 0) || getSafeImageSrcString("/images/placeholder.jpg") ? (
                          <img
                            src={getSafeImageSrcString((room.images && room.images.length > 0) ? room.images[currentImageIndex].url : "/images/placeholder.jpg")}
                            alt={room.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400">No image available</span>
                          </div>
                        )}
                      </div>
                      {(room.images && room.images.length > 1) && (
                        <>
                          <button
                            onClick={handleImagePrev}
                            className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                          >
                            <FaChevronLeft size={16} />
                          </button>
                          <button
                            onClick={handleImageNext}
                            className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                          >
                            <FaChevronRight size={16} />
                          </button>
                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1.5">
                            {room.images.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => handleImageSelect(index)}
                                className={`w-2 h-2 rounded-full transition-colors ${
                                  currentImageIndex === index ? "bg-white" : "bg-white/50"
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-lg font-bold text-text-primary dark:text-gray-100 mb-2">
                      {room.name}
                    </h4>
                    <div className="space-y-1 mb-3">
                      <p className="text-2xl font-bold text-primary dark:text-primary-light">
                        ₱ {room.price.toLocaleString()}
                        <span className="text-sm font-medium text-gray-500 ml-1">/mo</span>
                      </p>
                      <div className="flex items-center gap-2 text-xs text-primary font-semibold bg-primary/10 dark:bg-primary/20 px-2 py-1 rounded w-fit">
                        <FaCreditCard size={10} />
                        <span>₱ {room.reservationFee.toLocaleString()} Reservation Fee</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-text-secondary dark:text-gray-400">
                        <span className="font-medium">Room Type:</span> {room.roomType}
                      </p>
                      <p className="text-sm text-text-secondary dark:text-gray-400">
                        <span className="font-medium">Capacity:</span> {room.capacity}
                      </p>
                      <p className="text-sm text-text-secondary dark:text-gray-400">
                        <span className="font-medium">Available:</span> {room.availableSlots}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 bg-primary/5 dark:bg-primary/10 rounded-xl p-4 border border-primary/20 dark:border-primary/30">
                    <h5 className="font-semibold text-primary dark:text-primary-light mb-2">
                      Summary
                    </h5>
                    <div className="space-y-1 text-sm text-text-secondary dark:text-gray-400">
                      <p>Step {currentStep} of {totalSteps}</p>
                      {getValues('paymentMethod') && <p>Pay: {getValues('paymentMethod')}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {submitted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                >
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center max-w-md w-full shadow-2xl"
                  >
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <FaCheck size={40} className="text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Inquiry Sent!</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Wait for host approval.
                    </p>
                    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1.5 }}
                        className="h-full bg-primary"
                      />
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default InquiryModal;

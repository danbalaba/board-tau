"use client";

import React, { useState, useEffect } from "react";
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
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

/**
 * Only allow blob URLs generated from validated File objects as image sources.
 * Prevents DOM text reinterpretation and XSS via src attribute injection.
 */
const getSafeImageSrc = (file: File | null): string => {
  if (!file || !(file instanceof File)) return '';
  
  // Strict allowlist for basic image types only (blocks SVG and arbitrary executables)
  const safeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
  if (!safeTypes.includes(file.type)) return '';

  try {
    const url = URL.createObjectURL(file);
    
    // Explicitly validate the resulting string is a safe protocol and contains no HTML-like characters
    // Using a more comprehensive character filter including ', `, ;, and () to satisfy aggressive CodeQL rules.
    const lower = url.toLowerCase();
    const isSafeProtocol = lower.startsWith('blob:') || lower.startsWith('https://') || lower.startsWith('http://');
    const hasDangerousChars = /[<>"'`();\\]/.test(url);

    if (isSafeProtocol && !hasDangerousChars) {
      return url;
    }
  } catch (error) {
    return '';
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
  const [isUploading, setIsUploading] = useState(false);
  const { edgestore } = useEdgeStore();

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
    step4: profilePhoto !== null,
    step5: idAttachment !== null,
    step6: true, // Always completed
  };

  const totalSteps = 6;

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
        return profilePhoto !== null;
      case 5:
        return idAttachment !== null;
      case 6:
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
      case 3:
        fieldsToValidate = ['message'];
        break;
      case 4:
        fieldsToValidate = [];
        break;
      case 5:
        fieldsToValidate = [];
        break;
      case 6:
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
      if (data.profilePhoto) {
        const res = await edgestore.publicFiles.upload({
          file: data.profilePhoto,
        });
        profilePhotoUrl = res.url;
      }

      let idAttachmentUrl = null;
      if (data.idAttachment) {
        const res = await edgestore.publicFiles.upload({
          file: data.idAttachment,
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
          {[1, 2, 3, 4, 5, 6].map((step) => {
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
                  {step === 1 ? "Pay" : step === 2 ? "Stay" : step === 3 ? "Note" : step === 4 ? "Photo" : step === 5 ? "ID" : "Review"}
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
              <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors opacity-50 ${getValues('paymentMethod') === 'gcash' ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                <input
                  type="radio"
                  value="gcash"
                  {...register('paymentMethod', { required: "Payment method is required" })}
                  className="accent-primary"
                  disabled
                />
                <div className="flex-1">
                  <p className="font-medium">GCash <span className="text-xs text-gray-400">(Coming Soon)</span></p>
                  <p className="text-sm text-text-secondary dark:text-gray-400">Mobile wallet payment</p>
                </div>
              </label>
              <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors opacity-50 ${getValues('paymentMethod') === 'maya' ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                <input
                  type="radio"
                  value="maya"
                  {...register('paymentMethod', { required: "Payment method is required" })}
                  className="accent-primary"
                  disabled
                />
                <div className="flex-1">
                  <p className="font-medium">Maya <span className="text-xs text-gray-400">(Coming Soon)</span></p>
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
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary dark:text-gray-100">
              <FaUser className="inline mr-2" />
              4. Profile Photo
              <span className="text-red-500 ml-1">*</span>
            </h3>
            <div className="space-y-3">
              <p className="text-sm text-text-secondary dark:text-gray-400">
                Help hosts recognize you by adding a profile photo.
              </p>
              <FileUpload
                id="profilePhoto"
                label=""
                description="JPG, PNG, or WEBP (max. 5MB)"
                accept=".jpg,.jpeg,.png,.webp"
                onFileSelect={(file: File | null) => {
                  if (file) {
                    // Strict file type validation
                    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                    if (!validTypes.includes(file.type)) {
                      toast.error("Invalid file type. Only JPG, PNG, and WEBP allowed.");
                      return;
                    }
                    if (file.name.match(/\.(php|exe|bat|sh|js|html)$/i)) {
                      toast.error("Malicious file extensions are not allowed.");
                      return;
                    }
                    if (file.size > 5 * 1024 * 1024) {
                      toast.error("File size exceeds 5MB limit. Please choose a smaller file.");
                      return;
                    }

                    setProfilePhoto(file);
                    setValue('profilePhoto', file);
                  } else {
                    setProfilePhoto(null);
                    setValue('profilePhoto', null);
                  }
                  // Force step completion update
                  setCurrentStep(prev => prev);
                }}
                fileName={profilePhoto?.name}
                required={true}
              />
              {profilePhoto && (
                <div className="mt-2">
                  <img
                    src={getSafeImageSrc(profilePhoto)}
                    alt="Profile preview"
                    className="w-24 h-24 object-cover rounded-lg border-2 border-primary"
                  />
                </div>
              )}
              {!profilePhoto && (
                <p className="text-sm text-red-500">Please upload a profile photo</p>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary dark:text-gray-100">
              <FaIdCard className="inline mr-2" />
              5. Attach ID
              <span className="text-red-500 ml-1">*</span>
            </h3>
            <div className="space-y-3">
              <p className="text-sm text-text-secondary dark:text-gray-400">
                Please upload your ID based on your role:
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-sm text-text-secondary dark:text-gray-400">
                  • <span className="font-medium">Student:</span> Certificate of Registration (COR)
                </p>
                <p className="text-sm text-text-secondary dark:text-gray-400">
                  • <span className="font-medium">Staff:</span> Staff ID Card
                </p>
                <p className="text-sm text-text-secondary dark:text-gray-400">
                  • <span className="font-medium">Faculty:</span> Faculty ID Card
                </p>
                <p className="text-sm text-text-secondary dark:text-gray-400">
                  • <span className="font-medium">Other:</span> Valid Government ID
                </p>
              </div>
              <FileUpload
                id="idAttachment"
                label=""
                description="JPG, PNG, or WEBP (max. 5MB)"
                accept=".jpg,.jpeg,.png,.webp"
                onFileSelect={(file: File | null) => {
                  if (file) {
                    // Strict file type validation
                    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                    if (!validTypes.includes(file.type)) {
                      toast.error("Invalid file type. Only JPG, PNG, and WEBP allowed.");
                      return;
                    }
                    if (file.name.match(/\.(php|exe|bat|sh|js|html)$/i)) {
                      toast.error("Malicious file extensions are not allowed.");
                      return;
                    }
                    if (file.size > 5 * 1024 * 1024) {
                      toast.error("File size exceeds 5MB limit. Please choose a smaller file.");
                      return;
                    }

                    setIdAttachment(file);
                    setValue('idAttachment', file);
                  } else {
                    setIdAttachment(null);
                    setValue('idAttachment', null);
                  }
                  // Force step completion update
                  setCurrentStep(prev => prev);
                }}
                fileName={idAttachment?.name}
                required={true}
              />
              {idAttachment && (
                <div className="mt-2">
                  <img
                    src={getSafeImageSrc(idAttachment)}
                    alt="ID preview"
                    className="w-24 h-24 object-cover rounded-lg border-2 border-primary"
                  />
                </div>
              )}
              {!idAttachment && (
                <p className="text-sm text-red-500">Please upload your ID</p>
              )}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary dark:text-gray-100 flex items-center gap-2">
              <FaCheck className="text-primary" />
              6. Review Your Inquiry
            </h3>
            
            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4 shadow-inner">
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
                <div>
                  <span className="font-semibold block text-gray-900 dark:text-gray-100 mb-1">Check In</span>
                  {watchedValues[1] ? format(new Date(watchedValues[1]), 'MMM dd, yyyy') : '-'}
                </div>
                <div>
                  <span className="font-semibold block text-gray-900 dark:text-gray-100 mb-1">Check Out</span>
                  {watchedValues[2] ? format(new Date(watchedValues[2]), 'MMM dd, yyyy') : '-'}
                </div>
                <div>
                  <span className="font-semibold block text-gray-900 dark:text-gray-100 mb-1">Role</span>
                  {watchedValues[3]}
                </div>
                <div>
                  <span className="font-semibold block text-gray-900 dark:text-gray-100 mb-1">Payment Method</span>
                  <span className="capitalize">{watchedValues[0]}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50 shadow-sm">
                  <span className="font-bold text-gray-600 dark:text-gray-300">Reservation Fee Due</span>
                  <div className="flex flex-col items-end">
                    <span className="font-black text-blue-600 dark:text-blue-400 text-xl tracking-tight">₱ {room.reservationFee.toLocaleString()}</span>
                    <span className="text-[10px] text-blue-500 uppercase font-black tracking-widest opacity-70">Pay Securely</span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 mt-2 italic">* This is a one-time fee to hold the room. Monthly rent of ₱{room.price.toLocaleString()} is to be paid directly to the landlord.</p>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="font-semibold block text-sm text-gray-900 dark:text-gray-100 mb-2">Message to Landlord</span>
                <p className="text-sm text-gray-700 dark:text-gray-400 italic">"{watchedValues[5]}"</p>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-4">
                <div className="flex items-center gap-2 text-sm">
                  {profilePhoto ? <FaCheck className="text-primary" /> : <FaTimes className="text-red-500" />}
                  <span>Profile Photo</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {idAttachment ? <FaCheck className="text-primary" /> : <FaTimes className="text-red-500" />}
                  <span>Valid ID</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
               <FaCheck size={10} /> Everything looks great. Hit confirm below to send this securely.
            </p>
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
                        <img
                          src={(room.images && room.images.length > 0) ? room.images[currentImageIndex].url : "/images/placeholder.jpg"}
                          alt={room.name}
                          className="w-full h-full object-cover"
                        />
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

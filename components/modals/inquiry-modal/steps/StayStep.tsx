import React from "react";
import { FaCalendar, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInDays } from "date-fns";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import { Controller } from "react-hook-form";
import Button from "@/components/common/Button";
import { FormData } from "../useInquiryLogic";
import { ModernInquirySelect } from "../components/ModernInquirySelect";
import { sanitizeSecurityString, validateStrictChars, isCleanString, validatePhoneNumber } from "../validation/security";

interface StayStepProps {
  dateRange: DateRange | undefined;
  setDateRange: (val: DateRange | undefined) => void;
  showCalendar: boolean;
  setShowCalendar: (val: boolean) => void;
  getValues: any;
  setValue: any;
  control: any;
  errors: any;
  room: any;
  activeStay?: { endDate: string; status: string; listing: { title: string } } | null;
  register: any;
  watch: any;
  clearErrors: any;
}

const StayStep: React.FC<StayStepProps> = ({
  dateRange, setDateRange,
  showCalendar, setShowCalendar,
  getValues, setValue,
  control, errors, room,
  activeStay, register,
  watch, clearErrors
}) => {
  const moveInDate = watch('moveInDate');
  const contactMethod = watch('contactMethod');
  
  const hasOverlap = activeStay && moveInDate && new Date(moveInDate) < new Date(activeStay.endDate);
  const handleOccupantsChange = (value: number) => {
    setValue('occupantsCount', value, { shouldValidate: true });
  };
  
  const getContactInfoProps = () => {
    if (contactMethod === 'email') {
      return {
        label: 'Email Address',
        placeholder: 'example@email.com',
        type: 'email',
        validation: {
          required: "Email is required",
          validate: (value: string) => {
            const emailRegex = /\S+@\S+\.\S+/;
            if (!emailRegex.test(value)) {
              return "Please enter a valid email address";
            }
            if (!isCleanString(value)) {
              return "Please remove special characters (< > { } [ ])";
            }
            return true;
          }
        }
      };
    }

    return {
      label: 'Phone Number (Mobile/Viber/WhatsApp)',
      placeholder: 'e.g. 09123456789 or +63...',
      type: 'text',
      validation: {
        required: "Information is required",
        validate: (value: string) => {
          // Double check method inside validation to avoid race conditions
          const currentMethod = getValues('contactMethod');
          if (currentMethod === 'email') return true; // Let the email check handle it if it switched

          if (!validatePhoneNumber(value)) {
            return "Please enter a valid phone number (e.g. 09123456789 or +63...)";
          }
          if (!isCleanString(value)) {
            return "Please remove special characters (< > { } [ ])";
          }
          return true;
        }
      }
    };
  };

  const handleClearDates = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent calendar from opening
    setDateRange({ from: undefined, to: undefined });
    setValue('moveInDate', '', { shouldValidate: true });
    setValue('checkOutDate', '', { shouldValidate: true });
  };

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
            {dateRange?.from && (
              <div className="flex items-center gap-2">
                {dateRange?.to && (
                  <div className="text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-md shadow-sm border border-blue-200 dark:border-blue-800/50">
                    {differenceInDays(dateRange.to, dateRange.from)} nights
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleClearDates}
                  className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                  title="Clear dates"
                >
                  <MdClose size={18} />
                </button>
              </div>
            )}
          </div>

          {showCalendar && (
            <div className="absolute top-full left-0 z-50 mt-2 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200 ring-1 ring-black/5 min-w-[350px] w-max">
              <style>{`
                .rdp-root {
                  --rdp-accent-color: var(--primary-color);
                  --rdp-accent-text-color: #fff;
                  --rdp-range_start-color: var(--primary-color);
                  --rdp-range_end-color: var(--primary-color);
                  --rdp-range_middle-background-color: var(--primary-light-color);
                  --rdp-cell-size: 44px;
                  --rdp-caption-font-size: 18px;
                  font-size: 15px;
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

          {hasOverlap && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl"
            >
              <div className="flex gap-3">
                <span className="text-xl">🏠</span>
                <div>
                  <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Active Residence Conflict</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 leading-relaxed">
                    You currently have an active stay at <span className="font-bold underline italic">&apos;{activeStay?.listing.title}&apos;</span> until <span className="font-bold">{format(new Date(activeStay?.endDate || ''), 'MMMM dd, yyyy')}</span>. 
                    <br />
                    Please select a move-in date after your current check-out to avoid double-booking.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Dynamic Spacer for Calendar */}
        <AnimatePresence>
          {showCalendar && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 420, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            />
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-sm mb-2 text-text-primary dark:text-gray-100">
              Number of Occupants (Including you)
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
                onClick={() => handleOccupantsChange(Math.min(room.availableSlots, getValues('occupantsCount') + 1))}
                disabled={getValues('occupantsCount') >= room.availableSlots}
                className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FaChevronRight size={14} />
              </button>
              <span className="text-sm text-gray-500">/ {room.availableSlots} (Available)</span>
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
              <ModernInquirySelect
                options={[
                  { value: 'STUDENT', label: 'Student' },
                  { value: 'STAFF', label: 'Staff' },
                  { value: 'FACULTY', label: 'Faculty' },
                  { value: 'OTHER', label: 'Other' },
                ]}
                value={field.value}
                onChange={field.onChange}
                placeholder="Select your role..."
                error={errors.role?.message}
              />
            )}
          />
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
              <ModernInquirySelect
                options={[
                  { value: 'email', label: 'Email' },
                  { value: 'phone', label: 'Phone' },
                ]}
                value={field.value}
                onChange={(val) => {
                  field.onChange(val);
                  // Reset field and clear errors when method changes
                  setValue('contactInfo', '', { shouldValidate: false });
                  clearErrors('contactInfo');
                }}
                placeholder="Select a contact method..."
                error={errors.contactMethod?.message}
              />
            )}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {contactMethod && (
          <motion.div
            key={contactMethod}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            <label className="block font-semibold text-sm text-text-primary dark:text-gray-100">
              {getContactInfoProps().label}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <Controller
              key={contactMethod} // CRITICAL: Forces RHF to reset internal rules when method changes
              name="contactInfo"
              control={control}
              rules={getContactInfoProps().validation}
              render={({ field }) => (
                <input
                  {...field}
                  type={getContactInfoProps().type}
                  placeholder={getContactInfoProps().placeholder}
                  className={`w-full p-4 bg-white dark:bg-gray-900 border rounded-xl outline-none transition-all ${
                    errors.contactInfo 
                      ? 'border-red-500 focus:ring-1 focus:ring-red-500' 
                      : 'border-gray-300 dark:border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary'
                  }`}
                />
              )}
            />
            {errors.contactInfo && (
              <p className="text-xs text-red-500 font-medium">{errors.contactInfo.message}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StayStep;

import React from "react";
import { FaCalendar, FaChevronLeft, FaChevronRight, FaCheck } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { Home, Calendar, Users, Sparkles, ShieldCheck, User, UserCheck, GraduationCap, HelpCircle, Mail, PhoneCall } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInDays } from "date-fns";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import { Controller } from "react-hook-form";
import { createPortal } from "react-dom";
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
  const isSoloBuyout = watch('isSoloBuyout');

  const handleOccupantsChange = (value: number) => {
    if (isSoloBuyout) return; // Prevent changing occupants if solo buyout is checked
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
            if (!isCleanString(value)) {
              return "Please remove special characters (< > { } [ ])";
            }
            const emailRegex = /\S+@\S+\.\S+/;
            if (!emailRegex.test(value)) {
              return "Please enter a valid email address";
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Calendar size={18} />
            </div>
            Step 2: Stay & Occupancy Details
            <span className="text-red-500 font-bold ml-0.5">*</span>
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Specify your desired check-in date, length of stay, occupants count, and role.
          </p>
        </div>
        <span className="hidden sm:inline-flex text-[11px] font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full items-center gap-1 shrink-0">
          Duration & Role
        </span>
      </div>

      <div className="space-y-4">
        {/* Stay Range Selector Box */}
        <div className="relative">
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center justify-between">
            <span>Stay Range (Check-in to Check-out)</span>
            <span className="text-[10px] text-primary font-bold">Click to pick dates</span>
          </label>

          <div 
            onClick={() => setShowCalendar(!showCalendar)}
            className="flex items-center gap-3 w-full p-4 border-2 border-gray-200 dark:border-gray-800 rounded-2xl cursor-pointer bg-white dark:bg-gray-900/60 group hover:border-primary transition-all duration-200 shadow-sm select-none"
          >
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
              <Calendar size={20} />
            </div>

            <div className="flex-1 min-w-0">
              {dateRange?.from ? (
                <div className="flex flex-col">
                  <span className="text-xs font-mono font-black text-gray-900 dark:text-white truncate">
                    {format(dateRange.from, 'MMM dd, yyyy')} — {dateRange.to ? format(dateRange.to, 'MMM dd, yyyy') : 'Select check-out date'}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">Selected Booking Period</span>
                </div>
              ) : (
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-400 dark:text-gray-500">Choose check-in and check-out dates...</span>
                  <span className="text-[10px] text-gray-400/80">Opens interactive calendar</span>
                </div>
              )}
            </div>

            {dateRange?.from && (
              <div className="flex items-center gap-2 shrink-0">
                {dateRange?.to && (
                  <div className="text-xs font-black bg-primary/10 text-primary px-3 py-1 rounded-xl border border-primary/20 shadow-xs flex items-center gap-1">
                    <Sparkles size={12} />
                    {differenceInDays(dateRange.to, dateRange.from)} nights
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleClearDates}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-950/40 text-gray-400 hover:text-red-500 rounded-xl transition-colors cursor-pointer"
                  title="Clear dates"
                >
                  <MdClose size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Check-In & Check-Out Date Summary Grid */}
          <div className="grid grid-cols-2 gap-2.5 mt-2.5">
            <div className="bg-gray-50 dark:bg-gray-900/60 p-3 rounded-2xl border border-gray-200 dark:border-gray-800">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block mb-0.5">Check-In Date</span>
              <span className="text-xs font-black text-gray-900 dark:text-white font-mono">
                {dateRange?.from ? format(dateRange.from, 'MMM dd, yyyy') : <span className="text-gray-400 font-normal italic">Not selected</span>}
              </span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/60 p-3 rounded-2xl border border-gray-200 dark:border-gray-800">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block mb-0.5">Check-Out Date</span>
              <span className="text-xs font-black text-gray-900 dark:text-white font-mono">
                {dateRange?.to ? format(dateRange.to, 'MMM dd, yyyy') : <span className="text-gray-400 font-normal italic">Not selected</span>}
              </span>
            </div>
          </div>

          {(errors.moveInDate || errors.checkOutDate) && (
            <p className="text-xs text-red-500 font-bold mt-1.5 animate-in fade-in">Please select both check-in and check-out dates.</p>
          )}

          {hasOverlap && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl"
            >
              <div className="flex gap-3">
                <Home className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-extrabold text-amber-900 dark:text-amber-200">Active Residence Conflict</p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5 leading-relaxed">
                    You currently have an active stay at <span className="font-bold underline italic">&apos;{activeStay?.listing.title}&apos;</span> until <span className="font-bold">{format(new Date(activeStay?.endDate || ''), 'MMMM dd, yyyy')}</span>. 
                    <br />
                    Please select a check-in date after your current check-out to avoid double-booking.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* MOBILE FULL-SCREEN / BOTTOM-SHEET MODAL CALENDAR (< 640px) */}
        {typeof document !== "undefined" && createPortal(
          <AnimatePresence>
            {showCalendar && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="sm:hidden fixed inset-0 z-[999999] bg-slate-900/40 dark:bg-black/80 backdrop-blur-xl flex flex-col justify-end p-0"
                onClick={() => setShowCalendar(false)}
              >
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 28, stiffness: 300 }}
                  className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl w-full rounded-t-3xl border-t border-gray-200/80 dark:border-gray-800 p-5 shadow-2xl flex flex-col justify-between h-[560px] max-h-[90vh] overflow-hidden relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="absolute -top-16 -right-16 w-36 h-36 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

                  {/* Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800 shrink-0 relative z-10">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-2xl bg-primary/10 text-primary shadow-xs">
                        <FaCalendar size={16} />
                      </div>
                      <div>
                        <h4 className="font-black text-base text-gray-900 dark:text-white leading-tight">
                          Select Stay Dates
                        </h4>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Interactive check-in & check-out range</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCalendar(false)}
                      className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <MdClose size={20} />
                    </button>
                  </div>

                  {/* Preset Shortcuts */}
                  <div className="py-2 flex items-center gap-1.5 overflow-x-auto custom-scrollbar shrink-0 relative z-10">
                    <span className="text-[9px] font-black uppercase text-gray-400 shrink-0 mr-1">Presets:</span>
                    {[
                      { label: "1 Month", months: 1 },
                      { label: "3 Months", months: 3 },
                      { label: "6 Months", months: 6 },
                      { label: "1 Year", months: 12 },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          const from = dateRange?.from || new Date();
                          const to = new Date(from);
                          to.setMonth(to.getMonth() + preset.months);
                          setDateRange({ from, to });
                        }}
                        className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800/80 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20 text-gray-700 dark:text-gray-300 rounded-lg text-[10px] font-black transition-all border border-gray-200/60 dark:border-gray-700 shrink-0 active:scale-95 cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Body Calendar */}
                  <div className="flex-1 py-1 flex justify-center items-center overflow-hidden relative z-10">
                    <style dangerouslySetInnerHTML={{ __html: `
                      .rdp-root {
                        --rdp-accent-color: var(--primary-color, #2f7d6d);
                        --rdp-accent-text-color: #fff;
                        --rdp-range_start-color: var(--primary-color, #2f7d6d);
                        --rdp-range_end-color: var(--primary-color, #2f7d6d);
                        --rdp-range_middle-background-color: rgba(47, 125, 109, 0.14);
                        --rdp-cell-size: 40px;
                        --rdp-caption-font-size: 15px;
                        font-size: 14px;
                        margin: 0 auto;
                      }
                      .dark .rdp-root {
                        --rdp-range_middle-background-color: rgba(47, 125, 109, 0.28);
                        color: #f3f4f6;
                      }
                      .rdp-day_selected {
                        background-color: var(--rdp-accent-color) !important;
                        color: #fff !important;
                        font-weight: 800 !important;
                        border-radius: 12px !important;
                        box-shadow: 0 4px 12px rgba(47, 125, 109, 0.35) !important;
                      }
                      .rdp-day_range_middle {
                        background-color: var(--rdp-range_middle-background-color) !important;
                        color: var(--primary-color, #2f7d6d) !important;
                        font-weight: 700 !important;
                        border-radius: 6px !important;
                      }
                      .dark .rdp-day_range_middle {
                        color: #5eead4 !important;
                      }
                      .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
                        background-color: rgba(47, 125, 109, 0.12) !important;
                        border-radius: 10px !important;
                      }
                    ` }} />
                    <DayPicker
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      min={1}
                      disabled={{ before: new Date() }}
                      fixedWeeks={true}
                      className="m-0"
                    />
                  </div>

                  {/* Fixed Structural Footer Actions */}
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2 shrink-0 relative z-10">
                    <div className="flex items-center justify-between text-xs font-bold p-2.5 rounded-xl border border-gray-200/80 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
                      {dateRange?.from ? (
                        <>
                          <span className="text-primary font-mono text-[11px] font-black">
                            {format(dateRange.from, 'MMM dd, yyyy')} — {dateRange.to ? format(dateRange.to, 'MMM dd, yyyy') : '...'}
                          </span>
                          {dateRange?.to ? (
                            <span className="font-black bg-primary text-white px-2 py-0.5 rounded-md text-[10px] shadow-xs">
                              {differenceInDays(dateRange.to, dateRange.from)} nights
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-500 font-medium italic">Select check-out</span>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-400 text-[10px] font-medium italic">
                          Pick check-in and check-out dates
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleClearDates(e)}
                        disabled={!dateRange?.from}
                        className="px-4 py-3 rounded-xl border border-red-200 dark:border-red-900/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-extrabold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Clear
                      </button>
                      <Button
                        className="flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-primary/25 cursor-pointer"
                        onClick={() => setShowCalendar(false)}
                      >
                        Apply Dates
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

        {/* DESKTOP FLOATING POP-UP DATE PICKER MODAL (>= 640px) */}
        {typeof document !== "undefined" && createPortal(
          <AnimatePresence>
            {showCalendar && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="hidden sm:flex fixed inset-0 z-[999999] bg-slate-900/35 dark:bg-black/75 backdrop-blur-xl items-center justify-center p-4 overflow-y-auto transition-colors"
                onClick={() => setShowCalendar(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 0.9, y: 20, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl w-[480px] h-[610px] min-h-[610px] sm:max-h-[92vh] rounded-3xl border border-gray-200/80 dark:border-gray-800 p-6 shadow-2xl flex flex-col justify-between overflow-hidden relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="absolute -top-20 -right-20 w-44 h-44 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

                  {/* Modal Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800 shrink-0 relative z-10">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-2xl bg-primary/10 text-primary shadow-xs">
                        <FaCalendar size={18} />
                      </div>
                      <div>
                        <h4 className="font-black text-base text-gray-900 dark:text-white leading-tight">
                          Select Stay Dates
                        </h4>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Interactive check-in & check-out range</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCalendar(false)}
                      className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <MdClose size={20} />
                    </button>
                  </div>

                  {/* Preset Shortcuts */}
                  <div className="py-2.5 flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0 relative z-10">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 shrink-0">Presets:</span>
                    {[
                      { label: "1 Month", months: 1 },
                      { label: "3 Months", months: 3 },
                      { label: "6 Months", months: 6 },
                      { label: "1 Year", months: 12 },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          const from = dateRange?.from || new Date();
                          const to = new Date(from);
                          to.setMonth(to.getMonth() + preset.months);
                          setDateRange({ from, to });
                        }}
                        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800/80 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-extrabold transition-all border border-gray-200/60 dark:border-gray-700 shrink-0 active:scale-95 cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Body Calendar Container */}
                  <div className="flex-1 py-1 flex justify-center items-center overflow-hidden relative z-10">
                    <style dangerouslySetInnerHTML={{ __html: `
                      .rdp-root {
                        --rdp-accent-color: var(--primary-color, #2f7d6d);
                        --rdp-accent-text-color: #fff;
                        --rdp-range_start-color: var(--primary-color, #2f7d6d);
                        --rdp-range_end-color: var(--primary-color, #2f7d6d);
                        --rdp-range_middle-background-color: rgba(47, 125, 109, 0.14);
                        --rdp-cell-size: 42px;
                        --rdp-caption-font-size: 16px;
                        font-size: 14px;
                        margin: 0 auto;
                      }
                      .dark .rdp-root {
                        --rdp-range_middle-background-color: rgba(47, 125, 109, 0.28);
                        color: #f3f4f6;
                      }
                      .rdp-day_selected {
                        background-color: var(--rdp-accent-color) !important;
                        color: #fff !important;
                        font-weight: 800 !important;
                        border-radius: 12px !important;
                        box-shadow: 0 4px 12px rgba(47, 125, 109, 0.35) !important;
                      }
                      .rdp-day_range_middle {
                        background-color: var(--rdp-range_middle-background-color) !important;
                        color: var(--primary-color, #2f7d6d) !important;
                        font-weight: 700 !important;
                        border-radius: 6px !important;
                      }
                      .dark .rdp-day_range_middle {
                        color: #5eead4 !important;
                      }
                      .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
                        background-color: rgba(47, 125, 109, 0.12) !important;
                        border-radius: 10px !important;
                      }
                    ` }} />
                    <DayPicker
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      min={1}
                      disabled={{ before: new Date() }}
                      fixedWeeks={true}
                      className="m-0"
                    />
                  </div>

                  {/* Fixed Structural Footer Actions */}
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2.5 shrink-0 relative z-10">
                    <div className="h-10 flex items-center justify-between text-xs font-bold p-2.5 rounded-xl border border-gray-200/80 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
                      {dateRange?.from ? (
                        <>
                          <span className="text-primary font-mono font-black text-xs">
                            {format(dateRange.from, 'MMM dd, yyyy')} — {dateRange.to ? format(dateRange.to, 'MMM dd, yyyy') : '...'}
                          </span>
                          {dateRange?.to ? (
                            <span className="font-black bg-primary text-white px-2.5 py-0.5 rounded-md text-[10px] shadow-xs">
                              {differenceInDays(dateRange.to, dateRange.from)} nights
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-500 font-medium italic">Pick check-out date</span>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-400 text-[11px] font-medium italic">
                          Select check-in & check-out dates on calendar
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => { handleClearDates(e); }}
                        disabled={!dateRange?.from}
                        className="px-4 py-3 rounded-xl border border-red-200 dark:border-red-900/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-extrabold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Clear
                      </button>
                      <Button
                        className="flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-primary/25 cursor-pointer"
                        onClick={() => setShowCalendar(false)}
                      >
                        Apply Dates
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

        {/* Occupants Count Counter Card */}
        <div className="bg-white dark:bg-gray-900/60 p-4 rounded-2xl border-2 border-gray-200 dark:border-gray-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Users size={14} className="text-primary" />
              Number of Occupants (Including you)
            </label>
            <span className="text-[11px] font-extrabold text-primary bg-primary/10 px-2.5 py-0.5 rounded-md">
              {room.availableSlots} Beds Available
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Select total guests moving in:
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleOccupantsChange(Math.max(1, getValues('occupantsCount') - 1))}
                disabled={getValues('occupantsCount') <= 1 || isSoloBuyout}
                className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-all active:scale-95 cursor-pointer"
              >
                <FaChevronLeft size={12} />
              </button>
              <span className="text-lg font-black min-w-[36px] text-center font-mono text-gray-900 dark:text-white">
                {getValues('occupantsCount')}
              </span>
              <button
                type="button"
                onClick={() => handleOccupantsChange(Math.min(room.availableSlots, getValues('occupantsCount') + 1))}
                disabled={getValues('occupantsCount') >= room.availableSlots || isSoloBuyout}
                className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-all active:scale-95 cursor-pointer"
              >
                <FaChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Solo Buyout Feature */}
        {room.roomType === 'BEDSPACE' && room.availableSlots === room.capacity && room.capacity > 1 && (
          <div className="p-4 bg-primary/5 dark:bg-primary/10 border-2 border-primary/20 rounded-2xl transition-all duration-300 hover:bg-primary/15">
            <label className="flex items-start gap-3.5 cursor-pointer group select-none">
              <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-lg appearance-none checked:bg-primary checked:border-primary transition-all cursor-pointer peer"
                  {...register("isSoloBuyout", {
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                      if (e.target.checked) {
                        setValue('occupantsCount', 1, { shouldValidate: true });
                      }
                    }
                  })}
                />
                <div className="absolute opacity-0 peer-checked:opacity-100 pointer-events-none text-white">
                  <FaCheck size={11} />
                </div>
              </div>
              <div>
                <p className="font-extrabold text-xs text-gray-900 dark:text-white group-hover:text-primary transition-colors flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-500" />
                  Rent Entire Room (Solo Occupancy Buyout)
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  Book all {room.capacity} beds for yourself for 100% room privacy. You will pay full room reservation, but stay as the sole tenant.
                </p>
              </div>
            </label>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            Role / Identity Classification
            <span className="text-red-500 ml-1">*</span>
          </label>
          <Controller
            name="role"
            control={control}
            rules={{ required: "Role is required" }}
            render={({ field }) => (
              <ModernInquirySelect
                icon={<User size={18} />}
                options={[
                  { value: 'STUDENT', label: 'Student', icon: <GraduationCap size={16} /> },
                  { value: 'STAFF', label: 'Staff', icon: <UserCheck size={16} /> },
                  { value: 'FACULTY', label: 'Faculty', icon: <User size={16} /> },
                  { value: 'OTHER', label: 'Other', icon: <HelpCircle size={16} /> },
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
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            Preferred Host Contact Method
            <span className="text-red-500 ml-1">*</span>
          </label>
          <Controller
            name="contactMethod"
            control={control}
            rules={{ required: "Contact method is required" }}
            render={({ field }) => (
              <ModernInquirySelect
                icon={<Mail size={18} />}
                options={[
                  { value: 'email', label: 'Email Address', icon: <Mail size={16} /> },
                  { value: 'phone', label: 'Phone Number', icon: <PhoneCall size={16} /> },
                ]}
                value={field.value}
                onChange={(val) => {
                  field.onChange(val);
                  setValue('contactInfo', '', { shouldValidate: false });
                  clearErrors('contactInfo');
                }}
                placeholder="Select contact method..."
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
            className="space-y-1.5"
          >
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
              {getContactInfoProps().label}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <Controller
              key={contactMethod}
              name="contactInfo"
              control={control}
              rules={getContactInfoProps().validation}
              render={({ field }) => (
                <div className="relative">
                  <input
                    {...field}
                    type={getContactInfoProps().type}
                    placeholder={getContactInfoProps().placeholder}
                    className={`w-full p-4 bg-white dark:bg-gray-900 border rounded-2xl outline-none transition-all text-sm text-gray-900 dark:text-gray-100 ${
                      errors.contactInfo 
                        ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' 
                        : 'border-gray-200 dark:border-gray-800 focus:border-primary focus:ring-2 focus:ring-primary/20'
                    }`}
                  />
                </div>
              )}
            />
            {errors.contactInfo && (
              <p className="text-xs text-red-500 font-bold animate-in fade-in">{errors.contactInfo.message}</p>
            )}
            <p className="text-[10px] text-gray-400 dark:text-gray-500 italic ml-0.5 leading-snug flex items-center gap-1">
              <ShieldCheck size={12} className="text-primary shrink-0" />
              * Contact info is given to the host. Security OTP (Step 7) is sent to your registered account email.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StayStep;

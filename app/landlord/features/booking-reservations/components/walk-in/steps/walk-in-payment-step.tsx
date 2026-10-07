import React from "react";
import { UseFormSetValue, UseFormWatch, FieldErrors, UseFormGetValues } from "react-hook-form";
import { WalkInFormData, WalkInPaymentType } from "@/app/landlord/features/booking-reservations/hooks/use-walk-in-modal";
import { FaCalendar, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { Info, Calendar, Sparkles, Users, CreditCard, ShieldCheck, Check, DollarSign, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInDays } from "date-fns";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import { createPortal } from "react-dom";
import Button from "@/components/common/Button";

interface WalkInPaymentStepProps {
  setValue: UseFormSetValue<WalkInFormData>;
  watch: UseFormWatch<WalkInFormData>;
  getValues: UseFormGetValues<WalkInFormData>;
  errors: FieldErrors<WalkInFormData>;
  listings: any[];
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  showCalendar: boolean;
  setShowCalendar: (val: boolean) => void;
}

const WalkInPaymentStep: React.FC<WalkInPaymentStepProps> = ({ 
  setValue, watch, getValues, errors, listings, dateRange, setDateRange, showCalendar, setShowCalendar 
}) => {
  const selectedListingId = watch("listingId");
  const selectedRoomId = watch("roomId");
  
  const listing = listings.find(l => l.id === selectedListingId);
  const room = listing?.rooms?.find((r: any) => r.id === selectedRoomId);
  
  const roomPrice = room?.price || 0;
  const reservationFee = room?.reservationFee || 0;
  const availableSlots = room?.availableSlots || 1;

  const paymentType: WalkInPaymentType = watch('paymentType') || 'DIRECT_RENT';
  const securityDeposit = Number(watch('securityDeposit')) || 0;
  const isSoloBuyout = watch('isSoloBuyout');

  const isFlatRate = Boolean(room?.roomTypeDefinition?.isFlatRate);

  const handleOccupantsChange = (value: number) => {
    if (isSoloBuyout) return;
    setValue('occupantsCount', value, { shouldValidate: true });
  };

  const handleClearDates = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDateRange({ from: undefined, to: undefined });
    setValue('moveInDate', '', { shouldValidate: true });
    setValue('checkOutDate', '', { shouldValidate: true });
  };

  // Recalculate total price based on paymentType, room pricing model (isFlatRate), occupants, solo buyout, and deposit
  React.useEffect(() => {
    const occupantsCount = getValues("occupantsCount") || 1;
    if (paymentType === 'DIRECT_RENT') {
      const baseRent = isFlatRate ? roomPrice : roomPrice * (isSoloBuyout ? (room?.capacity || 1) : occupantsCount);
      setValue("totalPrice", baseRent + securityDeposit, { shouldValidate: true });
    } else {
      const baseFee = isFlatRate ? reservationFee : reservationFee * (isSoloBuyout ? (room?.capacity || 1) : occupantsCount);
      setValue("totalPrice", baseFee, { shouldValidate: true });
    }
  }, [paymentType, roomPrice, reservationFee, securityDeposit, getValues("occupantsCount"), setValue, getValues, isSoloBuyout, room?.capacity, isFlatRate]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
              <Calendar size={18} />
            </div>
            <span>Step 3: Stay & Payment Setup</span>
            <span className="text-red-500 font-bold ml-0.5">*</span>
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Select registration payment type, stay dates, and occupant count.
          </p>
        </div>
        <span className="hidden sm:inline-flex text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full shrink-0">
          {isFlatRate ? "Flat-Rate Whole Unit" : "Per-Head Rate"}
        </span>
      </div>

      <div className="space-y-4">
        {/* Payment Type Switch (Direct Rent vs Reservation Fee) */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            Select Walk-In Registration Payment Mode
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Direct Rent Card */}
            <div
              onClick={() => setValue('paymentType', 'DIRECT_RENT', { shouldValidate: true })}
              className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between select-none ${
                paymentType === 'DIRECT_RENT'
                  ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-sm'
                  : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 hover:border-gray-300 dark:hover:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <DollarSign size={16} className="text-primary" />
                  Immediate Move-In (1st Month Rent)
                </span>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  paymentType === 'DIRECT_RENT' ? 'border-primary bg-primary text-white' : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {paymentType === 'DIRECT_RENT' && <Check size={10} strokeWidth={3} />}
                </div>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                Guest moves in immediately & pays full 1st month&apos;s rent (+ optional deposit) in cash/onsite.
              </p>
            </div>

            {/* Holding Reservation Fee Card */}
            <div
              onClick={() => setValue('paymentType', 'RESERVATION_FEE', { shouldValidate: true })}
              className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between select-none ${
                paymentType === 'RESERVATION_FEE'
                  ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-sm'
                  : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 hover:border-gray-300 dark:hover:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Lock size={15} className="text-primary" />
                  Future Reservation (Holding Fee)
                </span>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  paymentType === 'RESERVATION_FEE' ? 'border-primary bg-primary text-white' : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {paymentType === 'RESERVATION_FEE' && <Check size={10} strokeWidth={3} />}
                </div>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                Guest pays a reservation fee to hold the room slot for a future check-in date.
              </p>
            </div>
          </div>
        </div>

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

          {(errors.moveInDate || errors.checkOutDate) && (
            <p className="text-xs text-red-500 font-bold mt-1.5 animate-in fade-in">Please select both check-in and check-out dates.</p>
          )}
        </div>

        {/* MOBILE POPUP CALENDAR */}
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
              Number of Occupants
            </label>
            <span className="text-[11px] font-extrabold text-primary bg-primary/10 px-2.5 py-0.5 rounded-md border border-primary/20">
              {availableSlots} Available Slots
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {isFlatRate ? "Unit Capacity" : "Select occupants count moving in:"}
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
                {getValues('occupantsCount') || 1}
              </span>
              <button
                type="button"
                onClick={() => handleOccupantsChange(Math.min(availableSlots, (getValues('occupantsCount') || 1) + 1))}
                disabled={(getValues('occupantsCount') || 1) >= availableSlots || isSoloBuyout}
                className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-all active:scale-95 cursor-pointer"
              >
                <FaChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Optional Security Deposit Input when DIRECT_RENT */}
        {paymentType === 'DIRECT_RENT' && (
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center justify-between">
              <span>Security Deposit Collected Onsite (Optional)</span>
              <span className="text-[10px] text-gray-400">Refundable deposit upon move-out</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-gray-400">₱</span>
              <input
                type="number"
                min="0"
                value={watch('securityDeposit') || ''}
                onChange={(e) => setValue('securityDeposit', Number(e.target.value) || 0, { shouldValidate: true })}
                placeholder="e.g. 1000"
                className="w-full pl-9 pr-4 py-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold text-gray-900 dark:text-white outline-none"
              />
            </div>
          </div>
        )}

        {/* Solo Buyout Feature for Walk-In (Only for Per-Head Bedspace Rooms) */}
        {!isFlatRate && room?.availableSlots === room?.capacity && (room?.capacity || 0) > 1 && (
          <div className="p-4 bg-primary/5 dark:bg-primary/10 border-2 border-primary/20 rounded-2xl transition-all duration-300 hover:bg-primary/15">
            <label className="flex items-start gap-3.5 cursor-pointer group select-none">
              <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-lg appearance-none checked:bg-primary checked:border-primary transition-all cursor-pointer peer"
                  checked={isSoloBuyout || false}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    setValue('isSoloBuyout', isChecked, { shouldValidate: true });
                    if (isChecked) {
                      setValue('occupantsCount', 1, { shouldValidate: true });
                    }
                  }}
                />
                <div className="absolute opacity-0 peer-checked:opacity-100 pointer-events-none text-white">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
              </div>
              <div>
                <p className="font-extrabold text-xs text-gray-900 dark:text-white group-hover:text-primary transition-colors flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-500" />
                  Rent Entire Room (Solo Occupancy Buyout)
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  Block all {room.capacity} beds for this single guest for 100% room privacy. Total fee covers all {room.capacity} beds.
                </p>
              </div>
            </label>
          </div>
        )}

        {/* Dynamic Pricing Callout */}
        <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/20 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest block">
              {paymentType === 'DIRECT_RENT' ? "Total Onsite Payment Collected" : "Total Reservation Fee"}
            </span>
            <span className="text-xl font-black text-primary">
              ₱ {(getValues("totalPrice") || 0).toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] font-extrabold text-gray-500 dark:text-gray-400 italic">
            {paymentType === 'DIRECT_RENT'
              ? (isFlatRate ? "1st Month Rent" : `1st Month Rent (${getValues("occupantsCount") || 1} occupant)`) + (securityDeposit > 0 ? ` + ₱${securityDeposit.toLocaleString()} Deposit` : "")
              : (isFlatRate ? "Flat Reservation Fee" : `₱${reservationFee.toLocaleString()} × ${getValues("occupantsCount") || 1} occupant`)}
          </span>
        </div>

        {/* Physical Payment Information Banner */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-primary/5 dark:bg-primary/10 border border-primary/20 flex items-start gap-3 mt-2">
          <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
            <ShieldCheck size={18} />
          </div>
          <div>
            <p className="text-xs font-extrabold text-gray-900 dark:text-white leading-tight">
              Physical Payment & Check-In Registration
            </p>
            <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-0.5 leading-relaxed">
              {paymentType === 'DIRECT_RENT'
                ? "Guest is paying 1st month's rent in person. Once recorded, the room status updates to reserved/occupied automatically."
                : "Guest is paying a holding reservation fee in person. Click 'Confirm Payment' in the reservation card to finalize room slot hold."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalkInPaymentStep;

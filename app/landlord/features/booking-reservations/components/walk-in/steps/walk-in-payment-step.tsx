import React from "react";
import { UseFormSetValue, UseFormWatch, FieldErrors, UseFormGetValues } from "react-hook-form";
import { WalkInFormData } from "../../../hooks/use-walk-in-modal";
import { FaCalendar, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInDays } from "date-fns";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/style.css";
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
  
  const reservationFee = room?.reservationFee || 0;
  const availableSlots = room?.availableSlots || 1;
  const isSoloBuyout = watch('isSoloBuyout');

  const handleOccupantsChange = (value: number) => {
    if (isSoloBuyout) return; // Prevent changing occupants if solo buyout is checked
    setValue('occupantsCount', value, { shouldValidate: true });
    // Update total price when occupants change
    setValue("totalPrice", reservationFee * value, { shouldValidate: true });
  };

  const handleClearDates = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDateRange({ from: undefined, to: undefined });
    setValue('moveInDate', '', { shouldValidate: true });
    setValue('checkOutDate', '', { shouldValidate: true });
  };

  // Keep total price in sync with date selections, occupant changes, and solo buyout
  React.useEffect(() => {
    const occupantsCount = getValues("occupantsCount") || 1;
    if (reservationFee > 0) {
      if (isSoloBuyout) {
        setValue("totalPrice", reservationFee * (room?.capacity || 1), { shouldValidate: true });
      } else if (occupantsCount > 0) {
        setValue("totalPrice", reservationFee * occupantsCount, { shouldValidate: true });
      }
    }
  }, [reservationFee, getValues("occupantsCount"), setValue, getValues, isSoloBuyout, room?.capacity]);

  return (
    <div className="space-y-4">
      <div className="space-y-2 mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <FaCalendar className="text-primary" size={20} />
          Step 5: Stay Details & Payment
        </h3>
        <p className="text-xs text-gray-500">Select the stay dates and occupants to calculate the reservation fee.</p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <label className="block font-semibold text-sm mb-2 text-text-primary dark:text-gray-100">
            Stay Range (Check-in to Check-out)
            <span className="text-red-500 ml-1">*</span>
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
              Number of Occupants
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => handleOccupantsChange(Math.max(1, getValues('occupantsCount') - 1))}
                disabled={getValues('occupantsCount') <= 1 || isSoloBuyout}
                className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FaChevronLeft size={14} />
              </button>
              <span className="text-xl font-semibold min-w-[50px] text-center text-gray-900 dark:text-gray-100">
                {getValues('occupantsCount') || 1}
              </span>
              <button
                type="button"
                onClick={() => handleOccupantsChange(Math.min(availableSlots, (getValues('occupantsCount') || 1) + 1))}
                disabled={(getValues('occupantsCount') || 1) >= availableSlots || isSoloBuyout}
                className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FaChevronRight size={14} />
              </button>
              <span className="text-sm text-gray-500">/ {availableSlots} (Available)</span>
            </div>
          </div>
        </div>

        {/* Solo Buyout Feature for Walk-In */}
        {room?.roomType === 'BEDSPACE' && room?.availableSlots === room?.capacity && room?.capacity > 1 && (
          <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-xl transition-all duration-300 hover:bg-primary/10">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-0.5">
                <input
                  type="checkbox"
                  className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-md appearance-none checked:bg-primary checked:border-primary transition-all cursor-pointer peer"
                  checked={isSoloBuyout || false}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    setValue('isSoloBuyout', isChecked, { shouldValidate: true });
                    if (isChecked) {
                      setValue('occupantsCount', 1, { shouldValidate: true });
                      setValue("totalPrice", reservationFee * room.capacity, { shouldValidate: true });
                    } else {
                      setValue("totalPrice", reservationFee * getValues('occupantsCount'), { shouldValidate: true });
                    }
                  }}
                />
                <div className="absolute opacity-0 peer-checked:opacity-100 pointer-events-none text-white">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                  Rent Entire Room (Solo Occupancy)
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Block all {room.capacity} beds for this single guest to ensure maximum privacy. Total reservation fee will cover all {room.capacity} beds.
                </p>
              </div>
            </label>
          </div>
        )}

        <div className="flex gap-3 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-2xl border border-blue-100 dark:border-blue-800/50 mt-4">
          <Info className="text-blue-500 shrink-0" size={16} />
          <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed font-medium">
            This walk-in will be created as <span className="font-bold">Pending Payment</span>. You must manually collect the payment (Cash/GCash) from the guest and click "Confirm Payment" in the reservation card to officially block the room slots.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WalkInPaymentStep;

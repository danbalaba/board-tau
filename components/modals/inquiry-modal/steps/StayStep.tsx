import React from "react";
import { FaCalendar, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInDays } from "date-fns";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import Select from "react-select";
import { Controller } from "react-hook-form";
import Button from "@/components/common/Button";
import { FormData } from "../useInquiryLogic";

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
}

const StayStep: React.FC<StayStepProps> = ({
  dateRange, setDateRange,
  showCalendar, setShowCalendar,
  getValues, setValue,
  control, errors, room
}) => {
  const handleOccupantsChange = (value: number) => {
    setValue('occupantsCount', value, { shouldValidate: true });
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
            {dateRange?.to && dateRange?.from && (
              <div className="text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-md shadow-sm border border-blue-200 dark:border-blue-800/50">
                {differenceInDays(dateRange.to, dateRange.from)} nights
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
};

export default StayStep;

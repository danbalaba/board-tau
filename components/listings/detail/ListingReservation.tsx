import React from "react";

import Button from "@/components/Button";
import SpinnerMini from "@/components/Loader";
import { formatPrice } from "@/utils/helper";
import { stayDurationOptions } from "@/utils/constants";

interface ListingReservationProps {
  price: number;
  totalPrice: number;
  moveInMonth: string;
  setMoveInMonth: (value: string) => void;
  stayDuration: string;
  setStayDuration: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

const ListingReservation: React.FC<ListingReservationProps> = ({
  price,
  totalPrice,
  moveInMonth,
  setMoveInMonth,
  stayDuration,
  setStayDuration,
  onSubmit,
  isLoading,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border-[1px] border-neutral-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
      <div className="flex flex-row items-center gap-1 p-4">
        <span className="text-lg font-semibold text-text-primary dark:text-gray-100">₱ {formatPrice(price)}</span>
        <span className="font-light text-neutral-600 dark:text-gray-400">per month</span>
      </div>
      <hr className="border-neutral-200 dark:border-gray-700" />

      {/* Move-in Month Selector */}
      <div className="p-4 flex flex-col gap-4">
        <div>
          <label className="block font-semibold text-[15px] mb-2 text-text-primary dark:text-gray-100">Move-in Month</label>
          <input
            type="month"
            value={moveInMonth}
            onChange={(e) => setMoveInMonth(e.target.value)}
            className="w-full p-3 border border-neutral-300 dark:border-gray-700 rounded-lg outline-none focus:border-black dark:focus:border-gray-300 bg-white dark:bg-gray-900 text-text-primary dark:text-gray-100"
          />
        </div>

        {/* Stay Duration Selector */}
        <div>
          <label className="block font-semibold text-[15px] mb-2 text-text-primary dark:text-gray-100">Stay Duration</label>
          <select
            value={stayDuration}
            onChange={(e) => setStayDuration(e.target.value)}
            className="w-full p-3 border border-neutral-300 dark:border-gray-700 rounded-lg outline-none focus:border-black dark:focus:border-gray-300 bg-white dark:bg-gray-900 text-text-primary dark:text-gray-100"
          >
            <option value="">Select duration...</option>
            {stayDurationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <hr className="border-neutral-200 dark:border-gray-700" />

      {/* Inquiry Button */}
      <div className="p-4">
        <Button
          disabled={isLoading}
          onClick={onSubmit}
          className="flex flex-row items-center justify-center h-[42px] "
          size="large"
        >
          {isLoading ? <SpinnerMini /> : <span>Inquire Now</span>}
        </Button>
      </div>
      <hr className="border-neutral-200 dark:border-gray-700" />

      {/* Total Price Breakdown */}
      <div className="p-4 flex flex-col gap-2 text-sm">
        <div className="flex flex-row items-center justify-between text-text-primary dark:text-gray-100">
          <span>₱ {formatPrice(price)} × months</span>
          <span>₱ {formatPrice(totalPrice)}</span>
        </div>
        <div className="flex flex-row items-center justify-between font-semibold text-lg border-t pt-2 mt-2 text-text-primary dark:text-gray-100 border-neutral-200 dark:border-gray-700">
          <span>Total Cost</span>
          <span>₱ {formatPrice(totalPrice)}</span>
        </div>
      </div>
    </div>
  );
};

export default ListingReservation;

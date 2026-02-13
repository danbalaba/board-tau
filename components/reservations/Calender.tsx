"use client"
import React from "react";
import { DateRange, Range, RangeKeyDict } from "react-date-range";
import { useTheme } from "next-themes";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

interface CalendarProps {
  value: Range;
  onChange: (fieldName: string, value: Range) => void;
  disabledDates?: Date[];
}

const Calendar: React.FC<CalendarProps> = ({
  value,
  onChange,
  disabledDates,
}) => {
  const { resolvedTheme } = useTheme();

  const handleChange = (value: RangeKeyDict) => {
    onChange("dateRange", value.selection)
  }

  return (
    <div className={`calendar-wrapper ${resolvedTheme === 'dark' ? 'dark-mode-calendar' : ''}`}>
      <DateRange
        rangeColors={["#2F7D6D"]}
        ranges={[value]}
        date={new Date()}
        onChange={handleChange}
        direction="vertical"
        showDateDisplay={false}
        minDate={new Date()}
        disabledDates={disabledDates}
      />
      <style jsx global>{`
        .dark-mode-calendar .rdrCalendarWrapper {
          background-color: rgb(31, 41, 55);
          color: rgb(243, 244, 246);
        }

        .dark-mode-calendar .rdrMonth {
          background-color: rgb(31, 41, 55);
          color: rgb(243, 244, 246);
        }

        .dark-mode-calendar .rdrMonthName {
          color: rgb(243, 244, 246);
        }

        .dark-mode-calendar .rdrWeekDays {
          background-color: rgb(55, 65, 81);
          color: rgb(243, 244, 246);
        }

        .dark-mode-calendar .rdrWeekDay {
          color: rgb(209, 213, 219);
        }

        .dark-mode-calendar .rdrDay {
          color: rgb(243, 244, 246);
        }

        .dark-mode-calendar .rdrDayNumber span {
          color: rgb(243, 244, 246);
        }

        .dark-mode-calendar .rdrDayDisabled {
          background-color: rgb(55, 65, 81);
          color: rgb(107, 114, 128);
        }

        .dark-mode-calendar .rdrDayPassive {
          background-color: rgb(55, 65, 81);
          color: rgb(156, 163, 175);
        }

        .dark-mode-calendar .rdrDayToday .rdrDayNumber span:after {
          background-color: #2F7D6D;
        }

        .dark-mode-calendar .rdrDayInRange,
        .dark-mode-calendar .rdrDayStartPreview,
        .dark-mode-calendar .rdrDayInPreview,
        .dark-mode-calendar .rdrDayEndPreview {
          background-color: rgba(47, 125, 109, 0.2);
        }

        .dark-mode-calendar .rdrDayStartEdge,
        .dark-mode-calendar .rdrDayEndEdge,
        .dark-mode-calendar .rdrDayHovered .rdrDayStartEdge,
        .dark-mode-calendar .rdrDayHovered .rdrDayEndEdge {
          background-color: #2F7D6D;
        }

        .dark-mode-calendar .rdrDaySelected,
        .dark-mode-calendar .rdrDayStartEdge,
        .dark-mode-calendar .rdrDayEndEdge {
          color: white;
        }

        .dark-mode-calendar .rdrStartEdge,
        .dark-mode-calendar .rdrEndEdge {
          background-color: #2F7D6D;
        }

        .dark-mode-calendar .rdrDayStartEdge,
        .dark-mode-calendar .rdrDayEndEdge {
          background-color: #2F7D6D;
          border-radius: 4px;
        }

        .dark-mode-calendar .rdrDayHovered .rdrDayStartEdge,
        .dark-mode-calendar .rdrDayHovered .rdrDayEndEdge {
          background-color: #4FA89A;
        }

        .dark-mode-calendar .rdrDayHovered {
          background-color: rgba(47, 125, 109, 0.3);
        }

        .dark-mode-calendar .rdrDayHovered .rdrDayNumber span {
          color: rgb(243, 244, 246);
        }

        .dark-mode-calendar .rdrPprevButton,
        .dark-mode-calendar .rdrNextButton {
          background-color: rgb(55, 65, 81);
          border-color: rgb(75, 85, 99);
        }

        .dark-mode-calendar .rdrPprevButton:hover,
        .dark-mode-calendar .rdrNextButton:hover {
          background-color: rgb(75, 85, 99);
        }

        /* General Calendar Improvements */
        .rdrCalendarWrapper {
          font-family: inherit;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .rdrMonth {
          padding: 16px;
        }

        .rdrWeekDays {
          padding: 0 8px;
          border-radius: 8px;
          margin-bottom: 8px;
        }

        .rdrDay {
          padding: 8px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .rdrDay:hover:not(.rdrDayDisabled) {
          transform: scale(1.05);
        }

        .rdrDayStartEdge,
        .rdrDayEndEdge {
          border-radius: 4px;
        }

        .rdrDaySelected {
          font-weight: 600;
        }

        .rdrPprevButton,
        .rdrNextButton {
          border-radius: 6px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .rdrPprevButton:hover,
        .rdrNextButton:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};

export default Calendar;

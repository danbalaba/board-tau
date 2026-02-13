"use client";

import React from "react";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { FieldValues, UseFormWatch } from "react-hook-form";

interface CounterProps {
  title: string;
  subtitle: string;
  onChange: (name: string, value: number) => void;
  name: string;
  watch: UseFormWatch<FieldValues>;
  disabled?: boolean;
  minValue?: number;
}

const Counter: React.FC<CounterProps> = ({
  title,
  subtitle,
  onChange,
  name,
  watch,
  disabled = false,
  minValue = 1,
}) => {
  const value = watch(name);

  const onAdd = () => {
    if (!disabled) {
      onChange(name, value + 1);
    }
  };

  const onReduce = () => {
    if (disabled || value === minValue) return;
    onChange(name, value - 1);
  };

  return (
    <div className={`flex flex-row items-center justify-between ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex flex-col">
        <h3 className="font-semibold text-text-primary">{title}</h3>
        <p className="font-light text-[14px] text-text-secondary">{subtitle}</p>
      </div>
      <div className="flex flex-row items-center gap-4">
        <button type="button"
          onClick={onReduce}
          disabled={disabled || value === minValue}
          className={`w-8 h-8 rounded-full border-[1px] flex items-center justify-center transition-all ${
            disabled || value === minValue
              ? 'border-border text-text-secondary cursor-not-allowed opacity-50'
              : 'border-border text-text-primary cursor-pointer hover:bg-primary-light hover:border-primary'
          }`}
        >
          <AiOutlineMinus size={16} />
        </button>
        <span className="font-light text-lg select-none text-text-primary w-6 text-center">
          {value}
        </span>
        <button type="button"
          onClick={onAdd}
          disabled={disabled}
          className={`w-8 h-8 rounded-full border-[1px] flex items-center justify-center transition-all ${
            disabled
              ? 'border-border text-text-secondary cursor-not-allowed opacity-50'
              : 'border-border text-text-primary cursor-pointer hover:bg-primary-light hover:border-primary'
          }`}
          autoFocus={title === "Guests"}
        >
          <AiOutlinePlus size={16} />
        </button>
      </div>
    </div>
  );
};

export default Counter;

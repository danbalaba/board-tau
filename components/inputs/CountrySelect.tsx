"use client";
import React, { useEffect, useRef } from "react";
import Select from "react-select";
import countries from "@/data/countries.json";

export type CountrySelectValue = {
  flag: string;
  label: string;
  latlng: number[];
  region: string;
  value: string;
};

const CountrySelect = ({
  value,
  onChange,
  options: optionsProp,
}: {
  value?: CountrySelectValue;
  onChange: (name: string, val: CountrySelectValue) => void;
  /** Override options (e.g. Philippines places + countries). Default: countries only. */
  options?: CountrySelectValue[];
}) => {
  const ref = useRef<any>(null);
  const options = optionsProp ?? (countries as CountrySelectValue[]);

  useEffect(() => {
    const timer = setTimeout(() => {
      ref.current?.focus();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const handleChange = (value: CountrySelectValue) => {
    onChange("location", value);
  };

  return (
    <Select
      ref={ref}
      placeholder="e.g. Tarlac, TAU, Philippines"
      isClearable
      options={options}
      value={value}
      onChange={handleChange}
      formatOptionLabel={(option: any) => (
        <div className="flex flex-row items-center gap-3 z-[10]">
          <div>{option.flag}</div>
          <div>
            {option.label},
            <span className="text-neutral-500 ml-1">{option.region}</span>
          </div>
        </div>
      )}
      classNames={{
        control: () => "p-[6px] text-[14px] border-1",
        input: () => "text-[14px]",
        option: () => "text-[14px]",
      }}
      theme={(theme) => ({
        ...theme,
        borderRadius: 6,
        colors: {
          ...theme.colors,
          primary: "black",
          primary25: "#ffe4e6",
          neutral0: "hsl(0, 0%, 100%)",
          neutral5: "hsl(0, 0%, 95%)",
          neutral10: "hsl(0, 0%, 90%)",
          neutral20: "hsl(0, 0%, 80%)",
          neutral30: "hsl(0, 0%, 70%)",
          neutral40: "hsl(0, 0%, 60%)",
          neutral50: "hsl(0, 0%, 50%)",
          neutral60: "hsl(0, 0%, 40%)",
          neutral70: "hsl(0, 0%, 30%)",
          neutral80: "hsl(0, 0%, 20%)",
          neutral90: "hsl(0, 0%, 10%)",
        },
      })}
      styles={{
        control: (base: any) => ({
          ...base,
          backgroundColor: "rgb(31, 41, 55)",
          borderColor: "rgb(55, 65, 81)",
          color: "rgb(243, 244, 246)",
        }),
        input: (base: any) => ({
          ...base,
          color: "rgb(243, 244, 246)",
        }),
        placeholder: (base: any) => ({
          ...base,
          color: "rgb(107, 114, 128)",
        }),
        singleValue: (base: any) => ({
          ...base,
          color: "rgb(243, 244, 246)",
        }),
        menu: (base: any) => ({
          ...base,
          backgroundColor: "rgb(31, 41, 55)",
          borderColor: "rgb(55, 65, 81)",
        }),
        menuList: (base: any) => ({
          ...base,
          backgroundColor: "rgb(31, 41, 55)",
        }),
        option: (base: any, state: any) => ({
          ...base,
          backgroundColor: state.isFocused ? "rgb(55, 65, 81)" : "rgb(31, 41, 55)",
          color: "rgb(243, 244, 246)",
          "&:active": {
            backgroundColor: "rgb(55, 65, 81)",
          },
        }),
      }}
    />
  );
};

export default CountrySelect;

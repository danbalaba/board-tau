'use client'
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import queryString from "query-string";
import * as LucideIcons from "lucide-react";

interface CategoryBoxProps {
  label: string;
  iconName?: string | null;
}

const CategoryBox: React.FC<CategoryBoxProps> = ({
  iconName,
  label,
}) => {
  const router = useRouter();
  const params = useSearchParams();
  const selected = params?.get("category") === label;

  const handleClick = () => {
    let currentQuery = {};
    if (params) {
      currentQuery = queryString.parse(params.toString());
    }

    const updatedQuery: any = {
      ...currentQuery,
      category: label,
    };

    if (params?.get("category") === label) {
      delete updatedQuery.category;
    }

    const url = queryString.stringifyUrl(
      {
        url: "/",
        query: updatedQuery,
      },
      { skipNull: true }
    );
    router.push(url);
  }

  // Safely resolve the Lucide icon from the string name
  const Icon = iconName && (LucideIcons as any)[iconName] 
    ? (LucideIcons as any)[iconName] 
    : LucideIcons.Building;

  return (
    <button
    type="button"
    onClick={handleClick}
      className={`flex flex-col max-w-fit items-center justify-center gap-2 p-3 border-b-2 hover:text-text-primary dark:hover:text-gray-300 transition-all duration-200 cursor-pointer text-[20px] md:text-[24px] ${
        selected
          ? "border-b-primary text-primary dark:border-b-primary dark:text-primary"
          : "border-transparent text-text-secondary dark:text-gray-400 hover:text-text-primary"}`}
    >
      <Icon className="text-gray-700 dark:text-gray-200" />
      <small className="font-medium md:text-[13px] text-[12px] select-none">{label}</small>
    </button>
  );
};

export default CategoryBox;


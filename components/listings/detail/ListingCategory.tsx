import React from "react";
import { IconType } from "react-icons";

interface ListingCategoryProps {
  icon: IconType;
  label: string;
  description: string;
}

const ListingCategory: React.FC<ListingCategoryProps> = ({
  icon: Icon,
  label,
  description,
}) => {
  return (
    <div className="group flex flex-row items-center gap-4 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 cursor-default">
      <div className="flex items-center justify-center p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300">
        <Icon size={24} />
      </div>
      <div className="flex flex-col">
        <span className="text-base font-bold text-gray-900 dark:text-gray-100 tracking-tight leading-tight">{label}</span>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium line-clamp-1 mt-0.5">{description}</p>
      </div>
    </div>
  );
};

export default ListingCategory;

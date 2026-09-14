import React from "react";
import CategoryBox from "./CategoryBox";
import { getActivePropertyTypes } from "@/services/taxonomy";
import { PropertyType } from "@prisma/client";

export default async function Categories() {
  const propertyTypes = await getActivePropertyTypes();

  if (!propertyTypes || propertyTypes.length === 0) {
    return null;
  }

  return (
    <div className="py-4 bg-gradient-to-b from-transparent to-gray-50 dark:from-transparent dark:to-slate-900/50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center text-xl md:text-2xl font-semibold text-text-primary dark:text-gray-100 mb-4 px-4">
          Seamless stay & experiences
        </h2>
        <div className="flex flex-nowrap justify-start items-center gap-3 overflow-x-auto pb-2 -mx-4 md:mx-0 md:justify-center hide-scrollbar">
          <div className="flex gap-3 px-4 md:px-0">
            {propertyTypes.map((item: PropertyType) => (
              <CategoryBox
                key={item.id}
                label={item.name}
                iconName={item.icon}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

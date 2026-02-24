"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import throttle from "lodash.throttle";
import { motion } from "framer-motion";

import { categories } from "@/utils/constants";
import { Category } from "@/types";

const Categories = () => {
  const [isActive, setIsActive] = useState(false);
  const params = useSearchParams();
  const pathname = usePathname();
  const category = params?.get("category");
  const router = useRouter();

  const isMainPage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsActive(true);
      } else {
        setIsActive(false);
      }
    };

    const throttledHandleScroll = throttle(handleScroll, 150);
    window.addEventListener("scroll", throttledHandleScroll);

    return () => window.removeEventListener("scroll", throttledHandleScroll);
  }, []);

  if (!isMainPage) {
    return null;
  }

  const handleCategoryClick = (categoryLabel: string) => {
    const newParams = new URLSearchParams(params?.toString() || "");

    if (category === categoryLabel) {
      newParams.delete("category");
    } else {
      newParams.set("category", categoryLabel);
    }

    router.push(`/?${newParams.toString()}`);
  };

  return (
    <div className="py-10 bg-gradient-to-b from-transparent to-gray-50 dark:from-transparent dark:to-slate-900/50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center text-xl md:text-2xl font-semibold text-text-primary dark:text-gray-100 mb-8 px-4">
          Seamless stay & experiences
        </h2>
        <div className="flex flex-nowrap justify-start items-center gap-3 overflow-x-auto pb-2 -mx-4 md:mx-0 md:justify-center hide-scrollbar">
          <div className="flex gap-3 px-4 md:px-0">
          {categories.map((item: Category, index: number) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.label}
                onClick={() => handleCategoryClick(item.label)}
                className={`px-3.5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center space-x-1.5 group flex-shrink-0 ${
                  category === item.label
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "bg-white dark:bg-slate-800 text-text-primary dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700"
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
                whileTap={{
                  scale: 0.95,
                  transition: { duration: 0.1 }
                }}
              >
                <motion.div
                  className="relative"
                  whileHover={{ rotate: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon className={`text-lg ${category === item.label ? 'text-white' : 'text-primary group-hover:text-primary/80'}`} />
                </motion.div>
                <span className="tracking-wide">{item.label}</span>
              </motion.button>
            );
          })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;

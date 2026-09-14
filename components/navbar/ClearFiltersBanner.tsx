"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ClearFiltersBanner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // If there are no filters at all, or only one property type, we don't show the banner
  // You might customize this based on when exactly you want the banner to appear.
  // For now, let's show it if any filter (except 'category') is active, 
  // or if multiple categories are somehow active (though category in URL is a single string here).
  
  const SYSTEM_KEYS = new Set(["callbackUrl", "error", "login", "secure", "code", "state", "email", "verified"]);
  const activeSearchKeys = Array.from(searchParams?.keys() || []).filter(k => !SYSTEM_KEYS.has(k));
  const hasFilters = activeSearchKeys.length > 0;

  if (!hasFilters) return null;

  const handleClear = () => {
    router.push("/");
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-200/80 dark:border-slate-800 py-2.5 sm:py-3 flex justify-center items-center shadow-sm z-40 sticky top-[80px]"
      >
        <div className="flex flex-col sm:flex-row items-center justify-center text-center gap-2 sm:gap-4 px-4 w-full max-w-4xl mx-auto text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200">
          <span className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200">
            You have active search filters applied.
          </span>

          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors bg-primary/10 hover:bg-primary/20 px-3.5 py-1.5 rounded-full shrink-0 whitespace-nowrap text-xs sm:text-sm font-bold border border-primary/20"
          >
            <XCircle size={15} className="shrink-0" />
            <span>Clear all filters</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

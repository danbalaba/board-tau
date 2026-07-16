"use client";

import React, { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Search as SearchIcon, MapPin, BedDouble, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { springBounce } from "@/utils/motion";

import Modal from "../modals/Modal";
import { useSearchSummary } from "@/hooks/useSearchSummary";

const SearchModal = dynamic(() => import("@/components/modals/SearchModal"), {
  ssr: false,
});

interface SearchManagerProps {
  isScrolled?: boolean;
}

const SearchManager = ({ isScrolled = false }: SearchManagerProps) => {
  const { locationLabel, priceLabel, roomTypeLabel } = useSearchSummary();

  const handleSearchClose = () => {};

  useEffect(() => {
    console.log('SearchManager component rendered');
  }, []);

  return (
    <Modal>
      {!isScrolled && (
        <motion.div
          layoutId="search-bar"
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <Modal.Trigger name="search">
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              whileHover={{
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
                y: -4,
                scale: 1.02
              }}
              className="w-full group search-bar-trigger text-center"
              style={{ maxWidth: '100%' }}
            >
              {/* Premium Vibrant Mobile View */}
              <div className="relative md:hidden w-full px-2 py-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-[32px] shadow-[0_8px_30px_rgba(47,125,109,0.15)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-white/60 dark:border-gray-700/50 group/mobile-search transition-all duration-300">
                <div className="flex items-center w-full gap-3">
                  
                  {/* Vibrant Search Icon Container */}
                  <motion.div 
                    className="flex items-center justify-center w-[46px] h-[46px] rounded-full bg-gradient-to-r from-primary to-orange-500 shadow-lg shadow-orange-500/20 shrink-0"
                    whileHover={{ scale: 1.05, rotate: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                     <SearchIcon className="text-white w-5 h-5 drop-shadow-sm" />
                  </motion.div>

                  {/* Text Content */}
                  <div className="flex flex-col items-start min-w-0 flex-1 py-1">
                     <span className="font-bold text-[15px] text-gray-900 dark:text-white truncate w-full text-left tracking-tight">
                        {locationLabel === "Any / Not sure" ? "Where to?" : locationLabel}
                     </span>
                     <span className="text-[13px] text-gray-500 dark:text-gray-400 truncate w-full text-left font-medium">
                        {priceLabel === "Any price" && roomTypeLabel === "Any room" 
                           ? "Anywhere • Any week • Add guests" 
                           : <><span className="text-orange-600 dark:text-orange-400">{priceLabel}</span> <span className="mx-1 opacity-40">•</span> {roomTypeLabel}</>}
                     </span>
                  </div>
                  
                  {/* Premium Filter Icon */}
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className="p-3 mr-1 bg-gray-50/80 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700 rounded-full shrink-0 text-gray-700 dark:text-gray-300 shadow-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                     <SlidersHorizontal className="w-4 h-4" />
                  </motion.div>
                </div>
              </div>

              {/* Desktop View - Full Summary */}
               <motion.div
                 className="hidden md:flex items-center justify-between w-full h-[88px] px-10 py-6 rounded-full"
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.05 }}
               >
                <motion.div
                  className="flex items-center flex-1 min-w-0"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 }}
                >
                  <div className="flex items-center mr-5 text-primary">
                    <MapPin className="text-lg w-5 h-5" />
                  </div>
                  <div className="flex flex-col min-w-0 w-full">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Location</span>
                    <span className="font-semibold text-base text-gray-900 dark:text-white truncate block w-full">
                      {locationLabel}
                    </span>
                  </div>
                </motion.div>

                <div className="h-10 w-px bg-gray-200 dark:bg-gray-700 shrink-0 mx-3" />

                 <motion.div
                   className="flex items-center flex-1 min-w-0"
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.11 }}
                 >
                   <div className="flex items-center mr-5 text-primary">
                     <SearchIcon className="text-lg w-5 h-5" />
                   </div>
                   <div className="flex flex-col min-w-0 w-full">
                     <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Budget</span>
                     <span className="font-semibold text-base text-gray-900 dark:text-white truncate block w-full">
                       {priceLabel}
                     </span>
                   </div>
                 </motion.div>

                 <div className="h-10 w-px bg-gray-200 dark:bg-gray-700 shrink-0 mx-3" />

                 <motion.div
                   className="flex items-center flex-1 min-w-0"
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.14 }}
                 >
                   <div className="flex items-center mr-5 text-primary">
                     <BedDouble className="text-lg w-5 h-5" />
                   </div>
                   <div className="flex flex-col min-w-0 w-full">
                     <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Room Type</span>
                     <span className="font-semibold text-base text-gray-900 dark:text-white truncate block w-full">
                       {roomTypeLabel}
                     </span>
                   </div>
                 </motion.div>

                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95, rotate: -5 }}
                  className="p-4 bg-gradient-to-r from-primary to-orange-500 rounded-full text-white shadow-lg shrink-0 ml-8 hover:shadow-orange-500/40 transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.23 }}
                >
                  <SearchIcon className="text-lg w-5 h-5" aria-hidden />
                </motion.div>
              </motion.div>
            </motion.button>
          </Modal.Trigger>
        </motion.div>
      )}

      <Modal.Window name="search" size="lg" hasFixedFooter>
        <SearchModal onCloseModal={handleSearchClose} />
      </Modal.Window>
    </Modal>
  );
};

export default SearchManager;

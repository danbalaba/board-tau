"use client";

import React, { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { FaSearch, FaMapMarkerAlt, FaBed } from "react-icons/fa";
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
              {/* Mobile View - Simple Airbnb Style */}
              <div className="relative md:hidden">
                {/* Simplified centering - everything directly in the button */}
                <div className="flex items-center justify-center gap-3 w-full px-4 py-3">
                  {/* Search text */}
                  <span className="font-semibold text-gray-700 dark:text-gray-200 text-base">
                    Search for boarding houses
                  </span>

                  {/* Search button */}
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-gradient-to-r from-primary to-orange-500 rounded-full text-white transition-all duration-200"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.08 }}
                  >
                    <FaSearch className="text-lg" aria-hidden />
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
                    <FaMapMarkerAlt className="text-lg" />
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
                     <FaSearch className="text-lg" />
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
                     <FaBed className="text-lg" />
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
                  <FaSearch className="text-lg" aria-hidden />
                </motion.div>
              </motion.div>
            </motion.button>
          </Modal.Trigger>
        </motion.div>
      )}

      <Modal.Window name="search">
        <SearchModal onCloseModal={handleSearchClose} />
      </Modal.Window>
    </Modal>
  );
};

export default SearchManager;

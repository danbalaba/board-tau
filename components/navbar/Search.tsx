"use client";

import React, { useMemo, useState, useEffect, useContext } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { FaSearch, FaMapMarkerAlt, FaBed } from "react-icons/fa";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

import Modal, { ModalContext } from "../modals/Modal";
import { useSearchSummary } from "@/hooks/useSearchSummary";

const SearchModal = dynamic(() => import("@/components/modals/SearchModal"), {
  ssr: false,
});

interface SearchProps {
  compact?: boolean;
  isMobile?: boolean;
}

const Search: React.FC<SearchProps> = ({ compact = false, isMobile = false }) => {
  const searchParams = useSearchParams();
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const { open } = useContext(ModalContext);

  useEffect(() => {
    setMounted(true);
  }, []);


  const { locationLabel, priceLabel, roomTypeLabel } = useSearchSummary();

  const handleSearchClose = () => {
    setIsExpanded(false);
  };

  return (
    <Modal>
      <motion.div
        layoutId="search-bar"
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <Modal.Trigger name="search">
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            className={`
              group transition-all duration-300
              ${compact
                ? 'rounded-full px-6 py-3 backdrop-blur-2xl border border-white/40 dark:border-gray-700/60 shadow-2xl hover:shadow-3xl transition-all duration-300'
                : 'search-bar-trigger text-center'
              }
            `}
            style={{
              background: compact ? `rgba(var(--surface-rgb), 0.95)` : undefined
            }}
          >
            <motion.div
              className={`
                transition-all duration-300
                ${compact ? 'flex items-center justify-between' : 'search-bar-content'}
              `}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              {/* Mobile View - Simple Airbnb Style */}
              {!compact && (
                <div className="relative md:hidden">
                  {/* Glow background */}
                  <div className="absolute inset-0 bg-gradient-radial from-primary/25 to-transparent blur-3xl scale-125 -z-10" />

                  <div className="flex items-center justify-center w-full px-4 py-3 gap-3">
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
              )}

              {/* Compact Mode (Navbar Scroll State) */}
               {compact ? (
                <>
                  <motion.div
                    className="flex items-center flex-1 min-w-0"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 }}
                  >
                    <div className="flex items-center mr-5 text-primary">
                      <FaMapMarkerAlt className="text-sm" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Location</span>
                      <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {locationLabel}
                      </span>
                    </div>
                    <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 shrink-0 mx-5" />
                  </motion.div>

                   <motion.div
                    className="flex items-center flex-1 min-w-0"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.11 }}
                  >
                    <div className="flex items-center mr-5 text-[#2F7D6D] dark:text-[#4FA89A]">
                      <FaSearch className="text-sm" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Budget</span>
                      <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {priceLabel}
                      </span>
                    </div>
                    <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 shrink-0 mx-5" />
                  </motion.div>

                  <motion.div
                    className="flex items-center flex-1 min-w-0"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.14 }}
                  >
                    <div className="flex items-center mr-5 text-[#2F7D6D] dark:text-[#4FA89A]">
                      <FaBed className="text-sm" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Room Type</span>
                      <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {roomTypeLabel}
                      </span>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95, rotate: -5 }}
                    className="p-3 bg-gradient-to-r from-primary to-orange-500 rounded-full text-white shadow-lg shrink-0 ml-5 hover:shadow-orange-500/40 transition-all duration-300"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.23 }}
                  >
                    <FaSearch className="text-sm" aria-hidden />
                  </motion.div>
                </>
              ) : (
                <>
                  {/* Mobile View - Simple Airbnb Style */}
                  <div className="relative md:hidden">
                    {/* Glow background */}
                    <div className="absolute inset-0 bg-gradient-radial from-primary/25 to-transparent blur-3xl scale-125 -z-10" />

                    <div className="flex items-center justify-center w-full px-4 py-3 gap-3">
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
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Location</span>
                        <span className="font-semibold text-base text-gray-900 dark:text-white truncate">
                          {locationLabel}
                        </span>
                      </div>
                    </motion.div>

                    <div className="h-10 w-px bg-gray-200 dark:bg-gray-700 shrink-0 mx-5" />

                    <motion.div
                      className="flex items-center flex-1 min-w-0"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.11 }}
                    >
                      <div className="flex items-center mr-5 text-primary">
                        <FaSearch className="text-lg" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Budget</span>
                        <span className="font-semibold text-base text-gray-900 dark:text-white truncate">
                          {priceLabel}
                        </span>
                      </div>
                    </motion.div>

                    <div className="h-10 w-px bg-gray-200 dark:bg-gray-700 shrink-0 mx-5" />

                    <motion.div
                      className="flex items-center flex-1 min-w-0"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.14 }}
                    >
                      <div className="flex items-center mr-5 text-primary">
                        <FaBed className="text-lg" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Room Type</span>
                        <span className="font-semibold text-base text-gray-900 dark:text-white truncate">
                          {roomTypeLabel}
                        </span>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95, rotate: -5 }}
                      className="p-4 bg-gradient-to-r from-primary to-orange-500 rounded-full text-white shadow-lg shrink-0 ml-5 hover:shadow-orange-500/40 transition-all duration-300"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.23 }}
                    >
                      <FaSearch className="text-lg" aria-hidden />
                    </motion.div>
                  </motion.div>
                </>
              )}
            </motion.div>
          </motion.button>
        </Modal.Trigger>
      </motion.div>

      <Modal.Window name="search">
        <SearchModal onCloseModal={handleSearchClose} />
      </Modal.Window>
    </Modal>
  );
};

export default Search;

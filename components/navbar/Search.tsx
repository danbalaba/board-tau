"use client";

import React, { useMemo, useState, useEffect, useContext } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { FaSearch } from "react-icons/fa";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

import Modal, { ModalContext } from "../modals/Modal";
import { colleges } from "@/data/colleges";

const SearchModal = dynamic(() => import("@/components/modals/SearchModal"), {
  ssr: false,
});

interface SearchProps {
  compact?: boolean;
}

const Search: React.FC<SearchProps> = ({ compact = false }) => {
  const searchParams = useSearchParams();
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const { open } = useContext(ModalContext);

  useEffect(() => {
    setMounted(true);
  }, []);


  const college = searchParams?.get("college");
  const categories = searchParams?.getAll("categories");
  const distance = searchParams?.get("distance");
  const roomType = searchParams?.get("roomType");
  const minPrice = searchParams?.get("minPrice");
  const maxPrice = searchParams?.get("maxPrice");
  const guestCount = searchParams?.get("guestCount");

  const locationLabel = useMemo(() => {
    const co = colleges.find((c) => c.value === college);
    const name = co?.label ?? "TAU";
    if (distance != null && distance !== "") return `Near ${name} · ≤ ${distance} km`;
    return `Near ${name}`;
  }, [college, distance]);

  const categoryLabel = useMemo(() => {
    if (categories?.length) {
      if (categories.length === 1) return categories[0];
      return `${categories.length} categories`;
    }
    return "Any category";
  }, [categories]);

  const priceLabel = useMemo(() => {
    if (minPrice && maxPrice && +minPrice > 0 && +maxPrice > 0) {
      return `₱${minPrice}–${maxPrice} / mo`;
    }
    return "Any price";
  }, [minPrice, maxPrice]);

  const roomTypeLabel = useMemo(() => {
    if (roomType) return roomType;
    return "Any room";
  }, [roomType]);

  const occupantLabel = useMemo(() => {
    if (guestCount) return `${guestCount} occupants`;
    return "Occupants";
  }, [guestCount]);

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
                ? 'rounded-pill px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-soft hover:shadow-medium transition-all duration-300'
                : 'search-bar-trigger'
              }
            `}
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
              {/* Compact Mode (Navbar Scroll State) */}
              {compact ? (
                <>
                  <motion.div
                    className="flex items-center flex-1 min-w-0"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 }}
                  >
                    <small className="text-base font-semibold text-gray-700 dark:text-gray-300 truncate mr-3">
                      {locationLabel}
                    </small>
                    <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 shrink-0" />
                  </motion.div>

                  <motion.div
                    className="flex items-center flex-1 px-4 min-w-0"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.11 }}
                  >
                    <small className="text-base font-medium text-gray-600 dark:text-gray-400 truncate">
                      {categoryLabel}
                    </small>
                    <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 ml-4 shrink-0" />
                  </motion.div>

                  <motion.div
                    className="flex items-center flex-1 px-4 min-w-0"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.14 }}
                  >
                    <small className="text-base font-medium text-gray-600 dark:text-gray-400 truncate">
                      {priceLabel}
                    </small>
                  </motion.div>

                  <motion.div
                    className="ml-3 shrink-0"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.17 }}
                  >
                    <div className="p-3 bg-primary rounded-full text-white group-hover:scale-110 transition-transform duration-200">
                      <FaSearch className="text-base" />
                    </div>
                  </motion.div>
                </>
              ) : (
                <>
                  {/* Mobile View - Compact */}
                  <motion.div
                    className="flex md:hidden items-center justify-between w-full"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                  >
                    <small className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex-1">
                      {locationLabel}
                    </small>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.08 }}
                    >
                      <div className="p-2.5 bg-primary rounded-full text-white hover:scale-110 transition-transform duration-200">
                        <FaSearch className="text-xs" />
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* Desktop View - Full Summary */}
                  <motion.div
                    className="hidden md:flex items-center justify-between w-full"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 }}
                    >
                      <small className="text-sm font-semibold px-5 text-gray-700 dark:text-gray-300 flex-shrink-0">
                        {locationLabel}
                      </small>
                    </motion.div>

                    <motion.div
                      className="hidden lg:flex items-center flex-1 border-l border-gray-200 dark:border-gray-700 pl-5"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.11 }}
                    >
                      <small className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {categoryLabel}
                      </small>
                    </motion.div>

                    <motion.div
                      className="hidden lg:flex items-center flex-1 border-l border-gray-200 dark:border-gray-700 pl-5 ml-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.14 }}
                    >
                      <small className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {priceLabel}
                      </small>
                    </motion.div>

                    <motion.div
                      className="hidden 2xl:flex items-center flex-1 border-l border-gray-200 dark:border-gray-700 pl-5 ml-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.17 }}
                    >
                      <small className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {roomTypeLabel}
                      </small>
                    </motion.div>

                    <motion.div
                      className="flex items-center ml-auto pl-5 border-l border-gray-200 dark:border-gray-700"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.20 }}
                    >
                      <small className="hidden 2xl:block text-sm font-medium text-gray-600 dark:text-gray-400 mr-4">
                        {occupantLabel}
                      </small>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.23 }}
                      >
                        <div className="p-2.5 bg-primary rounded-full text-white group-hover:scale-110 transition-transform duration-200">
                          <FaSearch className="text-xs" />
                        </div>
                      </motion.div>
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

"use client";

import React, { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { FaSearch } from "react-icons/fa";
import { motion } from "framer-motion";
import { springBounce } from "@/utils/motion";

import Modal from "../modals/Modal";
import { colleges } from "@/data/colleges";

const SearchModal = dynamic(() => import("@/components/modals/SearchModal"), {
  ssr: false,
});

interface SearchManagerProps {
  isScrolled?: boolean;
}

const SearchManager = ({ isScrolled = false }: SearchManagerProps) => {
  const searchParams = useSearchParams();

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

  const handleSearchClose = () => {};

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
                boxShadow: "0 16px 48px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
                y: -3,
                scale: 1.01
              }}
              className="w-full group search-bar-trigger text-left"
              style={{ maxWidth: '100%' }}
            >
              {/* Mobile View - Compact */}
              <motion.div
                className="flex md:hidden items-center justify-between w-full h-full px-2 py-1.5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <span className="font-semibold text-sm text-text-primary dark:text-gray-100 truncate flex-1">
                  {locationLabel}
                </span>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95, rotate: -5 }}
                  className="ml-2 p-1.5 bg-primary rounded-full text-white shadow-soft shrink-0"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.08 }}
                >
                  <FaSearch className="text-xs" aria-hidden />
                </motion.div>
              </motion.div>

              {/* Desktop View - Full Summary */}
              <motion.div
                className="hidden md:flex items-center justify-between w-full h-full px-4 py-2"
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
                  <span className="font-semibold text-base md:text-lg text-text-primary dark:text-gray-100 truncate mr-3">
                    {locationLabel}
                  </span>
                  <div className="h-6 w-px bg-border dark:bg-gray-600 shrink-0" />
                </motion.div>

                <motion.div
                  className="hidden lg:flex items-center flex-1 px-4 min-w-0"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.11 }}
                >
                  <span className="font-medium text-base md:text-lg text-text-secondary dark:text-gray-400 truncate">
                    {categoryLabel}
                  </span>
                  <div className="h-6 w-px bg-border dark:bg-gray-600 ml-4 shrink-0" />
                </motion.div>

                <motion.div
                  className="hidden lg:flex items-center flex-1 px-4 min-w-0"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.14 }}
                >
                  <span className="font-medium text-base md:text-lg text-text-secondary dark:text-gray-400 truncate">
                    {priceLabel}
                  </span>
                  <div className="h-6 w-px bg-border dark:bg-gray-600 ml-4 shrink-0" />
                </motion.div>

                <motion.div
                  className="hidden 2xl:flex items-center flex-1 px-4 min-w-0"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.17 }}
                >
                  <span className="font-medium text-base md:text-lg text-text-secondary dark:text-gray-400 truncate">
                    {roomTypeLabel}
                  </span>
                  <div className="h-6 w-px bg-border dark:bg-gray-600 ml-4 shrink-0" />
                </motion.div>

                <motion.div
                  className="flex items-center flex-1 px-4 min-w-0"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.20 }}
                >
                  <span className="hidden 2xl:block font-medium text-base md:text-lg text-text-secondary dark:text-gray-400 truncate mr-4">
                    {occupantLabel}
                  </span>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95, rotate: -5 }}
                    className="p-4 bg-primary rounded-full text-white shadow-soft shrink-0"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.23 }}
                  >
                    <FaSearch className="text-base md:text-lg" aria-hidden />
                  </motion.div>
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

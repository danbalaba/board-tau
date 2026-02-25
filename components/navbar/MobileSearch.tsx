"use client";

import React, { useState, useEffect, useContext } from "react";
import dynamic from "next/dynamic";
import { FaSearch } from "react-icons/fa";
import { motion } from "framer-motion";
import Modal, { ModalContext } from "../modals/Modal";

const SearchModal = dynamic(() => import("@/components/modals/SearchModal"), {
  ssr: false,
});

interface MobileSearchProps {
  layoutId?: string;
}

const MobileSearch: React.FC<MobileSearchProps> = ({ layoutId = "mobile-search-bar" }) => {
  const [mounted, setMounted] = useState(false);
  const { open } = useContext(ModalContext);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearchClose = () => {};

  return (
    <Modal>
      <motion.div
        layoutId={layoutId}
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
            className="w-full group"
            style={{
              width: '100%',
              background: 'rgba(var(--surface-rgb), 0.95)',
              borderRadius: '9999px',
              padding: '12px 20px',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(2xl)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)'
            }}
          >
            <div className="flex items-center justify-between w-full">
              {/* Search text */}
              <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm">
                Search for boarding houses
              </span>

              {/* Search button */}
              <motion.div
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-gradient-to-r from-primary to-orange-500 rounded-full text-white transition-all duration-200"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.08 }}
              >
                <FaSearch className="text-sm" aria-hidden />
              </motion.div>
            </div>
          </motion.button>
        </Modal.Trigger>
      </motion.div>

      <Modal.Window name="search">
        <SearchModal onCloseModal={handleSearchClose} />
      </Modal.Window>
    </Modal>
  );
};

export default MobileSearch;

"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaHeart, FaCalendarCheck, FaHome, FaUser, FaSignOutAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { User } from "next-auth";

import Modal from "@/components/modals/Modal";
import AuthModal from "@/components/modals/AuthModal";
import HostApplicationModal from "@/components/modals/HostApplicationModal";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

interface RightSwipePanelProps {
  user?: (User & { id: string; role?: string });
}

const RightSwipePanel: React.FC<RightSwipePanelProps> = ({ user }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const redirect = (url: string) => {
    setIsOpen(false);
    router.push(url);
  };

  const handleLogout = () => {
    setIsOpen(false);
    signOut({ callbackUrl: "/" });
  };

  // Close panel when user navigates
  useEffect(() => {
    const handleRouteChange = () => {
      setIsOpen(false);
    };
    window.addEventListener("popstate", handleRouteChange);
    return () => window.removeEventListener("popstate", handleRouteChange);
  }, []);

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 h-full w-[80%] bg-white dark:bg-gray-900 z-50 md:hidden shadow-2xl"
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="w-12" /> {/* Empty to center content */}
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Menu
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <svg
                  className="w-6 h-6 text-gray-600 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Panel Content */}
            <div className="flex flex-col h-[calc(100%-64px)]">
              {/* Theme Toggle (Top) */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <ThemeToggle />
              </div>

              {/* Menu Items */}
              <div className="flex-1 overflow-y-auto">
                {!user ? (
                  /* Not Logged In */
                  <Modal>
                    <div className="flex flex-col gap-3 p-4">
                      <Modal.Trigger name="Login">
                        <button
                          type="button"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 w-full bg-primary hover:bg-primary-hover text-white px-4 py-3 rounded-xl font-semibold transition-colors"
                        >
                          <FaUser className="text-sm" />
                          <span>Login</span>
                        </button>
                      </Modal.Trigger>

                      <Modal.Trigger name="Sign up">
                        <button
                          type="button"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-xl font-semibold transition-colors"
                        >
                          <FaHome className="text-sm" />
                          <span>Signup</span>
                        </button>
                      </Modal.Trigger>
                    </div>

                    <Modal.Window name="Login" size="sm">
                      <AuthModal name="Login" />
                    </Modal.Window>

                    <Modal.Window name="Sign up" size="sm">
                      <AuthModal name="Sign up" />
                    </Modal.Window>
                  </Modal>
                ) : (
                  /* Logged In */
                  <Modal>
                    <div className="flex flex-col gap-1 p-4">
                      <button
                        type="button"
                        onClick={() => redirect("/favorites")}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white"
                      >
                        <FaHeart className="text-sm" />
                        <span>My favorites</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => redirect("/reservations")}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white"
                      >
                        <FaCalendarCheck className="text-sm" />
                        <span>My reservations</span>
                      </button>

                      <Modal.Trigger name="host-application">
                        <button
                          type="button"
                          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white"
                        >
                          <FaHome className="text-sm" />
                          <span>Become a host</span>
                        </button>
                      </Modal.Trigger>

                      <button
                        type="button"
                        onClick={() => redirect("/profile")}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white"
                      >
                        <FaUser className="text-sm" />
                        <span>Profile</span>
                      </button>

                      <hr className="my-2" />

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white"
                      >
                        <FaSignOutAlt className="text-sm" />
                        <span>Logout</span>
                      </button>
                    </div>

                    <Modal.Window name="host-application" size="xl">
                      <HostApplicationModal />
                    </Modal.Window>
                  </Modal>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swipe Trigger Zone */}
      <div
        className="fixed top-0 bottom-0 right-0 w-4 z-30 md:hidden"
        onTouchStart={(e) => {
          // Right edge swipe detection
          if (e.touches[0].clientX > window.innerWidth - 20) {
            setIsOpen(true);
          }
        }}
      />
    </>
  );
};

export default RightSwipePanel;

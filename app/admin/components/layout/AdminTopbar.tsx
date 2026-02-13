'use client';

import React, { useState } from 'react';
import { FaSearch, FaBell, FaSun, FaMoon, FaUser, FaBars } from 'react-icons/fa';
import { signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

const AdminTopbar: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleSignOut = () => {
    setIsProfileMenuOpen(false);
    signOut({ callbackUrl: '/' });
  };

  // Get page title based on current path
  const getPageTitle = () => {
    if (pathname === '/admin') return 'Dashboard';
    if (pathname.includes('users')) return 'User Management';
    if (pathname.includes('listings')) return 'Property Management';
    if (pathname.includes('reservations')) return 'Funds and Escrow';
    if (pathname.includes('inquiries')) return 'Client Management';
    if (pathname.includes('reviews')) return 'Reviews';
    if (pathname.includes('reports')) return 'Reports & Audit Logs';
    if (pathname.includes('system')) return 'Settings';
    return 'Dashboard';
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-slate-700/50 px-6 py-4 sticky top-0 z-40"
    >
      <div className="flex items-center justify-between">
        {/* Page title */}
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <FaBars className="text-gray-600 dark:text-gray-400 text-lg" />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{getPageTitle()}</h1>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4 ml-8">
          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="relative p-3 rounded-xl hover:bg-gray-100/80 dark:hover:bg-slate-700/80 transition-colors"
          >
            <FaBell className="text-gray-600 dark:text-gray-400 text-lg" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </motion.button>

          {/* Dark mode toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleDarkMode}
            className="p-3 rounded-xl hover:bg-gray-100/80 dark:hover:bg-slate-700/80 transition-colors"
          >
            {isDarkMode ? (
              <FaSun className="text-gray-600 dark:text-gray-400 text-lg" />
            ) : (
              <FaMoon className="text-gray-600 dark:text-gray-400 text-lg" />
            )}
          </motion.button>

          {/* Profile menu */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100/80 dark:hover:bg-slate-700/80 transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                <FaUser className="text-white text-sm" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-800 dark:text-white">Admin</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">View profile</p>
              </div>
            </motion.button>

            {/* Profile dropdown */}
            <AnimatePresence>
              {isProfileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-200/50 dark:border-slate-700/50 z-50"
                >
                  <div className="p-4 border-b border-gray-200/50 dark:border-slate-700/50">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">Admin User</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">admin@boardtau.com</p>
                  </div>
                  <div className="p-2">
                    <motion.button
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100/80 dark:hover:bg-slate-700/80 transition-colors"
                    >
                      <FaUser className="text-sm" />
                      <span>Profile</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100/80 dark:hover:bg-slate-700/80 transition-colors"
                    >
                      <FaBell className="text-sm" />
                      <span>Notifications</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100/80 dark:hover:bg-slate-700/80 transition-colors"
                    >
                      <FaSun className="text-sm" />
                      <span>Settings</span>
                    </motion.button>
                  </div>
                  <div className="p-2 border-t border-gray-200/50 dark:border-slate-700/50">
                    <motion.button
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50/80 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <span>Logout</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default AdminTopbar;

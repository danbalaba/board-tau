'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  FaHome,
  FaUser,
  FaHotel,
  FaBook,
  FaStar,
  FaChartBar,
  FaCog,
  FaBars,
  FaSearch,
  FaQuestion,
  FaSignOutAlt,
  FaBars as FaBarsIcon,
  FaAngleDoubleLeft,
  FaAngleDoubleRight
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navItems = [
    { label: 'Dashboard', icon: FaHome, href: '/admin' },
    { label: 'Users', icon: FaUser, href: '/admin/users' },
    { label: 'Listings', icon: FaHotel, href: '/admin/listings' },
    { label: 'Reservations', icon: FaBook, href: '/admin/reservations' },
    { label: 'Inquiries', icon: FaQuestion, href: '/admin/inquiries' },
    { label: 'Reviews', icon: FaStar, href: '/admin/reviews' },
    { label: 'Reports', icon: FaChartBar, href: '/admin/reports' },
    { label: 'System', icon: FaCog, href: '/admin/system' },
  ];

  const isActive = (href: string) => {
    if (href === '/admin' && pathname === '/admin') {
      return true;
    }
    return pathname.startsWith(href) && href !== '/admin';
  };

  return (
    <>
      {/* Mobile toggle button */}
      {isMobile && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-50 lg:hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl shadow-xl p-3"
        >
          <FaBars className="text-gray-700 dark:text-gray-200" />
        </motion.button>
      )}

      {/* Sidebar overlay */}
      {isMobile && isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={{ x: -260 }}
        animate={{ x: isOpen || !isMobile ? 0 : -260 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed top-0 left-0 z-50 h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg shadow-2xl"
        style={{ width: isCollapsed ? '80px' : '260px' }}
      >
        {/* Logo section */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-slate-700/50">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2"
          >
            <Link href="/admin" onClick={() => isMobile && setIsOpen(false)}>
              {!isCollapsed && (
                <Image
                  src={(typeof window !== 'undefined' && document.documentElement.classList.contains('dark'))
                    ? '/images/TauBOARD-Dark.png'
                    : '/images/TauBOARD-Light.png'}
                  alt="BoardTAU Logo"
                  width={150}
                  height={40}
                  className="object-contain"
                />
              )}
            </Link>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggleCollapse}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            {isCollapsed ? (
              <FaAngleDoubleRight className="text-gray-600 dark:text-gray-400 transition-transform duration-300" />
            ) : (
              <FaAngleDoubleLeft className="text-gray-600 dark:text-gray-400 transition-transform duration-300" />
            )}
          </motion.button>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <div className="space-y-2">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                      active
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                    }`}
                    onClick={() => isMobile && setIsOpen(false)}
                  >
                    <Icon className={`text-lg ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'}`} />
                    {!isCollapsed && <span className="font-medium">{item.label}</span>}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </nav>

        {/* Footer section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200/50 dark:border-slate-700/50"
        >
          <div className="bg-gray-100/80 dark:bg-slate-700/80 backdrop-blur-lg rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full"></div>
              <div className={isCollapsed ? 'hidden' : 'block'}>
                <p className="text-sm font-semibold text-gray-800 dark:text-white">Admin</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Super Admin</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
            >
              <FaSignOutAlt className="text-gray-600 dark:text-gray-400 text-sm" />
              {!isCollapsed && <span className="text-sm text-gray-600 dark:text-gray-400">Logout</span>}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default AdminSidebar;

'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { FaBell, FaSearch, FaUserCircle } from 'react-icons/fa';

interface LandlordTopbarProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
  };
}

export default function LandlordTopbar({ user }: LandlordTopbarProps) {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-6">
      {/* Left side - Search */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Right side - Notifications & User */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          <FaBell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Menu */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {user.name || user.email}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user.role === 'landlord' ? 'Landlord' : 'User'}
            </p>
          </div>

          {user.image ? (
            <img
              src={user.image}
              alt="User profile"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <FaUserCircle size={32} className="text-gray-400" />
          )}

          {/* Dropdown menu (simplified) */}
          <div className="relative group">
            <button className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-2">
                <button
                  onClick={() => signOut()}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

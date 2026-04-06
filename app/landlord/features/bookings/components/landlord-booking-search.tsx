'use client';

import React, { useState, useEffect, useRef } from 'react';
import { IconSearch, IconX, IconCalendarCheck, IconUser } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Booking } from '../hooks/use-booking-logic';

interface LandlordBookingSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  bookings: Booking[];
}

export function LandlordBookingSearch({
  searchQuery,
  setSearchQuery,
  bookings
}: LandlordBookingSearchProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<Booking[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.length >= 2 && bookings) {
      const q = searchQuery.toLowerCase();
      const filtered = bookings
        .filter(b => 
          b.listing.title.toLowerCase().includes(q) || 
          (b.user.name?.toLowerCase() || '').includes(q) || 
          b.user.email.toLowerCase().includes(q)
        )
        .slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, bookings]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full lg:w-80 group">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors z-20">
        <IconSearch size={18} strokeWidth={2.5} />
      </div>
      <input
        type="text"
        placeholder="Search tenant or property..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        className="w-full relative z-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-700 py-3 pl-11 pr-10 text-xs font-bold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery('')}
          className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-primary transition-colors z-20"
        >
          <IconX size={14} strokeWidth={3} />
        </button>
      )}

      <AnimatePresence>
        {isFocused && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl z-[100] overflow-hidden"
          >
            <div className="p-2">
              <div className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50 dark:border-gray-800 mb-1">
                Suggested Bookings
              </div>
              {suggestions.map((booking) => (
                <button
                  key={booking.id}
                  onClick={() => {
                    setSearchQuery(booking.user.name || booking.user.email);
                    setIsFocused(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-primary/5 text-left transition-colors group/item"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover/item:text-primary transition-colors overflow-hidden">
                    {booking.listing.imageSrc ? (
                      <img src={booking.listing.imageSrc} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <IconCalendarCheck size={16} />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                      {booking.user.name || 'Anonymous Guest'}
                    </span>
                    <span className="text-[10px] text-gray-500 truncate font-medium">
                      {booking.listing.title} • {booking.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

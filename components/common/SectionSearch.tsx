'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  IconSearch,
  IconLoader2,
  IconX,
  IconCommand,
  IconArrowRight,
  IconBuilding,
  IconMessage,
  IconCalendarStats,
  IconUsers,
  IconStar,
  IconCalendar
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchLandlordData } from '@/services/landlord/search';
import debounce from 'lodash.debounce';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface SectionSearchProps {
  section: 'properties' | 'inquiries' | 'reservations' | 'bookings' | 'reviews';
  placeholder?: string;
  onSearchChange?: (query: string) => void;
  className?: string;
}

export const SectionSearch = ({
  section,
  placeholder = "Search matches...",
  onSearchChange,
  className
}: SectionSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchMatches = useCallback(
    debounce(async (q: string) => {
      if (!q || q.length < 2) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const matches = await searchLandlordData(q, section);
        setResults(matches);
      } catch (error) {
        console.error("Section search failed:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [section]
  );

  useEffect(() => {
    if (query.length >= 2) {
      setIsOpen(true);
      fetchMatches(query);
    } else {
      setResults([]);
      setIsOpen(false);
    }

    // Notify parent if needed for live filtering of the main list
    onSearchChange?.(query);
  }, [query, fetchMatches, onSearchChange]);

  const handleSelect = (perform: string) => {
    setIsOpen(false);
    router.push(perform);
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'building': return <IconBuilding size={16} />;
      case 'message': return <IconMessage size={16} />;
      case 'calendar-stats': return <IconCalendarStats size={16} />;
      case 'users': return <IconUsers size={16} />;
      case 'star': return <IconStar size={16} />;
      default: return <IconCalendar size={16} />;
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full max-w-md group", className)}>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-300">
          {isLoading ? (
            <IconLoader2 size={16} className="animate-spin" />
          ) : (
            <IconSearch size={16} />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full h-9 pl-10 pr-10 bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-300 text-[13px] font-medium placeholder:text-gray-400 shadow-sm"
        />
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <IconX size={12} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="absolute top-full left-0 right-0 mt-3 p-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl z-[1000] overflow-hidden"
          >
            <div className="px-3 py-2">
              <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-80">Possible Matches</h4>
            </div>
            <div className="max-h-[300px] overflow-auto custom-scrollbar">
              {results.map((res) => (
                <button
                  key={res.id}
                  onClick={() => handleSelect(res.perform)}
                  className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-300 group/item text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 group-hover/item:text-primary group-hover/item:bg-primary/10 transition-all duration-300 flex items-center justify-center">
                    {getIcon(res.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{res.name}</p>
                    <p className="text-[10px] text-gray-500 font-medium line-clamp-1">{res.subtitle}</p>
                  </div>
                  <IconArrowRight size={14} className="text-primary opacity-0 group-hover/item:opacity-100 -translate-x-2 group-hover/item:translate-x-0 transition-all duration-300" />
                </button>
              ))}
            </div>
            <div className="p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-b-xl border-t border-gray-100/50 dark:border-gray-800/50 mt-1 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[10px] font-black text-gray-400">ESC</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Close</span>
              </div>
              <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Search Insights</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

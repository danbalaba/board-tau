'use client';

import React, { useState, useEffect, useRef } from 'react';
import { IconSearch, IconX, IconBuilding } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Property } from '../hooks/use-property-logic';

interface LandlordPropertySearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  properties: Property[];
}

export function LandlordPropertySearch({
  searchQuery,
  setSearchQuery,
  properties
}: LandlordPropertySearchProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<Property[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.length >= 2 && properties) {
      const filtered = properties
        .filter(p => 
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.region?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, properties]);

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
        placeholder="Search properties..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        className="w-full relative z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-700 py-3 pl-12 pr-10 text-sm font-bold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery('')}
          className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-primary transition-colors z-20"
        >
          <IconX size={16} strokeWidth={3} />
        </button>
      )}

      <AnimatePresence>
        {isFocused && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 shadow-2xl z-[100] overflow-hidden"
          >
            <div className="p-2">
              <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50 dark:border-gray-800 mb-1">
                Possible Matches
              </div>
              {suggestions.map((property) => (
                <button
                  key={property.id}
                  onClick={() => {
                    setSearchQuery(property.title);
                    setIsFocused(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/5 text-left transition-colors group/item"
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover/item:text-primary transition-colors overflow-hidden relative">
                    {property.imageSrc ? (
                      <img src={property.imageSrc} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <IconBuilding size={20} />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                      {property.title}
                    </span>
                    <span className="text-[10px] text-gray-500 truncate font-medium">
                      {property.region || 'No region'} • PHP {property.price.toLocaleString()}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-2 text-[9px] font-bold text-gray-400 text-center">
              Press Enter to see all results
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

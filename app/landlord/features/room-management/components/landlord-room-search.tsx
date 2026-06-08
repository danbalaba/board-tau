'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, DoorOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/hooks/use-debounce';
import SafeImage from '@/components/common/SafeImage';

interface Room {
  id: string;
  name: string;
  price: number;
  propertyTitle?: string;
  imageSrc?: string;
}

interface LandlordRoomSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  rooms: Room[];
}

export function LandlordRoomSearch({
  searchQuery,
  setSearchQuery,
  rooms
}: LandlordRoomSearchProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const debouncedQuery = useDebounce(localQuery, 300);
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<Room[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    setSearchQuery(debouncedQuery);
  }, [debouncedQuery, setSearchQuery]);

  useEffect(() => {
    if (debouncedQuery.length >= 2 && rooms) {
      const filtered = rooms
        .filter(r => 
          r.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          r.propertyTitle?.toLowerCase().includes(debouncedQuery.toLowerCase())
        )
        .slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery, rooms]);

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
        <Search size={18} strokeWidth={2.5} />
      </div>
      <input
        type="text"
        placeholder="Search rooms..."
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        className="w-full relative z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-700 py-3 pl-12 pr-10 text-sm font-bold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
      />
      {localQuery && (
        <button
          onClick={() => {
            setLocalQuery('');
            setSearchQuery('');
          }}
          className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-primary transition-colors z-20"
        >
          <X size={16} strokeWidth={3} />
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
                Room Matches
              </div>
              {suggestions.map((room) => (
                <button
                  key={room.id}
                  onClick={() => {
                    setSearchQuery(room.name);
                    setIsFocused(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/5 text-left transition-colors group/item"
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover/item:text-primary transition-colors overflow-hidden relative">
                    {room.imageSrc ? (
                      <SafeImage src={room.imageSrc} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <DoorOpen size={20} />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                      {room.name}
                    </span>
                    <span className="text-[10px] text-gray-500 truncate font-medium">
                      {room.propertyTitle || 'Unassigned'} • PHP {room.price.toLocaleString()}
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

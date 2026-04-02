'use client';

import React, { useState, useEffect, useRef } from 'react';
import { IconSearch, IconX, IconMail, IconUser } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Inquiry } from '../hooks/use-inquiry-logic';

interface LandlordInquirySearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  inquiries: Inquiry[];
}

export function LandlordInquirySearch({
  searchQuery,
  setSearchQuery,
  inquiries
}: LandlordInquirySearchProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<Inquiry[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.length >= 2 && inquiries) {
      const filtered = inquiries
        .filter(i => 
          i.listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (i.user.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
          i.user.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, inquiries]);

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
        <IconSearch size={16} strokeWidth={2.5} />
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
                Suggested Inquiries
              </div>
              {suggestions.map((inquiry) => (
                <button
                  key={inquiry.id}
                  onClick={() => {
                    setSearchQuery(inquiry.user.name || inquiry.user.email);
                    setIsFocused(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-primary/5 text-left transition-colors group/item"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover/item:text-primary transition-colors overflow-hidden">
                    {inquiry.listing.imageSrc ? (
                      <img src={inquiry.listing.imageSrc} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <IconMail size={16} />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                      {inquiry.user.name || 'Anonymous Tenant'}
                    </span>
                    <span className="text-[10px] text-gray-500 truncate font-medium">
                      {inquiry.listing.title} • {inquiry.status}
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

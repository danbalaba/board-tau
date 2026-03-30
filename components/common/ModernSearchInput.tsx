'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { IconSearch, IconX, IconCommand } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helper';
import { matchSorter } from 'match-sorter';

interface ModernSearchInputProps<T> {
  data: T[];
  searchKeys: string[];
  onSearch: (filtered: T[]) => void;
  placeholder?: string;
  className?: string;
  suggestionTitle?: string;
  renderSuggestion?: (item: T) => React.ReactNode;
  onSuggestionClick?: (item: T) => void;
}

export default function ModernSearchInput<T>({
  data,
  searchKeys,
  onSearch,
  placeholder = "Search...",
  className,
  suggestionTitle = "Possible Matches",
  renderSuggestion,
  onSuggestionClick
}: ModernSearchInputProps<T>) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onSearchRef = useRef(onSearch);
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  const searchKeysRef = useRef(searchKeys);
  useEffect(() => {
    if (JSON.stringify(searchKeysRef.current) !== JSON.stringify(searchKeys)) {
      searchKeysRef.current = searchKeys;
    }
  }, [searchKeys]);

  const filteredResults = useMemo(() => {
    if (!query) return data;
    return matchSorter(data, query, { keys: searchKeysRef.current });
  }, [data, query]);

  const suggestions = useMemo(() => {
    if (!query) return [];
    return filteredResults.slice(0, 5);
  }, [filteredResults, query]);

  // Use a debounced effect for onSearch to prevent rapid state updates and potential loops
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchRef.current(filteredResults);
    }, 150);

    return () => clearTimeout(handler);
  }, [filteredResults]);

  // Keyboard shortcut Ctrl+F or Meta+F
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={cn("relative w-full", className)}>
      <div className={cn(
        "relative flex items-center h-10 rounded-xl border transition-all duration-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md",
        isFocused 
          ? "border-primary ring-4 ring-primary/10 bg-white dark:bg-gray-800 shadow-lg shadow-primary/5" 
          : "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
      )}>
        <IconSearch 
          size={16} 
          strokeWidth={2.5}
          className={cn(
            "absolute left-3.5 transition-colors duration-300", 
            isFocused ? "text-primary" : "text-gray-400"
          )} 
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => {
            setIsFocused(true);
            if (query) setShowSuggestions(true);
          }}
          onBlur={() => {
            // Delay closing suggestions to allow for clicks
            setTimeout(() => {
              setIsFocused(false);
              setShowSuggestions(false);
            }, 200);
          }}
          placeholder={placeholder}
          className="w-full bg-transparent pl-10 pr-10 py-2 text-[11px] font-bold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none"
        />
        
        <AnimatePresence>
          {!query && !isFocused && (
            <motion.div 
              initial={{ opacity: 0, x: 5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 5 }}
              className="absolute right-3.5 flex items-center gap-1 px-1.5 py-0.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm"
            >
              <IconCommand size={8} className="text-gray-400" />
              <span className="text-[8px] font-black text-gray-400">F</span>
            </motion.div>
          )}
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              type="button"
              onClick={() => {
                setQuery('');
                setShowSuggestions(false);
              }}
              className="absolute right-2.5 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 transition-colors"
            >
              <IconX size={12} strokeWidth={3} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.98 }}
            className="absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl p-1.5 z-[100] backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 overflow-hidden"
          >
            <div className="p-1.5 border-b border-gray-50 dark:border-gray-800 mb-1">
              <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] px-1.5">{suggestionTitle}</h4>
            </div>
            <div className="space-y-1">
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (onSuggestionClick) onSuggestionClick(item);
                    setShowSuggestions(false);
                  }}
                  className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-primary/5 dark:hover:bg-primary/10 transition-all text-left group"
                >
                  {renderSuggestion ? renderSuggestion(item) : (
                    <div className="flex-1 px-2">
                      <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors truncate">
                        {(item as any).title || (item as any).name || 'Matching Item'}
                      </p>
                      {(item as any).email && (
                         <p className="text-[10px] text-gray-500 font-medium leading-none mt-1">{(item as any).email}</p>
                      )}
                    </div>
                  )}
                  <div className="opacity-0 group-hover:opacity-100 mr-2 transition-opacity">
                    <IconCommand size={12} className="text-primary/40" />
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

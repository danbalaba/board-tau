'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { Search, HelpCircle, Sparkles, X, Plus } from 'lucide-react';
import { cn } from '@/utils/helper';
import Button from '@/components/common/Button';

interface RoomManagementCustomAmenityProps {
  onAddAmenity: (amenityString: string) => void;
  onClose: () => void;
}

const ALL_ICONS = Object.keys(LucideIcons)
  .filter(key => typeof (LucideIcons as any)[key] === 'function' || typeof (LucideIcons as any)[key] === 'object')
  .filter(key => key !== 'createLucideIcon' && key !== 'Icon' && !key.includes('Context'));

const POPULAR_ICONS = ['Tv', 'Wifi', 'Wind', 'Thermometer', 'Utensils', 'Bed', 'ShowerHead', 'Zap', 'Fan', 'Lock', 'Shield', 'Sofa', 'Refrigerator', 'WashingMachine', 'Monitor', 'Key', 'Coffee', 'Sun'];

export default function RoomManagementCustomAmenity({
  onAddAmenity,
  onClose
}: RoomManagementCustomAmenityProps) {
  const [customAmenityText, setCustomAmenityText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Sparkles');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredIcons = useMemo(() => {
    if (!debouncedQuery) return POPULAR_ICONS;
    const query = debouncedQuery.toLowerCase();
    return ALL_ICONS.filter(name => name.toLowerCase().includes(query)).slice(0, 48);
  }, [debouncedQuery]);

  const handleCustomAmenitySubmit = () => {
    if (customAmenityText.trim()) {
      const customAmenity = `${customAmenityText.trim()}|${selectedIcon}`;
      onAddAmenity(customAmenity);
      onClose();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="p-8 space-y-8 bg-white dark:bg-[#111827] rounded-[2.5rem] border border-gray-100 dark:border-white/10 shadow-2xl max-w-md w-full relative z-[700]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Add Custom Feature</h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Make your room stand out</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <X size={20} className="text-gray-400" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Name Input */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Feature Name</label>
          <div className="relative group">
            <input
              type="text"
              value={customAmenityText}
              onChange={(e) => setCustomAmenityText(e.target.value)}
              placeholder="e.g. Balcony, Study Corner"
              className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl py-4 px-5 text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none dark:text-white"
            />
            <Sparkles size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" />
          </div>
        </div>

        {/* Icon Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-primary">Choose Icon</label>
            <div className="relative">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="bg-gray-100 dark:bg-gray-800 border-none rounded-xl py-1.5 pl-8 pr-3 text-[10px] font-bold outline-none focus:ring-2 focus:ring-primary/20 w-32"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-6 gap-3 max-h-[200px] overflow-y-auto p-2 custom-scrollbar bg-gray-50/50 dark:bg-gray-900/20 rounded-3xl border border-gray-100 dark:border-gray-800">
            {filteredIcons.map((iconName) => {
              const Icon = (LucideIcons as any)[iconName] || HelpCircle;
              const isSelected = selectedIcon === iconName;
              
              return (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setSelectedIcon(iconName)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300",
                    isSelected 
                      ? "bg-primary border-primary shadow-lg shadow-primary/20 text-white scale-110" 
                      : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400 hover:border-primary/40 hover:text-primary"
                  )}
                >
                  <Icon size={18} strokeWidth={isSelected ? 2.5 : 2} />
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button outline onClick={onClose} className="flex-1 rounded-2xl uppercase text-[10px] font-black tracking-widest h-14 border-gray-200 dark:border-gray-800">
            Cancel
          </Button>
          <Button
            onClick={handleCustomAmenitySubmit}
            disabled={!customAmenityText.trim()}
            className="flex-1 rounded-2xl uppercase text-[10px] font-black tracking-widest h-14 bg-primary text-white shadow-xl shadow-primary/20"
          >
            Confirm
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

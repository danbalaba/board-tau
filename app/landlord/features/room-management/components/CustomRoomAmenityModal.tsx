'use client';

import React, { useState, useContext, useMemo, useEffect } from 'react';
import Input from '@/components/inputs/Input';
import Button from '@/components/common/Button';
import Modal, { ModalContext } from '@/components/modals/Modal';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { Search, HelpCircle, Sparkles } from 'lucide-react';
import { cn } from '@/utils/helper';

interface CustomRoomAmenityModalProps {
  onAddAmenity: (amenityString: string) => void;
  onClose?: () => void;
}

// Extract all valid icon names from the library
const ALL_ICONS = Object.keys(LucideIcons)
  .filter(key => typeof (LucideIcons as any)[key] === 'function' || typeof (LucideIcons as any)[key] === 'object')
  .filter(key => key !== 'createLucideIcon' && key !== 'Icon' && !key.includes('Context'));

const CustomRoomAmenityModal: React.FC<CustomRoomAmenityModalProps> = ({
  onAddAmenity,
  onClose
}) => {
  const [customAmenityText, setCustomAmenityText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('HelpCircle');
  const { close: contextClose } = useContext(ModalContext);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      contextClose();
    }
  };

  // Debounce logic for search to prevent lag
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter icons based on search
  const filteredIcons = useMemo(() => {
    if (!debouncedQuery) {
      // Show some popular ones by default
      return ['Tv', 'Wifi', 'Wind', 'Thermometer', 'Utensils', 'Bed', 'ShowerHead', 'Zap', 'Fan', 'Lock', 'Shield', 'Sofa', 'Refrigerator', 'WashingMachine', 'Monitor', 'Key', 'Coffee', 'Sun'];
    }
    const query = debouncedQuery.toLowerCase();
    return ALL_ICONS.filter(name => name.toLowerCase().includes(query)).slice(0, 48); // Limit to 48 for performance
  }, [debouncedQuery]);

  const handleCustomAmenitySubmit = () => {
    if (customAmenityText.trim()) {
      const customAmenity = `${customAmenityText.trim()}|${selectedIcon}`;
      onAddAmenity(customAmenity);
      handleClose();
    }
  };

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Modal.WindowHeader title="Advanced Room Feature" onClose={handleClose} />
      
      <div className="p-8 space-y-8">
        {/* Input Section */}
        <div className="relative group">
          <Input
            label="Feature Name"
            id="customAmenity"
            type="text"
            value={customAmenityText}
            onChange={(e) => setCustomAmenityText(e.target.value)}
            placeholder="e.g. Balcony, Study Corner"
            required
            useStaticLabel
          />
          <div className="flex items-center gap-2 mt-2 ml-1">
            <Sparkles size={10} className="text-primary animate-pulse" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Make your room stand out to students
            </p>
          </div>
        </div>

        {/* Icon Selection Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">
              Choose an Icon
            </label>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              {ALL_ICONS.length}+ icons available
            </span>
          </div>
          
          {/* Debounced Search Bar */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={16} />
            </div>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search icons (e.g. 'Coffee', 'Game', 'Music')..."
              className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
            />
          </div>
          
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-3 max-h-[220px] overflow-y-auto p-2 pr-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent bg-gray-50/50 dark:bg-gray-900/20 rounded-3xl border border-gray-100 dark:border-gray-800/50">
            {filteredIcons.map((iconName) => {
              const Icon = (LucideIcons as any)[iconName] || HelpCircle;
              const isSelected = selectedIcon === iconName;
              
              return (
                <motion.button
                  key={iconName}
                  type="button"
                  onClick={() => setSelectedIcon(iconName)}
                  title={iconName}
                  className={cn(
                    "relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all",
                    isSelected 
                      ? "bg-primary border-primary shadow-lg shadow-primary/20 text-white" 
                      : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400 hover:border-primary/40 hover:text-primary"
                  )}
                  whileHover={{ scale: 1.1, rotate: isSelected ? 0 : 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon size={20} strokeWidth={isSelected ? 2.5 : 2} />
                  {isSelected && (
                    <motion.div 
                      layoutId="active-dot-icon-room"
                      className="absolute -top-1 -right-1 w-3 h-3 bg-white dark:bg-primary border-2 border-primary dark:border-white rounded-full"
                    />
                  )}
                </motion.button>
              );
            })}
            
            {filteredIcons.length === 0 && (
              <div className="col-span-full py-10 text-center text-gray-400">
                <p className="text-[10px] font-black uppercase tracking-widest">No matching icons found</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-50 dark:border-gray-800">
          <Button
            type="button"
            outline
            onClick={handleClose}
            className="flex-1 rounded-2xl uppercase text-[11px] font-black tracking-widest h-14"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleCustomAmenitySubmit}
            disabled={!customAmenityText.trim()}
            className="flex-1 rounded-2xl uppercase text-[11px] font-black tracking-widest h-14 shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90"
          >
            Confirm & Add
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default CustomRoomAmenityModal;

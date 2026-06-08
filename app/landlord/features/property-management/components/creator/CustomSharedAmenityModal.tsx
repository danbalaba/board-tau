'use client';

import React, { useState, useContext, useMemo, useEffect } from 'react';
import Input from '@/components/inputs/Input';
import Button from '@/components/common/Button';
import Modal, { ModalContext } from '@/components/modals/Modal';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { Search, HelpCircle, Sparkles } from 'lucide-react';
import { cn } from '@/utils/helper';

interface CustomSharedAmenityModalProps {
  setValue: any;
  getValues: any;
  onClose?: () => void;
}

const ALL_ICONS = Object.keys(LucideIcons)
  .filter(key => typeof (LucideIcons as any)[key] === 'function' || typeof (LucideIcons as any)[key] === 'object')
  .filter(key => key !== 'createLucideIcon' && key !== 'Icon' && !key.includes('Context'));

const CustomSharedAmenityModal: React.FC<CustomSharedAmenityModalProps> = ({
  setValue,
  getValues,
  onClose
}) => {
  const [text, setText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('HelpCircle');
  const { close: contextClose } = useContext(ModalContext);

  const handleClose = () => {
    if (onClose) onClose();
    else contextClose();
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredIcons = useMemo(() => {
    if (!debouncedQuery) {
      return ['Wifi', 'Tv', 'ParkingCircle', 'Waves', 'Utensils', 'Dumbbell', 'WashingMachine', 'ShieldCheck', 'Users', 'Coffee', 'Trees', 'Bike'];
    }
    const query = debouncedQuery.toLowerCase();
    return ALL_ICONS.filter(name => name.toLowerCase().includes(query)).slice(0, 48);
  }, [debouncedQuery]);

  const handleSubmit = () => {
    if (text.trim()) {
      const current = getValues('propertyConfig.amenities') || [];
      const newValue = `${text.trim()}|${selectedIcon}`;

      if (!current.includes(newValue)) {
        setValue('propertyConfig.amenities', [...current, newValue]);
      }
      handleClose();
    }
  };

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Modal.WindowHeader title="Custom Shared Amenity" onClose={handleClose} />
      <div className="p-8 space-y-8">
        <div className="relative group">
          <Input
            label="Amenity Name"
            id="sharedAmenity"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. Swimming Pool, Gym, Coworking Space"
            required
            useStaticLabel
          />
          <div className="flex items-center gap-2 mt-2 ml-1">
            <Sparkles size={10} className="text-primary animate-pulse" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Showcase the unique perks of your boarding house
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">
              Choose Icon
            </label>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              {ALL_ICONS.length}+ icons available
            </span>
          </div>
          
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={16} />
            </div>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search icons (e.g. 'Wifi', 'Pool', 'Coffee')..."
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
                  className={cn(
                    "relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all",
                    isSelected ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400 hover:border-primary/40 hover:text-primary"
                  )}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon size={20} />
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

        <div className="flex items-center gap-3 pt-4 border-t border-gray-50 dark:border-gray-800">
          <Button type="button" outline onClick={handleClose} className="flex-1 rounded-2xl uppercase text-[11px] font-black tracking-widest h-14">Cancel</Button>
          <Button type="button" onClick={handleSubmit} disabled={!text.trim()} className="flex-1 rounded-2xl uppercase text-[11px] font-black tracking-widest h-14 bg-primary text-white shadow-xl shadow-primary/20">Add Amenity</Button>
        </div>
      </div>
    </motion.div>
  );
};

export default CustomSharedAmenityModal;

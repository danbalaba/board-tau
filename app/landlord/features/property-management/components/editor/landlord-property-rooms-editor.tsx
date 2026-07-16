'use client';
import React, { useState } from 'react';
import { Bed, Plus, Minus, Users, Copy, ClipboardPaste, CheckCircle2, LayoutGrid, Wand2, ShowerHead, HelpCircle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Input from '@/components/inputs/Input';
import { cn } from '@/utils/helper';
import { PropertyFormSection } from './shared-ui';
import { ROOM_TYPES, ROOM_TYPE_LABELS } from '@/data/roomTypes';
import { roomAmenities, bedTypeOptions as CENTRAL_BED_TYPES } from '@/data/roomAmenities';
import { toast } from 'sonner';

interface LandlordPropertyRoomsEditorProps {
  formData: any;
  setFormData: (data: any) => void;
  setActiveSection: (id: string) => void;
  onAddCustomUnitAmenity: (index: number) => void;
  onOpenBulkModal: () => void;
  addRoom: () => void;
  removeRoom: (index: number) => void;
  updateRoom: (index: number, field: string, value: any) => void;
}

const BATHROOM_OPTIONS = [
  { value: 'PRIVATE_CR', label: 'Private CR', icon: ShowerHead, desc: 'Dedicated inside room' },
  { value: 'COMMON_CR', label: 'Common CR', icon: Users, desc: 'Shared building CR' },
];

export function LandlordPropertyRoomsEditor({
  formData,
  setFormData,
  setActiveSection,
  onAddCustomUnitAmenity,
  onOpenBulkModal,
  addRoom,
  removeRoom,
  updateRoom
}: LandlordPropertyRoomsEditorProps) {
  const [copiedConfig, setCopiedConfig] = useState<any>(null);

  const copyRoom = (index: number) => {
    setCopiedConfig(formData.rooms[index]);
    toast.success('Room configuration copied!');
  };

  const pasteRoom = (index: number) => {
    if (!copiedConfig) return;
    setFormData((prev: any) => {
      const newRooms = [...prev.rooms];
      const { id, name, ...configToPaste } = copiedConfig; // Don't paste ID or name
      newRooms[index] = { ...newRooms[index], ...configToPaste };
      return { ...prev, rooms: newRooms };
    });
    toast.success('Configuration applied!');
  };

  return (
    <PropertyFormSection 
      id="rooms" 
      title="Room Setup" 
      icon={Bed} 
      description="Set up your rooms, pricing, and guest capacity" 
      setActiveSection={setActiveSection}
    >
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between p-8 bg-blue-600/5 dark:bg-blue-600/10 border border-blue-600/20 rounded-[2rem] gap-6 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-blue-600/10 rounded-2xl text-blue-600">
              <Wand2 size={28} className="animate-pulse" />
            </div>
            <div>
              <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight text-blue-600">Group Setup Wizard</h4>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Apply the same setup to all rooms in one click</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenBulkModal}
            className="flex items-center gap-3 px-10 py-4 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-600/20"
          >
            <LayoutGrid size={16} />
            Setup All {formData.rooms.length} Rooms
          </button>
        </div>

        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 gap-12">
            {formData.rooms.map((room: any, index: number) => (
              <motion.div
                key={`room-${index}`}
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: "circOut" }}
                className="group bg-white dark:bg-gray-900/40 rounded-[3rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500"
              >
                {/* Room Header */}
                <div className="px-10 py-6 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-lg shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h5 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-xs">Room Setup</h5>
                        <span className={cn(
                          "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border transition-colors",
                          room.roomType === 'SOLO' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                        )}>
                          {room.roomType}
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">Refining Specs for Room {index + 1}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white dark:bg-gray-900 rounded-2xl p-1.5 border border-gray-100 dark:border-gray-800 shadow-inner">
                      <button
                        type="button"
                        onClick={() => copyRoom(index)}
                        className="p-2.5 text-gray-400 hover:text-primary transition-all hover:bg-primary/10 rounded-xl"
                        title="Copy configuration"
                      >
                        <Copy size={16} />
                      </button>
                      <div className="w-[1px] h-4 bg-gray-100 dark:bg-gray-800 mx-1" />
                      <button
                        type="button"
                        onClick={() => pasteRoom(index)}
                        disabled={!copiedConfig}
                        className={cn(
                          "p-2.5 rounded-xl transition-all", 
                          copiedConfig ? "text-amber-500 hover:bg-amber-500/10" : "text-gray-200 dark:text-gray-700 cursor-not-allowed"
                        )}
                        title="Paste configuration"
                      >
                        <ClipboardPaste size={16} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRoom(index)}
                      className="p-3 text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all hover:scale-105 active:scale-95"
                    >
                      <Minus size={20} />
                    </button>
                  </div>
                </div>

                <div className="p-10 space-y-12">
                  {/* Phase 1: Core Specs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Room Type</label>
                      <div className="relative group/sel">
                        <select
                          value={room.roomType}
                          onChange={(e: any) => updateRoom(index, 'roomType', e.target.value)}
                          className="w-full bg-gray-50/50 dark:bg-gray-800 border-2 border-transparent rounded-[1.5rem] p-4 text-[11px] font-black uppercase tracking-widest focus:ring-0 focus:border-primary/40 transition-all appearance-none"
                        >
                          <option value="SOLO">Solo Room</option>
                          <option value="BEDSPACE">Bedspace / Dorm</option>
                        </select>
                        <LucideIcons.ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover/sel:text-primary transition-colors" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Bed Type</label>
                      <div className="relative group/sel">
                        <select
                          value={room.bedType}
                          onChange={(e: any) => updateRoom(index, 'bedType', e.target.value)}
                          className="w-full bg-gray-50/50 dark:bg-gray-800 border-2 border-transparent rounded-[1.5rem] p-4 text-[11px] font-black uppercase tracking-widest focus:ring-0 focus:border-primary/40 transition-all appearance-none"
                        >
                          {CENTRAL_BED_TYPES.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        <LucideIcons.ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover/sel:text-primary transition-colors" />
                      </div>
                    </div>

                    <Input
                      id={`rooms.${index}.price`}
                      label="Price (PHP)"
                      type="number"
                      value={room.price}
                      onChange={(e: any) => updateRoom(index, 'price', e.target.value)}
                      useStaticLabel
                    />
                    <Input
                      id={`rooms.${index}.reservationFee`}
                      label="Reservation Fee"
                      type="number"
                      value={room.reservationFee}
                      onChange={(e: any) => updateRoom(index, 'reservationFee', e.target.value)}
                      useStaticLabel
                    />
                  </div>

                  {/* Phase 2: Capacity Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-primary/5 dark:bg-primary/10 rounded-[2.5rem] border border-primary/20 shadow-inner">
                    <Input
                      id={`rooms.${index}.bedCount`}
                      label="Number of Beds"
                      type="number"
                      value={room.bedCount}
                      onChange={(e: any) => updateRoom(index, 'bedCount', e.target.value)}
                      useStaticLabel
                    />
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-1">Total Guests Allowed</label>
                      <div className="w-full rounded-2xl p-4 bg-white dark:bg-gray-900 border border-primary/20 text-[11px] font-black text-primary flex items-center justify-between shadow-sm">
                        <span>{room.capacity} GUESTS MAX</span>
                        <Users size={16} className="opacity-60" />
                      </div>
                    </div>
                    <Input
                      id={`rooms.${index}.size`}
                      label="Room Size (Sq. Meters)"
                      type="number"
                      value={room.size}
                      onChange={(e: any) => updateRoom(index, 'size', e.target.value)}
                      useStaticLabel
                    />
                  </div>

                  {/* Phase 3: Bathroom & Features */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <h6 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2 ml-1">
                        <ShowerHead size={14} className="text-primary" />
                        Bathroom Setup
                      </h6>
                      <div className="grid grid-cols-2 gap-4">
                        {BATHROOM_OPTIONS.map((opt: any) => {
                          const isSelected = room.bathroomArrangement === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => updateRoom(index, 'bathroomArrangement', opt.value)}
                              className={cn(
                                "group/opt flex flex-col items-center text-center p-6 rounded-[2rem] border-2 transition-all duration-500",
                                isSelected 
                                  ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-xl shadow-primary/10" 
                                  : "border-gray-50 dark:border-gray-800 bg-white dark:bg-transparent hover:border-primary/20"
                              )}
                            >
                              <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500",
                                isSelected ? "bg-primary text-white scale-110 rotate-6 shadow-lg shadow-primary/30" : "bg-gray-50 dark:bg-gray-800 text-gray-400 group-hover/opt:scale-105 group-hover/opt:bg-primary/10 group-hover/opt:text-primary"
                              )}>
                                <opt.icon size={20} />
                              </div>
                              <span className={cn("text-[10px] font-black uppercase tracking-widest mb-1.5", isSelected ? "text-primary" : "text-gray-900 dark:text-white")}>{opt.label}</span>
                              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">{opt.desc}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between ml-1">
                        <h6 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                          <LayoutGrid size={14} className="text-primary" />
                          Room Amenities
                        </h6>
                        <span className="px-2.5 py-1 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded-full">{room.amenities.length} Active</span>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {roomAmenities.filter((a: any) => !a.applicableTo || a.applicableTo.includes(room.roomType)).map((amenity: any) => {
                          const isSelected = room.amenities.includes(amenity.value);
                          const Icon = amenity.icon;
                          return (
                            <button
                              key={amenity.value}
                              type="button"
                              onClick={() => {
                                const newAmenities = isSelected 
                                  ? room.amenities.filter((a: string) => a !== amenity.value)
                                  : [...room.amenities, amenity.value];
                                updateRoom(index, 'amenities', newAmenities);
                              }}
                              className={cn(
                                "flex items-center gap-2.5 px-4 py-3.5 rounded-2xl border text-[9px] font-black uppercase tracking-widest transition-all duration-500",
                                isSelected
                                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]"
                                  : "bg-gray-50/50 dark:bg-gray-800/50 text-gray-400 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                              )}
                            >
                              <Icon size={14} className={cn("transition-transform duration-500", isSelected && "rotate-6")} />
                              <span className="truncate">{amenity.label}</span>
                            </button>
                          );
                        })}
                        {/* Custom Amenities */}
                        {room.amenities.filter((a: string) => a.includes('|')).map((ca: string) => {
                          const [label, iconName] = ca.split('|');
                          const Icon = (LucideIcons as any)[iconName] || HelpCircle;
                          return (
                            <button
                              key={ca}
                              type="button"
                              onClick={() => updateRoom(index, 'amenities', room.amenities.filter((a: string) => a !== ca))}
                              className="flex items-center gap-2.5 px-4 py-3.5 rounded-2xl bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20 text-[9px] font-black uppercase tracking-widest"
                            >
                              <Icon size={14} className="rotate-6" />
                              <span className="truncate">{label}</span>
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => onAddCustomUnitAmenity(index)}
                        className="w-full py-4 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[2rem] flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-500"
                      >
                        <Plus size={16} />
                        Add Custom Feature
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        <button
          type="button"
          onClick={addRoom}
          className="w-full py-6 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-[2.5rem] flex items-center justify-center gap-3 text-gray-400 hover:text-emerald-500 hover:border-emerald-500 hover:bg-emerald-500/5 transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
            <Plus size={20} />
          </div>
          <span className="text-sm font-black uppercase tracking-[0.2em]">Add Another Room</span>
        </button>
      </div>
    </PropertyFormSection>
  );
}
